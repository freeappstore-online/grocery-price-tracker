import { describe,it,expect } from 'vitest';
import { gtin, perUnit, summary, findBarcode, type Observation, type Product } from './model';
const product:Product={id:'1',name:'Milk',category:'Dairy',barcodes:[gtin('012345678905')],packageSize:1,unit:'L'};
const row=(type:'shelf'|'purchase',price:number,unit:'kg'|'g'='kg'):Observation=>({id:String(price),productId:'1',type,price,quantity:1,unit,pricePerUnit:perUnit(price,1,unit),timestamp:'2026-01-01',notes:''});
describe('capture model',()=>{
 it('normalizes valid UPC and EAN and keeps another package distinct',()=>{expect(gtin('012345678905')).toBe(gtin('0012345678905'));expect(gtin('012345678912')).not.toBe(gtin('012345678905'));expect(findBarcode([product],'0012345678905')).toBe(product);expect(findBarcode([product],'012345678912')).toBeUndefined();expect(()=>gtin('012345678906')).toThrow();});
 it('normalizes comparable units',()=>{expect(perUnit(2.5,500,'g')).toBe(5);expect(perUnit(4.8,1,'kg')).toBe(4.8);expect(perUnit(2,500,'mL')).toBe(4);expect(perUnit(2,1,'L')).toBe(2);expect(perUnit(2,2,'each')).toBe(1);expect(perUnit(6,2,'pack')).toBe(3)});
 it('summarizes separately and excludes incomparable units',()=>{const rows=[row('shelf',5),row('purchase',3),{...row('shelf',1),unit:'each' as const}];expect(summary(rows,'kg')).toEqual({typical:4,shelf:5,purchase:3})});
 it('allows no photo',()=>expect(row('shelf',2).photoDataUrl).toBeUndefined());
});
