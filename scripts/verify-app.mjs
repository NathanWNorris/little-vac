import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as rooms from '../dist/rooms.js';
import * as progression from '../dist/progression.js';
import * as simulation from '../dist/simulation.js';
import * as storeModule from '../dist/career-store.js';
import * as inputModule from '../dist/input.js';
import * as ui from '../dist/ui.js';
import * as world from '../dist/world.js';

// Exercise the real app orchestration against a small DOM surface. Drawing is
// deliberately omitted: browser playtests cover pixels, pointer geometry, and layout.
const source = (await readFile(new URL('../dist/app.js', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '');
const dependencies = { ...rooms, ...progression, ...simulation, ...storeModule, ...inputModule, ...ui, ...world, render() {}, drawTitle() {} };
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const makeApp = new AsyncFunction('deps', 'window', 'document', 'navigator', 'performance', 'requestAnimationFrame', 'setTimeout', 'clearTimeout', 'crypto', 'console',
  `const {${Object.keys(dependencies).join(',')}}=deps;\n${source}\nreturn {act,startRoom,requestStart,completed,frame,rooms,shop,continueShift,publicState,pointerDown,pointerMove,pointerUp,pointer:()=>input.pointer,run:()=>run};`);

function fixtureCareer(count = 0) {
  const career = progression.defaultCareer();
  for (let id = 1; id <= count; id++) progression.settleRun(career, { runId: `fixture-${id}`, roomId: id, coins: 300, time: 110, medal: 2, trinket: false });
  return career;
}
async function boot(initial = fixtureCareer(), { blockedStorage = false, deniedLocks = false } = {}) {
  let text = JSON.stringify(initial), timestamp = 0, releaseLock = null, lockGate = Promise.resolve();
  const storage = { getItem() { return text; }, setItem(key, value) { assert.equal(key, progression.SAVE_KEY); text = value; } };
  const locks = {
    async request(name, callback) { assert.equal(name, progression.SAVE_KEY); if (deniedLocks) throw new DOMException('Storage access denied', 'SecurityError'); await lockGate; return callback(); },
    hold() { lockGate = new Promise(resolve => { releaseLock = resolve; }); },
    release() { releaseLock?.(); releaseLock = null; },
  };
  const events = new Map(), documentEvents = new Map(), nodes = new Map(), webTools = new Map();
  let document;
  function node(id = '') {
    return { id, innerHTML: '', textContent: '', hidden: false, disabled: false, open: false, isConnected: true, dataset: {}, style: {}, tagName: 'DIV',
      classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, setAttribute() {}, insertAdjacentHTML(_position, html) { this.innerHTML += html; },
      querySelector(selector) { return selector === 'h1' || selector === 'h2' ? node('heading') : null; }, querySelectorAll() { return []; },
      focus() { document.activeElement = this; }, getContext() { return { setTransform() {} }; },
      showModal() { this.open = true; }, close() { this.open = false; },
      getBoundingClientRect() { return { left: 0, top: 0, bottom: 640, width: 960, height: 640 }; },
    };
  }
  document = { hidden: false, activeElement: null, body: node('body'), modelContext: {registerTool(tool){webTools.set(tool.name,tool);}}, addEventListener(name,callback) {if(!documentEvents.has(name))documentEvents.set(name,[]);documentEvents.get(name).push(callback);}, querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, node(selector));
    return nodes.get(selector);
  } };
  const window = { localStorage: storage, devicePixelRatio: 1, innerWidth: 1280, scrollY: 0,
    matchMedia: () => ({ matches: false }), scrollTo({ top }) { this.scrollY = top; },
    addEventListener(name, callback) { if (!events.has(name)) events.set(name, []); events.get(name).push(callback); },
  };
  if (blockedStorage) Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage access denied', 'SecurityError'); } });
  const errors = [];
  const app = await makeApp(dependencies, window, document, { locks }, { now: () => timestamp }, () => {}, () => 0, () => {}, { randomUUID: () => String(++timestamp) }, { error: error => errors.push(error) });
  return { ...app, storage, locks, nodes, errors, webTools, focused:()=>document.activeElement,
    keyEvent(type,key,options={}){for(const callback of documentEvents.get(type)||[])callback({key,target:{tagName:'CANVAS',closest:()=>null},preventDefault(){},...options});},
    blur(){for(const callback of events.get('blur')||[])callback();},
    visibility(hidden){document.hidden=hidden;for(const callback of documentEvents.get('visibilitychange')||[])callback();},
    async externalCareer(career) { storage.setItem(progression.SAVE_KEY, JSON.stringify(career)); for (const callback of events.get('storage') || []) await callback({ key: progression.SAVE_KEY }); },
    async settle() { const run = app.run(); run.phase = 'complete'; run.areaStates.forEach(state=>state.cleared=true); run.time = 100; run.percent = 1; run.coins = run.room.debris.reduce((sum, piece) => sum + piece.value, 0); await app.completed(); },
  };
}

let checks = 0;
async function test(name, body) { await body(); checks++; console.log(`PASS ${name}`); }

await test('denied embedded-browser storage still allows a warned, playable session', async () => {
  const initial=fixtureCareer(),app=await boot(initial,{blockedStorage:true,deniedLocks:true});
  assert.equal(app.publicState().screen,'title');
  assert.equal(app.nodes.get('#saveWarning').hidden,false);
  assert.match(app.nodes.get('#saveWarning').textContent,/progress will disappear when you leave/);
  await app.act('continue');assert.equal(app.publicState().awaitingStart,true);
  app.keyEvent('keydown','d');app.frame(100);app.frame(200);
  assert(app.run().robot.x>app.run().room.spawn.x,'Denied locks must fall back so a fresh room can start');
  await app.settle();
  assert.equal(app.publicState().screen,'result');assert.deepEqual(app.publicState().career.completed,[1]);
  const coins=app.publicState().career.coins;
  await app.act('shop');await app.act('buy:bag');await app.act('continue');
  assert.equal(app.run().room.id,2);assert.equal(app.run().stats.capacity,120);
  assert.equal(app.publicState().career.coins,coins-180);
  assert.equal(app.publicState().awaitingStart,true,'The next room still waits for a deliberate start');
  assert.deepEqual(JSON.parse(app.storage.getItem()),initial,'Memory-only play must not overwrite inaccessible persistent storage');
  assert.deepEqual(app.errors,[]);
});

