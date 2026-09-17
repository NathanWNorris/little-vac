import assert from 'node:assert/strict';
import {createInputController} from '../dist/input.js';

let checks=0;
function check(name,body){body();checks++;console.log(`PASS ${name}`);}
function fixture(rect={left:10,top:20,width:480,height:320}){
  const captures=[],releases=[],changes=[];let gestures=0;
  const target={setPointerCapture:id=>captures.push(id),releasePointerCapture:id=>releases.push(id)};
  const controller=createInputController({canvas:()=>({getBoundingClientRect:()=>rect}),onGesture:()=>gestures++,onChange:s=>changes.push(s)});
  const event=(values={})=>({pointerId:1,pointerType:'mouse',button:0,isPrimary:true,clientX:250,clientY:180,currentTarget:target,preventDefault(){this.prevented=true;},...values});
  return{controller,event,captures,releases,changes,get gestures(){return gestures;}};
}
const almost=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);

check('Mouse targeting follows scaled world coordinates, including letterboxing',()=>{
  const f=fixture();f.controller.pointerMove(f.event());
  assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
  assert.deepEqual(f.controller.movement({x:480,y:400}),{x:0,y:-1});
  f.controller.pointerMove(f.event({clientX:260,clientY:180}));
  assert.deepEqual(f.controller.pointer,{id:1,x:500,y:320});
  assert.deepEqual(f.captures,[]);assert.equal(f.gestures,0);
  const wide=fixture({left:10,top:20,width:600,height:320});wide.controller.pointerMove(wide.event({clientX:310,clientY:180}));
  assert.deepEqual(wide.controller.pointer,{id:1,x:480,y:320});
});
check('A click and release do not interrupt mouse following',()=>{
  const f=fixture();f.controller.pointerMove(f.event());f.controller.pointerDown(f.event());f.controller.pointerUp(f.event());
  assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
  f.controller.pointerMove(f.event({clientX:300,clientY:180}));
  assert.deepEqual(f.controller.pointer,{id:1,x:580,y:320});assert.equal(f.gestures,1);
  assert.deepEqual(f.captures,[]);assert.deepEqual(f.releases,[]);
});
check('Mouse exit and letterbox margins stop following until the mouse returns',()=>{
  const f=fixture();f.controller.pointerMove(f.event());f.controller.pointerLeave(f.event({pointerId:2}));
  assert.ok(f.controller.pointer);f.controller.pointerLeave(f.event());
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:0,y:0});
  f.controller.pointerUp(f.event());assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event({clientX:300}));assert.equal(f.controller.pointer.x,580);
  for(const point of [{clientX:9},{clientX:491},{clientY:19},{clientY:341}]){
    f.controller.pointerMove(f.event());f.controller.pointerMove(f.event(point));assert.equal(f.controller.pointer,null);
  }
  const wide=fixture({left:10,top:20,width:600,height:320});wide.controller.pointerMove(wide.event({clientX:310}));
  wide.controller.pointerMove(wide.event({clientX:30}));assert.equal(wide.controller.pointer,null);
});
check('Secondary buttons do not move the robot or steal a gesture',()=>{
  const f=fixture();for(const button of [1,2])f.controller.pointerDown(f.event({button}));
  assert.equal(f.controller.pointer,null);assert.equal(f.gestures,0);assert.deepEqual(f.captures,[]);
});
check('An extra finger cannot replace, release, or cancel the controlling finger',()=>{
  const f=fixture();f.controller.pointerDown(f.event({pointerType:'touch',clientX:100,clientY:100}));
  f.controller.pointerMove(f.event({pointerType:'touch',clientX:140,clientY:100}));
  f.controller.pointerDown(f.event({pointerId:2,pointerType:'touch',isPrimary:false}));
  f.controller.pointerMove(f.event({pointerId:2,pointerType:'touch',clientX:10,clientY:20}));
  f.controller.pointerUp(f.event({pointerId:2}));
  f.controller.pointerCancel(f.event({pointerId:2}));f.controller.pointerLeave(f.event());
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:1,y:0});assert.equal(f.controller.touch.id,1);
  // Also ignore another pointer even if a browser/device calls it primary.
  f.controller.pointerDown(f.event({pointerId:3,isPrimary:true}));
  assert.equal(f.gestures,1);assert.deepEqual(f.captures,[1]);
  f.controller.pointerUp(f.event());assert.equal(f.controller.touch,null);assert.deepEqual(f.releases,[1]);
});
check('The joystick anchors to the touch origin and caps diagonal speed',()=>{
  const f=fixture();f.controller.pointerDown(f.event({pointerType:'touch',clientX:300,clientY:100}));
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:0,y:0});
  f.controller.pointerMove(f.event({clientX:312,clientY:116}));
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:.3,y:.4});
  f.controller.pointerMove(f.event({clientX:600,clientY:500}));
  const movement=f.controller.movement({x:0,y:0});almost(movement.x,.6);almost(movement.y,.8);almost(Math.hypot(movement.x,movement.y),1);
});
check('The separate control tray works with a mouse as a relative joystick',()=>{
  const f=fixture();f.controller.pointerMove(f.event());f.controller.pointerDown(f.event({clientX:200,clientY:380}));
  assert.equal(f.controller.pointer,null);assert.equal(f.controller.touch.id,1);
  f.controller.pointerMove(f.event({clientX:180,clientY:380}));
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:-.5,y:0});
  f.controller.pointerLeave(f.event());assert.equal(f.controller.touch.id,1);
  f.controller.pointerUp(f.event());assert.equal(f.controller.touch,null);assert.deepEqual(f.releases,[1]);
  f.controller.pointerMove(f.event({clientX:180,clientY:380}));assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event());assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
});
check('Pause clear stops movement, releases capture, and ignores stale events',()=>{
  const f=fixture();f.controller.pointerDown(f.event({pointerType:'touch'}));f.controller.clear();
  f.controller.pointerMove(f.event({pointerType:'touch',clientX:400,clientY:100}));f.controller.pointerUp(f.event());
  assert.deepEqual(f.controller.movement({x:0,y:0}),{x:0,y:0});assert.deepEqual(f.releases,[1]);
  assert.deepEqual(f.changes.at(-1),{pointer:null,touch:null});
});
check('Clearing mouse hover stops it until a fresh mouse movement',()=>{
  const f=fixture();f.controller.pointerMove(f.event());f.controller.clear();
  assert.equal(f.controller.pointer,null);assert.deepEqual(f.controller.movement({x:0,y:0}),{x:0,y:0});
  f.controller.pointerUp(f.event());f.controller.pointerCancel(f.event());assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event());assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
});
check('Touch can take over idle mouse hover and ignores hovering secondary devices',()=>{
  const f=fixture();f.controller.pointerMove(f.event());
  f.controller.pointerMove(f.event({pointerId:2,pointerType:'touch'}));assert.equal(f.controller.pointer.id,1);
  f.controller.pointerDown(f.event({pointerId:2,pointerType:'touch'}));assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event({pointerId:2,pointerType:'touch',clientX:290}));
  f.controller.pointerMove(f.event());assert.deepEqual(f.controller.movement({x:0,y:0}),{x:1,y:0});
  f.controller.pointerCancel(f.event({pointerId:2}));assert.equal(f.controller.touch,null);
});
check('Mouse dead zone and approach speed avoid jitter and overshoot',()=>{
  const f=fixture();f.controller.pointerDown(f.event());
  assert.deepEqual(f.controller.movement({x:480,y:320}),{x:0,y:0});
  assert.deepEqual(f.controller.movement({x:475,y:320}),{x:0,y:0});
  assert.deepEqual(f.controller.movement({x:470,y:320}),{x:.5,y:0});
});
check('Keyboard direction stays normalized, cancels opposites, and overrides mouse',()=>{
  const f=fixture();f.controller.pointerDown(f.event());
  const diagonal=f.controller.movement({x:0,y:0},new Set(['w','d']));almost(Math.hypot(diagonal.x,diagonal.y),1);assert.ok(diagonal.x>0&&diagonal.y<0);
  assert.deepEqual(f.controller.movement({x:0,y:0},new Set(['ArrowLeft'])),{x:-1,y:0});
  f.controller.clear();assert.deepEqual(f.controller.movement({x:0,y:0},new Set(['a','d','w','s'])),{x:0,y:0});
});
check('Releasing a keyboard direction never returns to a stale mouse target',()=>{
  const f=fixture();f.controller.pointerMove(f.event());
  assert.deepEqual(f.controller.movement({x:400,y:320},new Set(['ArrowLeft'])),{x:-1,y:0});
  assert.deepEqual(f.controller.movement({x:350,y:320},new Set()),{x:0,y:0});
  assert.equal(f.controller.pointer,null);
  // Mouse follow resumes from an actual new movement, without requiring a click.
  f.controller.pointerMove(f.event({clientX:300}));
  assert.deepEqual(f.controller.movement({x:350,y:320},new Set()),{x:1,y:0});
});
check('Opposing held keyboard directions stop instead of falling back to mouse',()=>{
  const f=fixture();f.controller.pointerMove(f.event());
  assert.deepEqual(f.controller.movement({x:350,y:320},new Set(['a','d'])),{x:0,y:0});
  assert.deepEqual(f.controller.movement({x:350,y:320},new Set()),{x:0,y:0});
});
check('Clicking letterbox margins cannot restart out-of-room mouse steering',()=>{
  const f=fixture({left:10,top:20,width:600,height:320});
  f.controller.pointerMove(f.event({clientX:310}));
  f.controller.pointerMove(f.event({clientX:30}));
  assert.equal(f.controller.pointer,null);
  f.controller.pointerDown(f.event({clientX:30}));
  assert.deepEqual(f.controller.movement({x:480,y:320}),{x:0,y:0});
  assert.equal(f.controller.pointer,null);assert.equal(f.gestures,0);
  f.controller.pointerMove(f.event({clientX:310}));
  assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
});
check('Malformed events or missing canvas do not poison later movement',()=>{
  const f=fixture();for(const point of [{clientX:NaN},{clientY:Infinity},{pointerId:NaN}])f.controller.pointerDown(f.event(point));
  assert.equal(f.controller.pointer,null);f.controller.pointerDown(f.event());
  f.controller.pointerMove(f.event({clientX:NaN}));assert.deepEqual(f.controller.pointer,{id:1,x:480,y:320});
  assert.deepEqual(f.controller.movement({x:NaN,y:0}),{x:0,y:0});
  const empty=createInputController({canvas:()=>null});empty.pointerDown(f.event());assert.equal(empty.pointer,null);
  const hidden=fixture({left:0,top:0,width:0,height:0});hidden.controller.pointerDown(hidden.event());assert.equal(hidden.controller.pointer,null);
});
check('Capture loss and unsupported capture are safe, with detached snapshots',()=>{
  const f=fixture();f.controller.pointerDown(f.event({pointerType:'pen',currentTarget:{setPointerCapture(){throw Error('detached');},releasePointerCapture(){throw Error('already released');}}}));
  const view=f.controller.pointer;view.x=Infinity;assert.equal(f.controller.pointer.x,480);
  f.controller.pointerCancel({pointerId:1});assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event({pointerType:'pen'}));assert.equal(f.controller.pointer,null);
  f.controller.pointerMove(f.event());assert.ok(f.controller.pointer);
  f.controller.pointerCancel(f.event());assert.equal(f.controller.pointer,null);
});
console.log(`Input regression suite passed: ${checks} checks.`);
