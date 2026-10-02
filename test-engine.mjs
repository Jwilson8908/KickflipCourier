import assert from 'node:assert/strict';import {createShift as makeShift,update} from './dist/engine.js';
function createShift(choice=0){const s=makeShift(choice);s.forkAt=Infinity;return s;}
let s=createShift(0);s.obstacles=[];s.distance=s.job.at;s.lane=s.targetLane=-1;update(s,{deliver:true},.01,()=>.9);assert.equal(s.jobs,1);assert.equal(s.cash,50);assert.ok(s.time>60);
s=createShift(1);s.chase=true;s.dogGap=10;s.obstacles=[];s.distance=s.job.at;s.lane=s.targetLane=1;update(s,{deliver:true},.01,()=>.9);assert.equal(s.hazard,50);assert.equal(s.cash,110);
s=createShift();s.chase=true;s.dogGap=.001;s.speed=18;update(s,{brake:true},.05,()=>.9);assert.equal(s.phase,'ambulance');for(let n=0;n<118;n++)update(s,{},.05);assert.equal(s.phase,'fired');
s=createShift();s.chase=true;s.dogGap=23.99;s.speed=60;update(s,{boost:true},.05);assert.equal(s.chase,true,'Reaching a lead does not instantly escape');for(let n=0;n<61;n++)update(s,{boost:true},.05,()=>.9);assert.equal(s.chase,false);assert.equal(s.cash,15);
s=createShift();s.obstacles=[{z:1,lane:0,type:'car'}];update(s,{},.01);assert.equal(s.crashes,1);assert.ok(s.time<57);assert.equal(s.phase,'ambulance');assert.equal(s.endReason,'car');
s=createShift();s.obstacles=[{z:1,lane:0,type:'rail'}];update(s,{jump:true},.01,()=>0);assert.equal(s.crashes,0);assert.equal(s.cash,12);assert.equal(s.tricks,1);
s=createShift();s.distance=s.job.at+101;update(s,{},.01);assert.ok(s.time<54);assert.ok(s.job.at>s.distance);
s=createShift();s.time=.001;update(s,{},.01);assert.equal(s.phase,'complete');console.log('PASS delivery, Hazard Pay, dog catch/ambulance/firing, escape, collisions, jump/grind, missed job, shift complete');
{
 const s=createShift();s.lane=s.targetLane=-1;s.obstacles=[{z:14,lane:0,type:'car',hit:false}];update(s,{},.05,()=>.5);s.lane=s.targetLane=0;update(s,{},.05,()=>.5);assert.equal(s.crashes,0,'Entering a lane after safely passing its car must not cause a late collision');
 console.log('PASS passed-car lane change regression');
}
{
 const s=createShift();for(let n=0;n<4;n++){update(s,{jump:true},.01,()=>(n%3+.1)/3);assert.equal(s.trickType,n%3);const count=s.tricks;update(s,{jump:true},.01,()=>.9);assert.equal(s.tricks,count,'Airborne presses cannot award duplicate tips');for(let i=0;i<25;i++)update(s,{},.05,()=>.9);assert.equal(s.jump,0);}assert.equal(s.cash,16);console.log('PASS trick rotation, cooldown, rewards and landing');
}
{
 const s=createShift();s.chase=true;s.dogGap=10;s.lane=s.targetLane=1;update(s,{},.05,()=>.9);assert.ok(s.dogLane>0&&s.dogLane<1,'Dog follows right with a reaction delay');s.lane=s.targetLane=-1;for(let i=0;i<15;i++)update(s,{},.05,()=>.9);assert.ok(s.dogLane<-.7,'Dog follows across to the left');s.dogGap=-1;s.dogLane=1;update(s,{},.01,()=>.9);assert.equal(s.phase,'play','Dog cannot catch player across the road');s.dogLane=-1;update(s,{},.01,()=>.9);assert.equal(s.phase,'ambulance');console.log('PASS dog lane pursuit and physical catch');
}
{
 for(let type=0;type<6;type++){const s=createShift();s.obstacles=[{z:1,lane:0,type:'ramp'}];update(s,{},.01,()=>(type+.1)/6);assert.equal(s.trickType,type+3);assert.equal(s.jumpDuration,1.8);assert.equal(s.cash,[18,24,30,22,26,32][type]);for(let i=0;i<40;i++)update(s,{},.05,()=>.9);assert.equal(s.jump,0);}
 const s=createShift();s.obstacles=[{z:1,lane:0,type:'rail',length:140}];update(s,{jump:true},.01,()=>0);assert.ok(s.grindEnd);const initial=s.cash;for(let i=0;i<99;i++)update(s,{},.05,()=>.9);assert.equal(s.grindEnd,0);assert.ok(s.cash>=initial+25,'Long rail pays distance tips and finish bonus');const cash=s.cash;update(s,{},.05,()=>.9);assert.equal(s.cash,cash,'Finish pays once');
 const off=createShift();off.obstacles=[{z:1,lane:0,type:'rail',length:140}];update(off,{jump:true},.01,()=>0);for(let i=0;i<10;i++)update(off,{right:i===0},.05,()=>.9);assert.equal(off.grindEnd,0,'Leaving lane ends grind');console.log('PASS randomized tricks, ramp big air, extended grind rewards and cancellation');
}
{
 const s=createShift();s.obstacles=[{z:1,lane:1,type:'rail',length:140}];update(s,{},.05,()=>0);assert.equal(s.obstacles[0].hit,undefined,'Missed rail front remains catchable');assert.equal(s.crashes,0);s.lane=s.targetLane=1;update(s,{jump:true},.05,()=>0);assert.ok(s.grindEnd,'Jump after passing front catches remaining rail');const cash=s.cash;update(s,{},.05,()=>0);assert.equal(s.cash,cash,'Rail entry pays only once');
 const early=createShift();early.obstacles=[{z:28,lane:0,type:'rail',length:140}];update(early,{jump:true},.01,()=>0);assert.ok(early.grindEnd,'Forgiving rail front catch');console.log('PASS early and late rail entry, missed-lane recovery and single payout');
}
{
 const s=createShift();s.obstacles=[];s.distance=s.job.at-130;s.lane=s.targetLane=1;update(s,{deliver:true},.01,()=>0);assert.equal(s.jobs,1);assert.equal(s.cash,40);assert.equal(s.effects[0].type,'throw');assert.equal(s.effects[0].lane,-1);assert.equal(s.effects[0].targetZ,650);assert.equal(s.effects[0].cargo,'RUBBER CHICKEN','Thrown item preserves the delivered job after dispatch changes');update(s,{deliver:true},.01,()=>0);assert.equal(s.jobs,1,'One package cannot pay twice');const far=createShift();update(far,{deliver:true},.01,()=>0);assert.equal(far.jobs,0);console.log('PASS ranged package toss, target snapshot and duplicate/out-of-range protection');
}
{
 const s=createShift();s.obstacles=[{z:10,lane:0,type:'rail',length:140}];update(s,{},.01,()=>0);assert.ok(s.grindEnd,'Rolling onto an aligned rail starts grind without jump');assert.equal(s.cash,10);assert.equal(s.crashes,0);const wrong=createShift();wrong.obstacles=[{z:10,lane:1,type:'rail',length:140}];update(wrong,{},.01,()=>0);assert.equal(wrong.grindEnd,0);console.log('PASS automatic aligned rail grind');
}
{
 const s=createShift();s.obstacles=[{z:1,lane:0,type:'car'}];update(s,{deliver:true},.01,()=>0);assert.equal(s.phase,'ambulance');assert.equal(s.jobs,0);for(let i=0;i<120;i++)update(s,{},.05);assert.equal(s.phase,'ambulance','Car scene stays open for crutches');for(let i=0;i<31;i++)update(s,{},.05);assert.equal(s.phase,'fired');console.log('PASS fatal car collision and crutches scene duration');
}
{
 const s=createShift();s.obstacles=[{z:1,lane:1,type:'car'}];update(s,{},.01,()=>.9);assert.equal(s.nearMisses,1);assert.equal(s.cash,8);update(s,{},.01,()=>.9);assert.equal(s.cash,8,'Near miss pays once');assert.equal(s.phase,'play');
 for(const [offset,tip,rating] of [[0,15,'PERFECT'],[100,5,'NICE'],[-75,0,'LATE']]){const x=createShift();x.obstacles=[];x.distance=x.job.at-offset;update(x,{deliver:true},.01,()=>.9);assert.equal(x.tips,tip);assert.ok(x.effects[0].rating.startsWith(rating));}
 const x=createShift();x.obstacles=[];update(x,{jump:true},.01,()=>0);x.obstacles=[{z:x.distance+1,lane:0,type:'rail',length:140}];update(x,{},.01,()=>0);x.distance=x.job.at;update(x,{deliver:true},.01,()=>0);assert.ok(x.comboBonus>0,'Trick + grind + delivery banks combo');const before=x.comboBonus;update(x,{deliver:true},.01,()=>0);assert.equal(x.comboBonus,before,'No duplicate combo payouts');
 const expired=createShift();expired.obstacles=[];update(expired,{jump:true},.01,()=>0);for(let i=0;i<125;i++)update(expired,{},.05,()=>.9);assert.equal(expired.comboTime,0);assert.equal(expired.combo,0);
 const d=createShift();d.elapsed=14;update(d,{},.01,()=>.9);assert.equal(d.dogIntro,5.2);const distance=d.distance,time=d.time;update(d,{},.05,()=>.9);assert.equal(d.distance,distance,'Intro freezes traffic');assert.equal(d.time,time,'Intro preserves clock');for(let i=0;i<105;i++)update(d,{},.05,()=>.9);assert.equal(d.dogIntro,0);
 console.log('PASS near-miss single payout, ratings/tips, combo bank/expiry, restored intro freezes gameplay');
}
{
 const {neighborhood}=await import('./dist/engine.js');for(const [distance,district] of [[0,0],[1499,0],[1500,1],[3000,2],[4500,0]]){const s=createShift();s.distance=distance;assert.equal(neighborhood(s),district);}
 const s=createShift();s.distance=3000;s.spawnAt=0;s.job.at=5000;s.obstacles=[];update(s,{},.01,()=>.6);assert.equal(s.obstacles[0].type,'rail');assert.equal(s.obstacles[0].length,240);console.log('PASS neighborhood progression and longer Boardwalk rails');
}

