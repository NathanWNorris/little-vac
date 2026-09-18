// All rewards and unlocks live here so replays, saving, and the UI share one rule set.
export const SAVE_KEY = 'sweep-shift-career-v1';
const VERSION = 1;
const ROOM_COUNT = 24;
const MAX_COINS = 99_999_999;
const MAX_RUN_COINS = 100_000;
const HISTORY_LIMIT = 256;
const PRICES = [180, 320, 550, 900, 1350];
const COMPLETION_BONUS = 50;
const MEDAL_STEP_BONUS = 20;
const TRINKET_BONUS = 25;

export const UPGRADES = Object.freeze([
  Object.freeze({ key: 'width', name: 'Wider sweep', description: 'Reach more debris on each pass.' }),
  Object.freeze({ key: 'bag', name: 'Bigger bag', description: 'Collect more between station visits.' }),
  Object.freeze({ key: 'speed', name: 'Quicker wheels', description: 'Move around the room faster.' }),
  Object.freeze({ key: 'pull', name: 'Stronger suction', description: 'Pull scraps faster and loosen stuck debris sooner.' }),
]);

export const SHELLS = Object.freeze([
  Object.freeze({ id: 'mint', name: 'Mint', color: '#84d9b3', unlockAfter: 0 }),
  Object.freeze({ id: 'coral', name: 'Coral', color: '#ff947f', unlockAfter: 6 }),
  Object.freeze({ id: 'lemon', name: 'Lemon', color: '#f6d86f', unlockAfter: 12 }),
  Object.freeze({ id: 'lilac', name: 'Lilac', color: '#bdacf0', unlockAfter: 18 }),
  Object.freeze({ id: 'sky', name: 'Sky', color: '#83d4ed', unlockAfter: 24 }),
]);

