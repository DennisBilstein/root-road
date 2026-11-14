// Rechenintensive Arbeit in einem Worker Thread, damit der Event Loop frei bleibt.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2); // absichtlich rechenintensiv
}

if (!isMainThread) {
  parentPort?.postMessage(fib(workerData.n));
}

export function fibInWorker(n) {
  if (!Number.isInteger(n) || n < 0 || n > 45) return Promise.reject(new RangeError('n muss eine ganze Zahl von 0 bis 45 sein'));
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { n } });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => { if (code !== 0) reject(new Error(`Worker endete mit Code ${code}`)); });
  });
}

export { fib };
