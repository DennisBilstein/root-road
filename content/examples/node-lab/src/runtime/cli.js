// Kommandozeile: Argumente, Umgebung und Exit-Code. Wird von den Tests als Kindprozess gestartet.
import { parseArgs } from 'node:util';

export function parse(argv) {
  return parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      upper: { type: 'boolean', short: 'u', default: false },
      times: { type: 'string', short: 'n', default: '1' },
    },
  });
}

export function run(argv, env = process.env) {
  const { values, positionals } = parse(argv);
  const times = Number(values.times);
  if (!Number.isInteger(times) || times < 1 || times > 100) {
    return { code: 2, out: '', err: `--times muss eine ganze Zahl von 1 bis 100 sein, nicht "${values.times}"\n` };
  }
  const name = positionals[0] ?? env.USER_NAME ?? 'Welt';
  const line = `Hallo ${name}!`;
  const text = (values.upper ? line.toUpperCase() : line) + '\n';
  return { code: 0, out: text.repeat(times), err: '' };
}

// Nur ausführen, wenn die Datei direkt gestartet wird (nicht beim Import in Tests).
// import.meta.main wäre kürzer, ist laut Node-Doku aber noch „Early development“.
if (process.argv[1] === import.meta.filename) {
  try {
    const result = run(process.argv.slice(2));
    process.stdout.write(result.out);
    process.stderr.write(result.err);
    process.exitCode = result.code;
  } catch (error) {
    // Unbekannte Optionen lösen in parseArgs einen Fehler mit code ERR_PARSE_ARGS_UNKNOWN_OPTION aus.
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 64;
  }
}
