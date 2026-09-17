// Isolated playtest server. Injection is response-only; dist stays publishable.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const project=fileURLToPath(new URL('../',import.meta.url));
const port=4181;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8'};
const allowedCareers=new Set(['6','12','18','24']);

async function injection(url){
  const career=url.searchParams.get('career');
  if(career&&!allowedCareers.has(career))throw Object.assign(new Error('Use career=6, 12, 18, or 24.'),{status:400});
  const fixture=career?JSON.parse(await readFile(path.join(project,'tmp',`earned-career-${career}.json`),'utf8')):null;
  const initial=fixture?{'sweep-shift-career-v1':JSON.stringify(fixture)}:{};
  const bucket=`sweep-shift-qa:v1:${career?`career-${career}`:'fresh'}`;
  const data=JSON.stringify({bucket,initial,blocked:url.searchParams.get('storage')==='blocked'}).replaceAll('<','\\u003c');
  return `<script data-sweep-qa="isolated-storage">(() => {
    const config=${data};
    if(config.blocked){
      window.sweepQaStorage={getItem(){throw new Error('QA: storage blocked');},setItem(){throw new Error('QA: storage blocked');},removeItem(){throw new Error('QA: storage blocked');}};
      return;
    }
    // Session storage belongs to this QA origin and tab. The actual player save
    // is never read or written. Each fixture has its own independent namespace.
    let values={...config.initial};
    try {
      const saved=window.sessionStorage.getItem(config.bucket);
      if(saved!==null){const parsed=JSON.parse(saved);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))values=parsed;}
      else window.sessionStorage.setItem(config.bucket,JSON.stringify(values));
    } catch {}
    const persist=()=>{try{window.sessionStorage.setItem(config.bucket,JSON.stringify(values));}catch{}};
    window.sweepQaStorage={
      getItem(key){return Object.hasOwn(values,key)?String(values[key]):null;},
      setItem(key,value){values[key]=String(value);persist();},
      removeItem(key){delete values[key];persist();}
    };
  })();</script>`;
}

http.createServer(async(req,res)=>{
  try {
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method not allowed');return;}
    const url=new URL(req.url,'http://127.0.0.1');
    const pathname=decodeURIComponent(url.pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==path.resolve(root)&&!file.startsWith(path.resolve(root)+path.sep))throw Object.assign(new Error('Not found'),{status:404});
    if(file===path.resolve(root))file=path.join(root,'index.html');
    let content=await readFile(file);
    if(file===path.join(root,'index.html')){
      const html=content.toString('utf8'),marker='<script type="module" src="app.js"></script>';
      if(!html.includes(marker))throw new Error('QA injection point missing');
      const script=await injection(url);content=Buffer.from(html.replace(marker,()=>script+marker));
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':content.length,'X-Sweep-Shift-QA':'isolated-session-storage'});
    res.end(req.method==='HEAD'?undefined:content);
  } catch(error) {
    const status=error.status||(error.code==='ENOENT'?404:500);
    res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    res.end(status===400?error.message:status===404?'Not found':'QA server error');
  }
}).listen(port,'127.0.0.1',()=>{
  console.log(`Sweep Shift isolated QA: http://127.0.0.1:${port}/?fresh=1`);
  console.log('Fixtures: ?career=6 / 12 / 18 / 24. Blocked storage: ?storage=blocked.');
});
