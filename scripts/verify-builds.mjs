// Optional broad build audit: node scripts/verify-builds.mjs
// Uses ordinary movement and the real simulation at production's 120 Hz timestep.
// This intentionally remains separate from the faster default test command.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeRoom,makeEndless} from '../dist/rooms.js';
import {statsFor} from '../dist/progression.js';
import {solveRoom} from './verify.mjs';

const timeStep=1/120;
const builds=[
  {name:'starter',upgrades:{}},
  {name:'width only',upgrades:{width:5}},
  {name:'bag only',upgrades:{bag:5}},
  {name:'speed only',upgrades:{speed:5}},
  {name:'suction only',upgrades:{pull:5}},
  {name:'fully upgraded',upgrades:{width:5,bag:5,speed:5,pull:5}},
];
const campaign=[];
for(const {name,upgrades} of builds){
  for(let id=1;id<=24;id++){
    const solved=solveRoom(makeRoom(id),statsFor(upgrades),{timeStep,collectTrinket:false,runId:`build-audit-${name}-${id}`});
    campaign.push({id,build:name,upgrades,seconds:solved.result.time,physicalPickups:solved.physicalPickups,trinket:solved.result.trinket,unloads:solved.unloads});
  }
  console.log(`PASS 24 campaign rooms at 120 Hz: ${name}`);
}

const endless=[];
const seeds=['clean-room',4294967295,2147483648,4294967296,0,'0','morning-light','🧹',Number.MAX_SAFE_INTEGER];
for(const [index,seed] of seeds.entries()){
  const room=makeEndless(seed),solved=solveRoom(room,statsFor(),{timeStep,collectTrinket:false,runId:`build-audit-endless-${index}`});
  endless.push({seed,normalized:room.seed,seconds:solved.result.time,unloads:solved.unloads});
}
assert.equal(campaign.length,144);
assert.equal(endless.length,9);
const report={passed:true,timeStep,campaignBuildRuns:campaign.length,extraEndlessInputs:endless.length,
  note:'Automated physical simulation with ordinary directional movement. No keepsake-seeking route, forced pickups, completion, or currency. Times are simulated, not human playtime or performance measurements. Seed inputs may normalize to the same room.',
  campaign,endless};
mkdirSync(new URL('../tmp/',import.meta.url),{recursive:true});
writeFileSync(new URL('../tmp/physics-gap-audit-report.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:true,campaignBuildRuns:campaign.length,extraEndlessInputs:endless.length,timestep:'1/120 s',report:'tmp/physics-gap-audit-report.json'}));
