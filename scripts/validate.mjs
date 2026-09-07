import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadModel, validateModel} from './model.mjs';

export async function validateOutput(pages, outputDirectory) {
 const errors=[],titles=new Set(),canonicals=new Set();
 const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
 const idsByFile=new Map([...pages].map(([route,html])=>[route,[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>decode(x[1]))]));
 for(const [route,html] of pages){
   const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
   if(!title||titles.has(title))errors.push(`Missing or duplicate title: ${route}`);titles.add(title);
   const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
   if(!canonical||canonicals.has(canonical))errors.push(`Missing or duplicate canonical: ${route}`);canonicals.add(canonical);
   if((html.match(/<h1(?:\s[^>]*)?>/g)||[]).length!==1)errors.push(`Exactly one H1 required: ${route}`);
   if(!html.includes('<main ')||!html.includes('<html lang="en">'))errors.push(`Missing page landmarks/language: ${route}`);
   const ids=idsByFile.get(route);if(new Set(ids).size!==ids.length)errors.push(`Duplicate IDs: ${route}`);
   if(/<form\b|\bon\w+\s*=|javascript:|<iframe\b/i.test(html))errors.push(`Unsupported active markup: ${route}`);
   const base=html.match(/<base href="([^"]+)">/);
   if(base && (route!=='404.html' || base[1]!==new URL(canonical).pathname.replace(/404\.html$/, '')))errors.push(`Invalid error-page base: ${route}`);
   const linkMarkup=base?html.replace(base[0],''):html;
   for(const [,attribute,value] of linkMarkup.matchAll(/\b(href|src|poster)="([^"]*)"/g)){
     if(!value){if(attribute!=='src')errors.push(`Empty ${attribute}: ${route}`);continue;}
     const url=decode(value);
     if(/^(https:\/\/|mailto:|tel:)/.test(url))continue;
     if(/^[a-z]+:/i.test(url)||url.startsWith('//')||url.startsWith('/')){errors.push(`Unexpected non-relative URL: ${route}: ${url}`);continue;}
     const [file,hash]=url.split('#');
     const resolved=file?path.posix.normalize(path.posix.join(path.posix.dirname(route),decodeURIComponent(file))):route;
     if(resolved.startsWith('../')){errors.push(`Escaping path: ${route}: ${url}`);continue;}
     if(pages.has(resolved)){
       if(hash&&!idsByFile.get(resolved).includes(decodeURIComponent(hash)))errors.push(`Missing fragment: ${route}: ${url}`);
     } else {
       try{if(!(await stat(path.join(outputDirectory,resolved))).isFile())errors.push(`Not a file: ${url}`);}catch{errors.push(`Missing local target: ${route}: ${url}`);}
     }
   }
 }
 return errors;
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 try{
   const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
   const report=await validateModel(await loadModel(root,process.argv.includes('--production')?'production':'development'));
   for(const warning of report.warnings)console.warn('NOTE:',warning);
   for(const error of report.errors)console.error('ERROR:',error);
   if(report.errors.length)process.exitCode=1; else console.log('Content validation passed.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
