import assert from 'node:assert/strict';
import { makeRoom } from '../dist/rooms.js';
import {
  SAVE_KEY, defaultCareer, resetCareer, validateCareer, loadCareer, saveCareer, statsFor,
  UPGRADES, SHELLS, upgradePrice, buyUpgrade, settleRun, selectShell, isRoomUnlocked,
} from '../dist/progression.js';

let checks = 0;
function test(name, body) {
  body();
  checks++;
  console.log(`PASS ${name}`);
}
function memoryStorage(initial = null) {
  let text = initial;
  return {
    getItem(key) { assert.equal(key, SAVE_KEY); return text; },
    setItem(key, value) { assert.equal(key, SAVE_KEY); text = value; },
  };
}
function result(roomId, overrides = {}) {
  return { runId: `room-${roomId}`, roomId, coins: 300, time: 110, medal: 2, trinket: false, ...overrides };
}

test('fresh career and independently allocated defaults', () => {
  const a = defaultCareer();
  const b = defaultCareer();
  a.upgrades.bag = 4;
  a.completed.push(1);
  assert.equal(b.upgrades.bag, 0);
  assert.deepEqual(b.completed, []);
  assert.equal(loadCareer(memoryStorage()).status, 'new');
  assert.equal(isRoomUnlocked(b, 1), true);
  assert.equal(isRoomUnlocked(b, 2), false);
  assert.equal(isRoomUnlocked(b, 0), false);
});

test('existing v1 saves migrate to the same generation without losing progress or reporting damage', () => {
  const legacy = defaultCareer();
  settleRun(legacy, result(1, { trinket: true }));
  buyUpgrade(legacy, 'bag');
  delete legacy.generation;
  const text = JSON.stringify(legacy);
  const firstTab = loadCareer(memoryStorage(text));
  const secondTab = loadCareer(memoryStorage(text));
  assert.equal(firstTab.status, 'ok');
  assert.equal(secondTab.status, 'ok');
  assert.deepEqual(firstTab.career, secondTab.career);
  assert.deepEqual(firstTab.career, { ...legacy, generation: 0 });
  const storage = memoryStorage();
  assert.equal(saveCareer(storage, firstTab.career), true);
  assert.deepEqual(loadCareer(storage).career, firstTab.career);
});

test('reset replaces the career generation even before any room has been completed', () => {
  const career = defaultCareer(), first = career.generation;
  resetCareer(career);
  assert.notEqual(career.generation, first);
  const second = career.generation;
  resetCareer(career);
  assert.notEqual(career.generation, second);
  assert.deepEqual(career.completed, []);
  assert.equal(career.coins, 0);
  assert.equal(validateCareer(career).generation, career.generation);
});

test('upgrade effects stay bounded and each rank improves the relevant stat', () => {
  assert.deepEqual(statsFor({}), { radius: 54, capacity: 90, speed: 150, pull: 1 });
  assert.deepEqual(statsFor({ width: 5, bag: 5, speed: 5, pull: 5 }), { radius: 94, capacity: 240, speed: 225, pull: 2.25 });
  assert.deepEqual(statsFor({ width: 999, bag: -1, speed: Infinity, pull: '5' }), { radius: 94, capacity: 90, speed: 150, pull: 1 });
  const names = { width: 'radius', bag: 'capacity', speed: 'speed', pull: 'pull' };
  for (const { key } of UPGRADES) {
    for (let rank = 1; rank <= 5; rank++) assert.ok(statsFor({ [key]: rank })[names[key]] > statsFor({ [key]: rank - 1 })[names[key]]);
    assert.equal(upgradePrice(key, 0), 180);
    assert.equal(upgradePrice(key, 4), 1350);
    assert.equal(upgradePrice(key, 5), null);
  }
  assert.equal(upgradePrice('constructor', 0), null);
  assert.equal(upgradePrice('bag', -1), null);
  assert.equal(upgradePrice('bag', 0.5), null);
});

test('purchases require earned coins and never create negative currency', () => {
  const career = defaultCareer();
  assert.equal(buyUpgrade(career, 'bag').ok, false);
  assert.equal(career.coins, 0);
  const award = settleRun(career, result(1));
  assert.equal(career.coins, award.coins);
  assert.equal(buyUpgrade(career, 'bag').ok, true);
  assert.equal(career.coins, award.coins - 180);
  assert.equal(career.upgrades.bag, 1);
  assert.equal(buyUpgrade(career, '__proto__').ok, false);
  while (buyUpgrade(career, 'bag').ok) assert.ok(career.coins >= 0);
  assert.ok(career.coins >= 0);
});

