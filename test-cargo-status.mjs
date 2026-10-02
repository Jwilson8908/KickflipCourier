import assert from 'node:assert/strict';
import {createShift,cargoStatus} from './dist/engine.js';
let s=createShift(5);assert.equal(cargoStatus(s).value,'25s');
s.elapsed=10.2;assert.equal(cargoStatus(s).value,'15s');
s.elapsed=28;assert.equal(cargoStatus(s).ratio,0);
s=createShift(7);assert.equal(cargoStatus(s).value,'8s');
s.lobsterWarning=2.1;assert.equal(cargoStatus(s).value,'3s');assert.equal(cargoStatus(s).warning,true);
s=createShift(6);s.condition=.55;assert.equal(cargoStatus(s).value,'55%');
console.log('PASS cargo countdowns and condition bars');