await test('leaving the tab or iframe pauses every input mode and clears its held movement', async () => {
  for(const interrupt of ['blur','hidden'])for(const mode of ['mouse','keyboard','touch']){
    const app=await boot();await app.startRoom(1);await app.act('begin-room');
    const robot=app.run().robot,origin=robot.x;
    const pointer={pointerId:1,pointerType:mode==='touch'?'touch':'mouse',isPrimary:true,button:0,clientX:robot.x+100,clientY:robot.y};
    if(mode==='keyboard')app.keyEvent('keydown','d');
    else if(mode==='mouse')app.pointerMove(pointer);
    else{app.pointerDown(pointer);app.pointerMove({...pointer,clientX:pointer.clientX+40});}
    app.frame(100);app.frame(200);assert(robot.x>origin,mode+' must be moving before interruption');
    const stopped={x:robot.x,y:robot.y,time:app.run().time};
    if(interrupt==='blur')app.blur();else app.visibility(true);
    assert.equal(app.publicState().paused,true);assert.equal(app.nodes.get('#modal').open,true);
    app.frame(300);app.frame(400);
    assert.deepEqual({x:robot.x,y:robot.y,time:app.run().time},stopped,interrupt+' freezes the run');
    if(interrupt==='hidden')app.visibility(false);
    await app.act('resume');app.frame(500);
    assert.deepEqual({x:robot.x,y:robot.y},{x:stopped.x,y:stopped.y},mode+' cannot resume stale movement');
    app.keyEvent('keydown','d');app.frame(600);assert(robot.x>stopped.x,'Fresh input works after resuming');
  }
});

await test('saved coins buy upgrades while the room is paused, preserving cleaning and applying capacity on resume', async () => {
  const app = await boot(fixtureCareer(1));
  await app.startRoom(2);await app.act('begin-room');
  const active = app.run(); active.robot.x += 100; active.robot.bag = 90; active.robot.bagValue = 117; active.percent = 0.3;
  active.coins=200;active.full=true;active.fullNotified=true;active.time=35;
  const before = app.publicState().career,areas=structuredClone(active.areaStates),robot=structuredClone(active.robot);
  await app.act('rooms'); await app.act('shop');
  assert.equal(app.nodes.get('#modal').open, false);assert.equal(app.publicState().screen,'shop');
  assert.equal(app.publicState().paused,true);
  assert.match(app.nodes.get('#main').innerHTML,/317 coins pending/);
  assert.match(app.nodes.get('#main').innerHTML,/Spend saved coins/);
  assert(app.nodes.get('#main').innerHTML.includes(ui.money(before.coins)),'The spendable balance remains the saved career balance');
  await app.act('buy:bag', { disabled: false });
  assert.equal(app.publicState().career.coins,before.coins-180);assert.equal(app.publicState().career.upgrades.bag,1);
  app.frame(1000);app.frame(1100);
  assert.equal(active.time,35);assert.deepEqual(active.areaStates,areas);assert.deepEqual(active.robot,robot);
  assert.equal(active.coins,200);assert.equal(app.publicState().pendingCoins,317);
  assert.equal(app.run().stats.capacity, 90);
  await app.act('resume-room');
  assert.equal(app.run(), active); assert.equal(app.publicState().screen, 'play');
  assert.deepEqual(active.stats,progression.statsFor(app.publicState().career.upgrades));
  assert.equal(active.stats.capacity,120);assert.equal(active.full,false,'The old full bag gains space immediately on resume');
  assert.equal(active.robot.bag,90);assert.equal(active.robot.bagValue,117);assert.equal(active.percent,.3);
  assert.deepEqual(active.areaStates,areas);assert.equal(app.publicState().pendingCoins,317);
  for(const piece of active.debris.slice(0,31))Object.assign(piece,{x:active.robot.x,y:active.robot.y,type:'crumb',collected:false,amount:1});
  app.frame(1200);
  assert.equal(active.robot.bag,120,'The resumed vacuum can use its newly purchased capacity');
  assert.match(app.nodes.get('#announcement').textContent,/Bag full/,'Filling the new capacity announces full again');
});

await test('stale purchase and shell actions are blocked outside the shop and behind dialogs', async () => {
  for (const state of ['play','pause','title','rooms','finishing','shop-dialog']) {
    const app=await boot(fixtureCareer(6));await app.startRoom(7);await app.act('begin-room');
    const active=app.run(),before=app.publicState().career;
    if(state==='finishing')active.phase='finishing';
    else if(state==='shop-dialog'){await app.act('shop');await app.act('settings');}
    else if(state!=='play')await app.act(state);
    await app.act('buy:bag', { disabled: false });
    await app.act('shell:coral', { disabled: false });
    assert.deepEqual(app.publicState().career,before,`${state} cannot accept an old purchase control`);
    assert.equal(app.run(),active);assert.equal(active.stats.capacity,90);
  }
});

await test('explicit quitting still requires confirmation and discards only unfinished rewards', async () => {
  const app = await boot(fixtureCareer(6));
  await app.startRoom(7);
  const active = app.run(), before = app.publicState().career;
  active.coins = 42; active.robot.bag = 4; active.robot.bagValue = 9; active.percent = 0.3;
  await app.act('pause'); await app.act('quit');
  assert.equal(app.nodes.get('#modal').open, true); assert.equal(app.run(), active);
  assert.match(app.nodes.get('#modalContent').innerHTML, /data-action="quit-confirm"/);
  await app.act('resume');
  assert.equal(app.run(), active); assert.equal(active.coins, 42);
  assert.deepEqual(app.publicState().career, before, 'Cancelling quit must keep both the current room and saved career');
  await app.act('pause'); await app.act('quit'); await app.act('quit-confirm');
  assert.equal(app.run(), null); assert.equal(app.publicState().screen, 'shop');
  assert.equal(app.nodes.get('#modal').open, false);
  assert.deepEqual(app.publicState().career, before, 'Quitting must not pay unfinished bag or room coins');
  await app.act('buy:bag', { disabled: false }); await app.act('shell:coral', { disabled: false });
  assert.equal(app.publicState().career.upgrades.bag, 1);
  assert.equal(app.publicState().career.coins, before.coins - 180);
  assert.equal(app.publicState().career.shell, 'coral');
  await app.startRoom(7);
  assert.equal(app.run().stats.capacity, 120);
  assert.equal(app.run().percent, 0); assert.equal(app.run().robot.bag, 0);
});