test('completion, medal improvements, and trinkets pay each achievement only once', () => {
  const career = defaultCareer();
  const first = settleRun(career, result(1, { medal: 1, trinket: true }));
  assert.equal(first.coins, 395);
  assert.equal(first.bonus, 95);
  assert.equal(first.newMedal, 1);
  assert.equal(first.newTrinket, true);
  assert.deepEqual(career.completed, [1]);
  assert.equal(career.unlocked, 2);
  const beforeDuplicate = structuredClone(career);
  assert.equal(settleRun(career, result(1, { medal: 3, coins: 999 })).coins, 0);
  assert.deepEqual(career, beforeDuplicate);
  const replay = settleRun(career, result(1, { runId: 'replay-1', medal: 1, trinket: true, time: 150 }));
  assert.equal(replay.coins, 300);
  assert.equal(replay.bonus, 0);
  assert.equal(replay.newTrinket, false);
  assert.equal(career.bestTimes[1], 110);
  const silver = settleRun(career, result(1, { runId: 'silver-1', medal: 2, time: 100 }));
  assert.equal(silver.bonus, 20);
  const gold = settleRun(career, result(1, { runId: 'gold-1', medal: 3, time: 80 }));
  assert.equal(gold.bonus, 20);
  assert.equal(career.bestTimes[1], 80);
  const equalGold = settleRun(career, result(1, { runId: 'gold-again-1', medal: 3, trinket: true, time: 90 }));
  assert.equal(equalGold.bonus, 0);
  assert.equal(career.medals[1], 3);
  assert.equal(career.bestTimes[1], 80);
});

test('gold-first and staged medals receive the same lifetime achievement bonus', () => {
  const direct = defaultCareer();
  const staged = defaultCareer();
  const directBonus = settleRun(direct, result(1, { medal: 3 })).bonus;
  let stagedBonus = 0;
  for (let medal = 1; medal <= 3; medal++) stagedBonus += settleRun(staged, result(1, { runId: `staged-${medal}`, medal })).bonus;
  assert.equal(directBonus, stagedBonus);
});

test('invalid run data and attempts to skip levels cannot award or unlock anything', () => {
  const invalid = [
    result(24), result(0), result(2), result(-1), result(25),
    result(1, { runId: '' }), result(1, { runId: 'x'.repeat(129) }),
    result(1, { coins: -1 }), result(1, { coins: 100_001 }), result(1, { coins: Infinity }),
    result(1, { coins: 5.5 }), result(1, { time: NaN }), result(1, { time: 0 }),
    result(1, { medal: 4 }), result(1, { trinket: 'yes' }), null,
  ];
  for (const value of invalid) {
    const career = defaultCareer();
    const before = structuredClone(career);
    assert.equal(settleRun(career, value).ok, false);
    assert.deepEqual(career, before);
  }
});

