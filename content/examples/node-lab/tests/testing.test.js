import { test, describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { TtlCache, debounce, getRate } from '../src/testing/units.js';

describe('TtlCache mit gesteuerter Zeit', () => {
  beforeEach(() => mock.timers.enable({ apis: ['Date'], now: 1_000 }));

  it('liefert Werte bis zum Ablauf und danach undefined', (t) => {
    t.after(() => mock.timers.reset());
    const cache = new TtlCache(100);
    cache.set('a', 1);
    mock.timers.tick(99);
    assert.equal(cache.get('a'), 1);
    mock.timers.tick(1); // exakt ttl: abgelaufen (Grenzfall)
    assert.equal(cache.get('a'), undefined);
  });

  it('lehnt ungültige Laufzeiten ab', (t) => {
    t.after(() => mock.timers.reset());
    for (const bad of [0, -1, Number.NaN]) assert.throws(() => new TtlCache(bad), RangeError);
  });
});

test('debounce: nur der letzte Aufruf zählt', (t) => {
  mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => mock.timers.reset());
  const fn = mock.fn();
  const search = debounce(fn, 300);
  search('a');
  mock.timers.tick(200);
  search('ab');
  mock.timers.tick(299);
  assert.equal(fn.mock.callCount(), 0);
  mock.timers.tick(1);
  assert.equal(fn.mock.callCount(), 1);
  assert.deepEqual(fn.mock.calls[0]?.arguments, ['ab']);
});

describe('getRate mit ersetztem fetch', () => {
  const ok = (rate) => async () => ({ ok: true, status: 200, json: async () => ({ rate }) });

  it('holt den Kurs einmal und danach aus dem Cache', async () => {
    const fetchImpl = mock.fn(ok(1.08));
    assert.equal(await getRate('USD', { fetchImpl }), 1.08);
    assert.equal(await getRate('USD', { fetchImpl, cache: undefined }), 1.08); // anderer Cache: zweiter Abruf
    assert.equal(fetchImpl.mock.callCount(), 2);
    assert.equal(fetchImpl.mock.calls[0]?.arguments[0], 'https://rates.example.test/v1/USD');
  });

  it('nutzt denselben Cache für denselben Schlüssel', async () => {
    const cache = new TtlCache(1000);
    const fetchImpl = mock.fn(ok(2));
    await getRate('CHF', { fetchImpl, cache });
    await getRate('CHF', { fetchImpl, cache });
    assert.equal(fetchImpl.mock.callCount(), 1);
  });

  it('kodiert die Währung in der URL (kein Pfad-Einschleusen)', async () => {
    const fetchImpl = mock.fn(ok(1));
    await getRate('../x?y', { fetchImpl });
    assert.equal(fetchImpl.mock.calls[0]?.arguments[0], 'https://rates.example.test/v1/..%2Fx%3Fy');
  });

  it('meldet Fehlerstatus und kaputte Antworten verständlich', async () => {
    await assert.rejects(getRate('X', { fetchImpl: async () => ({ ok: false, status: 503 }) }), /\(503\)/);
    for (const bad of [{}, { rate: '1' }, { rate: Number.NaN }, null]) {
      await assert.rejects(getRate('Y', { fetchImpl: async () => ({ ok: true, status: 200, json: async () => bad }) }), /ohne gültigen Kurs/);
    }
  });
});

test('mock.method ersetzt eine Methode vorübergehend', (t) => {
  const spy = t.mock.method(Math, 'random', () => 0.5);
  assert.equal(Math.random(), 0.5);
  assert.equal(spy.mock.callCount(), 1);
});

test('Subtests und Überspringen', async (t) => {
  await t.test('läuft', () => assert.ok(true));
  await t.test('wird übersprungen', { skip: 'Beispiel für skip' }, () => assert.fail('läuft nie'));
});
