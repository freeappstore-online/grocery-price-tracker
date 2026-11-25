export type Unit = 'each'|'pack'|'kg'|'g'|'L'|'mL';
export type Product = { id:string; name:string; category:string; barcodes:string[]; packageSize:number; unit:Unit };
export type Observation = { id:string; productId:string; type:'shelf'|'purchase'; price:number; quantity:number; unit:Unit; pricePerUnit:number; photoDataUrl?:string; timestamp:string; notes:string };
export const units:Unit[] = ['each','pack','kg','g','L','mL'];
export const categories = ['Produce','Dairy','Meat','Bakery','Pantry','Frozen','Beverages','Household','Other'];
export function gtin(value:string):string {
 const s=value.trim(); if(!/^\d{12,13}$/.test(s)) throw new Error('Enter a 12-digit UPC-A or 13-digit EAN-13.');
 const digits=[...s].map(Number); const check=digits.pop()!; const sum=digits.reverse().reduce((a,n,i)=>a+n*(i%2===0?3:1),0);
 if((10-sum%10)%10!==check) throw new Error('Barcode check digit is invalid.'); return s.padStart(14,'0');
}
export function baseUnit(unit:Unit):string { return unit==='g'||unit==='kg'?'kg':unit==='mL'||unit==='L'?'L':unit; }
export function perUnit(price:number,quantity:number,unit:Unit):number { if(!Number.isFinite(price)||price<0||!Number.isFinite(quantity)||quantity<=0) throw new Error('Enter a valid price and quantity greater than zero.'); return price/(quantity*(unit==='g'||unit==='mL'?0.001:1)); }
export function summary(rows:Observation[], unit:Unit) { const comparable=rows.filter(r=>baseUnit(r.unit)===baseUnit(unit)); const values=comparable.map(r=>r.pricePerUnit); const min=(type:Observation['type'])=>{const v=comparable.filter(r=>r.type===type).map(r=>r.pricePerUnit);return v.length?Math.min(...v):null}; return {typical:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,shelf:min('shelf'),purchase:min('purchase')}; }
export function findBarcode(products:Product[], code:string) { const normalized=gtin(code); return products.find(p=>p.barcodes.includes(normalized)); }
