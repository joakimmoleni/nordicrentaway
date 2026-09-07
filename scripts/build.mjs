import {cp, mkdir, readFile, writeFile, rm, rename, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {loadModel, validateModel} from './model.mjs';
import {validateOutput} from './validate.mjs';
import {renderPages} from '../src/templates/pages.mjs';
import {escapeHTML} from '../src/templates/html.mjs';

export async function build({root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),mode='development',outDir='dist'}={}) {
 const model=await loadModel(root,mode);
 const report=await validateModel(model);
 if(report.errors.length)throw new Error('Content validation failed:\n'+report.errors.join('\n'));
 const destination=path.resolve(root,outDir);
 // A separate staging directory means a failed render never writes into dist.
 const stage=path.join(path.dirname(destination),`.dist-stage-${process.pid}-${Date.now()}`);
 const previous=path.join(path.dirname(destination),`.dist-previous-${process.pid}-${Date.now()}`);
 let movedPrevious=false;
 try{
   await mkdir(path.join(stage,'assets'),{recursive:true});
   await cp(path.join(root,'public'),stage,{recursive:true});
   const css=(await Promise.all(['tokens','base','layout','components'].map(name=>readFile(path.join(root,'src/styles',`${name}.css`),'utf8')))).join('\n');
   await writeFile(path.join(stage,'assets/site.css'),css);
   await cp(path.join(root,'src/scripts'),path.join(stage,'assets/scripts'),{recursive:true});
   const pages=renderPages(model);
   for(const [route,html] of pages){await mkdir(path.dirname(path.join(stage,route)),{recursive:true});await writeFile(path.join(stage,route),html);}
   const outputErrors=await validateOutput(pages,stage);
   if(outputErrors.length)throw new Error('Output validation failed:\n'+outputErrors.join('\n'));
   const sitemap=[...pages.keys()].filter(r=>r!=='404.html').map(route=>{
     const url=new URL(route==='index.html'?'':route.replace(/index\.html$/,''),model.baseUrl).href;
     return `  <url><loc>${escapeHTML(url)}</loc></url>`;
   }).join('\n');
   await writeFile(path.join(stage,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
   await writeFile(path.join(stage,'robots.txt'),mode==='production'?`User-agent: *\nAllow: /\nSitemap: ${model.site.canonicalOrigin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
   let jsBytes=0;for(const name of ['main','navigation','gallery','media'])jsBytes+=gzipSync(await readFile(path.join(root,'src/scripts',`${name}.js`))).length;
   const metrics={pages:pages.size,cssGzipBytes:gzipSync(css).length,jsGzipBytes:jsBytes,mode,externalRuntimeRequests:0};
   if(metrics.cssGzipBytes>40000||metrics.jsGzipBytes>40000)throw new Error('Own-code size budget exceeded.');
   await writeFile(path.join(stage,'build-report.json'),JSON.stringify({...metrics,notes:report.warnings},null,2)+'\n');
   try{await stat(destination);await rename(destination,previous);movedPrevious=true;}catch(error){if(error.code!=='ENOENT')throw error;}
   try{await rename(stage,destination);}catch(error){if(movedPrevious){await rename(previous,destination);movedPrevious=false;}throw error;}
   if(movedPrevious)await rm(previous,{recursive:true,force:true});
   return {...metrics,warnings:report.warnings};
 } finally {await rm(stage,{recursive:true,force:true});}
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){try{const result=await build({mode:process.argv.includes('--production')?'production':'development'});console.log(JSON.stringify(result,null,2));}catch(error){console.error(error.message);process.exitCode=1;}}
