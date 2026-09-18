// All campaign clearing below uses ordinary movement and the real 60Hz simulation.
// The solver cannot move bodies directly, mark debris collected, or grant cash.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {makeRoom,makeEndless,isWalkable} from '../dist/rooms.js';
import {createRun,step,runResult,clearLine,isRunWalkable} from '../dist/simulation.js';
import {AREA_STRIDE,HALLWAY_MIDPOINT,hallwayFor} from '../dist/world.js';
import {defaultCareer,statsFor,UPGRADES,upgradePrice,buyUpgrade,settleRun,saveCareer,loadCareer,isRoomUnlocked} from '../dist/progression.js';

const DT=1/60;
const cellOf=p=>[Math.floor(p.x/40),Math.floor(p.y/40)];
const cellKey=([x,y])=>`${x},${y}`;
const center=([x,y])=>({x:x*40+20,y:y*40+20});
function search(room,point){
  const approach=point.x<60?{x:60,y:room.entry.y}:point.x>900?{x:900,y:room.exit.y}:null;
  const start=cellOf(approach||point),queue=[start],distance=new Map([[cellKey(start),0]]),parent=new Map();
  for(let i=0;i<queue.length;i++){
    const [x,y]=queue[i],key=cellKey(queue[i]);
    for(const next of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
      const [nx,ny]=next,nkey=cellKey(next);
      if(room.grid[ny]?.[nx]&&!distance.has(nkey)&&isWalkable(room,nx*40+20,ny*40+20,17)){
        distance.set(nkey,distance.get(key)+1);parent.set(nkey,queue[i]);queue.push(next);
      }
    }
  }
  return {distance,pathTo(point){
    let cell=cellOf(point),key=cellKey(cell);assert(distance.has(key),`No path to ${key}`);
    const path=[cell];while(parent.has(key)){cell=parent.get(key);key=cellKey(cell);path.unshift(cell);}
    return [...(approach?[approach]:[]),...path.map(center)];
  }};
}

const jobAreas=room=>[room,...(room.nextAreas||[])];
const materialValue=room=>room.debris.reduce((sum,d)=>sum+d.value,0);
const jobValue=room=>jobAreas(room).reduce((sum,area)=>sum+materialValue(area),0);
function auditRun(run,totalValue,previous,timeStep=DT){
  const b=run.robot;
  assert([b.x,b.y,b.bag,b.bagValue,run.coins,run.time,run.percent,run.cleaned].every(Number.isFinite),'Non-finite run state');
  assert(isRunWalkable(run,b.x,b.y,17),'Robot crossed a wall or locked hallway');
  const worldX=b.x+run.areaIndex*AREA_STRIDE,previousWorldX=previous.x+(previous.areaIndex??0)*AREA_STRIDE;
  assert(Math.hypot(worldX-previousWorldX,b.y-previous.y)<=run.stats.speed*timeStep+1e-6,'Movement must remain continuous through hallways');
  if(run.areaIndex!==(previous.areaIndex??0)){
    const direction=run.areaIndex-(previous.areaIndex??0);
    assert.equal(Math.abs(direction),1,'A hallway joins adjacent areas only');
    assert(run.areaStates[Math.min(run.areaIndex,previous.areaIndex??0)].cleared,'A locked hallway cannot be crossed');
    if(direction>0){
      assert.equal(previous.cleaned,previous.room.debris.length);
      assert(Math.abs(previous.x-HALLWAY_MIDPOINT)<=run.stats.speed*timeStep+1e-6,'The robot must physically cross the hallway midpoint');
      assert(b.x<0,'Entering a new area begins inside the connecting hallway, without teleporting to a dock');
    }
    assert.equal(run.room,run.areas[run.areaIndex]);
    previous.collected=new Set();
  }else {
    assert(Math.hypot(b.x-previous.x,b.y-previous.y)<=run.stats.speed*timeStep+1e-6,'Movement exceeded the allowed speed');
    assert(run.cleaned+1e-7>=previous.cleaned,'Cleaning progress regressed within an area');
  }
  assert(run.percent>=0&&run.percent<=1&&b.bag>=0&&b.bag<=run.stats.capacity);
  assert(Number.isInteger(run.coins)&&run.coins>=0&&Number.isInteger(b.bagValue)&&b.bagValue>=0);
  let cleaned=0;
  for(const d of run.debris){
    assert([d.x,d.y,d.vx,d.vy,d.amount].every(Number.isFinite),'Non-finite debris state');
    assert(d.amount>=0&&d.amount<=1);assert(!previous.collected.has(d.id)||d.collected,'A pickup reappeared');
    if(d.collected){previous.collected.add(d.id);cleaned++;}
    else {if(d.type==='dust')cleaned+=1-d.amount;assert(isWalkable(run.room,d.x,d.y,3),'Loose material crossed a wall');}
  }
  assert(Math.abs(run.cleaned-cleaned)<1e-7,'Cleaning progress must match the visible remaining material');
  const remainingValue=run.areaStates.reduce((sum,area)=>sum+area.debris.filter(d=>!d.collected).reduce((value,d)=>value+d.value,0),0);
  assert.equal(run.coins+b.bagValue+remainingValue,totalValue,'Material value was lost or paid twice');
  previous.x=b.x;previous.y=b.y;previous.cleaned=run.cleaned;previous.areaIndex=run.areaIndex;previous.room=run.room;previous.phase=run.phase;
}

