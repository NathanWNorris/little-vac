import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { CAMPAIGN, LOCATIONS, makeRoom, makeEndless, isWalkable } from '../dist/rooms.js';
import {createRun,isRunWalkable} from '../dist/simulation.js';
import {statsFor} from '../dist/progression.js';
import {HALLWAY_MIDPOINT,HALL_HALF_HEIGHT} from '../dist/world.js';

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
  for(const target of [room.spawn,...room.stations,...room.debris,room.trinket,...(room.exit?[room.exit]:[]),...(room.entry?[room.entry]:[])]) {
    assert(isWalkable(room,target.x,target.y,18),`${room.name}: inaccessible point ${JSON.stringify(target)}`);
    assert(seen.has(`${Math.floor(target.x/40)},${Math.floor(target.y/40)}`),`${room.name}: unreachable point`);
  }
  assert.equal(room.stations.length,1,'Every campaign area and Endless room has exactly one drop-off dock');
  assert.deepEqual(room.spawn,room.stations[0],'A new job starts parked in its drop-off dock');
  if(room.entry) {
    assert(room.entry.x<=100,'A connected area starts at its left-hand doorway');
    assert(isWalkable(room,room.entry.x,room.entry.y,24),'The entrance needs clearance around the robot');
    for(let x=60;x<=100;x+=5)assert(isWalkable(room,x,room.entry.y,18),'The entrance must connect to an open left-side aisle');
    assert(Math.hypot(room.entry.x-room.spawn.x,room.entry.y-room.spawn.y)>80,'A connecting entrance is separate from the drop-off dock');
  }
  // All floor is built from intact 80px modules, ruling out one-cell corridors.
  for(let y=1;y<15;y+=2)for(let x=1;x<23;x+=2) {
    const block=[room.grid[y][x],room.grid[y][x+1],room.grid[y+1][x],room.grid[y+1][x+1]];
    assert(block.every(v=>v===block[0]),`${room.name}: narrow half-module at ${x},${y}`);
  }
  for(const obstacle of room.obstacles) {
    assert(['workbench','crate','cabinet','arcade','sofa','table','planter','pot','bench','speaker'].includes(obstacle.kind));
    for(let y=obstacle.y/40;y<(obstacle.y+obstacle.h)/40;y++)for(let x=obstacle.x/40;x<(obstacle.x+obstacle.w)/40;x++)assert.equal(room.grid[y][x],0);
  }
  assert(room.debris.length>=(room.areaCount>1?160:230)&&room.debris.length<=440);
  assert.equal(new Set(room.debris.map(d=>d.id)).size,room.debris.length);
  room.debris.forEach(d=>{
    assert(['crumb','confetti','dust','stuck'].includes(d.type));assert(Number.isInteger(d.value)&&d.value>0);
    if(room.id && ['dust','stuck'].includes(d.type)) assert.equal(d.resistance,room.toughness,'Tough debris must match the fixed job difficulty');
    else assert.equal(d.resistance,undefined,'Loose pieces and Endless keep their original suction behavior');
  });
  assert(room.goldTime>0&&room.silverTime>room.goldTime);
  assert(!isWalkable(room,-1,100)); assert(!isWalkable(room,NaN,100)); assert(!isWalkable(room,100,100,-1));
  return {floor:total,debris:room.debris.length,stations:room.stations.length};
}

