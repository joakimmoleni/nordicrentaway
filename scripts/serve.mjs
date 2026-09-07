import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const args=process.argv.slice(2);
const option=name=>args.includes(name)?args[args.indexOf(name)+1]:undefined;
const host=option('--host') || '127.0.0.1';
if(!['127.0.0.1','0.0.0.0'].includes(host))throw new Error('Unsupported preview host.');
const port=Number(option('--port') || process.env.PORT || 4173);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('PORT must be an integer between 0 and 65535.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
const server=createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('\0')||pathname.includes('\\')){res.writeHead(400);res.end();return;}
  let file=path.resolve(root,`.${pathname}`);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let info=await stat(file);
  if(info.isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(308,{Location:url.pathname+'/'+url.search});res.end();return;}
   file=path.join(file,'index.html');info=await stat(file);
  }
  if(!info.isFile())throw Object.assign(new Error('Not found'),{code:'ENOENT'});
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Accept-Ranges':'bytes'};
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);
  res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch(error){
  if(error instanceof URIError){res.writeHead(400);res.end('Bad request');return;}
  if(error.code==='ENOENT'||error.code==='ENOTDIR'){
   res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
   if(req.method==='HEAD')res.end();else res.end((await readFile(path.join(root,'404.html'),'utf8')).replace(/<base href="[^"]*">/,'<base href="/">'));
  }else{console.error(error.message);res.writeHead(500);res.end('Local server error');}
 }
});
server.on('error',error=>{console.error(`Could not start local preview: ${error.message}`);process.exitCode=1;});
server.listen(port,host,()=>console.log(`Local preview: http://127.0.0.1:${server.address().port}\nOnly this computer. Stop with Ctrl+C.`));