await test('Pause, Rooms, and Home open Upgrades directly while preserving the unfinished job', async () => {
  for(const origin of ['pause','rooms','title']){
    const app=await boot(fixtureCareer(12));await app.startRoom(13);await app.act('begin-room');
    const run=app.run(),career=app.publicState().career;
    run.time=25;run.coins=42;run.robot.bag=4;run.robot.bagValue=9;run.percent=.3;
    await app.act(origin);
    await app.act('shop');
    assert.equal(app.publicState().screen,'shop');assert.equal(app.publicState().paused,true);
    assert.equal(app.nodes.get('#modal').open,false,'Upgrades no longer asks the player to discard the room');
    const markup=app.nodes.get('#main').innerHTML;
    assert.match(markup,/51 coins pending/);assert.match(markup,/Finish this job to collect them/);
    assert.match(markup,/data-action="resume-room"/);
    assert.doesNotMatch(markup,/data-action="quit-confirm"/);
    app.frame(1000);app.frame(1100);assert.equal(run.time,25);
    assert.deepEqual(app.publicState().career,career,'Opening the shop does not collect pending job coins');
    await app.act('shell:coral');assert.equal(app.publicState().career.shell,'coral');
    assert.equal(app.publicState().career.coins,career.coins,'Changing color in the paused shop does not collect or spend job coins');
    await app.act('resume-room');
    assert.equal(app.publicState().screen,'play');assert.equal(app.run(),run);
    assert.equal(run.robot.bagValue,9);assert.equal(run.coins,42);assert.equal(run.percent,.3);
  }
});

await test('pending room and bag earnings cannot fund a saved-balance purchase',async()=>{
  const career=fixtureCareer(1);career.coins=5;
  const app=await boot(career);await app.startRoom(2);await app.act('begin-room');
  const run=app.run();run.coins=900;run.robot.bag=40;run.robot.bagValue=100;
  await app.act('shop');
  const before=app.publicState().career,markup=app.nodes.get('#main').innerHTML;
  assert.match(markup,/1,000 coins pending/);assert.match(markup,/Earn 175 more coins/);
  await app.act('buy:bag',{disabled:false});
  assert.deepEqual(app.publicState().career,before,'Even a stale enabled button cannot spend unfinished earnings');
  assert.equal(app.publicState().pendingCoins,1000);assert.equal(app.run(),run);
  await app.act('resume-room');assert.equal(run.stats.capacity,90);
});

await test('completion pays the unfinished job once after purchases from the paused shop',async()=>{
  const app=await boot(fixtureCareer(1));await app.startRoom(2);await app.act('begin-room');
  const run=app.run();run.coins=230;run.robot.bag=20;run.robot.bagValue=50;
  const before=app.publicState().career;
  await app.act('shop');await app.act('buy:bag');
  assert.equal(app.publicState().career.coins,before.coins-180);assert.equal(app.publicState().pendingCoins,280);
  await app.act('resume-room');
  run.phase='complete';run.areaStates.forEach(state=>state.cleared=true);run.percent=1;run.time=100;
  run.coins+=run.robot.bagValue;run.robot.bag=0;run.robot.bagValue=0;
  const expected=app.publicState().career,reward=progression.settleRun(expected,simulation.runResult(run));
  assert.equal(reward.ok,true);
  await app.completed();assert.equal(app.publicState().screen,'result');assert.deepEqual(app.publicState().career,expected);
  await app.completed();assert.deepEqual(app.publicState().career,expected,'Reopening completion cannot duplicate pending earnings or refund purchases');
});

await test('Endless seed zero survives restart and replay through the real app', async () => {
  const app = await boot(fixtureCareer(24));
  await app.startRoom(0, '0'); const expected = app.run().room;
  assert.equal(expected.seed, 0);
  await app.act('restart-confirm'); assert.deepEqual(app.run().room, expected);
  await app.settle(); await app.act('replay'); assert.deepEqual(app.run().room, expected);
});

await test('a completed room is paid once, enables upgrades, and Continue uses the purchased stats', async () => {
  const app = await boot(); await app.startRoom(1); await app.settle();
  const coins = app.publicState().career.coins;
  await app.completed(); assert.equal(app.publicState().career.coins, coins);
  await app.act('shop'); assert.equal(app.publicState().screen, 'shop');
  await app.act('buy:bag', { disabled: false }); await app.act('continue');
  assert.equal(app.run().room.id, 2); assert.equal(app.publicState().career.coins, coins - 180);
  assert.equal(app.run().stats.capacity, 120);
});

await test('another tab’s purchase and settings update preserve this tab’s active room', async () => {
  const app = await boot(fixtureCareer(1)); await app.startRoom(2);
  const active = app.run(), latest = progression.loadCareer(app.storage).career;
  progression.buyUpgrade(latest, 'bag'); latest.settings.muted = true;
  await app.externalCareer(latest);
  assert.equal(app.run(), active); assert.equal(app.publicState().career.upgrades.bag, 1);
  assert.equal(app.publicState().career.settings.muted, true); assert.equal(active.stats.capacity, 90);
  await app.settle(); assert.equal(app.publicState().career.completed.length, 2);
  assert.equal(app.publicState().career.upgrades.bag, 1);
});

await test('an external reset clears a later active room instead of showing a false completion', async () => {
  const app = await boot(fixtureCareer(6)); await app.startRoom(7);
  await app.externalCareer(fixtureCareer());
  assert.equal(app.run(), null); assert.equal(app.publicState().screen, 'rooms');
  assert.equal(app.publicState().career.coins, 0);
});

await test('a rejected reward leaves the room safely when a reset arrived without a storage event', async () => {
  const app = await boot(fixtureCareer(6)); await app.startRoom(7);
  app.storage.setItem(progression.SAVE_KEY, JSON.stringify(fixtureCareer()));
  await app.settle();
  assert.equal(app.run(), null); assert.equal(app.publicState().screen, 'rooms');
  assert.equal(app.publicState().career.coins, 0); assert.deepEqual(app.publicState().career.completed, []);
});

await test('a reset rejects a stale room-one reward before a storage event, even with no earlier progress', async () => {
  for (const count of [0, 6]) {
    const initial = fixtureCareer(count);
    if (count) initial.upgrades.bag = 5;
    const app = await boot(initial); await app.startRoom(1);
    const reset = progression.loadCareer(app.storage).career;
    progression.resetCareer(reset);
    app.storage.setItem(progression.SAVE_KEY, JSON.stringify(reset));
    await app.settle();
    assert.equal(app.run(), null, 'The room from the previous career must be discarded');
    assert.equal(app.publicState().screen, 'rooms');
    assert.equal(app.publicState().career.coins, 0);
    assert.deepEqual(app.publicState().career.completed, []);
    assert.deepEqual(progression.loadCareer(app.storage).career, reset, 'Old cleaning must not repopulate the reset save');
  }
});

