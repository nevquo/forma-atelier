import test from 'node:test';import assert from 'node:assert/strict';import worker from '../src/worker.js';
const body={name:'Test visitor',email:'test@example.com',type:'Concept feedback',message:'A test message for the concept.',consent:'on','cf-turnstile-response':'test-token'};
const req=(data=body,headers={})=>new Request('https://example.com/api/inquiries',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json',...headers},body:JSON.stringify(data)});
let writes=0;const env={FORM_ENABLED:'true',TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret',DB:{prepare:()=>({bind:(...values)=>({run:async()=>{assert.equal(values.length,8);assert.equal(values[2],'Test visitor');assert.equal(values[3],'test@example.com');assert.equal(values[6],1);assert.ok(!Number.isNaN(Date.parse(values[7])));writes++}})})}};
test('form disabled by default',async()=>{const r=await worker.fetch(req(),{});assert.equal(r.status,503)});
test('config does not expose the secret',async()=>{const r=await worker.fetch(new Request('https://example.com/api/config'),env);assert.deepEqual(await r.json(),{enabled:true,siteKey:'site'})});
test('rejects cross-origin submission',async()=>assert.equal((await worker.fetch(req(body,{Origin:'https://evil.example'}),env)).status,403));
test('rejects oversized request',async()=>assert.equal((await worker.fetch(req({...body,message:'x'.repeat(21000)}),env)).status,413));
test('rejects missing consent',async()=>assert.equal((await worker.fetch(req({...body,consent:''}),env)).status,400));
test('rejects invalid email',async()=>assert.equal((await worker.fetch(req({...body,email:'not-email'}),env)).status,400));
test('rejects honeypot',async()=>assert.equal((await worker.fetch(req({...body,website:'spam'}),env)).status,400));
test('rejects missing token',async()=>assert.equal((await worker.fetch(req({...body,'cf-turnstile-response':''}),env)).status,400));
test('GET cannot insert an enquiry',async()=>assert.equal((await worker.fetch(new Request('https://example.com/api/inquiries'),env)).status,405));
test('unknown API path returns 404',async()=>assert.equal((await worker.fetch(new Request('https://example.com/api/unknown'),env)).status,404));
test('verified message is saved before success; verification and storage failures fail closed',async()=>{
 const original=globalThis.fetch;try{
  globalThis.fetch=async()=>Response.json({success:true,hostname:'example.com',action:'inquiry'});
  const r=await worker.fetch(req(),env);assert.equal(r.status,201);assert.match((await r.json()).reference,/^FA-/);assert.equal(writes,1);
  globalThis.fetch=async()=>Response.json({success:true,hostname:'other.example',action:'inquiry'});assert.equal((await worker.fetch(req(),env)).status,400);assert.equal(writes,1);
  globalThis.fetch=async()=>Response.json({success:false});assert.equal((await worker.fetch(req(),env)).status,400);
  globalThis.fetch=async()=>Response.json({success:true,hostname:'example.com',action:'inquiry'});
  const bad={...env,DB:{prepare:()=>{throw Error('Unavailable')}}};assert.equal((await worker.fetch(req(),bad)).status,503);
 }finally{globalThis.fetch=original}
});
