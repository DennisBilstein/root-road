/* Werkstattaufgaben der Spur css (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'css-w1',modules:['css-m1'],level:'schwer',type:'write',language:'css',rows:22,
    title:'Responsives Kartenraster mit Tokens',
    text:'Schreibe das Stylesheet für ein Raster aus Karten, das ohne feste Breakpoints von einer auf mehrere Spalten wächst.',
    details:['Design-Tokens als Custom Properties in :root (mindestens --gap und --card-min).','.cards: Grid mit repeat(auto-fit, minmax(min(100%, var(--card-min)), 1fr)) und gap aus dem Token.','.card: padding, border, border-radius, box-sizing: border-box.','Hover-Effekt nur dort, wo es Hover gibt (@media (hover: hover)); sichtbarer Fokus für .card:focus-within.','Bewegung abschalten bei @media (prefers-reduced-motion: reduce).'],
    starter:L('/* Schreibe hier dein Stylesheet */','',''),
    rules:[
      need('Custom Properties --gap und --card-min in :root',/:root\s*\{[^}]*--gap\s*:[^}]*--card-min\s*:|:root\s*\{[^}]*--card-min\s*:[^}]*--gap\s*:/i),
      need('.cards ist ein Grid',/\.cards\s*\{[^}]*\bdisplay\s*:\s*grid\b/i),
      need('auto-fit mit minmax(min(100%, var(--card-min)), 1fr)',/repeat\s*\(\s*auto-fit\s*,\s*minmax\s*\(\s*min\s*\(\s*100%\s*,\s*var\(\s*--card-min\s*\)\s*\)\s*,\s*1fr\s*\)\s*\)/i,/\.cards\s*\{/i),
      need('Abstand über var(--gap)',/\bgap\s*:\s*var\(\s*--gap\s*\)/i,/\.cards\s*\{/i),
      need('.card mit padding, border, border-radius und box-sizing',/\.card\s*\{(?=[^}]*\bpadding\s*:)(?=[^}]*\bborder\s*:)(?=[^}]*\bborder-radius\s*:)(?=[^}]*\bbox-sizing\s*:\s*border-box)[^}]*\}/i),
      need('Hover nur mit @media (hover: hover)',/@media\s*\(\s*hover\s*:\s*hover\s*\)[\s\S]*:hover/i),
      need('Fokus mit .card:focus-within',/\.card:focus-within\s*\{[^}]*\boutline\b/i),
      need('@media (prefers-reduced-motion: reduce)',/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i),
      bad(/!important/i,'!important zerstört die Kaskade. Lege lieber die Reihenfolge und Spezifität richtig an.'),
      bad(/\bwidth\s*:\s*\d+px\b/i,'Feste Breiten in px sprengen kleine Bildschirme. Nutze Grid, %, rem oder minmax.'),
      bad(/\boutline\s*:\s*(?:none|0)\s*;/i,'Nimm niemals den Fokusrahmen weg, ohne einen sichtbaren Ersatz zu geben.')
    ],
    solution:L(':root {','  --gap: 1rem;','  --card-min: 16rem;','}','','.cards {','  display: grid;','  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min)), 1fr));','  gap: var(--gap);','}','','.card {','  box-sizing: border-box;','  padding: 1rem;','  border: 1px solid #8a94a6;','  border-radius: 0.5rem;','  transition: transform 0.2s ease;','}','','.card:focus-within {','  outline: 3px solid #1b5fd1;','  outline-offset: 2px;','}','','@media (hover: hover) {','  .card:hover {','    transform: translateY(-2px);','  }','}','','@media (prefers-reduced-motion: reduce) {','  .card {','    transition: none;','  }','}'),
    hint:'auto-fit mit minmax erzeugt so viele Spalten, wie in die Breite passen. min(100%, …) verhindert Überlauf auf sehr schmalen Bildschirmen.',
    why:'Intrinsisches Layout reagiert auf den verfügbaren Platz statt auf Gerätebreiten. Tokens halten Werte an einer Stelle, und Rücksicht auf Hover, Fokus und Bewegung gehört zur Barrierefreiheit.'},
  {id:'css-w2',modules:['css-m2'],level:'schwer',type:'write',language:'css',rows:24,
    title:'Farbschema, Fokus und Touch-Ziele',
    text:'Schreibe die Basisstile für Hell- und Dunkelmodus, einen sichtbaren Tastaturfokus und gut treffbare Buttons.',
    details:['Auf :root: color-scheme: light dark und Farb-Tokens --bg und --text für den Hellmodus.','Ein @media (prefers-color-scheme: dark)-Block überschreibt die Tokens im Dunkelmodus.','body nutzt die Tokens (background und color per var).','a:focus-visible und .btn:focus-visible bekommen einen deutlichen outline-Rahmen mit outline-offset.','.btn ist mindestens 44px (oder 2.75rem) hoch.','@media (prefers-reduced-motion: reduce) schaltet Animationen ab.'],
    starter:L('/* Schreibe hier dein Stylesheet */','',''),
    rules:[
      need('color-scheme: light dark',/\bcolor-scheme\s*:\s*light\s+dark\b/i),
      need('Tokens --bg und --text',/--bg\s*:[\s\S]*--text\s*:|--text\s*:[\s\S]*--bg\s*:/i),
      need('@media (prefers-color-scheme: dark) mit eigenen Tokens',/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{[\s\S]*--bg\s*:/i),
      need('body nutzt var(--bg) und var(--text)',/\bbody\s*\{(?=[^}]*\bbackground(?:-color)?\s*:\s*var\(\s*--bg\s*\))(?=[^}]*\bcolor\s*:\s*var\(\s*--text\s*\))[^}]*\}/i),
      need('a:focus-visible mit outline',/\ba:focus-visible\b[^{]*\{[^}]*\boutline\s*:\s*[^;]*\d/i),
      need('.btn:focus-visible mit outline-offset',/\.btn:focus-visible\b[^{]*\{[^}]*\boutline-offset\s*:/i),
      need('.btn ist mindestens 44px hoch',/\.btn\s*\{[^}]*\bmin-height\s*:\s*(?:44px|2\.75rem|3rem)/i),
      need('@media (prefers-reduced-motion: reduce)',/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i),
      bad(/\boutline\s*:\s*(?:none|0)\s*;/i,'Nimm niemals den Fokusrahmen weg, ohne einen sichtbaren Ersatz zu geben.'),
      bad(/\bmin-height\s*:\s*(?:[1-3]?\d)px\b/i,'Touch-Ziele brauchen mindestens 44 × 44 px (WCAG 2.2 empfiehlt 24 px als Minimum, 44 px als Ziel).'),
      bad(/:focus\s*\{[^}]*\boutline\s*:\s*(?:none|0)/i,'Auch :focus darf den Rahmen nicht entfernen.')
    ],
    solution:L(':root {','  color-scheme: light dark;','  --bg: #ffffff;','  --text: #14202e;','}','','@media (prefers-color-scheme: dark) {','  :root {','    --bg: #0e141c;','    --text: #e6ecf5;','  }','}','','body {','  background: var(--bg);','  color: var(--text);','}','','a:focus-visible,','.btn:focus-visible {','  outline: 3px solid currentColor;','  outline-offset: 3px;','}','','.btn {','  min-height: 44px;','  padding: 0.5rem 1rem;','}','','@media (prefers-reduced-motion: reduce) {','  * {','    animation: none !important;','    transition: none !important;','  }','}'),
    hint:'Dunkelmodus ist nur ein anderer Satz Token-Werte. :focus-visible zeigt den Rahmen für die Tastatur, nicht bei jedem Mausklick.',
    why:'Mit Tokens und color-scheme folgt die Seite der Systemeinstellung. Sichtbarer Fokus und große Ziele sind Pflicht (WCAG 2.2: 2.4.7, 2.5.8).'}
];
W.add('css',tasks);
})();