export function defaultCareer() {
  return {
    version: VERSION,
    generation: 0,
    coins: 0,
    unlocked: 1,
    completed: [],
    medals: {},
    bestTimes: {},
    trinkets: [],
    upgrades: { width: 0, bag: 0, speed: 0, pull: 0 },
    shell: 'mint',
    settings: { muted: false, effects: 0.65, reducedMotion: false },
    lastRoom: 1,
    endingSeen: false,
    recentRuns: [],
  };
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function boundedInteger(value, minimum, maximum, fallback = minimum) {
  return Math.max(minimum, Math.min(maximum, Math.floor(finiteNumber(value, fallback))));
}

function roomId(value) {
  return Number.isInteger(value) && value >= 1 && value <= ROOM_COUNT;
}

function validRunId(value) {
  return typeof value === 'string' && value.length <= 128 && value.trim().length > 0;
}

// Never trust a saved unlocked counter: only an uninterrupted completed campaign
// prefix grants access. A damaged [1, 24] save therefore unlocks room 2, not endless.
export function validateCareer(raw) {
  const clean = defaultCareer();
  if (!record(raw) || raw.version !== VERSION) return clean;

  clean.generation = boundedInteger(raw.generation, 0, Number.MAX_SAFE_INTEGER);
  clean.coins = boundedInteger(raw.coins, 0, MAX_COINS);
  const completed = new Set(Array.isArray(raw.completed) ? raw.completed.filter(roomId) : []);
  for (let id = 1; id <= ROOM_COUNT && completed.has(id); id++) clean.completed.push(id);
  clean.unlocked = Math.min(ROOM_COUNT + 1, clean.completed.length + 1);

  for (const id of clean.completed) {
    const medal = record(raw.medals) ? raw.medals[id] : undefined;
    clean.medals[id] = Number.isInteger(medal) && medal >= 1 && medal <= 3 ? medal : 1;
    const bestTime = record(raw.bestTimes) ? raw.bestTimes[id] : undefined;
    if (typeof bestTime === 'number' && Number.isFinite(bestTime) && bestTime > 0 && bestTime <= 604_800) {
      clean.bestTimes[id] = bestTime;
    }
  }

  const trinkets = new Set(Array.isArray(raw.trinkets) ? raw.trinkets.filter(roomId) : []);
  clean.trinkets = clean.completed.filter(id => trinkets.has(id));
  for (const { key } of UPGRADES) {
    clean.upgrades[key] = boundedInteger(record(raw.upgrades) ? raw.upgrades[key] : 0, 0, 5);
  }
  const shell = SHELLS.find(item => item.id === raw.shell);
  if (shell && clean.completed.length >= shell.unlockAfter) clean.shell = shell.id;

  if (record(raw.settings)) {
    clean.settings.muted = raw.settings.muted === true;
    clean.settings.effects = Math.max(0, Math.min(1, finiteNumber(raw.settings.effects, 0.65)));
    clean.settings.reducedMotion = raw.settings.reducedMotion === true;
  }
  if ((roomId(raw.lastRoom) && raw.lastRoom <= clean.unlocked) ||
      (raw.lastRoom === 0 && clean.completed.length === ROOM_COUNT)) {
    clean.lastRoom = raw.lastRoom;
  }
  clean.endingSeen = clean.completed.length === ROOM_COUNT && raw.endingSeen === true;
  if (Array.isArray(raw.recentRuns)) {
    // Keep the most recent occurrence of a repeated ID without allowing unbounded saves.
    clean.recentRuns = [...new Set(raw.recentRuns.filter(validRunId).reverse())].reverse().slice(-HISTORY_LIMIT);
  }
  return clean;
}

function equivalent(left, right) {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length &&
      left.every((value, index) => equivalent(value, right[index]));
  }
  if (!record(left) || !record(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every(key => Object.hasOwn(right, key) && equivalent(left[key], right[key]));
}

export function loadCareer(storage) {
  let saved;
  try {
    saved = storage.getItem(SAVE_KEY);
  } catch {
    return { career: defaultCareer(), status: 'blocked' };
  }
  if (saved === null || saved === undefined) return { career: defaultCareer(), status: 'new' };
  try {
    const raw = JSON.parse(saved);
    const career = validateCareer(raw);
    // Saves written before reset generations existed all belong to generation 0.
    // The migration must be identical in every tab and is not damaged progress.
    const migrated = record(raw) && raw.version === VERSION && !Object.hasOwn(raw, 'generation')
      ? { ...raw, generation: 0 } : raw;
    return { career, status: equivalent(migrated, career) ? 'ok' : 'recovered' };
  } catch {
    return { career: defaultCareer(), status: 'recovered' };
  }
}

export function saveCareer(storage, career) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(validateCareer(career)));
    return true;
  } catch {
    return false;
  }
}

export function resetCareer(career) {
  const previous = validateCareer(career).generation;
  Object.assign(career, defaultCareer(), { generation: previous === Number.MAX_SAFE_INTEGER ? 1 : previous + 1 });
}

export function statsFor(upgrades = {}) {
  const rank = key => boundedInteger(record(upgrades) ? upgrades[key] : 0, 0, 5);
  return {
    radius: 54 + rank('width') * 8,
    capacity: 90 + rank('bag') * 30,
    speed: 150 + rank('speed') * 15,
    pull: 1 + rank('pull') * 0.25,
  };
}

// rank is the CURRENT purchased rank, so upgradePrice('bag', 0) is the first purchase.
// null means no purchasable next rank; the UI can label it “Maxed”.
export function upgradePrice(key, rank) {
  if (!UPGRADES.some(upgrade => upgrade.key === key) || !Number.isInteger(rank) || rank < 0 || rank >= 5) return null;
  return PRICES[rank];
}

export function buyUpgrade(career, key) {
  if (!record(career)) return { ok: false, message: 'This career is unavailable.' };
  const upgrade = UPGRADES.find(item => item.key === key);
  if (!upgrade) return { ok: false, message: 'That upgrade is unavailable.' };
  const clean = validateCareer(career);
  const cost = upgradePrice(key, clean.upgrades[key]);
  if (cost === null) return { ok: false, message: `${upgrade.name} is fully upgraded.` };
  if (clean.coins < cost) return { ok: false, message: `Collect ${cost - clean.coins} more coins for ${upgrade.name.toLowerCase()}.` };
  clean.coins -= cost;
  clean.upgrades[key]++;
  Object.assign(career, clean);
  return { ok: true, message: `${upgrade.name} upgraded to rank ${clean.upgrades[key]} of 5.` };
}

