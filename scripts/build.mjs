import fs from 'node:fs';
const engine=fs.readFileSync('dist/engine.js','utf8').replace(/export /g,'');
const rooms=fs.readFileSync('server/rooms.js','utf8').replace(/^import .*;\n/,'').replace(/export /g,'');
const files=Object.fromEntries(['index.html','style.css','game.js','engine.js','audio.js','multiplayer.js','network-view.js','dog.png','icon.svg'].map(f=>['/'+f,{body:fs.readFileSync('dist/'+f).toString('base64'),type:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':f.endsWith('.svg')?'image/svg+xml':'text/html'}]));
const worker=engine+'\n'+rooms+'\nconst FILES='+JSON.stringify(files)+`;export default {async fetch(req,env){const u=new URL(req.url);if(u.pathname==='/api/race')return roomAPI(req,env);const file=FILES[u.pathname==='/'?'/index.html':u.pathname];if(!file)return new Response('Not found',{status:404});return new Response(Uint8Array.from(atob(file.body),c=>c.charCodeAt(0)),{headers:{'Content-Type':file.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}};`;
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',worker);console.log('Built multiplayer Worker');
