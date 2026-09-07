import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {safeURL} from '../src/templates/html.mjs';

const json = async file => JSON.parse(await readFile(file,'utf8'));
const arrayFromDirectory = async dir => Promise.all((await readdir(dir)).filter(f=>f.endsWith('.json')).sort().map(f=>json(path.join(dir,f))));
export async function loadModel(root, mode='development') {
  const content=path.join(root,'content');
  const model={root,mode,pages:{}};
  for(const name of ['site','team','media','redirects','video']) model[name]=await json(path.join(content,`${name}.json`));
  for(const name of ['home','services','properties','about','contact']) model.pages[name]=await json(path.join(content,'pages',`${name}.json`));
  model.services=(await arrayFromDirectory(path.join(content,'services'))).sort((a,b)=>a.order-b.order);
  model.properties=(await arrayFromDirectory(path.join(content,'properties'))).sort((a,b)=>a.order-b.order);
  model.baseUrl=mode==='production'?`${model.site.canonicalOrigin}/`:(process.env.PREVIEW_URL || model.site.previewUrl || `${model.site.canonicalOrigin}/`);
  const base=new URL(model.baseUrl);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||!base.pathname.endsWith('/'))throw new Error('Invalid website base URL.');
  return model;
}
export function assetPath(value) {
  if(typeof value!=='string' || !/^assets\/[a-zA-Z0-9/_\-.]+$/.test(value) || value.split('/').includes('..') || value.includes('//')) throw new Error(`Invalid local asset path: ${value}`);
  return value;
}
export async function validateModel(model) {
 const errors=[],warnings=[];
 const check=(truth,text)=>{if(!truth)errors.push(text);};
 const text=(value,label)=>check(typeof value==='string' && value.trim().length>0,label+' must be non-empty text.');
 const https=(value,label)=>{try{safeURL(value);}catch{errors.push(label+' must be an HTTPS URL without credentials.');}};
 const positive=(value,label)=>check(Number.isInteger(value)&&value>0,label+' must be a positive integer.');
 const verified=(item,label)=>{https(item.source,label+' source');check(/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt || ''),label+' needs a verification date.');};
 const email=value=>check(typeof value==='string'&&/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(value),'Invalid contact email.');
 const phone=value=>check(typeof value==='string'&&/^\+[0-9 ]{8,22}$/.test(value),'Invalid international phone number.');
 const unique=(items,key,label)=>{const seen=new Set(); for(const x of items){text(x[key],label+' '+key);check(!seen.has(x[key]),`Duplicate ${label} ${key}: ${x[key]}`);seen.add(x[key]);}};
 const asset=async (value,label)=>{try {assetPath(value);const f=path.join(model.root,'public',value);check((await stat(f)).isFile(),label+' is not a file.');}catch{errors.push(label+' must exist in public/assets.');}};
 check(model.site.schemaVersion===1,'Unsupported schemaVersion.');
 check(model.site.language==='en'&&JSON.stringify(model.site.availableLanguages)==='["en"]','Only the complete English edition is supported.');
 https(model.site.canonicalOrigin,'Canonical origin');
 try {const u=new URL(model.site.canonicalOrigin);check(u.pathname==='/'&&!u.search&&!u.hash,'Canonical origin must not contain a path, query or fragment.');}catch{}
 https(model.site.bookingUrl,'Booking URL');https(model.site.recommendationsUrl,'Recommendations URL');
 text(model.site.name,'Site name');text(model.site.companyName,'Company name');text(model.site.area?.en,'Area');
 for(const [key,value] of Object.entries(model.site.ui.en)) text(value,`UI ${key}`);
 unique(model.team,'id','person');
 check(model.team.some(p=>p.id===model.site.ownerContactId),'The owner contact must identify a team member.');
 for(const p of model.team){text(p.name,'Person name');text(p.role?.en,'Person role');email(p.email);phone(p.phone);verified(p,'Person');}
 email(model.site.guestContact.email);phone(model.site.guestContact.phone);email(model.site.generalEmail);
 unique(model.media,'id','media');
 const mediaIds=new Set(model.media.map(m=>m.id));
 for(const m of model.media){
   check(['pending','approved'].includes(m.status),'Invalid media status.');https(m.sourcePage,'Media source page');text(m.caption?.en,'Media caption');
   for(const axis of ['x','y'])check(typeof m.focus?.[axis]==='number'&&m.focus[axis]>=0&&m.focus[axis]<=100,'Media focus must be 0–100.');
   if(m.status==='approved'){
     https(m.source,'Media provenance');positive(m.width,'Media width');positive(m.height,'Media height');text(m.alt?.en,'Media alt text');
     await asset(m.fallback,'Media fallback');check(Array.isArray(m.variants)&&m.variants.length>0,'Approved media needs responsive variants.');
     const seen=new Set();
     for(const v of m.variants || []){positive(v.width,'Variant width');check(['image/avif','image/webp','image/jpeg','image/png'].includes(v.type),'Invalid variant MIME type.');check(v.width<=m.width,'Variant cannot exceed original width.');check(!seen.has(v.type+v.width),'Duplicate media variant width/type.');seen.add(v.type+v.width);await asset(v.src,'Media variant');}
   } else warnings.push(`Approved photo missing: ${m.id} (${m.caption.en}).`);
 }
 unique(model.services,'id','service');unique(model.services,'slug','service');
 unique(model.properties,'id','property');unique(model.properties,'slug','property');
 for(const collection of [model.services,model.properties]) for(const item of collection){
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug),'Slugs must be lower-case URL-safe words.');
  check(['draft','published'].includes(item.status),'Invalid publication status.');
  positive(item.order,'Display order');
  if(item.status!=='published')continue;
  verified(item,item.id);text(item.en?.seoTitle,'SEO title');text(item.en?.seoDescription,'SEO description');
 }
 for(const s of model.services.filter(s=>s.status==='published')){
   text(s.en.title,'Service title');text(s.en.summary,'Service summary');text(s.en.description,'Service description');
   check(Array.isArray(s.en.rows)&&s.en.rows.length>0,'Published service needs content rows.');
   for(const row of s.en.rows||[]){text(row.title,'Service row title');text(row.text,'Service row text');}
 }
 for(const p of model.properties.filter(p=>p.status==='published')){
   text(p.en?.name,'Property name');text(p.en?.description,'Property description');text(p.town,'Property town');text(p.type?.en,'Property type');
   check(Array.isArray(p.mediaIds),'Property media references must be an array.');
   for(const id of p.mediaIds||[])check(mediaIds.has(id),`Unknown media ID: ${id}`);
   if(p.bookingUrl!=null)https(p.bookingUrl,'Property booking URL');
   for(const key of ['guests','bedrooms','bathrooms'])if(p[key]!=null)positive(p[key],`Property ${key}`);
   if(p.scope!=null){text(p.scope.en,'Project scope');https(p.scopeSource,'A project contribution needs its own evidence source');}
   if(model.mode==='production')check(p.mediaIds.length>0&&p.mediaIds.every(id=>model.media.find(m=>m.id===id)?.status==='approved'),'Production property needs approved images.');
 }
 for(const [name,page] of Object.entries(model.pages)){
  check(!!page.en,`Page ${name} needs English content.`);
  for(const field of ['seoTitle','seoDescription','heading','intro'])text(page.en?.[field],`${name}.${field}`);
 }
 check(model.pages.contact.en.form.enabled===false,'The enquiry form is deliberately not connected. Do not enable it without implementing a real receiver.');
 check(model.pages.contact.en.form.endpoint===null,'No new form service may be added through content configuration.');
 check(['unconfigured','approved'].includes(model.video.status),'Invalid video status.');
 if(model.video.status==='approved'){await asset(model.video.source,'Video source');await asset(model.video.poster,'Video poster');text(model.video.title?.en,'Video title');if(model.video.captions)await asset(model.video.captions,'Captions');}
 unique(model.redirects,'from','redirect');
 for(const rule of model.redirects){check(/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(rule.from),'Invalid old URL.');if(rule.to!=null){check(/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(rule.to),'Invalid redirect destination.');check(rule.to!==rule.from,'A redirect must not point to itself.');}}
 const targets=new Map(model.redirects.filter(r=>r.to).map(r=>[r.from,r.to]));
 for(const start of targets.keys()){const seen=new Set([start]);let next=targets.get(start);while(targets.has(next)){if(seen.has(next)){errors.push('Redirect cycle: '+start);break;}seen.add(next);next=targets.get(next);}}
 if(model.mode==='production'){
   check(model.site.canonicalOriginConfirmed===true,'Production domain must be confirmed.');
   for(const [key,value] of Object.entries(model.site.production))check(value===true,'Production approval missing: '+key);
   check(model.site.production.contentApproved===true&&model.site.production.mediaApproved===true&&model.site.production.legalReviewed===true&&model.site.production.publishingConfigured===true&&model.site.production.languagesConfirmed===true,'All named production approvals are mandatory.');
 } else warnings.push('Preview: noindex enabled; company production website is unchanged.');
 return {errors,warnings};
}