export function solveRoom(room,stats,{runId=`verify-${room.id}-${room.seed}`,timeout=1000,collectTrinket=true,timeStep=DT}={}){
  assert(Number.isFinite(timeStep)&&timeStep>0&&timeStep<=.05,'Solver timestep must be supported by the simulation');
  const run=createRun(room,stats,runId),totalValue=jobValue(room);
  const previous={x:run.robot.x,y:run.robot.y,cleaned:0,collected:new Set()};
  let route=[],target=null,routeAge=0,stationVisit=false,unloads=0,finishEvents=0,areaClears=0,areaEntries=0,lastProgress=0,lastChange=0,lastArea=0;
  const diagnostic=()=>({room:room.name,area:run.areaIndex+1,seed:room.seed,time:run.time,percent:run.percent,robot:run.robot,target:target&&{kind:target.kind,id:target.item.id,x:target.item.x,y:target.item.y,amount:target.item.amount,collected:target.item.collected},route:route.slice(0,3),remaining:run.debris.filter(d=>!d.collected).slice(0,5)});
  for(let frame=0;frame<Math.ceil((timeout+2)/timeStep)&&run.phase!=='complete';frame++){
    assert(run.time<=timeout,`Physical solver timeout: ${JSON.stringify(diagnostic())}`);
    if(run.areaIndex!==lastArea){route=[];target=null;stationVisit=false;lastProgress=0;lastChange=run.time;lastArea=run.areaIndex;}
    if(run.phase==='playing'){
      if(run.cleaned>lastProgress+.001){lastProgress=run.cleaned;lastChange=run.time;}
      assert(run.time-lastChange<35,`No cleaning progress for 35 seconds: ${JSON.stringify(diagnostic())}`);
      if(run.robot.bag>=run.stats.capacity*.8&&!stationVisit){stationVisit=true;target=null;route=[];}
      if(stationVisit&&run.robot.bag===0){stationVisit=false;target=null;route=[];}
      if(target?.kind==='debris'&&target.item.collected||target?.kind==='trinket'&&run.trinket.collected){target=null;route=[];}
      if(!target){
        const graph=search(run.room,run.robot);
        const distance=p=>(graph.distance.get(cellKey(cellOf(p)))??Infinity)*40+Math.hypot(p.x-run.robot.x,p.y-run.robot.y)*.01;
        if(stationVisit)target={kind:'station',item:[...run.room.stations].sort((a,b)=>distance(a)-distance(b))[0]};
        else if(collectTrinket&&!run.trinket.hidden&&!run.trinket.collected)target={kind:'trinket',item:run.trinket};
        else target={kind:'debris',item:run.debris.filter(d=>!d.collected).sort((a,b)=>distance(a)-distance(b))[0]};
        assert(target.item,`No target before completion: ${JSON.stringify(diagnostic())}`);
        route=graph.pathTo(target.item);routeAge=0;
      }
      // Wind can move a target across cells. Replan at modest intervals only.
      if(target.kind==='debris'&&routeAge>1.5){route=search(run.room,run.robot).pathTo(target.item);routeAge=0;}
    }else if(run.phase==='exiting'&&target?.kind!=='exit'){
      assert.equal(runResult(run),null,'A cleared intermediate area cannot settle the job');
      target={kind:'exit',item:run.room.exit};assert(target.item,'An intermediate area must have an exit');
      route=search(run.room,run.robot).pathTo(target.item);route.push({x:target.item.x,y:target.item.y},{x:HALLWAY_MIDPOINT+10,y:target.item.y});routeAge=0;
    }
    let input={x:0,y:0};
    while(route.length&&Math.hypot(route[0].x-run.robot.x,route[0].y-run.robot.y)<.1)route.shift();
    if(['playing','exiting'].includes(run.phase)&&route.length){
      const dx=route[0].x-run.robot.x,dy=route[0].y-run.robot.y,length=Math.hypot(dx,dy);
      const scale=Math.min(1,length/(run.stats.speed*timeStep));input={x:dx/length*scale,y:dy/length*scale};
    }
    step(run,timeStep,input);routeAge+=timeStep;auditRun(run,totalValue,previous,timeStep);
    for(const event of run.events){if(event.type==='unload')unloads++;if(event.type==='finish')finishEvents++;if(event.type==='area-clear')areaClears++;if(event.type==='area-enter')areaEntries++;}
    run.events.length=0;
  }
  assert.equal(run.phase,'complete',`Solver did not finish: ${JSON.stringify(diagnostic())}`);
  assert.equal(finishEvents,1,'There must be one final completion');assert.equal(run.coins,totalValue);
  assert.equal(areaClears,run.areaCount-1,'Each intermediate area clears once');assert.equal(areaEntries,run.areaCount-1,'Each doorway is crossed once');
  assert.equal(run.percent,1);assert(run.debris.every(d=>d.collected));assert.equal(run.robot.bag,0);
  assert.equal(run.collectedCount,run.jobTotal,'Every piece in every area must be physically collected');
  const result=runResult(run),settled=JSON.stringify(result);
  for(let i=0;i<Math.ceil(3/timeStep);i++)step(run,timeStep,{x:1,y:1});
  assert.equal(JSON.stringify(runResult(run)),settled,'A completed run cannot award coins or time again');
  return {run,result,unloads,areaClears,areaEntries,physicalPickups:run.collectedCount,finalSweepPickups:run.jobTotal-run.collectedCount};
}

