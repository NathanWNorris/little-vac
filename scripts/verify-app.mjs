import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as rooms from '../dist/rooms.js';
import * as progression from '../dist/progression.js';
import * as simulation from '../dist/simulation.js';
import * as storeModule from '../dist/career-store.js';
import * as inputModule from '../dist/input.js';
import * as ui from '../dist/ui.js';

// Exercise the real app orchestration against a small DOM surface. Drawing is
// deliberately omitted: browser playtests cover pixels, pointer geometry, and layout.
const source = (await readFile(new URL('../dist/app.js', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '');
const dependencies = { ...rooms, ...progression, ...simulation, ...storeModule, ...inputModule, ...ui, render() {}, drawTitle() {} };
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const makeApp = new AsyncFunction('deps', 'window', 'document', 'navigator', 'performance', 'requestAnimationFrame', 'setTimeout', 'clearTimeout', 'crypto', 'console',
  `const {${Object.keys(dependencies).join(',')}}=deps;\n${source}\nreturn {act,startRoom,requestStart,completed,frame,rooms,shop,continueShift,publicState,pointerMove,pointer:()=>input.pointer,run:()=>run};`);

function fixtureCareer(count = 0) {
  const career = progression.defaultCareer();
  for (let id = 1; id <= count; id++) progression.settleRun(career, { runId: `fixture-${id}`, roomId: id, coins: 300, time: 110, medal: 2, trinket: false });
  return career;
}
async function boot(initial = fixtureCareer()) {
  let text = JSON.stringify(initial), timestamp = 0, releaseLock = null, lockGate = Promise.resolve();
  const storage = { getItem() { return text; }, setItem(key, value) { assert.equal(key, progression.SAVE_KEY); text = value; } };
  const locks = {
    async request(name, callback) { assert.equal(name, progression.SAVE_KEY); await lockGate; return callback(); },
    hold() { lockGate = new Promise(resolve => { releaseLock = resolve; }); },
    release() { releaseLock?.(); releaseLock = null; },
  };
  const events = new Map(), documentEvents = new Map(), nodes = new Map();
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
  document = { hidden: false, activeElement: null, body: node('body'), addEventListener(name,callback) {if(!documentEvents.has(name))documentEvents.set(name,[]);documentEvents.get(name).push(callback);}, querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, node(selector));
    return nodes.get(selector);
  } };
  const window = { localStorage: storage, devicePixelRatio: 1, innerWidth: 1280, scrollY: 0,
    matchMedia: () => ({ matches: false }), scrollTo({ top }) { this.scrollY = top; },
    addEventListener(name, callback) { if (!events.has(name)) events.set(name, []); events.get(name).push(callback); },
  };
  const errors = [];
  const app = await makeApp(dependencies, window, document, { locks }, { now: () => timestamp }, () => {}, () => 0, () => {}, { randomUUID: () => String(++timestamp) }, { error: error => errors.push(error) });
  return { ...app, storage, locks, nodes, errors,
    keyEvent(type,key){for(const callback of documentEvents.get(type)||[])callback({key,target:{tagName:'CANVAS',closest:()=>null},preventDefault(){}});},
    async externalCareer(career) { storage.setItem(progression.SAVE_KEY, JSON.stringify(career)); for (const callback of events.get('storage') || []) await callback({ key: progression.SAVE_KEY }); },
    async settle() { const run = app.run(); run.phase = 'complete'; run.time = 100; run.percent = 1; run.coins = run.room.debris.reduce((sum, piece) => sum + piece.value, 0); await app.completed(); },
  };
}

let checks = 0;
async function test(name, body) { await body(); checks++; console.log(`PASS ${name}`); }

await test('an active room stays intact and cannot be upgraded through Rooms or the shop action', async () => {
  const app = await boot(fixtureCareer(1));
  await app.startRoom(2);
  const active = app.run(); active.robot.x += 20; active.robot.bag = 4; active.robot.bagValue = 4; active.percent = 0.3;
  const before = app.publicState().career;
  await app.act('rooms'); await app.act('shop');
  assert.equal(app.nodes.get('#modal').open, true);
  assert.notEqual(app.publicState().screen, 'shop', 'The upgrade shop must stay closed until the room is finished or quit');
  assert.match(app.nodes.get('#modalContent').innerHTML, /data-action="quit"/);
  await app.act('buy:bag', { disabled: false });
  assert.deepEqual(app.publicState().career, before, 'An old purchase button must not spend saved coins during a room');
  assert.equal(app.run().stats.capacity, 90);
  await app.act('resume-room');
  assert.equal(app.run(), active); assert.equal(app.publicState().screen, 'play');
  assert.equal(active.robot.bag, 4); assert.equal(active.percent, 0.3);
});

await test('pausing, title navigation, and finishing animation never unlock purchases or shell changes', async () => {
  const app = await boot(fixtureCareer(6));
  await app.startRoom(7);
  const active = app.run(), before = app.publicState().career;
  for (const state of ['pause', 'title', 'finishing']) {
    if (state === 'finishing') active.phase = 'finishing';
    else await app.act(state);
    await app.act('buy:bag', { disabled: false });
    await app.act('shell:coral', { disabled: false });
    assert.deepEqual(app.publicState().career, before, `${state} must not permit changing upgrades or the equipped shell`);
    app.shop();
    assert.notEqual(app.publicState().screen, 'shop');
    assert.equal(app.nodes.get('#modal').open, true);
    assert.equal(app.run(), active);
    await app.act('resume');
  }
});

await test('quitting requires confirmation, discards only unfinished rewards, and then enables upgrades', async () => {
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
  assert.match(app.nodes.get('#main').innerHTML, /1 \/ 24 rooms complete/);
  assert.match(app.nodes.get('#main').innerHTML, /Room 2 ·/);
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
  const active = app.run(); active.phase = 'finishing'; active.finishProgress = 0.999;
  await app.act('new'); app.locks.hold();
  const resetting = app.act('reset-confirm');
  let duringWait;
  try { app.frame(1000); duringWait = active.phase; }
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
  app.run().phase = 'complete'; app.run().percent = 1; app.run().time = 100;
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
  const active = app.run(); active.time = 15; active.robot.bag = 5;
  await app.act('pause'); await app.act('controls');
  assert.equal(app.publicState().paused, true);
  app.frame(1000); app.frame(1100);
  assert.equal(active.time, 15); assert.equal(active.robot.bag, 5);
  assert.match(app.nodes.get('#modalContent').innerHTML, /How to play/);
  await app.act('resume');
  assert.equal(app.run(), active); assert.equal(app.publicState().paused, false);
});

await test('a quick key tap between simulation frames cancels the old mouse target', async () => {
  const app = await boot(); await app.startRoom(1);
  app.pointerMove({pointerId:1,pointerType:'mouse',isPrimary:true,clientX:550,clientY:540});
  assert.equal(app.pointer().x,550);
  app.keyEvent('keydown','ArrowUp'); app.keyEvent('keyup','ArrowUp');
  assert.equal(app.pointer(),null,'Keyboard takeover must happen at keydown, even without an intervening animation frame');
  const before={x:app.run().robot.x,y:app.run().robot.y};
  app.frame(1000);app.frame(1100);
  assert.equal(app.run().robot.x,before.x);assert.equal(app.run().robot.y,before.y);
});

console.log(`App orchestration verified: ${checks} checks passed.`);
