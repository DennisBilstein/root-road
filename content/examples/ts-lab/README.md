# TypeScript-Lab (ts-m1, ts-m2)

Geprüfter Code für die TypeScript-Lektionen. Kein eigenes `npm install`: `tsc` und `@types/node` kommen aus `../vue-lab`
(dort einmal `npm ci` ausführen). Getestet mit TypeScript 6.0.3 und Node.js 22.23 (Type-Stripping, `node --test`).

```bash
npm run verify   # tsc --noEmit und alle Tests (node:test)
npm run errors   # zeigt die echten tsc-Fehlermeldungen hinter den @ts-expect-error-Zeilen
```

- `src/basics/` gehört zu ts-m1, `src/advanced/` zu ts-m2.
- `// @ts-expect-error` markiert Zeilen, die absichtlich nicht kompilieren. Meldet `tsc` dort keinen Fehler, schlägt der Check fehl.
  Diese Funktionen heißen `erwarteteFehler` und werden nie aufgerufen.
- `tsconfig.json` ist strikt (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `erasableSyntaxOnly`, …) und passt zu
  Node.js, das Typen nur entfernt und nicht prüft.
- Code und Texte sind eigene Arbeit (Lizenz siehe `LICENSE`, `LICENSE-CONTENT`); die offiziellen Dokumentationen werden nur verlinkt.
