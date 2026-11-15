import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintWorkflow } from '../src/lint-workflow.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const load = (name) => fs.readFileSync(path.join(here, '..', 'workflows', name), 'utf8');
const rules = (text) => lintWorkflow(text).map((finding) => finding.rule);
const sha = 'a'.repeat(40);
const wrap = (body, head = 'permissions:\n  contents: read\n') => `name: T\non: push\n${head}jobs:\n  j:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n${body}`;

test('Das gute Beispiel und das Release-Beispiel haben keine Befunde', () => {
  assert.deepEqual(lintWorkflow(load('good-ci.yml')), []);
  assert.deepEqual(lintWorkflow(load('release.yml')), []);
});

test('Der echte Workflow dieses Repositories hat keine Fehler', () => {
  const real = fs.readFileSync(path.join(here, '..', '..', '..', '..', '.github', 'workflows', 'ci.yml'), 'utf8');
  assert.deepEqual(lintWorkflow(real).filter((finding) => finding.severity === 'error'), []);
});

test('Script-Injection: Ticket-Titel direkt im Skript wird gefunden', () => {
  const findings = lintWorkflow(load('bad-injection.yml'));
  assert.deepEqual(findings.map((finding) => [finding.rule, finding.line]), [['script-injection', 16]]);
});

test('Script-Injection: einzeilige run-Werte und weitere Felder werden erkannt', () => {
  assert.deepEqual(rules(wrap('      - run: echo "${{ github.head_ref }}"\n')), ['script-injection']);
  assert.deepEqual(rules(wrap('      - run: ./check.sh "${{ github.event.pull_request.title }}"\n')), ['script-injection']);
  assert.deepEqual(rules(wrap('      - run: echo "${{ github.event.head_commit.message }}"\n')), ['script-injection']);
});

test('Script-Injection: der Weg über env wird nicht beanstandet', () => {
  const safe = wrap('      - env:\n          TITLE: ${{ github.event.pull_request.title }}\n        run: echo "$TITLE"\n');
  assert.deepEqual(rules(safe), []);
});

test('Ungefährliche Ausdrücke im Skript (Matrix, Runner-Betriebssystem) bleiben erlaubt', () => {
  assert.deepEqual(rules(wrap('      - run: echo "${{ runner.os }} ${{ github.sha }}"\n')), []);
});

test('Nicht festgelegte Fremd-Actions werden gemeldet, SHA und lokale Actions nicht', () => {
  assert.deepEqual(rules(wrap('      - uses: someone/tool@v2\n')), ['unpinned-action']);
  assert.deepEqual(rules(wrap('      - uses: someone/tool@main\n')), ['unpinned-action']);
  assert.deepEqual(rules(wrap(`      - uses: someone/tool@${sha} # v2.1.0\n`)), []);
  assert.deepEqual(rules(wrap('      - uses: ./.github/actions/local\n')), []);
  assert.deepEqual(rules(wrap('      - uses: actions/checkout@v7\n')), []);
});

test('Ein 39-stelliger oder nicht hexadezimaler Wert gilt nicht als SHA', () => {
  assert.deepEqual(rules(wrap(`      - uses: someone/tool@${'a'.repeat(39)}\n`)), ['unpinned-action']);
  assert.deepEqual(rules(wrap(`      - uses: someone/tool@${'g'.repeat(40)}\n`)), ['unpinned-action']);
});

test('permissions: write-all ist ein Fehler; fehlender Block ist eine Warnung', () => {
  assert.deepEqual(lintWorkflow(load('bad-permissions.yml')).map((finding) => [finding.rule, finding.severity, finding.line]), [['write-all', 'error', 7]]);
  assert.deepEqual(lintWorkflow(load('bad-no-permissions.yml')).map((finding) => [finding.rule, finding.severity]), [['missing-permissions', 'warn']]);
  const missing = lintWorkflow(wrap('      - run: echo hi\n', ''));
  assert.deepEqual(missing.map((finding) => [finding.rule, finding.severity]), [['missing-permissions', 'warn']]);
});

test('Die Beispiele für fehlende Festlegung und fehlendes Zeitlimit melden genau ihre Regel', () => {
  assert.deepEqual(lintWorkflow(load('bad-unpinned.yml')).map((finding) => [finding.rule, finding.line]), [['unpinned-action', 16], ['unpinned-action', 17]]);
  assert.deepEqual(lintWorkflow(load('bad-no-timeout.yml')).map((finding) => [finding.rule, finding.severity]), [['missing-timeout', 'warn']]);
});

test('permissions pro Job ersetzt den Block auf oberster Ebene', () => {
  const text = 'name: T\non: push\njobs:\n  j:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    permissions:\n      contents: read\n    steps:\n      - run: echo hi\n';
  assert.deepEqual(rules(text), []);
});

test('pull_request_target mit Checkout des PR-Codes wird als Fehler gemeldet', () => {
  assert.deepEqual(lintWorkflow(load('bad-pwn-request.yml')).map((finding) => [finding.rule, finding.line]), [['pull-request-target-checkout', 16]]);
});

test('pull_request_target ohne Checkout des PR-Codes bleibt unbeanstandet', () => {
  const text = 'name: T\non:\n  pull_request_target:\npermissions:\n  pull-requests: write\njobs:\n  label:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@v7\n      - run: echo label\n';
  assert.deepEqual(rules(text), []);
});

test('Jobs ohne timeout-minutes erzeugen eine Warnung; Aufrufe wiederverwendbarer Workflows nicht', () => {
  const noTimeout = 'name: T\non: push\npermissions:\n  contents: read\njobs:\n  j:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n';
  assert.deepEqual(lintWorkflow(noTimeout).map((finding) => finding.rule), ['missing-timeout']);
  const reusable = `name: T\non: push\npermissions:\n  contents: read\njobs:\n  j:\n    uses: org/repo/.github/workflows/x.yml@${sha}\n`;
  assert.deepEqual(rules(reusable), []);
});

test('Die Befunde sind nach Zeile sortiert und enthalten eine Begründung', () => {
  const findings = lintWorkflow(load('bad-unpinned.yml'));
  assert.deepEqual(findings.map((finding) => finding.line), [...findings.map((finding) => finding.line)].sort((a, b) => a - b));
  assert.ok(findings.every((finding) => finding.message.length > 40));
});
