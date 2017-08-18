// @flow

const WAIT_INTERVAL = 25;
const waiters = {};

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const waitUntil = async (
  cb: () => boolean,
  timeout: number = Infinity,
  id: ?string
) => {
  let t = 0;
  if (cb()) return;
  if (id != null) waiters[id] = true;
  while (t < timeout) {
    await delay(WAIT_INTERVAL);
    if (cb()) {
      if (id != null) delete waiters[id];
      return;
    }
    t += WAIT_INTERVAL;
  }
  if (id != null) delete waiters[id];
  throw new Error('TIME_OUT');
};

const isWaiting = (id?: string) => {
  if (id != null) return waiters[id];
  return Object.keys(waiters).length !== 0;
};

export { delay, waitUntil, isWaiting };
