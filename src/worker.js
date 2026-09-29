const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const ready=env=>env.FORM_ENABLED==='true'&&!!env.DB&&!!env.TURNSTILE_SITE_KEY&&!!env.TURNSTILE_SECRET_KEY;
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
  if(url.pathname==='/api/config')return request.method==='GET'?json({enabled:ready(env),siteKey:ready(env)?env.TURNSTILE_SITE_KEY:null}):json({error:'Method not allowed'},405);
  if(url.pathname!=='/api/inquiries')return json({error:'Not found'},404);
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(!ready(env))return json({error:'Online enquiries are unavailable. Please email hello@nevquo.com.'},503);
  if(request.headers.get('Origin')!==url.origin)return json({error:'This request is not permitted.'},403);
  if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return json({error:'Expected JSON.'},415);
  if(Number(request.headers.get('Content-Length'))>20000)return json({error:'Message is too large.'},413);
  try{
   // Limit the actual stream, including requests without a Content-Length header.
   const reader=request.body?.getReader();if(!reader)return json({error:'Missing message.'},400);
   let size=0,chunks=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>20000){await reader.cancel();return json({error:'Message is too large.'},413)}chunks.push(value)}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
   let data;try{data=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'Invalid message format.'},400)}
   if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Invalid message.'},400);
   const text=key=>typeof data[key]==='string'?data[key].trim():'';
   if(text('website'))return json({error:'Unable to accept this message.'},400);
   const name=text('name'),email=text('email'),message=text('message'),type=text('type'),token=text('cf-turnstile-response');
   if(!name||name.length>120||email.length>190||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||message.length>4000||!['Website project','Concept feedback','Other question'].includes(type)||data.consent!=='on')return json({error:'Please check your name, email, topic, consent and message (10–4,000 characters).'},400);
   if(!token||token.length>2048)return json({error:'Please complete the security check.'},400);
   const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(8000)});
   if(!verification.ok)return json({error:'Security verification is unavailable. Please try later.'},503);
   const check=await verification.json();if(!check.success||check.hostname!==url.hostname||check.action!=='inquiry')return json({error:'The security check expired or failed. Please try again.'},400);
   const id=crypto.randomUUID(),reference='FA-'+id.toUpperCase();
   await env.DB.prepare('INSERT INTO inquiries (id, reference, name, email, project_type, message, consent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id,reference,name,email.toLowerCase(),type,message,1,new Date().toISOString()).run();
   return json({ok:true,reference},201);
  }catch{return json({error:'We could not confirm that your message was saved. Please email hello@nevquo.com before retrying.'},503)}
 }
};