export function isRoomUnlocked(career, id) {
  const clean = validateCareer(career);
  return id === 0 ? clean.completed.length === ROOM_COUNT : roomId(id) && id <= clean.unlocked;
}

function noReward(message) {
  return { ok: false, message, coins: 0, bonus: 0, newMedal: 0, newTrinket: false, newShell: null, endlessUnlocked: false };
}

export function settleRun(career, result) {
  if (!record(career) || !record(result) || !validRunId(result.runId) ||
      !(result.roomId === 0 || roomId(result.roomId)) ||
      !Number.isInteger(result.coins) || result.coins < 0 || result.coins > MAX_RUN_COINS ||
      typeof result.time !== 'number' || !Number.isFinite(result.time) || result.time <= 0 || result.time > 604_800 ||
      !Number.isInteger(result.medal) || result.medal < 1 || result.medal > 3 ||
      typeof result.trinket !== 'boolean') {
    return noReward('This run could not be recorded.');
  }
  const clean = validateCareer(career);
  if (clean.recentRuns.includes(result.runId)) return noReward('This run has already been recorded.');
  if (!isRoomUnlocked(clean, result.roomId)) return noReward('Finish the earlier rooms to unlock this shift.');

  const id = result.roomId;
  let bonus = 0;
  let newMedal = 0;
  let newTrinket = false;
  let newShell = null;
  let endlessUnlocked = false;
  if (id !== 0) {
    const firstFinish = !clean.completed.includes(id);
    if (firstFinish) {
      clean.completed.push(id);
      clean.unlocked = Math.min(ROOM_COUNT + 1, id + 1);
      bonus += COMPLETION_BONUS;
      newShell = SHELLS.find(shell => shell.unlockAfter === id) ?? null;
      endlessUnlocked = id === ROOM_COUNT;
    }
    const previousMedal = clean.medals[id] || 0;
    if (result.medal > previousMedal) {
      newMedal = result.medal;
      clean.medals[id] = result.medal;
      // Gold pays the same total medal bonus whether earned immediately or in stages.
      bonus += (result.medal - previousMedal) * MEDAL_STEP_BONUS;
    }
    if (!clean.bestTimes[id] || result.time < clean.bestTimes[id]) clean.bestTimes[id] = result.time;
    if (result.trinket && !clean.trinkets.includes(id)) {
      clean.trinkets.push(id);
      clean.trinkets.sort((a, b) => a - b);
      newTrinket = true;
      bonus += TRINKET_BONUS;
    }
  }

  const baseAward = Math.min(result.coins, MAX_COINS - clean.coins);
  bonus = Math.min(bonus, MAX_COINS - clean.coins - baseAward);
  const awarded = baseAward + bonus;
  clean.coins += awarded;
  clean.lastRoom = id;
  clean.recentRuns.push(result.runId);
  clean.recentRuns = clean.recentRuns.slice(-HISTORY_LIMIT);
  Object.assign(career, clean);
  return { ok: true, message: 'Shift complete!', coins: awarded, bonus, newMedal, newTrinket, newShell, endlessUnlocked };
}

export function selectShell(career, id) {
  if (!record(career)) return { ok: false, message: 'This career is unavailable.' };
  const shell = SHELLS.find(item => item.id === id);
  if (!shell) return { ok: false, message: 'That shell is unavailable.' };
  const clean = validateCareer(career);
  if (clean.completed.length < shell.unlockAfter) {
    return { ok: false, message: `Finish room ${shell.unlockAfter} to unlock ${shell.name}.` };
  }
  clean.shell = shell.id;
  Object.assign(career, clean);
  return { ok: true, message: `${shell.name} shell equipped.` };
}