{const s=createShift();s.dogEvents=1;s.elapsed=48;s.chase=false;update(s,{},.01,()=>.9);assert.equal(s.dogEvents,2);assert.equal(s.dogIntro,0);assert.equal(s.chase,true);assert.equal(createShift().time,60);console.log('PASS 60-second start and entrance only on first chase');}

{
 const shortcut=createShift();shortcut.forkAt=480;shortcut.distance=300;shortcut.obstacles=[];update(shortcut,{route:'shortcut'},.01,()=>.9);assert.equal(shortcut.route,'shortcut');assert.equal(shortcut.shortcuts,1);assert.equal(shortcut.job.at,550);shortcut.distance=shortcut.job.at;update(shortcut,{deliver:true},.01,()=>.9);assert.equal(shortcut.routeBonus,18);assert.equal(shortcut.cash,68);const routeEnd=shortcut.routeEnd;shortcut.distance=routeEnd+1;update(shortcut,{},.01,()=>.9);assert.equal(shortcut.route,'main');
 const safe=createShift();safe.forkAt=480;safe.distance=300;safe.obstacles=[];update(safe,{route:'safe',boost:true},.01,()=>.9);assert.equal(safe.route,'safe');for(let i=0;i<60;i++)update(safe,{boost:true},.05,()=>.9);assert.ok(safe.speed<51,'Scenic route caps speed');
 const toy=createShift();toy.chase=true;toy.toys=2;toy.dogGap=1;toy.obstacles=[];update(toy,{toy:true},.01,()=>.9);assert.equal(toy.toys,1);assert.equal(toy.dogDistract,3);const gap=toy.dogGap;for(let i=0;i<40;i++)update(toy,{toy:true},.05,()=>.9);assert.equal(toy.toys,1,'Cooldown prevents spam');assert.equal(toy.dogGap,gap,'Dog is occupied with toy');assert.equal(toy.chase,true,'Distraction is temporary, not an escape');for(let i=0;i<22;i++)update(toy,{boost:true},.05,()=>.9);assert.equal(toy.dogDistract,0);assert.equal(toy.chase,true);
 for(const type of ['sprinkler','door','pedestrian']){const s=createShift();s.obstacles=[{z:1,lane:0,type}];update(s,{},.01,()=>.9);assert.equal(s.crashes,1);assert.equal(s.phase,'play','Street obstacles recoverable');}
 console.log('PASS route choice/reward/expiry, scenic speed, toy distraction/cooldown/return, recoverable hazards');
}

