import assert from 'node:assert/strict';
import { createCareerStore } from '../dist/career-store.js';
import { SAVE_KEY, defaultCareer, resetCareer, loadCareer, saveCareer, settleRun, buyUpgrade } from '../dist/progression.js';

let checks = 0;
async function test(name, body) {
  await body(); checks++; console.log(`PASS ${name}`);
}
function memoryStorage() {
  let text = null;
  return {
    blockedRead: false, blockedWrite: false,
    getItem(key) { assert.equal(key, SAVE_KEY); if (this.blockedRead) throw Error('Blocked'); return text; },
    setItem(key, value) { assert.equal(key, SAVE_KEY); if (this.blockedWrite) throw Error('Quota'); text = value; },
  };
}
function queuedLocks() {
  let queue = Promise.resolve();
  return { request(name, operation) {
    assert.equal(name, SAVE_KEY);
    const pending = queue.then(operation);
    queue = pending.catch(() => {});
    return pending;
  } };
}
const run = (id = 1, runId = 'room-1') => ({ runId, roomId: id, coins: 300, time: 110, medal: 2, trinket: false });

await test('a stale tab setting change preserves another tab’s completed room and reward', async () => {
  const storage = memoryStorage(), locks = queuedLocks();
  const a = createCareerStore(storage, { locks }), b = createCareerStore(storage, { locks });
  const reward = await a.transact(career => settleRun(career, run()));
  assert.equal(reward.coins, 390);
  assert.equal(b.career.coins, 0, 'Tab B intentionally has an old view');
  await b.transact(career => { career.settings.muted = true; });
  assert.equal(b.career.coins, 390);
  assert.deepEqual(b.career.completed, [1]);
  assert.equal(loadCareer(storage).career.settings.muted, true);
  await a.sync();
  assert.equal(a.career.settings.muted, true);
  assert.equal(a.career.coins, 390);
});

await test('cross-tab purchases are serialized against the same earned balance', async () => {
  const storage = memoryStorage(), locks = queuedLocks();
  const earned = defaultCareer(); settleRun(earned, run()); saveCareer(storage, earned);
  const a = createCareerStore(storage, { locks }), b = createCareerStore(storage, { locks });
  const purchases = await Promise.all([
    a.transact(career => buyUpgrade(career, 'width')),
    b.transact(career => buyUpgrade(career, 'bag')),
    a.transact(career => buyUpgrade(career, 'speed')),
  ]);
  assert.deepEqual(purchases.map(purchase => purchase.ok), [true, true, false]);
  const saved = loadCareer(storage).career;
  assert.equal(saved.coins, 30);
  assert.deepEqual(saved.upgrades, { width: 1, bag: 1, speed: 0, pull: 0 });
});

await test('resets from stale tabs advance the saved generation and later settings preserve it', async () => {
  const storage = memoryStorage(), locks = queuedLocks();
  const legacy = defaultCareer(); delete legacy.generation;
  storage.setItem(SAVE_KEY, JSON.stringify(legacy));
  const a = createCareerStore(storage, { locks }), b = createCareerStore(storage, { locks });
  assert.equal(a.career.generation, b.career.generation);
  await Promise.all([a.transact(resetCareer), b.transact(resetCareer)]);
  const latest = loadCareer(storage).career;
  assert.equal(latest.generation, 2, 'Each serialized reset must advance the latest generation');
  await a.transact(career => { career.settings.muted = true; });
  assert.equal(loadCareer(storage).career.generation, latest.generation);
  await b.sync();
  assert.equal(b.career.generation, latest.generation);
  assert.equal(b.career.settings.muted, true);
});

await test('the same finished run cannot be rewarded through two stores', async () => {
  const storage = memoryStorage(), locks = queuedLocks();
  const a = createCareerStore(storage, { locks }), b = createCareerStore(storage, { locks });
  const rewards = await Promise.all([a.transact(career => settleRun(career, run())), b.transact(career => settleRun(career, run()))]);
  assert.deepEqual(rewards.map(reward => reward.ok), [true, false]);
  assert.equal(loadCareer(storage).career.coins, 390);
});