test('all 24 rooms unlock in order; actual bronze room earnings fund all 20 ranks near the ending', () => {
  const career = defaultCareer();
  let earned = 0;
  let spent = 0;
  let purchases = 0;
  let fullyUpgradedAt = null;
  let longestPurchaseWait = 0;
  let purchaseWait = 0;
  const shells = [];
  for (let id = 1; id <= 24; id++) {
    assert.equal(isRoomUnlocked(career, id), true);
    assert.equal(isRoomUnlocked(career, id + 1), false);
    assert.equal(selectShell(career, 'sky').ok, false);
    const room = makeRoom(id);
    const actualCoins = room.debris.reduce((sum, piece) => sum + piece.value, 0);
    const award = settleRun(career, result(id, { coins: actualCoins, time: room.silverTime + 60, medal: 1, trinket: false }));
    assert.equal(award.ok, true);
    earned += award.coins;
    if (award.newShell) shells.push(award.newShell.id);
    assert.equal(award.endlessUnlocked, id === 24);
    // Buy the cheapest available upgrade after each room; all money comes from
    // authored debris and bronze completion. Trinkets and replay grinding are absent.
    let boughtThisRoom = 0;
    while (true) {
      const candidates = UPGRADES.map(upgrade => ({ key: upgrade.key, price: upgradePrice(upgrade.key, career.upgrades[upgrade.key]) }))
        .filter(item => item.price !== null).sort((a, b) => a.price - b.price);
      const next = candidates[0];
      if (!next || career.coins < next.price) break;
      assert.equal(buyUpgrade(career, next.key).ok, true);
      spent += next.price;
      purchases++;
      boughtThisRoom++;
    }
    if (id === 1) assert.ok(boughtThisRoom >= 1 && boughtThisRoom <= 2);
    if (boughtThisRoom) purchaseWait = 0;
    else if (purchases < 20) longestPurchaseWait = Math.max(longestPurchaseWait, ++purchaseWait);
    if (purchases === 20 && fullyUpgradedAt === null) fullyUpgradedAt = id;
    assert.equal(career.coins, earned - spent);
  }
  assert.equal(purchases, 20);
  assert.ok(fullyUpgradedAt >= 21 && fullyUpgradedAt <= 24, `All ranks bought in room ${fullyUpgradedAt}`);
  assert.ok(longestPurchaseWait <= 1, `Waited ${longestPurchaseWait} rooms without an affordable upgrade`);
  assert.equal(spent, 13_200);
  assert.equal(career.unlocked, 25);
  assert.equal(career.completed.length, 24);
  assert.deepEqual(shells, SHELLS.slice(1).map(shell => shell.id));
  assert.equal(selectShell(career, 'sky').ok, true);
  assert.equal(career.shell, 'sky');
  assert.equal(isRoomUnlocked(career, 0), true);
  assert.equal(isRoomUnlocked(career, 25), false);
  assert.equal(buyUpgrade(career, 'bag').ok, false);
  const endless = settleRun(career, result(0, { runId: 'endless-a', coins: 500, medal: 3, trinket: true }));
  assert.equal(endless.coins, 500);
  assert.equal(endless.bonus, 0);
  assert.equal(endless.newTrinket, false);
  assert.equal(endless.endlessUnlocked, false);
  assert.equal(career.completed.length, 24);
  assert.equal(career.lastRoom, 0);
  console.log(`  Economy: ${earned} earned, ${spent} spent; final upgrade in room ${fullyUpgradedAt}; no trinkets or replays.`);
});

test('campaign completion does not require upgrades, medal targets, or optional trinkets', () => {
  const plain = defaultCareer();
  const collector = defaultCareer();
  for (let id = 1; id <= 24; id++) {
    const room = makeRoom(id);
    const actualCoins = room.debris.reduce((sum, piece) => sum + piece.value, 0);
    for (const [career, trinket] of [[plain, false], [collector, true]]) {
      assert.equal(isRoomUnlocked(career, id), true);
      assert.equal(settleRun(career, result(id, { coins: actualCoins, time: room.silverTime + 600, medal: 1, trinket })).ok, true);
      assert.deepEqual(career.upgrades, { width: 0, bag: 0, speed: 0, pull: 0 });
    }
  }
  assert.equal(isRoomUnlocked(plain, 0), true);
  assert.equal(isRoomUnlocked(collector, 0), true);
  assert.deepEqual(plain.completed, collector.completed);
  assert.deepEqual(plain.medals, collector.medals);
  assert.equal(plain.trinkets.length, 0);
  assert.equal(collector.trinkets.length, 24);
  assert.equal(collector.coins - plain.coins, 24 * 25);
});

test('the earned finale, last selected room, and ending-seen flag survive reload separately', () => {
  const career = defaultCareer();
  const storage = memoryStorage();
  for (let id = 1; id <= 24; id++) {
    const award = settleRun(career, result(id));
    assert.equal(award.endlessUnlocked, id === 24);
  }
  assert.equal(career.lastRoom, 24);
  assert.equal(career.endingSeen, false, 'Finishing the room does not pretend the player has seen the ending');
  assert.equal(saveCareer(storage, career), true);
  const beforeCelebration = loadCareer(storage).career;
  assert.equal(beforeCelebration.endingSeen, false);
  assert.equal(beforeCelebration.completed.length, 24);
  assert.equal(isRoomUnlocked(beforeCelebration, 0), true);
  beforeCelebration.endingSeen = true;
  assert.equal(saveCareer(storage, beforeCelebration), true);
  assert.equal(loadCareer(storage).career.endingSeen, true);
  const replay = settleRun(beforeCelebration, result(24, { runId: 'finale-replay', medal: 2 }));
  assert.equal(replay.bonus, 0);
  assert.equal(replay.endlessUnlocked, false);
  assert.equal(beforeCelebration.endingSeen, true);
  assert.equal(validateCareer({ ...defaultCareer(), endingSeen: true, lastRoom: 0 }).endingSeen, false);
  assert.equal(validateCareer({ ...defaultCareer(), lastRoom: 0 }).lastRoom, 1);
});