{const s=createShift();assert.equal(s.toys,0);s.chase=true;s.obstacles=[];update(s,{toy:-1},.01,()=>.9);assert.equal(s.dogDistract,0,'No free toys');s.obstacles=[{type:'toy',z:s.distance+1,lane:0}];update(s,{},.01,()=>.9);assert.equal(s.toys,1);update(s,{toy:-1},.01,()=>.9);assert.equal(s.toys,0);assert.equal(s.effects.find(e=>e.type==='toy').lane,-1,'Player controls left toss');const right=createShift();right.toys=1;right.chase=true;update(right,{toy:1},.01,()=>.9);assert.equal(right.effects.find(e=>e.type==='toy').lane,1);const missed=createShift();missed.obstacles=[{type:'toy',z:1,lane:1}];update(missed,{},.01,()=>.9);assert.equal(missed.toys,0,'Pickup requires same lane');assert.equal(missed.crashes,0);console.log('PASS earned inventory, pickup alignment, left/right throws, consumption');}

{const s=createShift();s.toys=3;s.obstacles=[{z:1,lane:0,type:'toy'}];update(s,{},.01,()=>.9);assert.equal(s.toys,3,'Full bag cannot exceed capacity');s.chase=true;update(s,{toy:-1},.01,()=>.9);assert.equal(s.toys,2);s.obstacles=[{z:s.distance+1,lane:0,type:'toy'}];update(s,{},.01,()=>.9);assert.equal(s.toys,3,'Used slot can be refilled');console.log('PASS three-toy cap and refill after use');}