await test('a sound transaction that sees another tab’s reset discards the old upgraded room before its storage event', async () => {
  const initial = fixtureCareer(6); initial.upgrades.bag = 5;
  const app = await boot(initial); await app.startRoom(1);
  assert.equal(app.run().stats.capacity, 240);
  const reset = progression.loadCareer(app.storage).career;
  progression.resetCareer(reset);
  app.storage.setItem(progression.SAVE_KEY, JSON.stringify(reset));
  await app.nodes.get('#soundBtn').onclick();
  assert.equal(app.run(), null);
  assert.equal(app.publicState().screen, 'rooms');
  assert.equal(app.publicState().career.settings.muted, true);
  await app.externalCareer(progression.loadCareer(app.storage).career);
  await app.act('continue');
  assert.equal(app.run().room.id, 1);
  assert.equal(app.run().stats.capacity, 90);
  assert.equal(app.publicState().career.coins, 0);
  assert.deepEqual(app.publicState().career.completed, []);
});

await test('another tab’s completion and found treasure refresh the title and treasure shelf', async () => {
  const app = await boot();
  await app.externalCareer(fixtureCareer(1));
  assert.match(app.nodes.get('#main').innerHTML, /Room 2 ·/);
  assert.match(app.nodes.get('#main').innerHTML, /Bench Business/);
  await app.act('collection');
  const latest = fixtureCareer(1); latest.trinkets = [1];
  await app.externalCareer(latest);
  assert.match(app.nodes.get('#main').innerHTML, /1 \/ 24 found/);
  assert.doesNotMatch(app.nodes.get('#main').innerHTML, /Hidden in room 1<\/small>/);
});

await test('Choose a room in the completed-career shop opens Rooms after an endless shift', async () => {
  const initial = fixtureCareer(24); initial.lastRoom = 0; initial.endingSeen = true;
  const app = await boot(initial); await app.act('shop');
  assert.match(app.nodes.get('#main').innerHTML, /data-action="rooms"[^>]*>Choose a room<\/button>/);
  await app.act('rooms');
  assert.equal(app.publicState().screen, 'rooms');
  assert.equal(app.run(), null);
});

await test('choosing another room requires confirmation and cancel keeps current cleaning', async () => {
  const app = await boot(fixtureCareer(2)); await app.startRoom(2);
  const active = app.run(); active.robot.bag = 12; active.percent = 0.4;
  await app.act('rooms'); await app.requestStart(3);
  assert.equal(app.nodes.get('#modal').open, true); assert.equal(app.run(), active);
  await app.act('resume'); assert.equal(app.run(), active); assert.equal(active.robot.bag, 12);
  await app.requestStart(2); assert.equal(app.run(), active); assert.equal(app.publicState().screen, 'play');
});

await test('a confirmed restart freezes the old room while waiting for its save lock', async () => {
  const app = await boot(); await app.startRoom(1);
  await app.act('begin-room');
  const active = app.run(); active.time = 10;
  await app.act('pause'); app.locks.hold();
  const restart = app.act('restart-confirm');
  let duringWait;
  try { app.frame(1000); duringWait = active.time; }
  finally { app.locks.release(); await restart; }
  assert.equal(duringWait, 10, 'The old room must not resume behind an asynchronous restart');
  assert.notEqual(app.run(), active); assert.equal(app.run().time, 0);
});

await test('a confirmed room switch freezes the old room during its delayed save', async () => {
  const app = await boot(fixtureCareer(1)); await app.startRoom(1);
  await app.act('begin-room');
  const active = app.run(); active.time = 10;
  await app.requestStart(2); app.locks.hold();
  const switching = app.act('switch-confirm');
  let duringWait;
  try { app.frame(1000); duringWait = active.time; }
  finally { app.locks.release(); await switching; }
  assert.equal(duringWait, 10); assert.equal(app.run().room.id, 2);
});

await test('a career reset cannot finish or reward the old room while storage is delayed', async () => {
  const app = await boot(fixtureCareer(1)); await app.startRoom(2);
  await app.act('begin-room');
  const active = app.run(); active.phase = 'finishing'; active.finishProgress = 0.999;
  await app.act('new'); app.locks.hold();
  const resetting = app.act('reset-confirm');
  let duringWait;
  try { await app.act('buy:bag');await app.act('shell:coral');app.frame(1000); duringWait = active.phase; }
  finally { app.locks.release(); await resetting; }
  assert.equal(duringWait, 'finishing'); assert.equal(app.run().room.id, 1);
  assert.equal(app.publicState().career.coins, 0); assert.deepEqual(app.publicState().career.completed, []);
});

await test('a delayed purchase does not pull the player back after they navigate to Rooms', async () => {
  const app = await boot(fixtureCareer(1)); await app.act('shop'); app.locks.hold();
  const purchase = app.act('buy:bag', { disabled: false });
  await app.act('rooms');
  app.locks.release(); await purchase;
  assert.equal(app.publicState().career.upgrades.bag, 1);
  assert.equal(app.publicState().screen, 'rooms');
});

await test('queued purchases and shell changes are rejected if play resumes or a dialog opens before saving',async()=>{
  for(const action of ['buy:bag','shell:coral'])for(const destination of ['resume-room','settings']){
    const app=await boot(fixtureCareer(6));await app.startRoom(7);await app.act('begin-room');
    const run=app.run();run.coins=42;run.robot.bag=7;run.robot.bagValue=10;
    await app.act('shop');const before=app.publicState().career;
    app.locks.hold();const purchase=app.act(action,{disabled:false});
    await app.act(destination);
    app.locks.release();await purchase;
    assert.deepEqual(app.publicState().career,before,action+' must recheck that the room is paused and no dialog is open');
    assert.equal(app.run(),run);assert.equal(run.stats.capacity,90);assert.equal(app.publicState().pendingCoins,52);
    if(destination==='resume-room')assert.equal(app.publicState().screen,'play');
    else assert.equal(app.nodes.get('#modal').open,true);
  }
});

