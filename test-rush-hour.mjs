import assert from 'node:assert/strict';
import {createShift,update} from './dist/engine.js';
import {mutate} from './server/rooms.js';
const hard=createShift(0,'hard');
for(let wave=0;wave<8;wave++){const section=hard.obstacles.filter(o=>o.section===wave);assert.equal(section.length,6);assert.ok(section.every(o=>o.lane!==o.freeLane));assert.equal(section[0].waveKind,wave%2?'closure':'traffic');}
for(const difficulty of ['normal','hard']){const s=createShift(0,difficulty);s.spawnAt=s.forkAt=s.dogReadyAt=1e12;s.jump=.43;s.obstacles=[{type:'car',z:10,lane:0}];update(s,{},.01,()=>.9);assert.equal(s.phase,'play');const crash=createShift(0,difficulty);crash.obstacles=[{type:'car',z:10,lane:0}];update(crash,{},.01,()=>.9);assert.equal(crash.phase,'ambulance');}
const room={difficulty:'hard',phase:'lobby',host:'a',round:0,players:[{id:'a',token:'a',seen:1000},{id:'b',token:'b',seen:1000}]};mutate(room,{action:'start',token:'a'},1000);assert.deepEqual(room.players[0].game.obstacles,room.players[1].game.obstacles);assert.ok(room.players.every(p=>p.game.difficulty==='hard'&&p.game.toys===0));
console.log('PASS Rush Hour sections, open lanes, car jumping and shared multiplayer course');
