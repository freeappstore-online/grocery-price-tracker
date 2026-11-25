// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
vi.mock('@freeappstore/sdk',()=>({initApp:()=>({})}));
import App from './App';
let root:Root; let host:HTMLDivElement;
const button=(text:string)=>Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.trim()===text)!;
const click=async(text:string)=>{await act(async()=>button(text).click())};
const input=async(el:HTMLInputElement,value:string)=>{await act(async()=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;setter.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));});};
beforeEach(async()=>{(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;localStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<App/>));});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks()});
describe('barcode capture',()=>{
 it('stops the camera stream when requested',async()=>{const stop=vi.fn(); Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn().mockResolvedValue({getTracks:()=>[{stop}]})}}); Object.defineProperty(window,'BarcodeDetector',{configurable:true,value:class {detect(){return Promise.resolve([])}}}); Object.defineProperty(HTMLMediaElement.prototype,'srcObject',{configurable:true,writable:true,value:null}); vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue(); await click('Scan barcode'); await click('Start camera'); await click('Stop camera'); expect(stop).toHaveBeenCalledOnce(); delete (window as any).BarcodeDetector; });
 it('supports denied camera and manual first and repeat scans without saving observations',async()=>{
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn().mockRejectedValue(new Error('denied'))}});
  await click('Scan barcode'); await click('Start camera'); expect(host.textContent).toContain('permission denied');
  await input(host.querySelector('input[placeholder="12 or 13 digits"]')!,'012345678905'); await click('Find barcode'); expect(host.textContent).toContain('New barcode');
  const name=Array.from(host.querySelectorAll('label')).find(x=>x.textContent?.startsWith('Item name'))!.querySelector('input')!; await input(name,'Milk'); await click('Add item');
  expect(host.textContent).toContain('Record a price'); expect(JSON.parse(localStorage.getItem('grocery-price-tracker-v1')!).observations).toHaveLength(0);
  await click('Scan barcode'); await input(host.querySelector('input[placeholder="12 or 13 digits"]')!,'0012345678905'); await click('Find barcode'); expect(host.textContent).toContain('Record a price');expect(host.textContent).toContain('Milk');expect(JSON.parse(localStorage.getItem('grocery-price-tracker-v1')!).observations).toHaveLength(0);
 });
});