await test('a queued purchase or shell change cannot slip through while a room is starting', async () => {
  for (const action of ['buy:bag', 'shell:coral']) {
    const app = await boot(fixtureCareer(6)); await app.act('shop');
    const before = app.publicState().career;
    app.locks.hold();
    const purchase = app.act(action, { disabled: false });
    const starting = app.act('room:7');
    app.locks.release(); await Promise.all([purchase, starting]);
    const after = app.publicState().career;
    assert.equal(after.coins, before.coins, `${action} must not spend while room startup is pending`);
    assert.deepEqual(after.upgrades, before.upgrades);
    assert.equal(after.shell, before.shell);
    assert.equal(app.run().room.id, 7); assert.equal(app.run().stats.capacity, 90);
    assert.equal(app.publicState().screen, 'play');
  }
});

await test('a room waiting for reward settlement cannot accept a purchase', async () => {
  const app = await boot(fixtureCareer(1)); await app.startRoom(2);
  app.run().phase = 'complete'; app.run().areaStates.forEach(state=>state.cleared=true); app.run().percent = 1; app.run().time = 100;
  const before = app.publicState().career;
  app.locks.hold();
  const completing = app.completed();
  try {
    await app.act('shop'); await app.act('buy:bag', { disabled: false });
    assert.deepEqual(app.publicState().career, before);
    assert.notEqual(app.publicState().screen, 'shop');
  } finally { app.locks.release(); await completing; }
  await app.act('shop'); await app.act('buy:bag', { disabled: false });
  assert.equal(app.publicState().career.upgrades.bag, 1);
});

await test('a dialog opened during delayed room startup keeps the new room paused', async () => {
  const app = await boot(); app.locks.hold();
  const starting = app.startRoom(1);
  app.nodes.get('#settingsBtn').onclick();
  app.locks.release(); await starting;
  assert.equal(app.nodes.get('#modal').open, true);
  assert.equal(app.publicState().paused, true, 'A visible settings dialog must pause a newly started room');
  app.frame(1000); app.frame(1100);
  assert.equal(app.run().time, 0, 'No cleaning or time may advance behind a dialog');
});

await test('delayed ending save does not replace a later navigation choice', async () => {
  const app = await boot(fixtureCareer(24)); app.locks.hold();
  const ending = app.act('ending');
  await app.act('rooms');
  app.locks.release(); await ending;
  assert.equal(app.publicState().screen, 'rooms');
  assert.equal(app.publicState().career.endingSeen, true);
});

await test('a reset during a delayed ending save cannot claim that the reset campaign is complete', async () => {
  const app = await boot(fixtureCareer(24)); app.locks.hold();
  const ending = app.act('ending');
  const reset = progression.loadCareer(app.storage).career;
  progression.resetCareer(reset);
  app.storage.setItem(progression.SAVE_KEY, JSON.stringify(reset));
  app.locks.release(); await ending;
  assert.equal(app.publicState().screen, 'rooms');
  assert.deepEqual(app.publicState().career.completed, []);
  assert.equal(app.publicState().career.endingSeen, false);
  assert.doesNotMatch(app.nodes.get('#main').innerHTML, /All rooms complete/);
});

await test('reopening controls in a later room freezes the run and preserves it on resume', async () => {
  const app = await boot(fixtureCareer(12)); await app.startRoom(13);
  await app.act('begin-room');
  const active = app.run(); active.time = 15; active.robot.bag = 5;
  await app.act('pause'); await app.act('controls');
  assert.equal(app.publicState().paused, true);
  app.frame(1000); app.frame(1100);
  assert.equal(active.time, 15); assert.equal(active.robot.bag, 5);
  assert.match(app.nodes.get('#modalContent').innerHTML, /How to play/);
  await app.act('resume');
  assert.equal(app.run(), active); assert.equal(app.publicState().paused, false);
});

await test('pause submenus return to Pause, and Main menu preserves the unfinished room', async () => {
  const app=await boot(fixtureCareer(12));await app.startRoom(13);await app.act('begin-room');
  const run=app.run();run.time=28;run.robot.bag=7;run.robot.bagValue=11;run.percent=.42;
  await app.act('pause');
  const pauseMarkup=app.nodes.get('#modalContent').innerHTML;
  assert.match(pauseMarkup,/data-action="rooms"/);assert.match(pauseMarkup,/data-action="shop"/);
  await app.act('rooms');
  assert.equal(app.publicState().screen,'rooms');assert.equal(app.run(),run);
  assert.equal(app.nodes.get('#modal').open,false);assert.equal(app.publicState().paused,true);
  await app.act('resume-room');await app.act('pause');await app.act('shop');
  assert.equal(app.publicState().screen,'shop');assert.equal(app.nodes.get('#modal').open,false,'Upgrades from Pause opens without a quit confirmation');
  await app.act('resume-room');assert.equal(app.run(),run);assert.equal(app.publicState().paused,false);
  await app.act('pause');await app.act('settings');
  assert.match(app.nodes.get('#modalContent').innerHTML,/data-action="back-pause"/);
  await app.act('back-pause');
  assert.match(app.nodes.get('#modalContent').innerHTML,/class="pause-menu"/);
  assert.equal(app.publicState().paused,true);
  await app.act('controls');app.keyEvent('keydown','Escape');
  assert.match(app.nodes.get('#modalContent').innerHTML,/class="pause-menu"/,'Escape from help goes back to Pause');
  await app.act('settings');await app.act('new');app.keyEvent('keydown','Escape');
  assert.match(app.nodes.get('#modalContent').innerHTML,/class="pause-menu"/,'Cancelling reset from paused Settings keeps the job paused');
  app.frame(1000);app.frame(1100);assert.equal(run.time,28);
  await app.act('title');
  assert.equal(app.publicState().screen,'title');assert.equal(app.publicState().paused,true);
  assert.equal(app.nodes.get('#modal').open,false);
  const homeText=app.nodes.get('#main').innerHTML.replace(/<[^>]*>/g,'');
  assert.match(homeText,/Room 13 · Leafy Welcome/);assert.match(homeText,/Upgrades/);assert.doesNotMatch(homeText,/Upgrades Locked/);
  await app.act('continue');assert.equal(app.run(),run);assert.equal(app.publicState().paused,false);
  assert.equal(run.robot.bag,7);assert.equal(run.robot.bagValue,11);assert.equal(run.percent,.42);
});