function testRoom({spawn={x:300,y:300},debris=[{id:0,x:820,y:500,type:'crumb',value:1}],grid}={}){
  return {id:1,name:'Physics checks',seed:1,width:960,height:640,grid:grid||Array.from({length:16},(_,y)=>Array.from({length:24},(_,x)=>+(x>0&&x<23&&y>0&&y<15))),obstacles:[],stations:[{x:100,y:540}],spawn,fans:[],debris,trinket:{x:900,y:500,name:'Test'},goldTime:95,silverTime:170};
}
export function physicsChecks(){
  const stats=statsFor(),straight=createRun(testRoom(),stats,'straight'),diagonal=createRun(testRoom(),stats,'diagonal');
  for(let i=0;i<60;i++){step(straight,DT,{x:1,y:0});step(diagonal,DT,{x:1,y:1});}
  assert(Math.abs(straight.robot.x-300-stats.speed)<1e-6);assert(Math.abs(Math.hypot(diagonal.robot.x-300,diagonal.robot.y-300)-stats.speed)<1e-6,'Diagonal movement must be normalized');
  const collision=createRun(testRoom({spawn:{x:60,y:300}}),stats,'collision');
  for(let i=0;i<120;i++)step(collision,DT,{x:-1,y:0});assert(collision.robot.x>=57&&collision.robot.x<60);assert(isWalkable(collision.room,collision.robot.x,collision.robot.y,17));
  const bagRoom=testRoom({debris:Array.from({length:200},(_,id)=>({id,x:id<100?300+id%3:820,y:id<100?300+id%4:500,type:'crumb',value:1}))});
  const bagRun=createRun(bagRoom,stats,'full-bag');step(bagRun,DT,{});
  assert.equal(bagRun.robot.bag,stats.capacity);assert(bagRun.full);
  const fullX=bagRun.robot.x;step(bagRun,DT,{x:1,y:0});
  assert(bagRun.robot.x>fullX,'A full bag must not stop movement');assert.equal(bagRun.collectedCount,stats.capacity,'Full bags must stop pickup');
  const stationRoute=search(bagRoom,bagRun.robot).pathTo(bagRoom.stations[0]);
  for(let frame=0;frame<600&&stationRoute.length;frame++){
    const p=stationRoute[0],dx=p.x-bagRun.robot.x,dy=p.y-bagRun.robot.y,length=Math.hypot(dx,dy);
    if(length<.1){stationRoute.shift();continue;}
    const scale=Math.min(1,length/(stats.speed*DT));step(bagRun,DT,{x:dx/length*scale,y:dy/length*scale});
  }
  assert.equal(stationRoute.length,0);for(let i=0;i<180;i++)step(bagRun,DT,{});
  assert.equal(bagRun.robot.bag,0);assert.equal(bagRun.coins,stats.capacity);assert.equal(bagRun.events.filter(e=>e.type==='unload').length,1,'A physical station visit pays the bag only once');
  const keepsakeRoom=testRoom({debris:bagRoom.debris});keepsakeRoom.trinket={x:340,y:300,name:'Separate keepsake'};
  const keepsake=createRun(keepsakeRoom,stats,'full-bag-keepsake');step(keepsake,DT,{});
  assert.equal(keepsake.robot.bag,stats.capacity);assert.equal(keepsake.trinket.collected,false);
  for(let i=0;i<24;i++)step(keepsake,DT,{x:1,y:0});
  assert.equal(keepsake.trinket.collected,true,'A full dirt bag must not block walking over a keepsake');
  assert.equal(keepsake.robot.bag,stats.capacity);assert.equal(keepsake.events.filter(e=>e.type==='trinket').length,1);
  const blockedRoom=testRoom({spawn:{x:380,y:300},debris:['crumb','dust','stuck','confetti'].map((type,id)=>({id,x:450,y:280+id*12,type,value:1})).concat({id:4,x:365,y:310,type:'crumb',value:1})});
  for(let y=6;y<=9;y++)blockedRoom.grid[y][10]=0;
  assert.equal(clearLine(blockedRoom,380,300,450,300),false);
  const blocked=createRun(blockedRoom,statsFor({width:5}),'line-of-sight');
  for(let i=0;i<120;i++)step(blocked,DT,{});
  assert(blocked.debris[4].collected,'Nearby visible material should collect');
  for(const d of blocked.debris.slice(0,4)){assert.equal(d.collected,false,'Suction must not pass through walls');assert.equal(d.amount,1);assert.equal(d.progress,0);}
  // Actual room 1 geometry: the old 12px samples skipped this workbench corner.
  const cornerRoom=makeRoom(1);cornerRoom.spawn={x:244,y:165};
  assert(isWalkable(cornerRoom,cornerRoom.spawn.x,cornerRoom.spawn.y,17));
  const cornerDebris=cornerRoom.debris.find(d=>d.id===9);
  assert.equal(clearLine(cornerRoom,244,165,cornerDebris.x,cornerDebris.y),false,'No suction through the corner between LOS samples');
  assert.equal(clearLine(cornerRoom,cornerDebris.x,cornerDebris.y,244,165),false,'Corner occlusion must be symmetric');
  assert.equal(clearLine(cornerRoom,244,165,244,200),true,'Clear aisles must still allow suction');
  assert.equal(clearLine(cornerRoom,280,140,244,165),false,'A ray cannot start inside furniture');
  const corner=createRun(cornerRoom,statsFor({width:5}),'corner-line-of-sight');step(corner,DT,{});
  assert.equal(corner.debris[9].vx,0);assert.equal(corner.debris[9].vy,0,'Blocked debris must not receive pull force');
  const dustRoom=testRoom({debris:[{id:0,x:300,y:300,type:'dust',value:2},...Array.from({length:20},(_,id)=>({id:id+1,x:800,y:500,type:'crumb',value:1}))]});
  const dust=createRun(dustRoom,stats,'dust-rounding');for(let i=0;i<10;i++)step(dust,.05,{});
  step(dust,.049999/1.9,{});
  assert.equal(dust.debris[0].collected,true);assert.equal(dust.debris[0].amount,0);assert(Math.abs(dust.cleaned-1)<1e-10,'A fully faded dust patch counts as one whole cleaned piece');
  const finalRoom=testRoom({debris:Array.from({length:20},(_,id)=>({id,x:id===19?800:300+(id%4)*2,y:id===19?500:300+Math.floor(id/4)*2,type:'crumb',value:id%3+1}))});
  const final=createRun(finalRoom,stats,'100-percent');for(let i=0;i<180;i++)step(final,DT,{});
  assert.equal(final.phase,'playing');assert.equal(final.collectedCount,19,'95% cleanup must leave the last piece for the player');
  assert.equal(final.debris[19].collected,false);assert.equal(final.percent,.95);assert.equal(runResult(final),null);
  walkTo(final,{x:800,y:500});for(let i=0;i<180;i++)step(final,DT,{});
  assert.equal(final.phase,'complete');assert.equal(final.collectedCount,20);
  assert.equal(final.coins,finalRoom.debris.reduce((sum,d)=>sum+d.value,0));assert.equal(final.trinket.collected,false,'Completion must not invent a found trinket');
  const dustFinalRoom=testRoom({debris:Array.from({length:20},(_,id)=>({id,x:id===19?800:300,y:id===19?500:300,type:'dust',value:2}))});
  const dustFinal=createRun(dustFinalRoom,stats,'100-percent-dust-rounding');
  for(let i=0;i<63;i++)step(dustFinal,1/120,{});
  assert.equal(dustFinal.phase,'playing','Dust still below 95% must not finish early');
  assert.equal(dustFinal.collectedCount,0);assert(dustFinal.debris.slice(0,19).every(d=>d.amount>0));
  step(dustFinal,1/120,{});
  assert.equal(dustFinal.collectedCount,19,'The boundary must come from real dust collection');
  assert.equal(dustFinal.phase,'playing','Exactly 95% dust collection must not complete a room');
  assert.equal(dustFinal.coins,0);assert(Math.abs(dustFinal.percent-.95)<1e-12);
  walkTo(dustFinal,{x:800,y:500});for(let i=0;i<240;i++)step(dustFinal,1/120,{});
  assert.equal(dustFinal.phase,'complete');assert.equal(dustFinal.coins,40);
  assert.equal(dustFinal.events.filter(e=>e.type==='finish').length,1,'Full dust collection must pay only once');
  const invalid=createRun(testRoom(),stats,'invalid');step(invalid,NaN,{x:Infinity,y:NaN});step(invalid,-1,{x:Infinity,y:NaN});assert.equal(invalid.time,0);step(invalid,DT,{x:Infinity,y:NaN});assert.equal(invalid.robot.x,300);assert.equal(invalid.robot.y,300);
  invalid.phase='unknown';const invalidTime=invalid.time;step(invalid,DT,{x:1,y:0});assert.equal(invalid.time,invalidTime,'Unknown phases must not advance the game');
  connectedAreaChecks();carriedBagChecks();resistanceChecks();
}

