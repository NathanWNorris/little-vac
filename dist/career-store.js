import { SAVE_KEY, loadCareer, saveCareer, validateCareer } from './progression.js';

// A transaction always starts with the latest save. The optional Web Locks
// manager serializes this read/change/write sequence across tabs as well.
export function createCareerStore(storage, { locks, onChange, onWarning } = {}) {
  const initial = loadCareer(storage);
  let career = initial.career;
  let status = initial.status;
  let memoryOnly = status === 'blocked';
  let queue = Promise.resolve();

  const notify = (callback, value) => {
    // A view callback must not turn a committed purchase into a rejected one.
    try { callback?.(value); } catch { /* The saved transaction is already complete. */ }
  };
  function useMemory() {
    if (!memoryOnly) {
      memoryOnly = true;
      notify(onWarning, 'Progress could not be saved. Keep this tab open: your current session is now stored only in memory.');
    }
    status = 'blocked';
  }
  function latestCareer() {
    if (memoryOnly) return career;
    const latest = loadCareer(storage);
    if (latest.status === 'blocked') {
      useMemory();
      return career;
    }
    status = latest.status;
    return latest.career;
  }
  async function withLock(operation) {
    if (typeof locks?.request !== 'function') return operation();
    let started = false;
    try {
      return await locks.request(SAVE_KEY, async () => {
        started = true;
        return operation();
      });
    } catch (error) {
      // Some embedded browsers expose Web Locks but deny access. Fall back
      // only if the callback never ran, never by replaying a failed mutation.
      if (started) throw error;
      return operation();
    }
  }
  function enqueue(operation) {
    const pending = queue.then(() => withLock(operation));
    queue = pending.catch(() => {});
    return pending;
  }

  return {
    get career() { return career; },
    get status() { return status; },
    async transact(mutate) {
      if (typeof mutate !== 'function') throw new TypeError('A career transaction needs a function.');
      return enqueue(async () => {
        // Work on a copy so a rejected callback cannot leak a partial change.
        const next = validateCareer(latestCareer());
        const returned = mutate(next);
        // Ordinary game actions are synchronous. Keep their read/write pair
        // together even when an embedded browser does not offer Web Locks.
        const result = returned && typeof returned.then === 'function' ? await returned : returned;
        career = validateCareer(next);
        if (!memoryOnly) {
          if (saveCareer(storage, career)) status = 'ok';
          else useMemory();
        }
        notify(onChange, career);
        return result;
      });
    },
    async sync() {
      return enqueue(() => {
        career = validateCareer(latestCareer());
        notify(onChange, career);
        return career;
      });
    },
  };
}