await test('home primary labels match fresh, completed, and endless destinations', async () => {
  const fresh=await boot();assert.match(fresh.nodes.get('#main').innerHTML,/home-play[^>]*[^]*?<span>Play<\/span>/);
  await fresh.act('continue');assert.equal(fresh.run().room.id,1);
  const career=fixtureCareer(24),finish=await boot(career);
  assert.match(finish.nodes.get('#main').innerHTML,/Finish campaign/);
  await finish.act('continue');assert.equal(finish.publicState().screen,'ending');
  career.endingSeen=true;const replay=await boot(career);
  assert.match(replay.nodes.get('#main').innerHTML,/Choose a room/);
  await replay.act('continue');assert.equal(replay.publicState().screen,'rooms');
  career.lastRoom=0;const endless=await boot(career);
  assert.match(endless.nodes.get('#main').innerHTML,/Play endless/);
  await endless.act('continue');assert.equal(endless.publicState().screen,'endless');
});

await test('the full start guide ends after the first completed room, while deliberate starts and manual help remain', async () => {
  const app=await boot();await app.startRoom(1);
  assert.match(app.nodes.get('#main').innerHTML,/class="picture-guide"/,'A fresh player sees the picture guide');
  await app.act('restart-confirm');
  assert.match(app.nodes.get('#main').innerHTML,/class="picture-guide"/,'Restarting before the first success does not skip learning the controls');
  await app.act('begin-room');await app.settle();await app.act('room:2');
  const markup=app.nodes.get('#main').innerHTML;
  assert.match(markup,/room-start-compact/);assert.doesNotMatch(markup,/class="picture-guide"/,'The next room must not reopen the full tutorial');
  const run=app.run(),parked=JSON.stringify(run);
  const pointer={pointerId:1,pointerType:'mouse',isPrimary:true,button:0,clientX:550,clientY:540};
  app.pointerMove(pointer);app.frame(100);app.frame(200);
  assert.equal(app.publicState().awaitingStart,true);assert.equal(JSON.stringify(run),parked,'A compact prompt must still keep movement, suction and the clock parked');
  app.pointerDown(pointer);
  assert.equal(app.publicState().awaitingStart,false,'A fresh left-click starts the compact prompt');
  assert.equal(app.nodes.get('#roomStart').hidden,true);

  const reloaded=await boot(app.publicState().career);await reloaded.startRoom(1);
  assert.match(reloaded.nodes.get('#main').innerHTML,/room-start-compact/,'Completed-room replays keep the short prompt after reload');
  assert.doesNotMatch(reloaded.nodes.get('#main').innerHTML,/class="picture-guide"/);
  await reloaded.act('controls');
  assert.match(reloaded.nodes.get('#modalContent').innerHTML,/class="picture-guide"/,'Manual How to play still provides the full picture guide');
  assert.equal(reloaded.publicState().awaitingStart,true);
  await reloaded.act('resume');
  const origin=reloaded.run().robot.x;
  reloaded.keyEvent('keydown','d');reloaded.frame(100);reloaded.frame(200);
  assert.equal(reloaded.publicState().awaitingStart,false);
  assert(reloaded.run().robot.x>origin,'WASD starts and steers from the compact prompt');
});

await test('a quick key tap between simulation frames cancels the old mouse target', async () => {
  const app = await boot(); await app.startRoom(1);
  await app.act('begin-room');
  app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:550,clientY:540});
  assert.equal(app.pointer().x,550);
  app.keyEvent('keydown','ArrowUp'); app.keyEvent('keyup','ArrowUp');
  assert.equal(app.pointer(),null,'Keyboard takeover must happen at keydown, even without an intervening animation frame');
  const before={x:app.run().robot.x,y:app.run().robot.y};
  app.frame(1000);app.frame(1100);
  assert.equal(app.run().robot.x,before.x);assert.equal(app.run().robot.y,before.y);
});

await test('new rooms freeze time, suction, movement and rewards until an explicit left click', async () => {
  const app = await boot(); await app.startRoom(1);
  const run = app.run();
  assert.deepEqual({x:run.robot.x,y:run.robot.y},run.room.stations[0],'Spawn inside the actual drop-off dock');
  Object.assign(run.debris[0], {x:run.robot.x, y:run.robot.y, type:'crumb', collected:false, amount:1});
  const before = JSON.stringify(run);
  const pointer = {pointerId:1,pointerType:'mouse',isPrimary:true,clientX:550,clientY:540,button:0};
  app.pointerMove(pointer);
  app.keyEvent('keydown','ArrowRight',{repeat:true});
  app.keyEvent('keydown','d',{ctrlKey:true});
  app.keyEvent('keydown','q');
  for (let stamp=100;stamp<=10000;stamp+=100) app.frame(stamp);
  assert.equal(app.publicState().awaitingStart,true);
  assert.equal(app.pointer(),null);
  assert.equal(JSON.stringify(run),before,'Even nearby debris must remain untouched while reading instructions');
  for (const rejected of [{button:2},{button:1},{isPrimary:false}]) app.pointerDown({...pointer,...rejected});
  assert.equal(app.publicState().awaitingStart,true);
  assert.throws(()=>app.webTools.get('move_robot').execute({x:1,y:0,seconds:1}),/Start the room first/);
  app.pointerDown(pointer); app.pointerUp(pointer);
  assert.equal(app.publicState().awaitingStart,false);
  assert.equal(app.pointer(),null,'Start click must not steer toward the button or an old target');
  assert.equal(app.nodes.get('#roomStart').hidden,true);
  app.frame(10100);
  assert(run.time>0&&run.time<=.101,'Reading time must never be counted as cleaning time');
  assert.equal(run.robot.x,JSON.parse(before).robot.x,'Ignored keys must not carry through into movement');
  assert(run.collectedCount>0,'Automatic suction starts after the explicit click');
  app.pointerMove(pointer); app.pointerUp(pointer);
  assert.equal(app.pointer().x,550,'Mouse following needs no held button after starting');
});