function walkTo(run,point){
  const route=search(run.room,run.robot).pathTo(point);route.push({...point});
  for(let frame=0;frame<1800&&route.length&&['playing','exiting'].includes(run.phase);frame++){
    const p=route[0],dx=p.x-run.robot.x,dy=p.y-run.robot.y,length=Math.hypot(dx,dy);
    if(length<.1){route.shift();continue;}
    const scale=Math.min(1,length/(run.stats.speed*DT));step(run,DT,{x:dx/length*scale,y:dy/length*scale});
  }
  assert(!route.length||['finishing','complete'].includes(run.phase),'Focused check could not physically reach its destination');
}

function crossHallway(run,direction=1){
  const from=run.areaIndex,door=direction>0?run.room.exit:run.room.entry;
  walkTo(run,door);
  for(let i=0;i<600&&run.areaIndex===from;i++){
    const before={x:run.robot.x+run.areaIndex*AREA_STRIDE,y:run.robot.y};
    step(run,DT,{x:direction,y:0});
    const worldX=run.robot.x+run.areaIndex*AREA_STRIDE;
    assert(Math.hypot(worldX-before.x,run.robot.y-before.y)<=run.stats.speed*DT+1e-6,'Hallway movement cannot teleport');
    assert(isRunWalkable(run,run.robot.x,run.robot.y,17),'Hallway movement stays inside open floor');
  }
  assert.equal(run.areaIndex,from+direction,'Ordinary movement must cross the entire hallway in either direction');
}

