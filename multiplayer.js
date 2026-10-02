export class Multiplayer {
 constructor(onState){this.onState=onState;this.room=null;this.token=null;this.seq=0;this.pending={};this.busy=false;this.last=0;this.error='';}
 async call(action,extra={}){const r=await fetch('/api/race',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,code:this.room?.code,token:this.token,...extra})});const data=await r.json();if(!r.ok)throw Error(data.error||'Connection lost');if(data.token)this.token=data.token;this.room=data.room;this.error='';this.onState(this.room);return data;}
 async enter(action,name,code){await this.call(action,{name,code});this.seq=0;}
 collect(keys){for(const k of ['left','right','jump','deliver']){if(keys[k]){this.pending[k]=true;keys[k]=false;}}if(keys.toyLeft||keys.toyRight){this.pending.toy=keys.toyLeft?-1:1;keys.toyLeft=keys.toyRight=false;}}
 tick(now,keys){if(!this.room||this.busy||now-this.last<160)return;this.last=now;this.busy=true;const batch=this.pending;this.pending={};const input={...batch,boost:!!(keys.boost||keys.screenBoost),brake:!!keys.brake};this.call(this.room.phase==='race'?'input':'poll',{seq:++this.seq,input}).catch(e=>{this.error=e.message;for(const k of ['left','right','jump','deliver','toy'])if(batch[k])this.pending[k]=batch[k];}).finally(()=>this.busy=false);}
 async leave(){const r=this.room;try{await this.call('leave');}catch{}this.room=null;this.token=null;this.pending={};this.onState(null);}
}