{
 const s=createShift();s.obstacles=[];s.dogEvents=2;for(let i=0;i<3;i++){s.distance=s.job.at;s.deliverCool=0;update(s,{deliver:true},.01,()=>.9);}assert.equal(s.streak,3);assert.equal(s.bestStreak,3);assert.equal(s.streakBonus,25);s.distance=s.job.at+101;update(s,{},.01,()=>.9);assert.equal(s.streak,0);assert.equal(s.bestStreak,3);
 const soup=createShift(1);soup.obstacles=[{type:'barrel',z:1,lane:0}];update(soup,{},.01,()=>.9);assert.equal(soup.condition,.7);soup.obstacles=[];soup.distance=soup.job.at;soup.stun=0;update(soup,{deliver:true},.01,()=>.9);assert.equal(soup.cash,43,'Damaged soup pays reduced base and tip');assert.ok(soup.effects[0].reaction.includes('SOUP'));assert.equal(soup.condition,1,'Next cargo starts intact');
 const special=createShift();special.obstacles=[{type:'barrel',z:1,lane:0}];special.jump=.5;update(special,{},.01,()=>.9);assert.equal(special.crashes,0);special.distance=special.job.at;update(special,{deliver:true},.01,()=>.9);assert.equal(special.specialBonus,25);special.distance=special.job.at;special.deliverCool=0;update(special,{deliver:true},.01,()=>.9);assert.equal(special.specialBonus,25,'Special window pays only once');
 const theft=createShift();theft.obstacles=[];theft.chase=true;theft.dogGap=2;update(theft,{},.01,()=>.9);assert.ok(theft.stolen);assert.equal(theft.chase,false);const jobs=theft.jobs;update(theft,{deliver:true},.01,()=>.9);assert.equal(theft.jobs,jobs,'Stolen cargo cannot be delivered');for(let i=0;i<100&&!theft.recovered;i++)update(theft,{boost:true},.05,()=>.9);assert.equal(theft.recovered,1,'Boosting recovers package');assert.equal(theft.stolen,null);assert.ok(theft.job.at>theft.distance);assert.equal(theft.dogStole,true,'Once per chase');
 const lost=createShift();lost.obstacles=[];lost.streak=2;lost.stolen={at:200,remaining:.01,cargo:lost.job.cargo};update(lost,{},.05,()=>.9);assert.equal(lost.stolen,null);assert.equal(lost.streak,0);assert.equal(lost.jobs,0);console.log('PASS delivery streaks/reset, fragile cargo/pay/reactions, one-time special bonus, theft/recovery/timeout');
}

{const s=createShift();s.forkAt=480;s.distance=350;s.elapsed=14;s.obstacles=[];update(s,{},.01,()=>.9);assert.equal(s.forkOpen,true);assert.equal(s.dogIntro,0,'Route prompt cannot be interrupted by intro');assert.equal(s.dogEvents,0);update(s,{route:'shortcut'},.01,()=>.9);assert.equal(s.route,'shortcut');assert.equal(s.dogIntro,0,'Selection gets a grace period');for(let i=0;i<30;i++)update(s,{},.05,()=>.9);assert.equal(s.dogIntro,0);for(let i=0;i<15;i++)update(s,{},.05,()=>.9);assert.ok(s.dogIntro>0,'Intro plays after route is chosen and grace ends');assert.equal(s.forkOpen,false);console.log('PASS route-choice priority and post-selection intro delay');}

{const s=createShift();s.obstacles=[];for(let i=0;i<30;i++)update(s,{screenBoost:true},.05,()=>.9);assert.ok(s.speed>59,'Holding road activates boost');for(let i=0;i<30;i++)update(s,{screenBoost:false},.05,()=>.9);assert.ok(s.speed<31,'Releasing road ends boost');for(let i=0;i<30;i++)update(s,{screenBoost:false,boost:true},.05,()=>.9);assert.ok(s.speed>59,'Boost button remains independent');console.log('PASS screen hold boost, release, independent button input');}
