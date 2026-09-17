import assert from 'node:assert/strict';
import { CAMPAIGN, LOCATIONS, makeRoom, makeEndless, isWalkable } from '../dist/rooms.js';

function validate(room) {
  assert.equal(room.width,960); assert.equal(room.height,640);
  assert.equal(room.grid.length,16); room.grid.forEach(r=>assert.equal(r.length,24));
  const start=[Math.floor(room.spawn.x/40),Math.floor(room.spawn.y/40)];
  const queue=[start], seen=new Set([start.join(',')]);
  for(let i=0;i<queue.length;i++) {
    const [x,y]=queue[i];
    assert(isWalkable(room,x*40+20,y*40+20,18),`${room.name}: no clearance at ${x},${y}`);
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      const key=`${nx},${ny}`;
      if(room.grid[ny]?.[nx]&&!seen.has(key)) {seen.add(key);queue.push([nx,ny]);}
    }
  }
  const total=room.grid.flat().reduce((a,b)=>a+b,0);
  assert.equal(seen.size,total,`${room.name}: disconnected floor`);
  assert(total>=190,`${room.name}: too little floor`);
  for(const target of [room.spawn,...room.stations,...room.debris,room.trinket]) {
    assert(isWalkable(room,target.x,target.y,18),`${room.name}: inaccessible point ${JSON.stringify(target)}`);
    assert(seen.has(`${Math.floor(target.x/40)},${Math.floor(target.y/40)}`),`${room.name}: unreachable point`);
  }
  assert(Math.hypot(room.spawn.x-room.stations[0].x,room.spawn.y-room.stations[0].y)>=60,'Robot must not overlap the collection station at spawn');
  // All floor is built from intact 80px modules, ruling out one-cell corridors.
  for(let y=1;y<15;y+=2)for(let x=1;x<23;x+=2) {
    const block=[room.grid[y][x],room.grid[y][x+1],room.grid[y+1][x],room.grid[y+1][x+1]];
    assert(block.every(v=>v===block[0]),`${room.name}: narrow half-module at ${x},${y}`);
  }
  for(const obstacle of room.obstacles) {
    assert(['workbench','crate','cabinet','arcade','sofa','table','planter','pot','bench','speaker'].includes(obstacle.kind));
    for(let y=obstacle.y/40;y<(obstacle.y+obstacle.h)/40;y++)for(let x=obstacle.x/40;x<(obstacle.x+obstacle.w)/40;x++)assert.equal(room.grid[y][x],0);
  }
  assert(room.debris.length>=230&&room.debris.length<=440);
  assert.equal(new Set(room.debris.map(d=>d.id)).size,room.debris.length);
  room.debris.forEach(d=>{assert(['crumb','confetti','dust','stuck'].includes(d.type));assert(Number.isInteger(d.value)&&d.value>0);});
  assert(room.goldTime>0&&room.silverTime>room.goldTime);
  assert(!isWalkable(room,-1,100)); assert(!isWalkable(room,NaN,100)); assert(!isWalkable(room,100,100,-1));
  return {floor:total,debris:room.debris.length,stations:room.stations.length};
}

assert.equal(CAMPAIGN.length,24); assert.equal(LOCATIONS.length,4);
const layouts=new Set();
for(let id=1;id<=24;id++) {
  const room=makeRoom(id);validate(room);
  assert.deepEqual(room,makeRoom(id),`Room ${id} is not deterministic`);
  assert.equal(room.location,Math.floor((id-1)/6));
  assert.notDeepEqual(room.debris,makeRoom(id,99).debris);
  layouts.add(JSON.stringify(room.grid));
  // Calls must return independent arrays and objects.
  const clone=makeRoom(id); clone.grid[1][1]=9;clone.debris[0].x=-999;
  assert.deepEqual(room,makeRoom(id));
}
assert.equal(layouts.size,24,`Expected 24 distinct authored layouts, received ${layouts.size}`);
const endlessLayouts=new Set(), locations=new Set(), debrisCounts=new Set();
for(let seed=0;seed<100;seed++) {
  const room=makeEndless(seed);validate(room);
  assert.deepEqual(room,makeEndless(seed),`Seed ${seed} is not deterministic`);
  assert.deepEqual(room,makeEndless(String(seed)),`Numeric seed ${seed} differs as a string`);
  endlessLayouts.add(JSON.stringify(room.grid));locations.add(room.location);debrisCounts.add(room.debris.length);
}
assert(endlessLayouts.size>=95);assert.equal(locations.size,4);assert(debrisCounts.size>45);
assert.deepEqual(makeEndless('clean-room'),makeEndless('clean-room'));
assert.throws(()=>makeRoom(0),RangeError);assert.throws(()=>makeRoom(25),RangeError);
console.log(JSON.stringify({passed:true,campaignRooms:24,uniqueCampaignLayouts:layouts.size,endlessSeeds:100,uniqueEndlessLayouts:endlessLayouts.size,endlessLocations:locations.size,debrisCounts:debrisCounts.size,checks:['determinism','fresh objects','connected floor','80px aisles','18px clearance','all debris/stations/trinkets reachable','bounded population','material validity']},null,2));