function connectedAreaChecks(){
  const stats=statsFor();
  const debrisAt=x=>Array.from({length:20},(_,id)=>({id,x,y:300,type:'crumb',value:1}));
  const root=testRoom({debris:debrisAt(300)}),second=testRoom({spawn:{x:100,y:540},debris:[...debrisAt(140),{id:20,x:180,y:300,type:'dust',value:2,resistance:2.6},{id:21,x:820,y:500,type:'crumb',value:1}]});
  Object.assign(root,{areaIndex:0,areaCount:2,areaName:'Front room',exit:{x:900,y:300,nextName:'Back room'},nextAreas:[second]});
  Object.assign(second,{areaIndex:1,areaCount:2,areaName:'Back room',entry:{x:60,y:300}});
  root.trinket={x:300,y:300,name:'Hidden until final area',hidden:true};second.trinket={x:140,y:300,name:'Final keepsake'};
  const lockedRoom={...root,debris:debrisAt(300),spawn:{...root.exit}},locked=createRun(lockedRoom,stats,'locked-door');
  for(let i=0;i<300;i++)step(locked,DT,{x:1,y:0});
  assert.equal(locked.areaIndex,0,'Walking through a doorway before 100% cannot skip cleaning');assert.equal(locked.phase,'playing');
  assert(locked.robot.x<=hallwayFor(root,0).gateX-17,'The locked door physically blocks the robot');
  assert.equal(locked.collectedCount,0,'Approaching a locked hallway cannot silently clear the room');
  assert.equal(isRunWalkable(locked,HALLWAY_MIDPOINT,300,17),false,'The locked corridor cannot be entered from beyond its gate');
  const nearlyCleanRoom={...root,debris:debrisAt(300).map((d,i)=>i===19?{...d,type:'dust'}:d)},nearlyClean=createRun(nearlyCleanRoom,stats,'nearly-clean-door');
  for(let i=0;i<10;i++)step(nearlyClean,.05,{});
  assert.equal(nearlyClean.collectedCount,19);assert(nearlyClean.percent>.99&&nearlyClean.percent<1);assert.equal(nearlyClean.phase,'playing');
  step(nearlyClean,(.05-.0001)/1.9,{});
  assert(nearlyClean.percent>.99999&&nearlyClean.percent<1);assert.equal(nearlyClean.phase,'playing','Even 99.999% cannot open the next room');
  step(nearlyClean,.0001/1.9,{});assert.equal(nearlyClean.phase,'exiting');assert.equal(nearlyClean.collectedCount,20);
  const run=createRun(root,stats,'connected-job'),career=defaultCareer(),careerBefore=JSON.stringify(career),careerAtStart={marker:'same job'};
  run.started=true;run.careerAtStart=careerAtStart;
  step(run,DT,{});
  assert.equal(run.phase,'exiting');assert.equal(run.coins,0);assert.equal(run.percent,1);assert.equal(run.robot.bag,20);assert.equal(run.robot.bagValue,20);
  assert.equal(run.trinket.collected,false,'Intermediate hidden keepsakes cannot be collected');
  assert.equal(run.events.filter(e=>e.type==='finish').length,0);assert.equal(run.events.filter(e=>e.type==='area-clear').length,1);
  for(let i=0;i<120;i++)step(run,DT,{});
  assert.equal(run.areaIndex,0,'A clean area must wait for the player to drive to its doorway');assert.equal(runResult(run),null);
  assert.equal(settleRun(career,runResult(run)).ok,false);assert.equal(JSON.stringify(career),careerBefore,'Intermediate earnings stay unbanked');
  const timeBeforeDoor=run.time;
  crossHallway(run);
  assert.equal(run.areaIndex,1);assert.equal(run.areaCount,2);assert.equal(run.room,second);assert.equal(run.jobRoom,root);
  assert.equal(run.runId,'connected-job');assert.equal(run.careerAtStart,careerAtStart);assert.equal(run.coins,0);assert.equal(run.robot.bag,20);assert.equal(run.robot.bagValue,20);assert(run.time>timeBeforeDoor);
  assert.equal(run.cleaned,0);assert.equal(run.percent,0);assert.equal(run.collectedCount,20);assert.equal(run.started,true);
  assert(Math.abs(run.robot.x-(HALLWAY_MIDPOINT-AREA_STRIDE))<=stats.speed*DT);assert.equal(run.robot.y,second.entry.y);
  assert.notEqual(run.robot.y,second.spawn.y,'Connected rooms enter through the opposite door, not the dock');
  const entryTime=run.time,entryX=run.robot.x;step(run,DT,{x:1,y:0});assert(run.time>entryTime);assert(run.robot.x>entryX,'The next area continues without another start click');
  assert.equal(runResult(run),null,'Entering the final area still cannot settle an unfinished job');
  walkTo(run,{x:140,y:300});
  assert.equal(run.phase,'playing');assert.equal(run.trinket.collected,true);
  const bagBeforeBack=run.robot.bag,valueBeforeBack=run.robot.bagValue;
  crossHallway(run,-1);
  assert.equal(run.phase,'exiting');assert.equal(run.percent,1);assert(run.debris.every(d=>d.collected),'Returning to a cleaned area cannot respawn its dirt');
  assert.equal(run.robot.bag,bagBeforeBack);assert.equal(run.robot.bagValue,valueBeforeBack);
  const secondState=run.areaStates[1],savedDust=secondState.debris[20].amount,savedPickups=run.collectedCount;
  assert(savedDust>0&&savedDust<1,'The later room retains partially vacuumed dust while visiting an earlier room');
  const secondSnapshot=JSON.stringify({debris:secondState.debris,trinket:secondState.trinket,cleaned:secondState.cleaned,percent:secondState.percent});
  crossHallway(run);
  assert.equal(JSON.stringify({debris:run.debris,trinket:run.trinket,cleaned:run.cleaned,percent:run.percent}),secondSnapshot,'Backtracking restores the exact later-room progress and keepsake');
  assert.equal(run.collectedCount,savedPickups);assert.equal(run.events.filter(e=>e.type==='area-clear').length,1,'Returning through an open hallway cannot award a second clear');
  walkTo(run,{x:180,y:300});for(let i=0;i<120;i++)step(run,DT,{});
  walkTo(run,{x:820,y:500});for(let i=0;i<180;i++)step(run,DT,{});
  const value=jobValue(root);
  assert.equal(run.phase,'complete');assert.equal(run.coins,value);assert.equal(run.collectedCount,42);assert.equal(run.trinket.collected,true);
  assert.equal(run.events.filter(e=>e.type==='finish').length,1);assert.equal(run.events.filter(e=>e.type==='area-enter').length,3);
  const result=runResult(run);assert.equal(result.roomId,root.id);assert.equal(result.coins,value);assert.equal(result.trinket,true);
  assert.equal(settleRun(career,result).ok,true);const awarded=career.coins;assert.equal(settleRun(career,result).ok,false);assert.equal(career.coins,awarded,'The whole job pays exactly once');
  const restart=createRun(root,stats,'connected-restart');assert.equal(restart.areaIndex,0);assert.equal(restart.coins,0);assert.equal(restart.time,0);assert.equal(runResult(restart),null,'Restart cannot carry provisional earnings');
  const simulated=solveRoom(root,stats,{runId:'connected-route-check'});assert.equal(simulated.areaEntries,1);assert.equal(simulated.result.coins,value);
}

