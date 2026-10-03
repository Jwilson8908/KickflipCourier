// Smooth presentation only: cash, hits and race results always come from the server.
export function receiveView(authoritative,previous,smooth){
 const next=structuredClone(authoritative);
 next.viewAge=0;next.viewCorrection=0;
 if(smooth&&previous?.phase==='play'&&next.phase==='play'){
  const offset=previous.distance-next.distance;
  if(Math.abs(offset)<40){next.distance+=offset;next.viewCorrection=offset;}
  next.lane=previous.lane;
  if(next.stun===0&&previous.stun===0)next.speed=previous.speed;
 }
 return next;
}
export function advanceView(s,dt,controls={}){
 if(s.phase!=='play'||s.dogIntro>0)return;
 const step=Math.min(dt,Math.max(0,.8-s.viewAge));s.viewAge+=dt;
 const correction=Math.max(-s.speed*step*.6,Math.min(s.speed*step*.6,(s.viewCorrection||0)*(1-Math.exp(-dt*9))));s.viewCorrection=(s.viewCorrection||0)-correction;
 const desired=s.stun>0?10:controls.brake?18:(controls.boost||controls.screenBoost)?(s.route==='safe'?50:60):30;s.speed+=(desired-s.speed)*Math.min(1,step*5);const travel=s.speed*step-correction;s.distance+=travel;
 if(s.difficulty==='hard')for(const o of s.obstacles)if(o.type==='car'&&!o.hit&&(o.section===undefined||o.z-s.distance<450))o.z-=14*step;
 s.lane+=(s.targetLane-s.lane)*(1-Math.exp(-dt*10));s.elapsed+=step;s.jump=Math.max(0,s.jump-step);s.time=Math.max(0,s.time-step);
}