await test('write failure retains session purchases and never reloads the older disk save', async () => {
  const storage = memoryStorage(), warnings = [], updates = [];
  const store = createCareerStore(storage, { onWarning: warning => warnings.push(warning), onChange: career => updates.push(career.coins) });
  await store.transact(career => settleRun(career, run()));
  storage.blockedWrite = true;
  await store.transact(career => buyUpgrade(career, 'width'));
  assert.equal(store.status, 'blocked'); assert.equal(store.career.coins, 210);
  await store.sync();
  assert.equal(store.career.upgrades.width, 1);
  storage.blockedWrite = false;
  await store.transact(career => buyUpgrade(career, 'bag'));
  assert.equal(store.career.coins, 30);
  assert.deepEqual(store.career.upgrades, { width: 1, bag: 1, speed: 0, pull: 0 });
  assert.equal(loadCareer(storage).career.coins, 390, 'A degraded session deliberately does not overwrite other tabs later');
  assert.equal(warnings.length, 1);
  assert.deepEqual(updates, [390, 210, 210, 30]);
});

await test('initial or later blocked reads preserve playable memory and warn only when needed', async () => {
  const blocked = memoryStorage(); blocked.blockedRead = true;
  const fresh = createCareerStore(blocked);
  assert.equal(fresh.status, 'blocked');
  await fresh.transact(career => settleRun(career, run()));
  assert.equal(fresh.career.coins, 390);
  blocked.blockedRead = false;
  await fresh.sync(); assert.equal(fresh.career.coins, 390);
  const storage = memoryStorage(), warnings = [];
  const store = createCareerStore(storage, { onWarning: text => warnings.push(text) });
  await store.transact(career => settleRun(career, run()));
  storage.blockedRead = true;
  await store.transact(career => buyUpgrade(career, 'bag'));
  assert.equal(store.career.coins, 210); assert.equal(store.career.upgrades.bag, 1);
  await store.sync(); assert.equal(store.career.coins, 210); assert.equal(warnings.length, 1);
});

await test('a rejected transaction has no partial effect and does not stall the queue', async () => {
  const storage = memoryStorage(), locks = queuedLocks(), store = createCareerStore(storage, { locks });
  let attempts = 0;
  await assert.rejects(store.transact(career => { attempts++; career.coins = 123; throw Error('Cancelled'); }), /Cancelled/);
  assert.equal(attempts, 1); assert.equal(store.career.coins, 0); assert.equal(loadCareer(storage).career.coins, 0);
  await store.transact(career => settleRun(career, run()));
  assert.equal(store.career.coins, 390);
});

await test('unavailable locks fall back once and same-store asynchronous operations remain ordered', async () => {
  const storage = memoryStorage();
  const store = createCareerStore(storage, { locks: { request() { throw Error('Unavailable'); } } });
  let calls = 0;
  const first = store.transact(async career => { calls++; await Promise.resolve(); return settleRun(career, run()); });
  const second = store.transact(career => buyUpgrade(career, 'bag'));
  await Promise.all([first, second, store.sync()]);
  assert.equal(calls, 1); assert.equal(store.career.coins, 210); assert.equal(store.career.upgrades.bag, 1);
});

await test('synchronous transactions without Web Locks do not introduce an avoidable read/write yield', async () => {
  const storage = memoryStorage();
  const a = createCareerStore(storage), b = createCareerStore(storage);
  await Promise.all([
    a.transact(career => settleRun(career, run(1, 'first'))),
    b.transact(career => settleRun(career, run(1, 'replay'))),
  ]);
  assert.equal(loadCareer(storage).career.coins, 690);
  await a.sync(); assert.equal(a.career.coins, 690);
});

await test('external reset is synchronized and view callback failures cannot replay an award', async () => {
  const storage = memoryStorage();
  const store = createCareerStore(storage, { onChange() { throw Error('View failed'); } });
  const reward = await store.transact(career => settleRun(career, run()));
  assert.equal(reward.ok, true); assert.equal(loadCareer(storage).career.coins, 390);
  saveCareer(storage, defaultCareer());
  await store.sync(); assert.equal(store.career.coins, 0); assert.deepEqual(store.career.completed, []);
});

console.log(`Career store verified: ${checks} checks passed.`);
