import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

export function publicIP(ip) {
  if (net.isIP(ip) !== 4) return false; // IPv6 deliberately unsupported in v0.1
  const [a,b,c] = ip.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===168) || (a===100&&b>=64&&b<=127) || (a===198&&(b===18||b===19)) || (a===192&&b===0) || (a===198&&b===51&&c===100) || (a===203&&b===0&&c===113));
}
export function validateURL(raw) {
  const u = new URL(raw);
  if (!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port && !['80','443'].includes(u.port)) throw Error('Only public HTTP(S) URLs on standard ports without credentials are supported');
  u.hash=''; return u.href;
}
export async function request(raw) {
  const url=new URL(validateURL(raw));
  let dnsTimer;
  const records=await Promise.race([dns.lookup(url.hostname,{all:true,family:4}), new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('DNS timeout')),10000);})]).finally(()=>clearTimeout(dnsTimer));
  if (!records.length || records.some(r=>!publicIP(r.address))) throw Error('Non-public or unsupported address');
  return await new Promise((resolve,reject)=>{
    const req=(url.protocol==='https:'?https:http).request(url,{method:'GET',headers:{'User-Agent':'SmallBatchRedirectAudit/0.1','Range':'bytes=0-0'},lookup:(_h,opts,cb)=>opts.all?cb(null,[records[0]]):cb(null,records[0].address,4)},res=>{
      const result={status:res.statusCode,location:res.headers.location??null};
      res.destroy();resolve(result);
    });
    const timer=setTimeout(()=>req.destroy(Error('Request timeout')),10000);
    req.on('close',()=>clearTimeout(timer));
    req.on('error',reject);req.end();
  });
}
export async function audit(entry, transport=request) {
  const row={url:entry.url,expectedUrl:entry.expectedUrl??null,finalUrl:null,status:null,redirects:[],verdict:'error',error:null};
  try {
    let current=validateURL(entry.url); const expected=entry.expectedUrl?validateURL(entry.expectedUrl):null;
    const seen=new Set();
    for (let i=0;i<=8;i++) {
      if(seen.has(current)){row.verdict='redirect_loop';return row;}
      seen.add(current);row.finalUrl=current;
      const result=await transport(current);row.status=result.status;
      if([301,302,303,307,308].includes(result.status)&&result.location){
        const next=validateURL(new URL(result.location,current).href);
        row.redirects.push({url:current,status:result.status,to:next}); current=next; continue;
      }
      row.verdict=[401,403,429].includes(result.status)?'blocked':result.status>=400?'http_error':result.status>=300?'unresolved_redirect':expected&&current!==expected?'wrong_destination':result.status>=200&&result.status<300?'pass':'unexpected_status';
      return row;
    }
    row.verdict='too_many_redirects';
  }catch(e){row.error=e.message;}
  return row;
}
export function validateInput(input) {
  if (!Array.isArray(input?.checks)||!input.checks.length||input.checks.length>100) throw Error('checks must contain 1–100 URL objects');
  for(const entry of input.checks){validateURL(entry.url);if(entry.expectedUrl)validateURL(entry.expectedUrl);}
  return input.checks;
}
export async function run(input,onRow=()=>{}) {
  const checks=validateInput(input),rows=[];
  for(const entry of checks){const row=await audit(entry);rows.push(row);await onRow(row);await new Promise(r=>setTimeout(r,250));}
  return rows;
}
