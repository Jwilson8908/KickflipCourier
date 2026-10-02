import {createShift,update} from '../dist/engine.js';
export function advance(room,now){
 if(room.phase==='countdown'&&now>=room.starts){room.phase='race';room.tick=room.starts;}
 if(room.phase!=='race')return;
 const end=room.starts+60000,until=Math.min(now,end);let steps=0;
 while(room.tick<until&&steps++<1300){const dt=Math.min(.05,(until-room.tick)/1000);room.tick+=dt*1000;
  for(const p of room.players){const s=p.game;if(!s)continue;const input=room.tick-p.seen>1500?{}:{...p.input};
   const rng=()=>{p.rng=(Math.imul(1664525,p.rng)+1013904223)>>>0;return p.rng/4294967296;};
   s.event=null;update(s,input,dt,rng);if(s.dogIntro>0){s.dogIntro=0;s.event='bark';}if(s.event){s.soundEvent=s.event;s.soundSerial=(s.soundSerial||0)+1;}for(const k of ['left','right','jump','deliver','toy','route'])p.input[k]=false;
   s.time=Math.max(0,(end-room.tick)/1000);
  }
 }
 if(now>=end){room.phase='results';for(const p of room.players)if(p.game.phase==='play')p.game.phase='complete';}
}
export function mutate(room,b,now){advance(room,now);const p=room.players.find(p=>p.token===b.token);
 if(b.action==='join'){if(room.phase!=='lobby')throw Error('Race already started. Wait for the next race.');if(room.players.length>=4)throw Error('Room is full.');room.players.push(player(b,now));return room.players.at(-1);}
 if(!p)throw Error('Rejoin this room to play.');p.seen=now;
 if(b.action==='resume')p.input={};
 if(b.action==='leave'){room.players=room.players.filter(x=>x!==p);if(p.id===room.host)room.host=room.players[0]?.id;return p;}
 if(b.action==='start'||b.action==='rematch'){
  if(p.id!==room.host)throw Error('Only the host can start the race.');
  if(!['lobby','results'].includes(room.phase))throw Error('Race already underway.');
  const online=room.players.filter(x=>now-x.seen<10000);if(online.length<2)throw Error('Two connected couriers are needed.');room.players=online;room.phase='countdown';room.starts=now+3500;room.tick=room.starts;room.round++;
  const seed=(now>>>0);for(const x of room.players){x.rng=seed;x.input={};x.seq=0;x.game=createShift(0);x.game.toys=1;x.game.dogIntro=0;x.game.dogEvents=0;x.game.dogReadyAt=14;x.game.forkAt=1e12;x.game.spawnAt=1e12;
let terrain=seed;const terrainRandom=()=>{terrain=(Math.imul(1664525,terrain)+1013904223)>>>0;return terrain/4294967296;};
for(let z=700;z<4000;z+=170){const types=['car','barrel','rail','ramp','sprinkler','car','barrel','rail','ramp','sprinkler','toy','rail'],type=types[Math.floor(terrainRandom()*types.length)];x.game.obstacles.push({z,lane:Math.floor(terrainRandom()*3)-1,type,length:type==='rail'?180:0,hit:false});}}
 }
 if(b.action==='input'&&room.phase==='race'&&Number.isSafeInteger(b.seq)&&b.seq>p.seq){p.seq=b.seq;const i=b.input||{};p.input={boost:!!i.boost,brake:!!i.brake};if(Array.isArray(i.laneSteps)){for(const direction of i.laneSteps.slice(0,8))if(direction===-1||direction===1)p.game.targetLane=Math.max(-1,Math.min(1,p.game.targetLane+direction));}for(const k of ['left','right','jump','deliver'])if(i[k]&&(!Array.isArray(i.laneSteps)||!['left','right'].includes(k)))p.input[k]=true;if(i.toy===-1||i.toy===1)p.input.toy=i.toy;}
 return p;
}
export function player(b,now){return {id:crypto.randomUUID(),token:crypto.randomUUID(),name:String(b.name||'Courier').trim().slice(0,18)||'Courier',seen:now,input:{},seq:0,rng:1,game:null};}
export function publicRoom(r,token,now){return {code:r.code,phase:r.phase,host:r.host,round:r.round,starts:r.starts,now,players:r.players.map(p=>({id:p.id,name:p.name,online:now-p.seen<10000,seq:p.token===token?p.seq:undefined,queuedJump:p.token===token?!!p.input.jump:undefined,game:p.token===token?p.game:p.game?{cash:p.game.cash,jobs:p.game.jobs,tricks:p.game.tricks,phase:p.game.phase}:null})),you:r.players.find(p=>p.token===token)?.id};}
export async function roomAPI(req,env){
 const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
 if(req.method!=='POST')return json({error:'Use POST'},405);
 if(Number(req.headers.get('content-length')||0)>4096)return json({error:'Request too large'},413);
 let b;try{const raw=await req.text();if(raw.length>4096)return json({error:'Request too large'},413);b=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
 try{const now=Date.now();if(b.action==='create'){
  const p=player(b,now);for(let i=0;i<5;i++){const code=Array.from(crypto.getRandomValues(new Uint8Array(5)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');const r={code,phase:'lobby',host:p.id,round:0,starts:0,tick:now,players:[p]};const res=await env.DB.prepare('INSERT OR IGNORE INTO courier_rooms (code,state,revision,updated) VALUES (?,?,0,?)').bind(code,JSON.stringify(r),now).run();if(res.meta.changes)return json({room:publicRoom(r,p.token,now),token:p.token});}throw Error('Try creating the room again.');
 }
 const code=String(b.code||'').toUpperCase();if(!/^[A-Z2-9]{5}$/.test(code))return json({error:'Enter the five-character room code.'},400);
 for(let attempt=0;attempt<8;attempt++){
  const row=await env.DB.prepare('SELECT state,revision,updated FROM courier_rooms WHERE code=?').bind(code).first();if(!row||now-row.updated>7200000)return json({error:'Room expired or not found. Create a new room.'},404);
  const r=JSON.parse(row.state);const p=mutate(r,b,now);const res=await env.DB.prepare('UPDATE courier_rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?').bind(JSON.stringify(r),now,code,row.revision).run();if(res.meta.changes)return json({room:publicRoom(r,p.token,now),...(b.action==='join'?{token:p.token}:{})});
 }return json({error:'Room busy. Retrying…'},409);
 }catch(e){return json({error:e.message||'Multiplayer temporarily unavailable.'},400);}
}
