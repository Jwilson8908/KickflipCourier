import assert from 'node:assert/strict';import {receiveView,advanceView} from './dist/network-view.js';
const source={phase:'play',distance:100,lane:0,targetLane:0,speed:30,elapsed:1,jump:.5,time:59,dogIntro:0,cash:35,stun:0,obstacles:[{z:300,type:'car'}]};
let view=receiveView(source,null,false);const startZ=view.obstacles[0].z-view.distance;
for(let i=0;i<10;i++)advanceView(view,.016);
assert.ok(Math.abs(view.distance-104.8)<1e-8);assert.equal(view.obstacles[0].z,300);assert.ok(Math.abs(startZ-(view.obstacles[0].z-view.distance)-4.8)<1e-8,'Rendered obstacle scrolls once, at camera speed');assert.equal(source.distance,100);assert.equal(view.cash,35);
const before=view.obstacles[0].z-view.distance;let next=receiveView({...source,distance:104},view,true);assert.equal(next.obstacles[0].z-next.distance,before,'Server packet cannot jump obstacle on screen');
for(let i=0;i<80;i++){const old=next.obstacles[0].z-next.distance;advanceView(next,.016);const z=next.obstacles[0].z-next.distance;assert.ok(z<=old,'Road never scrolls backward');assert.ok(old-z<=.8,'No sudden scroll leap');assert.equal(next.obstacles[0].z,300);}assert.ok(next.viewCorrection<.05);
// Repeated packets under varying delays use the same fixed world coordinate.
for(const age of [.08,.16,.3,.55,.12]){for(let i=0;i<Math.round(age/.016);i++)advanceView(next,.016);const z=next.obstacles[0].z-next.distance;next=receiveView({...source,distance:next.distance-3},next,true);assert.equal(next.obstacles[0].z-next.distance,z);}
const reset=receiveView({...source,distance:0},next,false);assert.equal(reset.distance,0);const down=receiveView({...source,phase:'ambulance'},next,true);advanceView(down,.1);assert.equal(down.distance,100);
console.log('PASS actual rendered obstacle coordinates: one scroll rate, no packet jumps, no backward scroll, variable mobile delays, state isolation and round reset.');
