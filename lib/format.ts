// Utilidades de formato compartidas (moneda COP, números en letras, etc.).

export function cop(n: number): string{ return "$"+Math.round(n).toLocaleString("es-CO"); }
export function numberToWords(n: number): string{
  n = Math.round(n);
  if(n===0) return "CERO";
  const UNI = ["","UN","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE","DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE","VEINTE"];
  const DEC = ["","","VEINTI","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  const CEN = ["","CIENTO","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];
  function tri2(x: number): string{
    if(x===0) return "";
    const c=Math.floor(x/100), r=x%100;
    let s = c>0 ? (x===100?"CIEN":CEN[c])+" " : "";
    if(r===0) return s.trim();
    if(r<=20) s += UNI[r];
    else if(r<30) s += "VEINTI"+UNI[r-20];
    else { const d=Math.floor(r/10), u=r%10; s += DEC[d] + (u>0?" Y "+UNI[u]:""); }
    return s.trim();
  }
  const millones = Math.floor(n/1000000);
  const miles = Math.floor((n%1000000)/1000);
  const cientos = n%1000;
  const parts: string[] = [];
  if(millones>0) parts.push(millones===1?"UN MILLÓN":tri2(millones)+" MILLONES");
  if(miles>0) parts.push(miles===1?"MIL":tri2(miles)+" MIL");
  if(cientos>0) parts.push(tri2(cientos));
  return parts.join(" ").trim();
}
export function copWords(n: number): string{ return numberToWords(n) + " PESOS M/CTE"; }
export function stars(n: number): string{ const full=Math.round(n); return "★★★★★☆☆☆☆☆".slice(5-full,10-full); }
export function catLabel(cat: string): string{ return cat==="alojamientos"?"Fincas y Cabañas":cat==="parques"?"Parques Temáticos":"Tours"; }
export function esc(s: unknown): string { return String(s).replace(/[&<>"']/g, function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[c];}); }