await test('fresh WASD, uppercase WASD and arrow keys start at the dock and steer on the first press', async () => {
  for(const [key,axis,sign] of [['w','y',-1],['a','x',-1],['s','y',1],['d','x',1],['W','y',-1],['D','x',1],['ArrowUp','y',-1],['ArrowRight','x',1],['ArrowDown','y',1],['ArrowLeft','x',-1]]){
    const app=await boot();await app.startRoom(1);const run=app.run();
    const origin={x:run.robot.x,y:run.robot.y};
    app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:550,clientY:300});
    app.keyEvent('keydown',key);app.frame(100);app.frame(200);
    assert.equal(app.publicState().awaitingStart,false,key+' starts the room');
    assert((run.robot[axis]-origin[axis])*sign>0,key+' steers immediately');
    assert.equal(app.pointer(),null,'Keyboard startup must discard hovering mouse targets');
    app.keyEvent('keyup',key);
    const stopped={x:run.robot.x,y:run.robot.y};app.frame(300);
    assert.deepEqual({x:run.robot.x,y:run.robot.y},stopped,'Releasing the key stops without stale mouse steering');
  }
});

await test('restarting returns to the dock and waits for a fresh key instead of a held repeat', async () => {
  const app=await boot();await app.startRoom(1);
  app.keyEvent('keydown','d');app.frame(100);app.frame(200);
  assert(app.run().robot.x>app.run().room.stations[0].x);
  await app.act('restart-confirm');
  const parked={x:app.run().robot.x,y:app.run().robot.y};
  assert.deepEqual(parked,app.run().room.stations[0]);
  app.keyEvent('keydown','d',{repeat:true});
  app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:600,clientY:250});
  app.frame(300);app.frame(400);
  assert.equal(app.run().time,0);assert.equal(app.publicState().awaitingStart,true);
  assert.deepEqual({x:app.run().robot.x,y:app.run().robot.y},parked);
  app.keyEvent('keyup','d');app.keyEvent('keydown','d');app.frame(500);
  assert(app.run().robot.x>parked.x);
});

await test('menus preserve readiness and return focus to Start, while Resume does not re-arm a started room', async () => {
  const app = await boot(); await app.startRoom(1);
  const startButton = app.nodes.get('#roomStart [data-action="begin-room"]');
  assert.equal(app.focused(),startButton);
  await app.act('controls'); await app.act('begin-room');
  assert.equal(app.publicState().awaitingStart,true,'Instructions dialog must block starting');
  await app.act('resume'); assert.equal(app.focused(),startButton);
  await app.act('rooms'); await app.act('resume-room');
  assert.equal(app.publicState().awaitingStart,true);
  await app.act('begin-room');
  await app.act('pause'); await app.act('resume');
  await app.act('rooms'); await app.act('resume-room');
  assert.equal(app.publicState().awaitingStart,false);
  assert.equal(app.focused(),app.nodes.get('#gameCanvas'));
});

await test('restarts, replays, next rooms, and Endless always wait for a fresh Start', async () => {
  const app = await boot(fixtureCareer(24)); await app.startRoom(1); await app.act('begin-room');
  await app.act('restart-confirm'); assert.equal(app.publicState().awaitingStart,true);
  await app.act('begin-room'); await app.settle(); await app.act('replay');
  assert.equal(app.publicState().awaitingStart,true);
  await app.act('begin-room'); await app.settle(); await app.act('room:2');
  assert.equal(app.publicState().awaitingStart,true);
  await app.act('begin-room'); await app.settle(); await app.startRoom(0,'0');
  assert.equal(app.publicState().awaitingStart,true); assert.equal(app.run().time,0);
});

await test('touch can scroll instructions, tap Start, then drag without bypassing pending room setup', async () => {
  const app = await boot(); await app.startRoom(1);
  app.locks.hold(); const restarting = app.act('restart-confirm');
  app.pointerDown({pointerId:1,pointerType:'mouse',button:0});
  assert.equal(app.publicState().awaitingStart,true);
  app.locks.release(); await restarting;
  const touch = {pointerId:2,pointerType:'touch',isPrimary:true,button:0,clientX:300,clientY:400};
  for(const pointerType of ['touch','pen']){
    app.pointerDown({...touch,pointerType,preventDefault(){assert.fail('Reading the guide must allow native scrolling');}});
    app.pointerMove({...touch,pointerType,clientY:300});app.frame(100);
    app.pointerUp({...touch,pointerType});
    assert.equal(app.publicState().awaitingStart,true,'Swiping the instructions must not start the job');
    assert.equal(app.run().time,0);
  }
  await app.act('begin-room');assert.equal(app.publicState().awaitingStart,false);
  app.pointerDown(touch);
  const x=app.run().robot.x;
  app.pointerMove({...touch,clientX:340}); app.frame(200); app.frame(300);
  assert(app.run().robot.x>x,'Dragging after tapping Start steers normally');
  app.pointerUp(touch);
});


await test('an open area exit remains unpaid while paused upgrades use saved coins', async () => {
  const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
  const run=app.run(),before=app.publicState().career;
  assert.equal(run.areaCount,2);run.phase='exiting';run.percent=1;run.coins=200;
  await app.completed();assert.deepEqual(app.publicState().career,before);
  assert.equal(app.publicState().screen,'play');
  app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:250,clientY:500});
  assert.equal(app.pointer().x,250,'Mouse steering remains available on the way to an exit');
  await app.act('pause');await app.act('shop');await app.act('buy:pull');
  assert.equal(app.publicState().career.coins,before.coins-180);assert.equal(app.publicState().career.upgrades.pull,1);
  assert.equal(run.coins,200);assert.equal(app.publicState().screen,'shop');
  await app.act('resume-room');assert.equal(app.run(),run);assert.equal(run.phase,'exiting');
  assert.equal(run.stats.pull,progression.statsFor(app.publicState().career.upgrades).pull);
});

