import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>Promise.reject(new DOMException('denied','NotAllowedError'))}})});
const page=await context.newPage();
try {
 await page.goto('http://127.0.0.1:5173/');
 await page.getByRole('button',{name:'Scan barcode'}).click(); await page.getByRole('button',{name:'Start camera'}).click(); await page.getByRole('alert').getByText(/permission denied/).waitFor();
 await page.getByLabel('Manual barcode').fill('012345678905');await page.getByRole('button',{name:'Find barcode'}).click();await page.getByLabel('Item name').fill('Synthetic milk');await page.getByRole('button',{name:'Add item'}).click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('grocery-price-tracker-v1')).observations.length),0);
 await page.getByLabel('Price ($)').fill('2.50'); await page.getByRole('button',{name:'Save price'}).click(); assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('grocery-price-tracker-v1')).observations.length),1);
 await page.getByRole('button',{name:'Scan barcode'}).click();await page.getByLabel('Manual barcode').fill('0012345678905');await page.getByRole('button',{name:'Find barcode'}).click();await page.getByRole('heading',{name:'Synthetic milk'}).waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('grocery-price-tracker-v1')).observations.length),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('390px browser simulation passed: denied camera, manual first/repeat scan, explicit save, no horizontal overflow.');
} finally { await browser.close(); }
