// Build-time preparation of the explicitly approved, pinned company photographs.
// No scraping, browser hotlinks, npm packages, or runtime image service.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const media=JSON.parse(await readFile(path.join(root,'content/media.json'),'utf8'));
const cache=path.join(root,'.cache/media');
await mkdir(cache,{recursive:true});
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const item of media.filter(item=>item.status==='approved')){
  if(!/^[a-z0-9-]+$/.test(item.id)||!/^[a-f0-9]{64}$/.test(item.sha256||''))throw new Error('Invalid pinned media metadata.');
  const url=new URL(item.source);
  if(url.protocol!=='https:'||url.hostname!=='www.nordicrentaway.com'||url.username||url.password)throw new Error('Unapproved media host.');
  const original=path.join(cache,item.sha256);
  let bytes;
  try{bytes=await readFile(original);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(!bytes){
    const response=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'NordicRentAway-Preview/1.0'}});
    if(!response.ok||new URL(response.url).hostname!==url.hostname||!/^image\/(jpeg|png|webp)/i.test(response.headers.get('content-type')||''))throw new Error(`Could not fetch approved image: ${item.id}`);
    if(Number(response.headers.get('content-length'))>16000000)throw new Error('Image exceeds 16 MB.');
    bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>16000000)throw new Error('Image exceeds 16 MB.');
    if(digest(bytes)!==item.sha256)throw new Error(`Source image changed: ${item.id}. Review the new file before approving it.`);
    await writeFile(original,bytes);
  }
  if(digest(bytes)!==item.sha256)throw new Error(`Corrupt media cache: ${item.id}`);
  const outputs=[...item.variants];
  if(!outputs.some(output=>output.src===item.fallback))outputs.push({src:item.fallback,width:Math.min(1280,item.width),type:item.fallback.endsWith('.png')?'image/png':'image/jpeg'});
  for(const output of outputs){
    if(!/^assets\/[a-zA-Z0-9/_\-.]+$/.test(output.src)||output.src.split('/').includes('..'))throw new Error('Unsafe media output path.');
    const destination=path.join(root,'public',output.src);
    await mkdir(path.dirname(destination),{recursive:true});
    const extension=path.extname(destination);
    const stage=destination.replace(new RegExp(`\\${extension}$`),`.tmp${extension}`);
    // ImageMagick is present in the build image; do not install a package silently.
    await exec('convert',[original,'-auto-orient','-strip','-resize',`${output.width}x>`,'-quality','84',stage],{timeout:45000,maxBuffer:1024*1024});
    await rename(stage,destination);
  }
  console.log(`Prepared ${item.id}: ${outputs.length} local image variants`);
}