test('a missed trinket can be earned on a later replay without repeating other bonuses', () => {
  const career = defaultCareer();
  settleRun(career, result(1, { trinket: false }));
  const found = settleRun(career, result(1, { runId: 'trinket-replay', trinket: true }));
  assert.equal(found.bonus, 25);
  assert.equal(found.newTrinket, true);
  assert.equal(found.newMedal, 0);
  assert.deepEqual(career.trinkets, [1]);
  const repeated = settleRun(career, result(1, { runId: 'trinket-replay-again', trinket: true }));
  assert.equal(repeated.bonus, 0);
  assert.equal(repeated.newTrinket, false);
});

test('save/reload preserves progress, settings, and settlement idempotence', () => {
  const career = defaultCareer();
  settleRun(career, result(1, { trinket: true }));
  buyUpgrade(career, 'width');
  career.settings = { muted: true, effects: 0.2, reducedMotion: true };
  const storage = memoryStorage();
  assert.equal(saveCareer(storage, career), true);
  const loaded = loadCareer(storage);
  assert.equal(loaded.status, 'ok');
  assert.deepEqual(loaded.career, career);
  assert.equal(settleRun(loaded.career, result(1)).coins, 0);
  // Field order is irrelevant to the valid-save check.
  const reversed = Object.fromEntries(Object.entries(career).reverse());
  assert.equal(loadCareer(memoryStorage(JSON.stringify(reversed))).status, 'ok');
});

test('blocked and corrupt storage remain playable with accurate status', () => {
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); } };
  assert.equal(loadCareer(blocked).status, 'blocked');
  assert.equal(loadCareer(undefined).status, 'blocked');
  assert.equal(saveCareer(blocked, defaultCareer()), false);
  for (const text of ['', '{not json', 'null', '[]', '42', '{"version":2,"coins":999}']) {
    const loaded = loadCareer(memoryStorage(text));
    assert.equal(loaded.status, 'recovered');
    assert.equal(isRoomUnlocked(loaded.career, 1), true);
    assert.equal(settleRun(loaded.career, result(1)).ok, true);
  }
});

test('malformed saves cannot invent future unlocks or invalid effects', () => {
  const damaged = {
    ...defaultCareer(), coins: -900, unlocked: 25, completed: [24, 1, 1, 3, '2', -5],
    medals: { 1: 99, 24: 3, 3: 3 }, bestTimes: { 1: -10, 24: 10 }, trinkets: [1, 1, 24],
    upgrades: { width: 1000, bag: -50, speed: '3', pull: Infinity },
    shell: 'sky', lastRoom: 24, endingSeen: true,
    settings: { muted: 'true', effects: 99, reducedMotion: true },
    recentRuns: ['valid', null, '', 'valid'],
  };
  const clean = validateCareer(damaged);
  assert.deepEqual(clean.completed, [1]);
  assert.equal(clean.unlocked, 2);
  assert.equal(isRoomUnlocked(clean, 0), false);
  assert.equal(isRoomUnlocked(clean, 24), false);
  assert.equal(clean.lastRoom, 1);
  assert.equal(clean.shell, 'mint');
  assert.equal(clean.endingSeen, false);
  assert.deepEqual(clean.trinkets, [1]);
  assert.deepEqual(clean.medals, { 1: 1 });
  assert.deepEqual(clean.bestTimes, {});
  assert.deepEqual(clean.upgrades, { width: 5, bag: 0, speed: 0, pull: 0 });
  assert.deepEqual(clean.settings, { muted: false, effects: 1, reducedMotion: true });
  assert.deepEqual(clean.recentRuns, ['valid']);
  assert.equal(loadCareer(memoryStorage(JSON.stringify(damaged))).status, 'recovered');
  assert.deepEqual(validateCareer({ ...defaultCareer(), completed: [24], unlocked: 25 }).completed, []);
});

test('coin totals and run history are bounded without losing recent duplicate protection', () => {
  const career = defaultCareer();
  career.coins = 99_999_998;
  const award = settleRun(career, result(1));
  assert.equal(award.coins, 1);
  assert.equal(career.coins, 99_999_999);
  for (let index = 0; index < 300; index++) settleRun(career, result(1, { runId: `replay-${index}`, coins: 0 }));
  assert.equal(career.recentRuns.length, 256);
  assert.equal(career.recentRuns.at(-1), 'replay-299');
  assert.equal(settleRun(career, result(1, { runId: 'replay-299' })).coins, 0);
});

console.log(`Progression verified: ${checks} checks passed.`);