async function enterSecondArea(app,{bag=0,bagValue=0,coins=200}={}){
  const run=app.run();run.phase='exiting';run.percent=1;run.coins=coins;run.full=bag>=run.stats.capacity;run.areaStates[0].cleared=true;
  Object.assign(run.robot,{x:world.HALLWAY_MIDPOINT-1,y:run.room.exit.y,bag,bagValue});
  app.keyEvent('keydown','d');app.frame(100);
  assert.equal(run.areaIndex,1,'Normal movement across the open hallway changes area');
  return run;
}
await test('walking through a hallway keeps continuous position, camera, and control without a new start screen', async () => {
  const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
  const id=app.run().runId,before=app.publicState().career,run=await enterSecondArea(app);
  assert.equal(run.runId,id);assert.equal(run.coins,200);assert(run.time>0);
  assert.equal(run.percent,0);assert.equal(run.robot.bag,0);
  assert(Math.abs(run.robot.x-(world.HALLWAY_MIDPOINT-world.AREA_STRIDE))<run.stats.speed/120);
  assert.equal(run.robot.y,run.room.entry.y);
  assert.notDeepEqual(run.room.entry,run.room.stations[0],'An annex is entered through its left doorway, not its dock');
  assert.equal(app.publicState().awaitingStart,false);assert.equal(app.publicState().area.number,2);
  assert.match(app.nodes.get('#areaGuide').outerHTML,/Room 9 · Area 2 of 2/);
  assert.equal(app.nodes.get('#roomStart').hidden,true);
  assert.equal(app.focused(),app.nodes.get('#gameCanvas'));
  const entered={x:run.robot.x,y:run.robot.y},time=run.time;
  const firstCamera=run.cameraX;
  app.frame(200);assert(run.time>time);assert(run.robot.x>entered.x,'A held keyboard direction continues across the hallway');
  assert(run.cameraX>firstCamera&&run.cameraX<run.robot.x+world.AREA_STRIDE-480,'The camera pans toward the robot without jumping to the next room');
  app.keyEvent('keyup','d');
  const cursorX=run.robot.x+world.AREA_STRIDE-run.cameraX+70;
  app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:cursorX,clientY:run.robot.y});
  assert(app.pointer(),'Mouse steering resumes on movement without any click');
  const beforeMouseX=run.robot.x;app.frame(300);assert(run.robot.x>beforeMouseX,'Mouse direction accounts for both the camera and the active-room offset');
  const afterCamera=run.cameraX,afterMouseX=run.robot.x;
  app.frame(400);assert(run.cameraX>afterCamera);assert(run.robot.x>afterMouseX,'A stationary screen cursor continues steering correctly while the camera moves');
  await app.act('pause');const pausedCamera=run.cameraX;app.frame(500);assert.equal(run.cameraX,pausedCamera,'Pause freezes the camera together with the robot');
  assert.deepEqual(app.publicState().career,before,'Area transitions never bank career coins');
});

await test('restart returns a multi-area job to its original first area and quit loses its pending coins', async () => {
  const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
  const original=app.run().jobRoom,before=app.publicState().career;
  await enterSecondArea(app);await app.act('restart-confirm');
  assert.equal(app.run().areaIndex,0);assert.deepEqual(app.run().room,original);
  assert.equal(app.run().coins,0);assert.equal(app.run().time,0);assert.equal(app.run().started,false);
  await app.act('begin-room');await enterSecondArea(app);
  await app.act('pause');await app.act('quit');await app.act('quit-confirm');
  assert.equal(app.run(),null);assert.equal(app.publicState().screen,'shop');
  assert.deepEqual(app.publicState().career,before);
});

await test('a held touch drag continues across an internal doorway on the same canvas', async () => {
  const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
  const run=app.run(),surface=app.nodes.get('#gameCanvas');run.phase='exiting';run.percent=1;run.areaStates[0].cleared=true;
  Object.assign(run.robot,{x:world.HALLWAY_MIDPOINT-1,y:run.room.exit.y});
  const touch={pointerId:2,pointerType:'touch',isPrimary:true,button:0,clientX:300,clientY:400};
  app.pointerDown(touch);app.pointerMove({...touch,clientX:340});app.frame(100);
  assert.equal(run.areaIndex,1);assert.equal(run.started,true);
  assert.equal(app.nodes.get('#gameCanvas'),surface);
  const enteredX=run.robot.x;app.frame(200);
  assert(run.robot.x>enteredX,'Crossing the hallway must not drop an active touch gesture');
  app.pointerUp(touch);const stopped={x:run.robot.x,y:run.robot.y};app.frame(300);
  assert.deepEqual({x:run.robot.x,y:run.robot.y},stopped);
});

await test('partial and full bags retain dirt, coin value, and visible totals across doors and menus', async () => {
  for(const full of [false,true]){
    const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
    const saved=app.publicState().career,bag=full?app.run().stats.capacity:7,bagValue=full?173:17;
    const run=await enterSecondArea(app,{bag,bagValue});app.keyEvent('keyup','d');
    assert.equal(run.robot.bag,bag);assert.equal(run.robot.bagValue,bagValue);assert.equal(run.coins,200);
    assert.equal(run.full,full);assert.equal(app.publicState().pendingCoins,200+bagValue);
    assert.equal(app.publicState().robot.bagValue,bagValue);
    if(full)assert.match(app.nodes.get('#gameTip').textContent,/green arrow/);
    await app.act('pause');
    const pauseMarkup=app.nodes.get('#modalContent').innerHTML;
    assert.match(pauseMarkup,/Area 2 of 2/,'Pause identifies the area entered through the door');
    assert(pauseMarkup.includes(ui.coinBalance(saved.coins)),'Pause distinguishes the saved balance from unfinished job coins');
    assert(pauseMarkup.includes('In bag: '+bagValue+' coins'),'Pause retains the value of carried dirt');
    assert(pauseMarkup.includes('+'+(200+bagValue)+' this job'),'Pause retains deposited and carried coin totals');
    await app.act('resume');await app.act('rooms');await app.act('resume-room');
    await app.act('pause');await app.act('quit');await app.act('resume');
    assert.equal(run.robot.bag,bag);assert.equal(run.robot.bagValue,bagValue);assert.equal(run.coins,200);
    assert.deepEqual(app.publicState().career,saved);
    if(full){
      Object.assign(run.debris[0],{x:run.robot.x,y:run.robot.y,type:'crumb',collected:false,amount:1});
      app.frame(200);
      assert.equal(run.debris[0].collected,false,'A carried full bag must block pickups immediately');
      assert.equal(run.robot.bagValue,bagValue);
    }
    await app.act('pause');await app.act('quit');await app.act('quit-confirm');
    assert.equal(app.run(),null);assert.deepEqual(app.publicState().career,saved);
  }
});

await test('restarting a job discards both carried dirt and deposited pending coins', async () => {
  const app=await boot(fixtureCareer(8));await app.startRoom(9);await app.act('begin-room');
  const saved=app.publicState().career;
  await enterSecondArea(app,{bag:7,bagValue:17});await app.act('restart-confirm');
  assert.equal(app.run().robot.bag,0);assert.equal(app.run().robot.bagValue,0);assert.equal(app.run().coins,0);
  assert.equal(app.publicState().pendingCoins,0);assert.equal(app.run().areaIndex,0);
  assert.deepEqual(app.publicState().career,saved);
});

console.log(`App orchestration verified: ${checks} checks passed.`);