function carriedBagChecks(){
  const stats=statsFor(),root=testRoom({debris:Array.from({length:stats.capacity},(_,id)=>({id,x:300,y:300,type:'crumb',value:id%3+1}))});
  const second=testRoom({debris:[{id:0,x:80,y:300,type:'crumb',value:3}],spawn:{x:100,y:540}});
  Object.assign(root,{exit:{x:900,y:300,nextName:'Second area'},nextAreas:[second]});
  root.trinket.hidden=true;second.entry={x:60,y:300};
  const value=materialValue(root),run=createRun(root,stats,'carry-full-bag');
  step(run,DT,{});
  assert.equal(run.phase,'exiting');assert.equal(run.full,true);assert.equal(run.robot.bag,stats.capacity);assert.equal(run.robot.bagValue,value);assert.equal(run.coins,0,'Clearing an intermediate area must not deposit its bag');
  crossHallway(run);
  assert.equal(run.areaIndex,1,'A full bag must not block the doorway');assert.equal(run.robot.bag,stats.capacity);assert.equal(run.robot.bagValue,value);assert.equal(run.full,true);assert.equal(run.unloading,0);
  for(let i=0;i<60;i++)step(run,DT,{});
  assert.equal(run.debris[0].collected,false,'Carried full bags cannot collect in the next area');assert.equal(run.robot.bagValue,value);assert.equal(run.coins,0);
  crossHallway(run,-1);
  assert.equal(run.robot.bag,stats.capacity);assert.equal(run.robot.bagValue,value);assert.equal(run.coins,0,'A full bag keeps all of its value while backtracking');
  assert(run.areaStates[1].debris.every(d=>!d.collected),'Returning to an earlier dock does not clear the later room');
  walkTo(run,root.stations[0]);for(let i=0;i<90;i++)step(run,DT,{});
  assert.equal(run.robot.bag,0);assert.equal(run.robot.bagValue,0);assert.equal(run.full,false);assert.equal(run.coins,value,'A physical dock visit deposits the carried contents');
  assert.equal(run.events.filter(e=>e.type==='unload').length,1);assert.equal(run.events.find(e=>e.type==='unload').value,value);
  for(let i=0;i<90;i++)step(run,DT,{});assert.equal(run.coins,value,'Staying at the old dock cannot pay twice');
  crossHallway(run);walkTo(run,{x:80,y:300});for(let i=0;i<90;i++)step(run,DT,{});
  assert.equal(run.phase,'complete');assert.equal(run.coins,value+3);assert.equal(run.collectedCount,stats.capacity+1);assert.equal(run.robot.bag,0);assert.equal(runResult(run).coins,value+3);
  const cleared=createRun(root,stats,'deposit-in-cleared-area');step(cleared,DT,{});
  walkTo(cleared,root.stations[0]);for(let i=0;i<90;i++)step(cleared,DT,{});
  assert.equal(cleared.phase,'exiting');assert.equal(cleared.areaIndex,0);assert.equal(cleared.robot.bag,0);assert.equal(cleared.robot.bagValue,0);assert.equal(cleared.full,false);assert.equal(cleared.coins,value,'Docks remain usable after the current area is clean');
  assert.equal(cleared.events.filter(e=>e.type==='unload').length,1);assert.equal(runResult(cleared),null);
  for(let i=0;i<120;i++)step(cleared,DT,{});assert.equal(cleared.coins,value,'A cleared-area dock cannot pay the bag twice');
  const passingDock=createRun({...root,stations:[{x:390,y:300}]},stats,'leave-partial-unload');step(passingDock,DT,{});
  let maxUnloading=0;
  for(let i=0;i<600&&passingDock.areaIndex===0;i++){step(passingDock,DT,{x:1,y:0});maxUnloading=Math.max(maxUnloading,passingDock.unloading);}
  assert(maxUnloading>0&&maxUnloading<1,'The robot physically crossed a dock without waiting for its unload');
  assert.equal(passingDock.areaIndex,1);assert.equal(passingDock.unloading,0,'A partial unload must not continue at the next area entrance');assert.equal(passingDock.robot.bag,stats.capacity);assert.equal(passingDock.robot.bagValue,value);assert.equal(passingDock.coins,0);
}