assert.equal(CAMPAIGN.length,24); assert.equal(LOCATIONS.length,4);
const legacyEarlyHashes = [
  'c22c953a03dd0bc8f54c820d917830b4c0ebef0bc5521522fd99353bca781ea3',
  '9e76a848d170cbfe9f498005d4b5e8a3b349b8cf517b8681c0871235c685e8f6',
  'd782216328b5ba2b115e78fd26cbb072251010399433f8e617736981242db0b6',
  '51900f6f804d8bdfb4d092a6643c2af89729fb745f04f83fd44dce6f69964148',
  '0543286ca9f751bfde511f790d88861daf4e02fad5f246f9ac39b2cbef9f3643',
  'ea945e735dabe352f8a6f9b870bbb703b1bcc802c220488f75871d99c8f28926',
  'b46c76b2fa3f3c279ad0df1ac20fe71cbc98e19c7edf8da4525a3e7b32b136ac',
  '536de4390ee31372ca8043d3837252acfcc319e3e79a78eda5e00d5e771a3eb0',
];
const originalBudgets = [230,275,280,290,300,320,285,300,315,330,345,365,300,315,330,345,360,380,320,340,360,380,400,420];
const layouts=new Set();let campaignAreas=0,previousToughness=1;
for(let id=1;id<=24;id++) {
  const room=makeRoom(id), areas=[room,...room.nextAreas];
  const hallwayRun=createRun(room,statsFor(),`geometry-${id}`);
  assert.equal(areas.length,id<9?1:id<18?2:id<22?3:4);
  assert.equal(room.areaCount,areas.length);
  assert(room.toughness>=previousToughness&&room.toughness>=1&&room.toughness<=2.6);
  previousToughness=room.toughness;
  if(id<=6)assert.equal(room.toughness,1,'The opening workshop retains starter suction pacing');
  assert.equal(new Set(areas.map(a=>a.areaName)).size,areas.length,'Connected areas need distinct names');
  assert.equal(areas.reduce((sum,a)=>sum+a.debris.length,0),originalBudgets[id-1]+95*(areas.length-1),'Additional areas must not multiply the whole payout');
  assert.equal(areas.filter(a=>!a.trinket.hidden).length,1,'Exactly one treasure per whole job');
  for(const [index,area] of areas.entries()) {
    validate(area);campaignAreas++;
    for(const key of ['id','name','seed','location','goldTime','silverTime','areaCount','toughness'])assert.equal(area[key],room[key],`Area changed job identity: ${key}`);
    assert.equal(area.areaIndex,index);
    assert.equal(area.trinket.hidden,index<areas.length-1);
    if(index<areas.length-1) {
      assert(area.exit.x>=840,'Door should be visible near the right edge');
      assert(isWalkable(area,area.exit.x,area.exit.y,24),'Door needs room for the robot to enter');
      assert(Math.hypot(area.exit.x-area.spawn.x,area.exit.y-area.spawn.y)>500,'Door cannot overlap the entry');
      assert.equal(area.exit.nextName,areas[index+1].areaName);
      hallwayRun.areaIndex=index;
      assert.equal(isRunWalkable(hallwayRun,HALLWAY_MIDPOINT,area.exit.y,17),false,'A dirty area keeps its hall physically closed');
      hallwayRun.areaStates[index].cleared=true;
      for(let x=900;x<=1260;x+=5)for(const dy of [-42,0,42]){
        assert(isRunWalkable(hallwayRun,x,area.exit.y+dy,17),`Room ${id} area ${index+1}: blocked hallway at ${x},${dy}`);
      }
      for(const dy of [-HALL_HALF_HEIGHT,HALL_HALF_HEIGHT])assert.equal(isRunWalkable(hallwayRun,HALLWAY_MIDPOINT,area.exit.y+dy,17),false,'Hallway walls cannot be walked through');
      hallwayRun.areaIndex=index+1;
      for(let x=-300;x<=60;x+=10)assert(isRunWalkable(hallwayRun,x,area.exit.y,17),'The same open corridor is reachable while backtracking from an unfinished later area');
    } else assert.equal(area.exit,null,'The final area completes the job instead of opening another door');
    if(index>0) {
      assert.equal(area.nextAreas,undefined,'Area chain must not contain cycles');
      assert.equal(area.entry.y,areas[index-1].exit.y,'Connected doorways must line up vertically');
      assert(area.entry.x<area.width/2&&areas[index-1].exit.x>area.width/2,'Leave through the right side and arrive through the left');
    } else assert.equal(area.entry,null,'The first area starts at its dock, not a connector');
    layouts.add(JSON.stringify(area.grid));
  }
  if(id<=8) {
    const debris=room.debris.map(({resistance,...piece})=>piece);
    const {hidden,...trinket}=room.trinket;
    const hash=createHash('sha256').update(JSON.stringify({grid:room.grid,debris,spawn:room.spawn,trinket})).digest('hex');
    assert.equal(hash,legacyEarlyHashes[id-1],`Room ${id} changed its existing layout, dust placement, or treasure`);
  }
  assert.deepEqual(room,makeRoom(id),`Room ${id} is not deterministic`);
  assert.equal(room.location,Math.floor((id-1)/6));
  assert.notDeepEqual(room.debris,makeRoom(id,99).debris);
  // Calls must return independent arrays and objects.
  const clone=makeRoom(id); clone.grid[1][1]=9;clone.debris[0].x=-999;
  if(clone.nextAreas.length){clone.nextAreas[0].grid[1][1]=9;clone.nextAreas[0].debris[0].x=-999;}
  assert.deepEqual(room,makeRoom(id));
  for(let seed=0;seed<10;seed++) {
    const alternate=makeRoom(id,seed);
    for(const area of [alternate,...alternate.nextAreas])validate(area);
    assert.deepEqual(alternate,makeRoom(id,String(seed)),'Numeric campaign seeds must round-trip as strings');
  }
}
assert.equal(campaignAreas,50);
assert.equal(layouts.size,50,`Expected 50 distinct authored layouts, received ${layouts.size}`);
const endlessLayouts=new Set(), locations=new Set(), debrisCounts=new Set();
for(let seed=0;seed<1000;seed++) {
  const room=makeEndless(seed);validate(room);
  assert.deepEqual(room,makeEndless(seed),`Seed ${seed} is not deterministic`);
  assert.deepEqual(room,makeEndless(String(seed)),`Numeric seed ${seed} differs as a string`);
  endlessLayouts.add(JSON.stringify(room.grid));locations.add(room.location);debrisCounts.add(room.debris.length);
}
assert(endlessLayouts.size>=950);assert.equal(locations.size,4);assert(debrisCounts.size>45);
assert.deepEqual(makeEndless('clean-room'),makeEndless('clean-room'));
assert.throws(()=>makeRoom(0),RangeError);assert.throws(()=>makeRoom(25),RangeError);
console.log(JSON.stringify({passed:true,campaignRooms:24,campaignAreas,uniqueCampaignLayouts:layouts.size,campaignSeeds:240,endlessSeeds:1000,uniqueEndlessLayouts:endlessLayouts.size,endlessLocations:locations.size,debrisCounts:debrisCounts.size,checks:['determinism','fresh objects','connected floor','80px aisles','18px clearance','all debris/docks/trinkets/doorways reachable','one dock per area including Endless','aligned entrance and exit doorways','one treasure per job','bounded total population','gradual fixed debris resistance','first eight layouts and debris placements preserved']},null,2));