function resistanceChecks(){
  function patch(type,resistance,pull=0){
    const room=testRoom({debris:[{id:0,x:300,y:300,type,value:2,resistance},...Array.from({length:20},(_,id)=>({id:id+1,x:800,y:500,type:'crumb',value:1}))]});
    const run=createRun(room,statsFor({pull}),`${type}-${resistance}-${pull}`);
    for(let i=0;i<20;i++)step(run,DT,{});
    return run.debris[0];
  }
  const softDust=patch('dust',1),hardDust=patch('dust',2.6),upgradedDust=patch('dust',2.6,5);
  assert(hardDust.amount>softDust.amount,'Later dust requires longer suction');assert(upgradedDust.amount<hardDust.amount,'Suction upgrades must visibly accelerate tougher dust');
  const softStuck=patch('stuck',1),hardStuck=patch('stuck',2.6),upgradedStuck=patch('stuck',2.6,5);
  assert(hardStuck.progress<softStuck.progress,'Later stuck scraps require longer loosening');assert(upgradedStuck.progress>hardStuck.progress,'Suction upgrades must accelerate stuck scraps');
  for(const resistance of [NaN,0,-1])assert.equal(patch('dust',resistance).amount,softDust.amount,'Invalid resistance must fall back to ordinary material');
}

export async function verifyCampaign(){
  await import('./verify-rooms.mjs');await import('./verify-progression.mjs');
  await import('./verify-input.mjs');await import('./verify-career-store.mjs');await import('./verify-app.mjs');physicsChecks();
  let career=defaultCareer();const report=[],purchases=[];let awarded=0,spent=0;
  const store=new Map(),storage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  function shop(room){
    while(true){
      const choices=UPGRADES.map(({key})=>({key,rank:career.upgrades[key],price:upgradePrice(key,career.upgrades[key])})).filter(u=>u.price!==null&&u.price<=career.coins).sort((a,b)=>a.rank-b.rank||a.price-b.price);
      if(!choices.length)break;const choice=choices[0];assert(buyUpgrade(career,choice.key).ok);spent+=choice.price;purchases.push({afterRoom:room,...choice});
    }
  }
  mkdirSync(new URL('../tmp/',import.meta.url),{recursive:true});
  for(let id=1;id<=24;id++){
    assert(isRoomUnlocked(career,id));const stats=statsFor(career.upgrades),room=makeRoom(id);
    const solved=solveRoom(room,stats,{runId:`earned-campaign-${id}`});
    const before=career.coins,reward=settleRun(career,solved.result);assert(reward.ok);
    const expectedBonus=50+solved.result.medal*20+(solved.result.trinket?25:0);
    assert.equal(reward.bonus,expectedBonus,'First completion pays each unique bonus exactly once');
    assert.equal(reward.coins,jobValue(room)+expectedBonus);
    assert.equal(career.coins-before,reward.coins);awarded+=reward.coins;
    const snapshot=JSON.stringify(career);assert.equal(settleRun(career,solved.result).ok,false);assert.equal(JSON.stringify(career),snapshot);
    shop(id);assert.equal(career.coins,awarded-spent,'All purchases must use genuinely earned cash');
    assert(saveCareer(storage,career));const loaded=loadCareer(storage);assert.equal(loaded.status,'ok');assert.deepEqual(loaded.career,career);career=loaded.career;
    assert.equal(settleRun(career,solved.result).ok,false,'Reload cannot duplicate a completed run reward');
    const restarted=createRun(room,stats,`restart-${id}`);step(restarted,DT,{});assert.equal(runResult(restarted),null);assert.equal(settleRun(career,runResult(restarted)).ok,false,'A restart cannot bank an unfinished run');
    report.push({id,name:room.name,areas:solved.run.areaCount,seconds:solved.result.time,medal:solved.result.medal,stats,unloads:solved.unloads,physicalPickups:solved.physicalPickups,finalSweepPickups:solved.finalSweepPickups,trinket:solved.result.trinket,coins:reward.coins,remainingCash:career.coins,upgrades:{...career.upgrades}});
    console.log(`Room ${id}: ${solved.result.time.toFixed(2)}s, ${solved.unloads} unloads, medal ${solved.result.medal}, +${reward.coins} coins`);
    if(id%6===0)writeFileSync(new URL(`../tmp/earned-career-${id}.json`,import.meta.url),JSON.stringify(career,null,2));
  }
  assert.equal(career.completed.length,24);assert(isRoomUnlocked(career,0));
  const endless=[];
  for(const seed of [17,2048,99001]){
    const room=makeEndless(seed),solved=solveRoom(room,statsFor(career.upgrades),{runId:`earned-endless-${seed}`});
    const reward=settleRun(career,solved.result);assert(reward.ok);assert.equal(reward.bonus,0,'Endless must not repeat campaign completion or trinket bonuses');awarded+=reward.coins;
    shop(0);assert.equal(career.coins,awarded-spent);endless.push({seed,seconds:solved.result.time,coins:reward.coins,unloads:solved.unloads});
  }
  const replay=solveRoom(makeRoom(1),statsFor(career.upgrades),{runId:'earned-replay-1'}),replayReward=settleRun(career,replay.result);
  assert(replayReward.ok);assert.equal(replayReward.bonus,0,'An equally good replay cannot repeat completion, medal or trinket bonuses');awarded+=replayReward.coins;
  assert.equal(career.coins,awarded-spent);assert.equal(career.completed.length,24);
  writeFileSync(new URL('../tmp/earned-career.json',import.meta.url),JSON.stringify(career,null,2));
  const output={passed:true,campaignRooms:24,endlessRooms:3,automatedSeconds:report.reduce((sum,r)=>sum+r.seconds,0),timeNote:'Automated route-finding simulation times; not human playtime.',minRoomSeconds:Math.min(...report.map(r=>r.seconds)),maxRoomSeconds:Math.max(...report.map(r=>r.seconds)),awarded,spent,remainingCash:career.coins,purchases,report,endless,checks:['connected rooms','real movement','robot and debris collision bounds','normalized diagonals','exact corner line of sight','physical suction','bag capacity','full-bag keepsakes','automatic unloading','bags and value carried both ways through hallways','dock unloading in previously cleared areas','conserved material value and dust progress','100% physical cleanup','continuous hallway movement and locked gates','backtracking preserves dust and keepsakes','resistant dust and stuck scraps','unique bonuses','save/reload','unfinished restart rejection','earned upgrades','ending unlock','endless seeds']};
  writeFileSync(new URL('../tmp/campaign-report.json',import.meta.url),JSON.stringify(output,null,2));
  console.log(JSON.stringify({passed:true,rooms:24,endless:3,automatedSeconds:output.automatedSeconds,minRoomSeconds:output.minRoomSeconds,maxRoomSeconds:output.maxRoomSeconds,upgrades:career.upgrades,awarded,spent,remainingCash:career.coins},null,2));
  return output;
}

export function verifyDeepPhysics(){
  const starterCampaign=Array.from({length:24},(_,i)=>{
    const solved=solveRoom(makeRoom(i+1),statsFor());
    return {id:i+1,time:solved.result.time,unloads:solved.unloads};
  });
  const endless=Array.from({length:40},(_,seed)=>{
    const solved=solveRoom(makeEndless(seed),statsFor(seed%2?{width:5,bag:5,speed:5,pull:5}:{}));
    return {seed,build:seed%2?'max':'starter',time:solved.result.time,unloads:solved.unloads};
  });
  // Unplanned movement exercises wall sliding and drifting piles outside the
  // efficient solver's tidy routes. No progress or awards are forced.
  let randomState=761923,soakFrames=0;
  const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
  for(let id=1;id<=24;id++){
    const room=makeRoom(id),run=createRun(room,statsFor({width:5,bag:5,speed:5,pull:5}),`soak-${id}`);
    const previous={x:run.robot.x,y:run.robot.y,cleaned:0,collected:new Set()},totalValue=jobValue(room);
    let input={x:0,y:0};
    for(let frame=0;frame<3600;frame++){
      if(frame%45===0)input={x:random()*2-1,y:random()*2-1};
      step(run,DT,input);auditRun(run,totalValue,previous);soakFrames++;
      assert(run.particles.length<=110,'Particles must stay bounded during sustained play');run.events.length=0;
    }
  }
  const report={passed:true,starterCampaign,endless,soakRooms:24,soakFrames,soakSimulatedSeconds:soakFrames*DT,totalCompletionSeconds:[...starterCampaign,...endless].reduce((sum,r)=>sum+r.time,0),timeNote:'Automated physical simulation, not human playtime.'};
  mkdirSync(new URL('../tmp/',import.meta.url),{recursive:true});
  writeFileSync(new URL('../tmp/deep-physics-report.json',import.meta.url),JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:true,starterCampaign:24,endless:40,soakRooms:24,soakFrames,soakSimulatedSeconds:report.soakSimulatedSeconds,totalCompletionSeconds:report.totalCompletionSeconds},null,2));
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){await verifyCampaign();if(process.argv.includes('--deep'))verifyDeepPhysics();}
