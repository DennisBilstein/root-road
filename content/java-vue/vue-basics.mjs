// Vue-Grundlagen: die neun Lektionen js-m1-l8 bis js-m1-l16 (Einstieg bis Abschlussprojekt).
// Stichtag 23.11.2026. Eigene Texte; Code und Tests liegen unter content/examples/vue-lab/ (src/, src/lessons/basics/, tests/).
// Vue-Dokumentation: CC BY 4.0 (© Evan You und Mitwirkende). Vue Router, Pinia, Vitest und Vue Test Utils: MIT. Es wird kein fremder Code übernommen.
const lab = 'content/examples/vue-lab/';
const vueDocs = (title, url, note = 'Offizielle Vue-Dokumentation (CC BY 4.0, © Evan You und Mitwirkende); Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const mit = (title, url, who) => ({ title, url, note: `Offizielle Dokumentation (${who}, MIT-Lizenz); Inhalt hier eigenständig zusammengefasst.` });
const linkOnly = (title, url, note = 'Nur verlinkt und zusammengefasst; Rechte liegen bei den jeweiligen Herausgebern.') => ({ title, url, note });

export const lessons = [
  // ───────────────────────────── l8: Einstieg ─────────────────────────────
  {
    id: 'js-m1-l8', title: 'Vue-Einstieg: Single-File-Komponenten und script setup', minutes: 40,
    prerequisites: 'JavaScript-Grundlagen (js-m1-l1 bis l7), HTML und CSS im Überblick. Vue wird in einem Vite-Projekt ausgeführt, nicht als normales Node-Skript.',
    objectives: [
      'Aufbau einer Single-File-Komponente (SFC) mit Script, Template und Styles beschreiben',
      'Erklären, dass der Code in script setup für jede Komponenteninstanz neu läuft, ein normaler script-Block dagegen nur einmal je Modul',
      'Mit ref veränderlichen Zustand anlegen und im Script (.value) und im Template (automatisch entpackt) lesen',
      'Begründen, warum {{ }} fremden Text sicher als Text zeigt und v-html nicht',
    ],
    simple: `Eine Vue-Komponente ist ein Baustein der Oberfläche: Sie besitzt eigene Daten, ein Stück HTML und manchmal eigene Gestaltung. In einer Single-File-Komponente (Datei mit der Endung .vue) stehen alle drei beieinander: das Script oben, das Template darunter, optional Styles.

Der wichtigste Satz dieser Lektion: Der Code in script setup läuft für jede Instanz neu. Setzt du zwei Zähler auf die Seite, bekommt jeder sein eigenes count. Das ist das, was man von einem Baustein erwartet, und es ist anders als bei einer Variablen am Anfang einer normalen JavaScript-Datei, die einmal pro Modul entsteht und von allen geteilt wird.

Damit sich die Oberfläche ändert, wenn sich ein Wert ändert, muss Vue den Wert kennen. Dafür gibt es ref: Die Variable ist eine kleine Hülle mit dem Wert in .value. Im Template schreibst du nur count, Vue packt den Wert dort selbst aus. Eine gewöhnliche let-Variable würde sich zwar ändern, aber Vue würde nichts davon bemerken und nichts neu zeichnen.`,
    steps: [
      'Counter.vue beginnt mit <script setup lang="ts">. Das ist Compiler-Syntax: Alles, was auf oberster Ebene deklariert wird (Variablen, Funktionen, Importe), steht dem Template zur Verfügung, ohne dass man es zurückgeben muss.',
      'defineProps<{ label: string }>() deklariert die Eingabe der Komponente. defineProps ist ein Compiler-Makro und wird nicht importiert. Hier wird label nur im Template gebraucht, deshalb braucht es keine Variable dafür.',
      'const count = ref(0) legt den Zustand an. Im Script heißt er count.value, im Template reicht count (automatisches Auspacken auf oberster Ebene).',
      'Im Template ruft @click="count++" die Erhöhung auf. Die Schreibweise ist erlaubt, weil Vue im Template .value selbst ergänzt.',
      '{{ label }} gibt den Text aus und maskiert dabei HTML: Ein Label wie <b>fett</b> erscheint als sichtbarer Text, nicht als fetter Text. Das macht Interpolation sicherer als v-html, das ungeprüftes HTML einsetzt.',
      'Der Test mountet zwei Counter und klickt nur den ersten: Er zeigt 2, der zweite bleibt bei 0. Damit ist belegt, dass jede Instanz eigenen Zustand hat.',
      'SharedCounter.vue zeigt die Falle: In einem normalen <script>-Block steht const shared = ref(0). Dieser Block läuft einmal pro Modul, also teilen sich alle Instanzen diesen Zustand. Der Test klickt die erste Instanz, und beide zeigen 1.',
    ],
    background: `Warum gibt es zwei Arten von Script-Blöcken? Ein Vue-Template wird in eine Funktion übersetzt, die bei jedem Rendern aufgerufen wird. Der Setup-Code erzeugt vorher den Zustand, auf den sich diese Funktion bezieht. Für jede Instanz muss das neu geschehen, sonst würden sich Komponenten gegenseitig überschreiben. Ein normaler script-Block ist dagegen einfaches Modul-JavaScript: Er läuft, sobald die Datei zum ersten Mal importiert wird. Dort gehören Dinge hin, die wirklich nur einmal gebraucht werden (eine Konstante, ein benannter Export).

Der Compiler erledigt in script setup viel Handarbeit: Er ergänzt .value im Template, macht Top-Level-Bindings sichtbar und prüft bei TypeScript die Props gegen ihren Typ. Was er nicht tut: Er macht gewöhnliche Variablen reaktiv. Reaktiv wird nur, was in ref, reactive oder computed steckt.

Die Options API (data, methods, computed als Objekt) bleibt von Vue unterstützt und ist für viele bestehende Projekte weiter richtig. Dieser Kurs nutzt die Composition API mit script setup, weil sich Logik dort leichter in Funktionen auslagern und testen lässt (siehe Lektion zu Composables).`,
    terms: [
      { term: 'Single-File-Komponente', text: 'Eine .vue-Datei, die Script, Template und optional Styles einer Komponente zusammenfasst. Sie wird vom Build-Werkzeug (Vite) übersetzt und läuft nicht direkt in Node.' },
      { term: 'script setup', text: 'Kompakte Schreibweise der Composition API. Der Code läuft pro Instanz; Top-Level-Bindings stehen im Template bereit.' },
      { term: 'ref', text: 'Hülle um einen Wert in .value. Änderungen werden von Vue bemerkt, die Oberfläche aktualisiert sich.' },
      { term: 'Interpolation', text: 'Die Schreibweise {{ ausdruck }} im Template. Das Ergebnis wird als Text eingesetzt, HTML wird dabei maskiert.' },
      { term: 'Compiler-Makro', text: 'Funktion wie defineProps oder defineEmits, die nur der Vue-Compiler kennt. Sie wird nicht importiert und existiert zur Laufzeit nicht.' },
    ],
    code: { file: lab + 'src/lessons/basics/Counter.vue', lang: 'Vue' },
    code2: { file: lab + 'src/lessons/basics/SharedCounter.vue', lang: 'Vue' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/basics.spec.ts, Block „script setup und Instanzen“): 3 Tests grün
 - Zähler A zweimal geklickt: "A: 2"; Zähler B: "B: 0"
 - label "<b>fett</b>": kein <b>-Element, der Text enthält die Zeichen "<b>fett</b>"
 - zwei SharedCounter: ein Klick ändert beide Anzeigen auf "Geteilt: 1"`,
    mistakes: [
      { wrong: 'Eine normale let-Variable zu ändern und zu erwarten, dass sich die Oberfläche aktualisiert.',
        why: 'Vue beobachtet nur Werte in ref, reactive oder computed. Eine gewöhnliche Variable ändert sich, aber niemand merkt es.',
        fix: 'Veränderlichen Zustand mit ref anlegen. Im Script .value verwenden, im Template den Namen ohne .value.' },
      { wrong: 'Veränderlichen Zustand in einen normalen script-Block oder in eine Datei auf Modulebene zu legen.',
        why: 'Dieser Code läuft nur einmal je Modul; alle Instanzen teilen den Wert. Das fällt oft erst auf, wenn eine Komponente zum zweiten Mal benutzt wird.',
        fix: 'Zustand in script setup anlegen. Gewollt geteilten Zustand bewusst in einen Store (Pinia) oder ein Composable mit geteiltem Zustand legen und so benennen.' },
      { wrong: 'v-html zu verwenden, damit Titel oder Kommentare aus Nutzereingaben formatiert erscheinen.',
        why: 'v-html setzt den Text als HTML ein. Enthält er ein Skript-Element oder einen Event-Handler, ist das eine Lücke für Cross-Site-Scripting.',
        fix: 'Mit {{ }} als Text ausgeben. Wirklich benötigtes HTML nur aus vertrauenswürdiger Quelle oder nach Bereinigung mit einer geprüften Bibliothek einsetzen.' },
      { wrong: 'Im Template count.value zu schreiben.',
        why: 'Refs auf oberster Ebene werden im Template automatisch ausgepackt. Mit .value würde man versuchen, auf eine Zahl zuzugreifen, die bereits entpackt ist.',
        fix: 'Im Template nur count schreiben. Auf .value kommt es im Script an. Achtung: Ein ref, der in einem Objekt steckt, wird in Berechnungen im Template nicht entpackt (dort bleibt .value nötig).' },
      { wrong: 'Eine .vue-Datei mit node datei.vue ausführen zu wollen.',
        why: 'SFCs sind kein JavaScript. Erst der Build (Vite mit dem Vue-Plugin) wandelt sie in ausführbaren Code um.',
        fix: 'Projekt mit npm run dev starten oder die Komponente in einem Test mit Vitest und Vue Test Utils mounten.' },
    ],
    practice: 'Lege eine kleine Komponente an und prüfe vor dem Weitermachen drei Dinge: Funktioniert sie auch, wenn du sie zweimal auf die Seite setzt? Erscheint Text mit spitzen Klammern als Text? Ist der Knopf ein echtes <button> mit type="button", der sich per Tastatur auslösen lässt? Diese drei Prüfungen finden die meisten Anfängerfehler, bevor sie in größeren Komponenten vergraben sind.',
    exercises: [
      { task: 'Baue eine Komponente Greeting.vue mit einer Prop name und einem Eingabefeld, das den Gruß live anzeigt (ref plus v-model). Schreibe einen Test, der sie mountet, einen Namen eintippt und den Gruß prüft.', acceptance: 'Die Anzeige folgt der Eingabe; im Test wird setValue verwendet; die Komponente benutzt ref und kein let.' },
      { task: 'Grenzfall: Mounte zwei Instanzen derselben Komponente und ändere nur eine. Wiederhole den Versuch mit einer Komponente, die ihren Zustand in einem normalen script-Block hält, und erkläre den Unterschied.', acceptance: 'Beobachtung: Mit script setup bleibt die zweite Instanz unverändert, mit normalem script-Block ändert sie sich mit. Die Erklärung nennt „einmal pro Modul“ gegen „pro Instanz“.' },
      { task: 'Fehlerfall: Übergib als Text <img src=x onerror=alert(1)> an die Komponente, einmal mit {{ }} und einmal (nur im Testprojekt) mit v-html. Beschreibe, was jeweils im DOM entsteht.', acceptance: 'Mit {{ }} entsteht kein img-Element, der Text ist sichtbar; mit v-html entsteht ein img-Element. Der v-html-Versuch wird danach wieder entfernt.' },
    ],
    quiz: [
      { q: 'Wann läuft der Code in script setup?',
        options: ['Für jede neue Komponenteninstanz, also für jeden Zähler neu', 'Genau einmal pro Anwendung, beim ersten Import der Datei', 'Nur, wenn die Komponente im Template ein v-if enthält'],
        correct: 0,
        rationales: ['Deshalb haben zwei Zähler getrennten Zustand; der Test zeigt A: 2 und B: 0.', 'Das gilt für einen normalen script-Block (Modulcode), nicht für script setup.', 'v-if hat mit dem Zeitpunkt des Setup-Codes nichts zu tun.'],
        explain: 'script setup ist die Setup-Funktion der Komponente: Sie läuft pro Instanz; ein normaler script-Block läuft einmal pro Modul.' },
      { q: 'Ein Titel enthält die Zeichen <b>fett</b>. Was zeigt {{ title }} im Template?',
        options: ['Fett gedruckten Text, weil Vue das HTML auswertet', 'Die Zeichen <b>fett</b> als sichtbaren Text', 'Eine Fehlermeldung, weil spitze Klammern nicht erlaubt sind'],
        correct: 1,
        rationales: ['Das würde v-html tun und ist deshalb für fremde Texte gefährlich.', 'Die Interpolation maskiert HTML; im Test gibt es kein b-Element.', 'Spitze Klammern in Daten sind erlaubt; Vue maskiert sie nur.'],
        explain: 'Interpolation setzt Text ein und maskiert HTML. v-html dagegen würde den Text als Markup einsetzen.' },
      { q: 'Warum ändert sich die Anzeige nicht, wenn eine normale let-Variable im Script hochgezählt wird?',
        options: ['Weil let in Vue-Dateien nicht erlaubt ist', 'Weil nur Werte in ref, reactive oder computed von Vue beobachtet werden', 'Weil die Variable erst nach einem Neustart des Servers neu gelesen wird'],
        correct: 1,
        rationales: ['let ist erlaubt, es ist nur nicht reaktiv.', 'Reaktivität entsteht durch die Hülle: Ohne sie weiß Vue nicht, dass sich etwas geändert hat.', 'Ein Neustart ist nicht beteiligt; es geht um das Beobachten von Änderungen.'],
        explain: 'Vue erkennt nur Änderungen an reaktiven Werten. Veränderlicher UI-Zustand gehört deshalb in ref.' },
    ],
    sources: [
      vueDocs('Vue: Single-File Components', 'https://vuejs.org/guide/scaling-up/sfc.html'),
      vueDocs('Vue: <script setup>', 'https://vuejs.org/api/sfc-script-setup.html'),
      vueDocs('Vue: Reactivity Fundamentals (ref)', 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html'),
      vueDocs('Vue: Security (Injection von HTML)', 'https://vuejs.org/guide/best-practices/security.html'),
    ],
    verification: 'Die Tests im vue-lab (Vue 3.5.45, @vue/test-utils 2.4.11, jsdom) sind grün, vue-tsc ist fehlerfrei. NICHT geprüft: Verhalten in verschiedenen echten Browsern, Server-Rendering und das Verhalten der Options API.',
  },

  // ───────────────────────────── l9: Reaktivität ─────────────────────────────
  {
    id: 'js-m1-l9', title: 'Reaktivität: ref, computed, watch und Aufräumen', minutes: 45,
    prerequisites: 'Lektion „Vue-Einstieg“ (js-m1-l8); Closures und Callbacks (js-m1-l2); Referenzen (js-m1-l3).',
    objectives: [
      'Den Unterschied zwischen ref und reactive nennen und erklären, warum Destrukturieren eines reactive-Objekts die Verbindung verliert',
      'computed (abgeleiteter, zwischengespeicherter Wert ohne Nebenwirkung) von watch (ausdrücklicher Seiteneffekt) unterscheiden',
      'Den Zeitpunkt eines Watchers bestimmen (Standard: gebündelt vor dem nächsten Rendern; flush "sync": sofort)',
      'Ressourcen wie Timer mit onScopeDispose oder onUnmounted aufräumen',
    ],
    simple: `Reaktivität heißt: Du änderst einen Wert, und alles, was davon abhängt, aktualisiert sich selbst. Dafür brauchst du nur drei Werkzeuge. ref hält einen Wert. computed leitet aus anderen Werten einen neuen ab (zum Beispiel „Wochenminuten = Minuten mal drei“) und rechnet nur dann neu, wenn sich etwas Benutztes geändert hat. watch führt einen Seiteneffekt aus, wenn sich ein Wert ändert: etwas speichern, einen Request starten, eine Meldung schreiben.

Die Faustregel: Wenn du einen Wert aus anderen berechnen kannst, nimm computed. Wenn etwas passieren soll, weil sich ein Wert geändert hat, nimm watch. Wer einen Wert per watch in einen zweiten ref kopiert, hat zwei Quellen der Wahrheit, die irgendwann auseinanderlaufen.

Das dritte Thema ist Aufräumen. Ein Timer, ein offener Request oder ein Event-Listener lebt weiter, wenn die Komponente längst verschwunden ist. Vue bindet Watcher und computed, die während des Setups angelegt werden, an die Komponente und stoppt sie beim Entfernen automatisch. Für alles andere (setInterval, fetch, addEventListener) musst du selbst aufräumen, mit onScopeDispose.`,
    steps: [
      'useWeeklyPlan legt minutes als ref(20) an und leitet weekly = minutes * 3 mit computed ab. Wer weekly liest, bekommt 60; ändert sich minutes, ändert sich weekly.',
      'watch(minutes, value => onChange(value)) ist der Seiteneffekt: Bei jeder Änderung meldet die Funktion den neuen Wert nach außen. Der Test sammelt die Werte und erwartet [25] nach einer Änderung von 20 auf 25.',
      'computed ist träge und merkt sich das Ergebnis. Im Test zählt ein Spion die Aufrufe des Getters: Zweimal lesen ergibt einen Aufruf, erst nach einer Änderung von minutes kommt ein zweiter.',
      'watch läuft standardmäßig gebündelt vor dem nächsten Rendern (flush: "pre"). Setzt man minutes zweimal hintereinander, läuft der Callback danach einmal, mit dem letzten Wert 22. Mit flush: "sync" läuft er bei jeder Änderung sofort (zweimal). Der DOM-Zustand ist zu beiden Zeitpunkten noch der alte.',
      'Aus einem reactive-Objekt zu destrukturieren (const { minutes } = state) kopiert nur den Zahlenwert. toRef(state, "minutes") behält die Verbindung: Der Test zeigt 20 gegen 25.',
      'useTicker startet mit setInterval einen Zähler und räumt ihn mit onScopeDispose(() => clearInterval(timer)) auf. Der Test lässt 350 ms vergehen (3 Takte), stoppt den Scope und prüft, dass danach keine Takte mehr kommen und kein Timer übrig ist.',
      'effectScope fasst Effekte zusammen und beendet sie mit scope.stop(). In einer Komponente übernimmt Vue diese Rolle selbst; in Tests und in Composables außerhalb von Komponenten erzeugt man einen Scope von Hand.',
    ],
    background: `Warum bündelt watch Änderungen? Würde jeder einzelne Schreibzugriff sofort einen Callback und ein Rendern auslösen, würde eine Schleife mit hundert Änderungen hundert Aktualisierungen erzeugen. Vue sammelt Änderungen deshalb und führt Watcher und Rendern gebündelt aus. Das spart Arbeit, bedeutet aber: Direkt nach einer Änderung ist das DOM noch alt. Wer den neuen DOM-Zustand braucht, wartet mit await nextTick(). Mit flush: "post" läuft ein Watcher nach dem Rendern, mit flush: "sync" sofort (selten sinnvoll, weil er die Bündelung aufgibt).

Warum verliert Destrukturieren die Verbindung? reactive verpackt ein Objekt in einen Proxy, der beim Zugriff auf Eigenschaften mitschreibt, wer sie liest. Beim Destrukturieren wird die Eigenschaft einmal gelesen und die Zahl in eine normale Variable kopiert; danach gibt es keinen Proxy mehr dazwischen. Mit toRef oder toRefs entstehen Refs, die auf die Eigenschaft zeigen. Ein ref selbst hat dieses Problem nicht, weil der Wert immer über .value gelesen wird.

Warum computed ohne Nebenwirkungen? Ein computed kann beliebig oft und beliebig spät ausgewertet werden. Schreibt es nebenbei in andere Werte oder startet Requests, hängt das Ergebnis von der Reihenfolge der Zugriffe ab. Reine Berechnung macht das Verhalten vorhersagbar.`,
    terms: [
      { term: 'computed', text: 'Abgeleiteter Wert. Wird beim ersten Lesen berechnet, zwischengespeichert und nur nach einer Änderung einer benutzten Quelle neu berechnet. Soll rein sein.' },
      { term: 'watch', text: 'Führt eine Funktion aus, wenn sich eine beobachtete Quelle ändert. Für Seiteneffekte wie Speichern oder Anfragen gedacht.' },
      { term: 'flush', text: 'Zeitpunkt, zu dem ein Watcher läuft: "pre" (Standard, vor dem Rendern), "post" (nach dem Rendern), "sync" (sofort).' },
      { term: 'effectScope', text: 'Container für Effekte (computed, watch). scope.stop() beendet alle darin angelegten Effekte auf einmal.' },
      { term: 'onScopeDispose', text: 'Registriert eine Aufräumfunktion, die beim Ende des aktuellen Scopes läuft, zum Beispiel beim Entfernen der Komponente.' },
    ],
    code: { file: lab + 'src/lessons/basics/weeklyPlan.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/basics.spec.ts', lang: 'TypeScript', from: "describe('Reaktivität, computed, watch", to: "expect(vi.getTimerCount()).toBe(0);", plus: 3 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/basics.spec.ts, Block „Reaktivität, computed, watch und Aufräumen“): 5 Tests grün
 - computed: Getter nach zweimaligem Lesen 1 Aufruf, nach Änderung 2 Aufrufe (Werte 60, 60, 75)
 - watch: sync-Watcher 2 Aufrufe sofort; Standard-Watcher erst nach nextTick, einmal mit dem Wert 22
 - useWeeklyPlan: weekly 60 -> 75; onChange erhielt [25]
 - reactive: destrukturierter Wert bleibt 20, toRef zeigt 25
 - Timer: 3 Takte nach 350 ms; nach scope.stop() weiterhin 3, getTimerCount() = 0`,
    mistakes: [
      { wrong: 'Einen Wert mit watch in einen zweiten ref zu kopieren, statt ihn mit computed abzuleiten.',
        why: 'Zwei Quellen der Wahrheit laufen auseinander, vor allem bei Fehlern oder wenn der Watcher einmal nicht ausgelöst wird.',
        fix: 'Abgeleitete Werte mit computed berechnen; watch nur für Seiteneffekte wie Speichern, Anfragen oder Protokollieren.' },
      { wrong: 'In einem computed Requests zu starten oder andere Werte zu verändern.',
        why: 'Ein computed kann mehrfach oder zu unerwarteten Zeitpunkten ausgewertet werden. Nebenwirkungen machen das Ergebnis von der Reihenfolge abhängig.',
        fix: 'computed bleibt reine Berechnung. Seiteneffekte gehören in watch oder in eine Funktion, die ein Ereignis auslöst.' },
      { wrong: 'Ein reactive-Objekt zu destrukturieren und anzunehmen, die Variablen blieben aktuell.',
        why: 'Beim Destrukturieren wird der Wert kopiert, der Proxy fällt weg.',
        fix: 'toRefs oder toRef verwenden, oder gleich einzelne refs anlegen. Für ganze Objekte lieber ref({ ... }) verwenden und über .value arbeiten.' },
      { wrong: 'setInterval, fetch oder addEventListener zu starten und nach dem Entfernen der Komponente weiterlaufen zu lassen.',
        why: 'Die Ressource lebt weiter, hält Speicher und kann später veraltete Daten in nicht mehr vorhandene Zustände schreiben.',
        fix: 'Mit onScopeDispose oder onUnmounted aufräumen (clearInterval, abort, removeEventListener) und im Test prüfen, dass kein Timer übrig bleibt.' },
      { wrong: 'Direkt nach einer Änderung den neuen DOM-Zustand zu lesen.',
        why: 'Änderungen werden gebündelt; das DOM ist erst nach dem nächsten Rendern aktuell.',
        fix: 'Mit await nextTick() warten, oder den Wert aus dem Zustand statt aus dem DOM lesen.' },
    ],
    practice: 'Frage dich bei jedem Watcher: Könnte ein computed oder ein Ereignis in einem Handler dasselbe leisten? Meist ja. Wenn du einen Watcher wirklich brauchst, schreibe auf, was er aufräumen muss, und prüfe das im Test: Ein Timer, der nach dem Stoppen des Scopes noch läuft, fällt dort sofort auf, in der Oberfläche oft erst nach Wochen.',
    exercises: [
      { task: 'Baue ein Composable useTotal, das aus einer Liste von Minutenwerten (ref) die Summe und den Durchschnitt mit computed ableitet. Schreibe einen Test mit drei Werten und prüfe beide Ergebnisse nach einer Änderung.', acceptance: 'Summe und Durchschnitt aktualisieren sich nach jeder Änderung; es wird kein watch verwendet; der Durchschnitt ist bei leerer Liste 0 und nicht NaN.' },
      { task: 'Grenzfall: Beobachte mit watch einen Wert, der innerhalb derselben Tick-Phase dreimal gesetzt wird. Zähle die Aufrufe mit Standard-Flush und mit flush: "sync" und begründe den Unterschied.', acceptance: 'Standard: ein Aufruf mit dem letzten Wert; sync: drei Aufrufe. Die Begründung nennt die Bündelung der Änderungen.' },
      { task: 'Fehlerfall: Baue einen Timer ohne Aufräumen, stoppe den Scope und zeige mit vi.getTimerCount(), dass er weiterläuft. Ergänze dann onScopeDispose und zeige, dass kein Timer übrig bleibt.', acceptance: 'Vor der Korrektur ist der Zähler größer als 0, nach der Korrektur 0; der Test schlägt vor der Korrektur fehl und besteht danach.' },
    ],
    quiz: [
      { q: 'Welche Aufgabe passt am besten zu computed?',
        options: ['Einen Wert aus vorhandenen reaktiven Werten ableiten, zum Beispiel Minuten mal drei', 'Bei jedem Lesen eine Anfrage an den Server schicken', 'Einen geheimen Schlüssel vor dem Nutzer verstecken'],
        correct: 0,
        rationales: ['Das ist der Kern von computed: reine Ableitung, zwischengespeichert.', 'Anfragen sind Seiteneffekte und gehören nicht in ein computed.', 'Reaktivität hat mit Geheimhaltung nichts zu tun; Clientcode ist öffentlich.'],
        explain: 'computed ist für reine, abgeleitete Werte; Seiteneffekte gehören in watch oder Ereignisbehandlung.' },
      { q: 'minutes wird in einem Durchgang zweimal gesetzt (21, dann 22). Wie oft läuft ein Standard-watch danach?',
        options: ['Zweimal, einmal pro Zuweisung', 'Einmal, mit dem letzten Wert 22, nach der Bündelung', 'Gar nicht, weil sich Zahlen nicht beobachten lassen'],
        correct: 1,
        rationales: ['Das ist das Verhalten von flush: "sync", nicht des Standards.', 'Vue bündelt Änderungen; der Callback läuft vor dem nächsten Rendern mit dem aktuellen Wert.', 'Auch Zahlen in einem ref lassen sich beobachten.'],
        explain: 'Der Standard-Flush bündelt Änderungen; erst flush: "sync" ruft bei jeder Zuweisung sofort auf.' },
      { q: 'Warum gehört ein setInterval in ein Composable zusammen mit onScopeDispose?',
        options: ['Damit der Timer nach dem Entfernen der Komponente nicht weiterläuft und keinen Speicher hält', 'Damit der Timer schneller läuft', 'Weil setInterval ohne onScopeDispose einen Syntaxfehler auslöst'],
        correct: 0,
        rationales: ['Aufräumen verhindert Speicherlecks und späte Schreibzugriffe auf nicht mehr vorhandenen Zustand.', 'Die Geschwindigkeit bleibt gleich; es geht um das Beenden.', 'Es gibt keinen Syntaxfehler; der Fehler wäre leise und erst später sichtbar.'],
        explain: 'Selbst gestartete Ressourcen werden von Vue nicht automatisch beendet; onScopeDispose bindet sie an den Lebenszyklus.' },
    ],
    sources: [
      vueDocs('Vue: Reactivity Fundamentals', 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html'),
      vueDocs('Vue: Computed Properties', 'https://vuejs.org/guide/essentials/computed.html'),
      vueDocs('Vue: Watchers (flush, Aufräumen)', 'https://vuejs.org/guide/essentials/watchers.html'),
      vueDocs('Vue: Effect Scope API', 'https://vuejs.org/api/reactivity-advanced.html#effectscope'),
      vueDocs('Vue: Lifecycle Hooks', 'https://vuejs.org/guide/essentials/lifecycle.html'),
    ],
    verification: 'Die Tests im vue-lab laufen grün; Zeitabläufe nutzen Fake-Timer von Vitest. NICHT geprüft: Verhalten im echten Browser mit Rendern, Speicherlecks über längere Zeit und Watcher in Komponenten mit Server-Rendering.',
  },

  // ───────────────────────────── l10: Props, Emits, Slots, Formulare ─────────────────────────────
  {
    id: 'js-m1-l10', title: 'Props, Emits, Slots und zugängliche Formulare', minutes: 50,
    prerequisites: 'Lektionen „Vue-Einstieg“ (js-m1-l8) und „Reaktivität“ (js-m1-l9); HTML-Formulare (js-m1-l5).',
    objectives: [
      'Den Datenfluss „Props nach unten, Events nach oben“ erklären und begründen, warum ein Kind eine Prop nicht verändert',
      'Props und Emits mit TypeScript typisieren und im Test über emitted prüfen',
      'Einen benannten Slot anbieten und nutzen, ohne dass das Kind den Inhalt kennt',
      'Ein Formular mit Label, textlicher Fehlermeldung, aria-invalid und erhaltenem Eingabewert bauen',
    ],
    simple: `Komponenten sprechen in zwei Richtungen miteinander. Nach unten geben Props Daten weiter: Die Liste sagt dem Listeneintrag „das ist deine Aufgabe“. Nach oben melden Events Wünsche: Der Eintrag sagt der Liste „der Nutzer möchte diese Aufgabe umschalten“. Das Kind ändert die Aufgabe nie selbst. Es meldet mit der ID, und die Komponente, die den Zustand besitzt, entscheidet.

Das klingt umständlich, ist aber der Grund, warum man Komponenten versteht und testet: Es gibt genau einen Ort, an dem sich ein Wert ändert. Würde jedes Kind seine Prop direkt verändern, wüsste man bei einem falschen Wert nicht mehr, wer ihn gesetzt hat.

Slots sind Platzhalter, die der Elternteil füllt. TaskItem bietet einen benannten Slot meta an; die Liste setzt dort eine kleine Nummer ein. Das Kind muss nichts über den Inhalt wissen.

Formulare sind der Ort, an dem Barrierefreiheit zählt. Ein Feld braucht ein sichtbares Label, eine Fehlermeldung als Text (nicht nur eine rote Farbe) und muss die Eingabe behalten, wenn etwas abgelehnt wird.`,
    steps: [
      'TaskItem.vue deklariert defineProps<{ task: Task }>() und defineEmits<{ toggle: [id: number] }>(). Die Typen beschreiben den Vertrag: Eine Aufgabe kommt hinein, ein Ereignis toggle mit der Zahl id geht hinaus.',
      'Die Checkbox ist <input type="checkbox" :checked="task.done"> mit @change="emit(\'toggle\', task.id)". Sie zeigt den Zustand der Prop an und verändert sie nicht.',
      'Der Titel steht in {{ task.title }}. Weil Interpolation HTML maskiert, erscheint ein Titel wie <img src=x onerror=alert(1)> als Text. Der Test belegt das: kein img-Element, task.done bleibt false, emitted("toggle") ist [[7]].',
      '<slot name="meta" /> ist die Stelle für Zusatzinhalt. In TasksView füllt <template #meta><small> · Nr. {{ task.id }}</small></template> den Slot.',
      'In TasksView steht v-for="task in visible" :key="task.id". Der Schlüssel muss eine stabile fachliche ID sein: Mit dem Index würde Vue beim Löschen oder Umsortieren Zustände den falschen Einträgen zuordnen.',
      'Das Formular nutzt @submit.prevent="add", ein <label for="task-title"> mit passender id, :aria-invalid="!!error" und aria-describedby="task-error". Die Meldung steht in <p id="task-error" role="alert">.',
      'add() ruft store.add(title.value) auf. Wirft die Prüfung (normalizeTitle), wird die Meldung in error geschrieben und title bleibt stehen. Nur im Erfolgsfall wird das Feld geleert.',
      'Der Test schickt das Formular leer ab, prüft, dass eine Meldung erscheint, tippt dann „Test schreiben“ ein und prüft, dass die Aufgabe in der Liste steht und die Meldung wieder leer ist.',
    ],
    background: `Warum darf ein Kind eine Prop nicht verändern? Vue übergibt das Objekt selbst, nicht eine Kopie. Eine Zuweisung an task.done im Kind würde im Elternteil sichtbar, ohne dass der es merkt. Im Entwicklungsmodus warnt Vue bei direkter Zuweisung an eine Prop; bei verschachtelten Objekten erkennt es die Änderung nicht immer. Deshalb ist die Regel eine Vereinbarung, die man im Test absichern sollte: Der Test prüft, dass task.done nach dem Klick weiter false ist.

Warum stabile Schlüssel? Vue vergleicht beim Aktualisieren die alte und die neue Liste. Mit stabilen Schlüsseln erkennt es, welcher Eintrag verschoben, hinzugefügt oder entfernt wurde, und behält Zustand wie den Fokus oder einen halb getippten Text bei. Mit dem Index als Schlüssel rutschen beim Löschen alle folgenden Einträge um eine Stelle, und Vue ordnet die Zustände neu zu, nicht selten falsch.

Warum role="alert"? Ein Element mit diesem Attribut wird von Screenreadern beim Erscheinen von Text sofort angesagt. Es muss schon im DOM stehen, bevor der Text hineinkommt; deshalb existiert der Absatz mit leerem Inhalt von Anfang an. Für weniger dringende Hinweise (Anzahl offener Aufgaben) passt role="status".`,
    terms: [
      { term: 'Prop', text: 'Eingabewert einer Komponente. Er fließt vom Elternteil zum Kind und wird vom Kind nicht verändert.' },
      { term: 'Emit', text: 'Ereignis, mit dem ein Kind dem Elternteil etwas meldet, zum Beispiel toggle mit der ID.' },
      { term: 'Slot', text: 'Platzhalter in einer Komponente, den der Elternteil mit eigenem Inhalt füllt. Benannte Slots (#meta) unterscheiden mehrere Stellen.' },
      { term: 'key', text: 'Eindeutige, stabile Kennung eines Listeneintrags, damit Vue Einträge beim Aktualisieren richtig zuordnet.' },
      { term: 'role="alert"', text: 'Live-Region für wichtige Meldungen. Der Inhalt wird beim Erscheinen sofort von Screenreadern vorgelesen.' },
    ],
    code: { file: lab + 'src/components/TaskItem.vue', lang: 'Vue' },
    code2: { file: lab + 'src/views/TasksView.vue', lang: 'Vue' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/learning.spec.ts, Block „Komponentenverträge“): 2 Tests grün
 - TaskItem: setValue(true) -> emitted("toggle") = [[7]]; task.done bleibt false; Titel mit <img …> erzeugt kein img-Element
 - TasksView: leerer Submit -> Meldung in #task-error; Eingabe "Test schreiben" -> Aufgabe in der Liste, Meldung leer`,
    mistakes: [
      { wrong: 'task.done im Kind direkt zu überschreiben (oder v-model auf eine Prop zu setzen).',
        why: 'Der Elternteil verliert die Kontrolle über seine Daten; Änderungen sind schwer nachzuvollziehen und Vue warnt im Entwicklungsmodus.',
        fix: 'Ein Event mit der ID senden (emit("toggle", task.id)) und die Änderung dort ausführen, wo der Zustand liegt (Elternteil oder Store).' },
      { wrong: 'Den Index als :key zu verwenden (v-for="(task, index) in tasks" :key="index").',
        why: 'Beim Umsortieren oder Löschen verschiebt sich der Index; Vue ordnet Zustand (Fokus, Eingabe) dem falschen Eintrag zu.',
        fix: 'Eine stabile fachliche ID als Schlüssel nehmen (:key="task.id").' },
      { wrong: 'v-if und v-for auf demselben Element zu verwenden, um eine Liste zu filtern.',
        why: 'Die Reihenfolge der Auswertung ist unübersichtlich und in Vue 3 anders als in Vue 2. Der Filter gehört nicht an den Schleifenkopf.',
        fix: 'Mit einem computed (visible) vorfiltern und darüber iterieren, wie in TasksView.' },
      { wrong: 'Fehler nur durch eine rote Umrandung oder Farbe anzuzeigen.',
        why: 'Menschen mit Farbfehlsichtigkeit und Screenreader-Nutzer bemerken das nicht. WCAG 2.2 verlangt, dass Informationen nicht allein über Farbe vermittelt werden.',
        fix: 'Meldung als Text anzeigen, mit aria-describedby am Feld verknüpfen, aria-invalid setzen und role="alert" für die Ansage nutzen.' },
      { wrong: 'Bei einem Fehler das Eingabefeld zu leeren.',
        why: 'Die Nutzerin muss alles neu tippen; bei langen Texten ist das ein häufiger Grund zum Abbruch.',
        fix: 'Das Feld nur im Erfolgsfall leeren (wie add() in TasksView) und die Eingabe sonst behalten.' },
    ],
    practice: 'Baue jede neue Komponente mit dem Vertrag zuerst: Welche Props kommen herein, welche Events gehen hinaus, welche Slots gibt es? Schreibe dann den Test über genau diesen Vertrag (mount, Interaktion, emitted). Prüfe das Formular zum Schluss mit der Tastatur (Tab, Enter) und lies die Fehlermeldung laut: Würdest du auch ohne Farbe verstehen, was zu tun ist?',
    exercises: [
      { task: 'Erweitere TaskItem um das Event remove mit der ID und einen Löschknopf mit sichtbarem Text „Löschen“. Schreibe einen Test, der den Klick und die gesendete ID prüft.', acceptance: 'emitted("remove") enthält die ID; die Prop wird nicht verändert; der Knopf ist ein <button type="button"> mit sichtbarem Namen.' },
      { task: 'Grenzfall: Gib dem Formular einen Titel mit genau 120 und mit 121 Zeichen. Zeige, welcher akzeptiert wird, und prüfe, dass die Eingabe bei Ablehnung stehen bleibt.', acceptance: '120 Zeichen werden akzeptiert, 121 abgelehnt; bei Ablehnung steht der eingegebene Text weiter im Feld; die Meldung nennt die Grenze.' },
      { task: 'Fehlerfall: Ersetze :key="task.id" durch den Index, markiere die zweite Aufgabe als erledigt (oder tippe in ein Feld im Eintrag) und lösche die erste. Beschreibe, was mit dem Zustand der übrigen Einträge passiert.', acceptance: 'Beobachtung dokumentiert: Zustand springt zum falschen Eintrag. Danach ist der Code mit stabiler ID wiederhergestellt.' },
    ],
    quiz: [
      { q: 'Wie meldet das Kind TaskItem, dass die Nutzerin den Status ändern möchte?',
        options: ['Durch direkte Zuweisung an task.done im Kind', 'Mit emit("toggle", task.id), den Zustand ändert der Besitzer', 'Durch Ändern einer globalen window-Variable'],
        correct: 1,
        rationales: ['Das verletzt den einseitigen Datenfluss und macht Änderungen nicht mehr nachvollziehbar.', 'Das Kind meldet nur den Wunsch mit stabiler ID; die Mutation passiert dort, wo der Zustand liegt.', 'Globale Variablen umgehen die Struktur und sind schwer zu testen.'],
        explain: 'Props nach unten, Events nach oben: Das Kind ändert nichts selbst, sondern meldet.' },
      { q: 'Warum ist der Index als :key für eine umsortierbare oder löschbare Liste ungeeignet?',
        options: ['Weil Vue Zahlen als Schlüssel grundsätzlich nicht erlaubt', 'Weil sich der Index beim Löschen verschiebt und Vue Zustand dem falschen Eintrag zuordnet', 'Weil der Index die Liste langsamer rendert, mehr aber nicht'],
        correct: 1,
        rationales: ['Zahlen sind als Schlüssel erlaubt; die ID in der Lektion ist selbst eine Zahl.', 'Ein stabiler Schlüssel bleibt beim Eintrag, der Index wandert mit der Position.', 'Es geht um Korrektheit des Zustands, nicht nur um Geschwindigkeit.'],
        explain: 'Stabile fachliche IDs als Schlüssel halten Fokus und Eingaben beim richtigen Eintrag.' },
      { q: 'Welche Umsetzung macht eine Fehlermeldung für alle erreichbar?',
        options: ['Rote Umrandung des Feldes, sonst nichts', 'Meldungstext, per aria-describedby mit dem Feld verknüpft, mit aria-invalid und role="alert"', 'Ein Tooltip, der nur beim Überfahren mit der Maus erscheint'],
        correct: 1,
        rationales: ['Farbe allein erreicht nicht alle Nutzer und erfüllt WCAG 2.2 nicht.', 'Text, Verknüpfung und Ansage funktionieren mit Tastatur und Screenreader.', 'Hover-Inhalt ist für Tastatur- und Touch-Nutzer nicht erreichbar.'],
        explain: 'Fehler müssen als Text vorliegen, am Feld verknüpft und angesagt werden; Farbe darf nur unterstützen.' },
    ],
    sources: [
      vueDocs('Vue: Props (einseitiger Datenfluss)', 'https://vuejs.org/guide/components/props.html'),
      vueDocs('Vue: Component Events', 'https://vuejs.org/guide/components/events.html'),
      vueDocs('Vue: Slots', 'https://vuejs.org/guide/components/slots.html'),
      vueDocs('Vue: List Rendering (key)', 'https://vuejs.org/guide/essentials/list.html'),
      linkOnly('W3C WCAG 2.2: Technik ARIA19 – role=alert', 'https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19.html', 'W3C-Technik; nur verlinkt.'),
    ],
    verification: 'Die Tests im vue-lab laufen grün (jsdom); der Titel mit HTML wird im Test als Text ausgegeben. NICHT geprüft: Ansage durch echte Screenreader, Tastaturbedienung im echten Browser und Verhalten von Slots mit Gültigkeitsbereich (Scoped Slots, siehe js-m2).',
  },

  // ───────────────────────────── l11: Composables ─────────────────────────────
  {
    id: 'js-m1-l11', title: 'Composables: API-Zustände und Schutz vor veralteten Antworten', minutes: 50,
    prerequisites: 'Lektionen „Reaktivität“ (js-m1-l9) und „Props, Emits, Slots“ (js-m1-l10); Promises, async/await und fetch (js-m1-l4, l5).',
    objectives: [
      'Ein Composable als Funktion beschreiben, die Zustand und Logik bündelt und eigene Refs zurückgibt',
      'Laden, Fehler und Erfolg als Teil des Datenvertrags modellieren und Antworten zur Laufzeit prüfen',
      'Mit AbortController und einer Sequenznummer verhindern, dass eine alte Antwort die neue überschreibt',
      'Abhängigkeiten (fetch) als Parameter übergeben, damit Tests ohne Netzwerk laufen',
    ],
    simple: `Ein Composable ist eine Funktion, die zusammengehörigen Zustand und die dazugehörige Logik einpackt, damit mehrere Komponenten sie nutzen können. Üblich ist der Name mit use am Anfang: useTaskApi. Die Funktion legt refs an, definiert Funktionen und gibt beides zurück. Jeder Aufruf erzeugt einen neuen, eigenen Zustand; wer Zustand teilen will, nimmt dafür bewusst einen Store.

Das Beispiel dieser Lektion lädt eine Liste von Aufgaben. Dabei gehört mehr zum Vertrag als „die Daten“: Es gibt einen Ladezustand, einen Fehlerzustand und den Erfolgsfall. Wer nur den Erfolg baut, bekommt eine Oberfläche, die bei einem Fehler still bleibt oder endlos „lädt“.

Dazu kommt ein feines Problem: Netzwerkantworten kommen nicht immer in der Reihenfolge zurück, in der man sie angefordert hat. Wird eine Anfrage gestartet und eine zweite hinterher, kann die erste später antworten und die neuere Antwort überschreiben. Zwei einfache Mittel lösen das: Die alte Anfrage wird abgebrochen, und jede Antwort wird nur übernommen, wenn sie noch die aktuelle ist.`,
    steps: [
      'useTaskApi(fetcher = fetch) nimmt die Abruffunktion als Parameter. Im Alltag ist es das echte fetch, im Test eine Attrappe: So braucht kein Test das Netzwerk.',
      'tasks, loading und error sind drei refs. Sie sind der sichtbare Teil des Vertrags: Die Oberfläche kann jeden Zustand anzeigen (Lädt …, Fehlertext, Liste).',
      'load() bricht zuerst eine laufende Anfrage mit controller?.abort() ab, erhöht die Sequenznummer (++sequence) und merkt sich den Wert in current. So ist jede Anfrage eindeutig nummeriert.',
      'Die Antwort wird geprüft: if (!response.ok) throw new Error(`HTTP ${response.status}`). Der Statuscode ist Teil der Fehlermeldung. fetch wirft bei 404 oder 503 nämlich nicht von selbst.',
      'parseTasks(await response.json()) prüft die Daten zur Laufzeit (Typen, Länge, doppelte IDs). TypeScript kennt zur Laufzeit keine Typen; Fremddaten sind erst nach dieser Prüfung vertrauenswürdig.',
      'Nur wenn current === sequence, wird tasks.value gesetzt. Dieselbe Prüfung steht im catch und im finally: Eine alte Anfrage darf weder Daten noch Fehler schreiben noch den Ladezustand der neuen beenden.',
      'Ein AbortError (durch das eigene Abbrechen) ist kein Fehler für die Nutzerin und wird nicht als Meldung angezeigt.',
      'onScopeDispose erhöht die Sequenznummer und bricht ab. Danach kann eine späte Antwort nichts mehr in den Zustand schreiben.',
      'Der zweite Test lässt die erste Antwort bewusst später eintreffen als die zweite. Ergebnis: tasks zeigt „New“, nicht „Old“.',
    ],
    background: `Warum nicht nur AbortController? Abbrechen verhindert nicht jeden Fall: Hat der Server schon geantwortet und liegt die Antwort im Netzwerk-Stack, kann sie trotz abort noch bei der Verarbeitung ankommen. Auch Fetch-Attrappen in Tests achten das Signal meist nicht. Die Sequenznummer ist die zweite, unabhängige Sicherung: Sie prüft in der Anwendung selbst, ob die Antwort noch gebraucht wird. Beide zusammen sind robuster als jedes für sich.

Warum die Prüfung im finally? Ohne Prüfung würde die alte Anfrage mit finally { loading = false } den Ladezustand der neueren beenden, obwohl diese noch läuft. Die Oberfläche würde „fertig“ anzeigen, aber noch keine neuen Daten haben.

Warum den Fetcher übergeben? Eine Funktion, die intern fest fetch aufruft, lässt sich nur mit Netzwerk oder mit globalem Austausch testen. Wer den Fetcher als Parameter nimmt, kann in Tests eine kleine Funktion übergeben, die kontrolliert antwortet oder verzögert. Das nennt man Abhängigkeitsübergabe; es ist ein einfaches Mittel, das ohne Framework auskommt.`,
    terms: [
      { term: 'Composable', text: 'Funktion mit Namen use…, die Zustand und Logik der Composition API bündelt und Refs und Funktionen zurückgibt.' },
      { term: 'AbortController', text: 'Browser-API, mit der eine laufende Anfrage abgebrochen wird. Das signal wird an fetch übergeben.' },
      { term: 'Race Condition', text: 'Fehler, bei dem das Ergebnis von der Reihenfolge abhängt, in der parallele Vorgänge fertig werden.' },
      { term: 'Sequenznummer', text: 'Zähler, mit dem jede Anfrage nummeriert wird. Nur die Antwort der neuesten Nummer darf den Zustand ändern.' },
      { term: 'Laufzeitprüfung', text: 'Kontrolle von Fremddaten im Programm, etwa mit parseTasks. TypeScript prüft nur den Code, nicht die Daten, die später ankommen.' },
    ],
    code: { file: lab + 'src/composables/useTaskApi.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/learning.spec.ts', lang: 'TypeScript', from: "describe('API-Grenze'", plus: 0 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/learning.spec.ts, Block „API-Grenze“): 2 Tests grün
 - 503 -> error "HTTP 503", loading false; danach gültige Daten -> 1 Aufgabe, error ""
 - erste Antwort verspätet: tasks[0].title ist "New", nicht "Old"
(kein echtes Netzwerk; Antworten sind Attrappen)`,
    mistakes: [
      { wrong: 'Eine fetch-Antwort immer als Erfolg zu behandeln und direkt response.json() zu lesen.',
        why: 'fetch wirft bei HTTP-Fehlern wie 404 oder 503 nicht. Man liest eine Fehlerseite als Daten oder bekommt einen unklaren Fehler.',
        fix: 'response.ok prüfen und bei Misserfolg einen Fehler mit Statuscode werfen. Den Inhalt danach zur Laufzeit validieren.' },
      { wrong: 'Antworten ohne Prüfung zu übernehmen (tasks.value = await response.json()).',
        why: 'Der Typ steht nur im Code. Bei fehlenden Feldern oder falschen Typen bricht die Oberfläche später an unklarer Stelle.',
        fix: 'Mit einer Prüfung wie parseTasks (oder einem Schema) validieren; bei Fehlern den alten Zustand behalten und eine Meldung zeigen.' },
      { wrong: 'Nur den Ladezustand zu verwalten, aber keinen Fehlerzustand.',
        why: 'Fehler sind der Normalfall im Netzwerk. Ohne Fehlerzustand sieht die Nutzerin eine leere oder endlos ladende Seite.',
        fix: 'Laden, Fehler und Leerzustand als eigene Zustände modellieren und anzeigen (siehe TasksView).' },
      { wrong: 'In finally ohne Prüfung loading = false zu setzen.',
        why: 'Eine alte, spät beendete Anfrage beendet den Ladezustand der neuen. Die Anzeige springt auf „fertig“, bevor die Daten da sind.',
        fix: 'Nur zurücksetzen, wenn current === sequence (wie im Beispiel).' },
      { wrong: 'Nach dem Entfernen der Komponente weiter Daten in den Zustand zu schreiben.',
        why: 'Späte Antworten ändern Zustände, die niemand mehr braucht, und können in einer neuen Instanz Fehler auslösen.',
        fix: 'In onScopeDispose abbrechen und die Sequenznummer erhöhen, damit spätere Antworten verworfen werden.' },
    ],
    practice: 'Schreibe zu jeder Datenabfrage drei Tests, bevor du sie verwendest: Erfolg, HTTP-Fehler (zum Beispiel 503) und eine verspätete alte Antwort. Alle drei laufen mit einer Attrappe als fetcher, ohne Netzwerk. Wenn ein Test nur mit dem echten Server funktioniert, ist die Abhängigkeit nicht sauber getrennt.',
    exercises: [
      { task: 'Schreibe ein Composable useCounterApi, das über einen übergebenen fetcher einen Zähler lädt (Antwort { count: number }), mit loading, error und value. Teste Erfolg und Fehler mit Attrappen.', acceptance: 'Erfolg setzt value und leert error; Fehler setzt error und lässt value unverändert; kein Test nutzt echtes Netzwerk.' },
      { task: 'Grenzfall: Löse load() zweimal direkt hintereinander aus und lasse die erste Antwort nach der zweiten eintreffen. Prüfe tasks und loading in beiden Zwischenständen.', acceptance: 'Während die zweite Anfrage läuft, bleibt loading true; nach der späten ersten Antwort bleibt tasks bei den Daten der zweiten.' },
      { task: 'Fehlerfall: Entferne die Prüfung current === sequence aus dem finally-Block und lasse den Test mit der verspäteten Antwort laufen. Beschreibe die Abweichung und stelle den Code wieder her.', acceptance: 'Beobachtung dokumentiert: loading wechselt zu früh auf false (oder eine alte Antwort überschreibt); der ursprüngliche Code ist wiederhergestellt.' },
    ],
    quiz: [
      { q: 'Warum nutzt das Composable neben dem Abbrechen zusätzlich eine Sequenznummer?',
        options: ['Weil HTTP dadurch automatisch verschlüsselt wird', 'Damit verspätete alte Antworten den aktuellen Zustand nicht ersetzen, auch wenn das Abbrechen sie nicht aufhält', 'Damit alle Server garantiert sofort abbrechen'],
        correct: 1,
        rationales: ['Verschlüsselung ist Sache von HTTPS und hat mit der Nummer nichts zu tun.', 'Abort ist eine Bitte an den Browser; die Nummer prüft in der Anwendung selbst, ob die Antwort noch gebraucht wird.', 'Auf den Server hat die Nummer keinen Einfluss.'],
        explain: 'Zwei unabhängige Sicherungen gegen Race Conditions: Abbrechen und Prüfen der Nummer.' },
      { q: 'Die API antwortet mit HTTP 503. Was macht fetch?',
        options: ['Es wirft sofort einen Fehler', 'Es liefert eine Antwort mit ok = false; der Code muss selbst prüfen und einen Fehler werfen', 'Es versucht automatisch eine Sekunde später erneut'],
        correct: 1,
        rationales: ['fetch wirft nur bei Netzwerkfehlern, nicht bei HTTP-Statuscodes.', 'Deshalb steht im Beispiel if (!response.ok) throw new Error(...).', 'Automatische Wiederholung gibt es bei fetch nicht.'],
        explain: 'HTTP-Fehler sind für fetch normale Antworten; der Code muss response.ok prüfen.' },
      { q: 'Warum bekommt useTaskApi den fetcher als Parameter?',
        options: ['Damit der Code in Tests mit einer kontrollierten Attrappe ohne Netzwerk läuft', 'Weil fetch in Composables nicht importiert werden darf', 'Damit die Daten automatisch im Browser-Cache landen'],
        correct: 0,
        rationales: ['Tests können Erfolg, Fehler und Verzögerung gezielt steuern.', 'fetch ist überall verfügbar; es ist keine Frage der Erlaubnis.', 'Caching hängt von Headern ab, nicht von dieser Signatur.'],
        explain: 'Abhängigkeiten als Parameter machen Code testbar, ohne globale Austausche.' },
    ],
    sources: [
      vueDocs('Vue: Composables', 'https://vuejs.org/guide/reusability/composables.html'),
      vueDocs('Vue: Effect Scope API (onScopeDispose)', 'https://vuejs.org/api/reactivity-advanced.html#onscopedispose'),
      linkOnly('MDN: AbortController', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController', 'MDN-Dokumentation (CC BY-SA 2.5); nur verlinkt und zusammengefasst.'),
      linkOnly('MDN: Using the Fetch API (Fehler und response.ok)', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', 'MDN-Dokumentation (CC BY-SA 2.5); nur verlinkt und zusammengefasst.'),
    ],
    verification: 'Die Tests im vue-lab laufen grün, alle mit Attrappen statt Netzwerk. NICHT geprüft: Verhalten gegen einen echten Server, Zeitüberschreitungen (Timeouts), Wiederholungsstrategien und Browser-Caches. TanStack Query (js-m3) übernimmt vieles davon in einer geprüften Bibliothek.',
  },

  // ───────────────────────────── l12: Router ─────────────────────────────
  {
    id: 'js-m1-l12', title: 'Vue Router: Navigation, Lazy Loading und Backendgrenzen', minutes: 45,
    prerequisites: 'Lektion „Props, Emits, Slots“ (js-m1-l10); HTTP-Grundlagen und Statuscodes (js-m1-l5).',
    objectives: [
      'Routen mit Namen, Pfaden und Komponenten definieren und mit RouterLink und RouterView nutzen',
      'Eine Route per dynamischem Import lazy laden und den Nutzen belegen',
      'Erklären, warum der History-Modus einen Serverfallback braucht',
      'Begründen, warum ein Frontend-Guard keine Autorisierung ersetzt, und 401, 403 und 419 den richtigen Reaktionen zuordnen',
    ],
    simple: `Der Router verknüpft Adressen mit Komponenten. Ruft jemand /about auf, zeigt RouterView die About-Seite; klickt jemand auf einen RouterLink, wechselt die Seite, ohne dass der Browser neu lädt. Routen bekommen Namen (tasks, about). Links nutzen den Namen statt des Pfades, und wenn sich ein Pfad ändert, bleiben alle Links richtig.

Lazy Loading heißt: Eine selten besuchte Seite wird erst geladen, wenn man sie braucht. Statt die Komponente direkt zu importieren, schreibst du component: () => import("./views/AboutView.vue"). Der Build legt daraus ein eigenes Paket an.

Zwei Grenzen sollte man kennen. Erstens: Im History-Modus sehen Adressen wie echte Pfade aus (/about). Ruft jemand /about direkt auf, fragt der Browser den Server nach genau diesem Pfad. Der Server muss deshalb für unbekannte Pfade die index.html ausliefern, sonst kommt ein 404. Zweitens: Ein Router kann Seiten verstecken, aber keine Daten schützen. Jeder Code im Browser lässt sich umgehen. Ob jemand etwas sehen darf, entscheidet der Server bei jeder Anfrage.`,
    steps: [
      'router.ts exportiert routes als Liste und baut daraus mit createRouter({ history: createWebHistory(), routes }) den Router. Die Trennung macht die Routen testbar (ohne echte Adressleiste).',
      '{ path: "/", name: "tasks", component: TasksView } ist die Startseite, direkt importiert, weil sie sofort gebraucht wird.',
      '{ path: "/about", name: "about", component: () => import("./views/AboutView.vue") } lädt die About-Seite erst bei Bedarf. Im Test ist die Komponente vor dem ersten Besuch eine Funktion (noch nicht geladen) und danach ein Objekt (geladen).',
      '{ path: "/:pathMatch(.*)*", redirect: "/" } fängt alle unbekannten Pfade ab und leitet zur Startseite. Der Test ruft /gibt-es-nicht/unterseite auf und landet bei der Route tasks mit dem Pfad /.',
      'App.vue verwendet <RouterLink :to="{ name: \'tasks\' }"> und <RouterView />. Dazu gehören ein Sprunglink „Zum Inhalt“ und <nav aria-label="Hauptnavigation">: Mit der Tastatur kommt man direkt zum Hauptinhalt.',
      'Der Test mit createMemoryHistory() zeigt: router.resolve({ name: "about" }).path ist "/about". Die Speicher-Historie braucht kein Browserfenster.',
      'Im Build (vite build) entsteht für die About-Seite ein eigenes Paket von 0,40 kB, getrennt vom Hauptpaket (siehe „Ausgabe“).',
    ],
    background: `Warum braucht der History-Modus einen Serverfallback? Bei einer klassischen Webseite gibt es für jede Adresse eine Datei oder ein Skript auf dem Server. Eine Single-Page-Anwendung hat nur eine Datei (index.html); die Pfade existieren nur im Browser. Wird /about direkt aufgerufen (Lesezeichen, Seite neu laden, geteilter Link), kennt der Server diesen Pfad nicht. Mit einer Regel „alles, was keine Datei ist, bekommt index.html“ lädt der Browser die Anwendung, und der Router zeigt die richtige Seite. Der Hash-Modus (/#/about) braucht diese Regel nicht, sieht aber weniger sauber aus.

Warum ersetzt ein Guard keine Autorisierung? Alles, was im Browser läuft, steht unter Kontrolle der Person davor. Wer den Guard umgeht (JavaScript ändern, Adresse direkt aufrufen, Anfrage mit curl), sieht trotzdem nur, was der Server ausliefert. Ein Guard verbessert die Bedienung (kein Blick auf eine Seite, die nur Fehler zeigt), der Schutz sitzt im Backend.

Die Statuscodes lesen sich so: 401 heißt „nicht angemeldet“ (Anmeldeseite zeigen), 403 heißt „angemeldet, aber nicht berechtigt“ (Hinweis zeigen, keine neue Anmeldung), 419 ist bei Laravel das Signal für „Sitzung oder CSRF-Token abgelaufen“ (Seite neu laden, Token erneuern). 419 ist kein Standardcode, sondern eine Laravel-Konvention.`,
    terms: [
      { term: 'RouterView', text: 'Platzhalter, an dem der Router die Komponente der aktuellen Route anzeigt.' },
      { term: 'RouterLink', text: 'Link, der ohne Neuladen navigiert. Mit :to="{ name: ... }" wird über den Routennamen verlinkt.' },
      { term: 'Lazy Loading', text: 'Eine Komponente wird erst beim ersten Besuch geladen: component: () => import(...). Der Build erzeugt dafür ein eigenes Paket.' },
      { term: 'History-Modus', text: 'Saubere Adressen ohne #. Der Server muss für unbekannte Pfade die index.html liefern.' },
      { term: 'Guard', text: 'Funktion, die eine Navigation prüft oder umleitet (beforeEach). Sie steuert die Bedienung, ist aber keine Sicherheitsgrenze.' },
    ],
    code: { file: lab + 'src/router.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/basics.spec.ts', lang: 'TypeScript', from: "describe('Router (js-m1-l12)'", to: "expect(router.currentRoute.value.fullPath).toBe('/?a=1#b');", plus: 2 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/basics.spec.ts, Block „Router“): 4 Tests grün
 - resolve({ name: "tasks" }).path = "/", resolve({ name: "about" }).path = "/about"
 - About-Komponente: vor dem Besuch Funktion, nach push("/about") Objekt (geladen)
 - push("/gibt-es-nicht/unterseite") -> Route "tasks", fullPath "/"; push("/xyz?a=1#b") -> fullPath "/?a=1#b"
vite build (vue-lab): index-….js 104,17 kB (gzip 40,71 kB); AboutView-….js 0,40 kB (gzip 0,31 kB) als eigenes Paket`,
    mistakes: [
      { wrong: 'Eine Route zu verstecken und das für Schutz der Daten zu halten.',
        why: 'Alle Anfragen lassen sich ohne den Router stellen. Wer die Adresse der API kennt, ruft sie direkt auf.',
        fix: 'Der Server prüft bei jeder Anfrage Anmeldung und Berechtigung. Der Guard dient nur der Bedienung.' },
      { wrong: 'Im History-Modus zu veröffentlichen, ohne den Server zu konfigurieren.',
        why: 'Direktaufrufe und Neuladen auf Unterseiten liefern 404, weil der Server den Pfad nicht kennt.',
        fix: 'Fallback auf index.html für alle Pfade, die keine Dateien sind; den Direktaufruf nach dem Deployment testen.' },
      { wrong: 'Alle Seiten direkt zu importieren, auch selten genutzte.',
        why: 'Das Startpaket wird größer und braucht länger, obwohl die meisten Seiten selten gebraucht werden.',
        fix: 'Selten genutzte Seiten lazy importieren und das Ergebnis im Build prüfen (eigenes Paket).' },
      { wrong: 'Einen Redirect-Parameter ungeprüft zu übernehmen (zum Beispiel ?redirect=https://fremde-seite.example).',
        why: 'Offener Redirect: Nach der Anmeldung könnte man auf eine fremde Seite geschickt werden.',
        fix: 'Nur interne Pfade zulassen (beginnt mit "/" und nicht mit "//"); siehe Lektion zu Router-Guards (js-m4).' },
      { wrong: 'Abgelaufene Anmeldung (401) wie eine leere Erfolgsantwort zu behandeln.',
        why: 'Die Nutzerin sieht eine leere Liste und denkt, es gäbe keine Daten.',
        fix: '401, 403 und 419 getrennt behandeln: anmelden, Hinweis „keine Berechtigung“, Sitzung erneuern.' },
    ],
    practice: 'Prüfe nach jeder Routenänderung drei Dinge: Funktionieren die Links über den Namen? Funktioniert der Direktaufruf einer Unterseite (auch nach dem Deployment)? Zeigt eine unbekannte Adresse eine sinnvolle Seite oder Weiterleitung statt einer leeren Fläche? Und bei Schutz: Ruf die API-Adresse einmal ohne Anmeldung direkt auf; die Antwort muss der Server verweigern.',
    exercises: [
      { task: 'Ergänze eine Route /tasks/:id mit dem Namen task-detail. Schreibe einen Test, der resolve({ name: "task-detail", params: { id: 5 } }).path prüft.', acceptance: 'Der Pfad lautet /tasks/5; der Parameter wird beim Auflösen ersetzt; die Route verwendet Lazy Loading.' },
      { task: 'Grenzfall: Rufe eine unbekannte Adresse mit Abfrageparametern und Hash auf (/xyz?a=1#b) und prüfe, wohin der Router weiterleitet und was vom Aufruf erhalten bleibt.', acceptance: 'Die Weiterleitung erreicht tasks; fullPath ist "/?a=1#b". Die Beobachtung nennt, dass Query und Hash bei einem Redirect auf einen Pfad erhalten bleiben und dass das beim Weiterreichen sensibler Parameter bedacht werden muss.' },
      { task: 'Fehlerfall: Starte den Vite-Build im History-Modus hinter einem einfachen statischen Server ohne Fallback und rufe /about direkt auf. Dokumentiere das Ergebnis und die Regel, die das behebt.', acceptance: 'Der Direktaufruf liefert 404; mit Fallback auf index.html erscheint die Seite. Die Regel ist in einem Satz notiert.' },
    ],
    quiz: [
      { q: 'Was kann ein Router-Guard nicht ersetzen?',
        options: ['Eine serverseitige Prüfung von Anmeldung und Berechtigung', 'Eine Weiterleitung bei fehlender Anmeldung', 'Die Entscheidung, welche Seite angezeigt wird'],
        correct: 0,
        rationales: ['Der Browser steht unter der Kontrolle der Nutzerin; der Server muss jede Anfrage selbst prüfen.', 'Weiterleitungen sind die Aufgabe des Guards.', 'Auch das ist eine normale Aufgabe des Routers.'],
        explain: 'Frontend-Guards verbessern die Bedienung; Schutz von Daten entsteht nur im Backend.' },
      { q: 'Warum führt /about direkt aufgerufen im History-Modus ohne Serverfallback zu einem 404?',
        options: ['Weil der Router keine Pfade kennt', 'Weil der Server den Pfad /about nicht kennt, der nur im Browser existiert', 'Weil Vue Router nur im Hash-Modus funktioniert'],
        correct: 1,
        rationales: ['Der Router kennt die Pfade, aber erst, nachdem die Anwendung geladen wurde.', 'Der Server muss für unbekannte Pfade die index.html ausliefern, damit die Anwendung starten kann.', 'Der History-Modus ist vollwertig; er braucht nur die Serverregel.'],
        explain: 'Single-Page-Anwendungen brauchen für Direktaufrufe einen Fallback auf index.html.' },
      { q: 'Woran erkennt man im Build, dass das Lazy Loading der About-Seite wirkt?',
        options: ['Der Build meldet für die About-Seite ein eigenes, kleines Paket neben dem Hauptpaket', 'Die About-Seite ist gar nicht mehr im Projekt enthalten', 'Der Router zeigt sie dann schneller als jede andere Seite'],
        correct: 0,
        rationales: ['Im Lab entsteht AboutView-….js mit 0,40 kB getrennt vom 104-kB-Hauptpaket.', 'Sie ist weiter da und wird nur später geladen.', 'Beim ersten Besuch kommt sogar eine Anfrage hinzu; der Gewinn liegt im kleineren Startpaket.'],
        explain: 'Dynamische Importe erzeugen eigene Pakete; so wird der Nutzen im Build sichtbar.' },
    ],
    sources: [
      mit('Vue Router: Einführung', 'https://router.vuejs.org/guide/', 'Vue Router'),
      mit('Vue Router: Named Routes', 'https://router.vuejs.org/guide/essentials/named-routes.html', 'Vue Router'),
      mit('Vue Router: Lazy Loading Routes', 'https://router.vuejs.org/guide/advanced/lazy-loading.html', 'Vue Router'),
      mit('Vue Router: Verschiedene History-Modi (Serverkonfiguration)', 'https://router.vuejs.org/guide/essentials/history-mode.html', 'Vue Router'),
      linkOnly('MDN: HTTP-Statuscodes 401 und 403', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', 'MDN-Dokumentation (CC BY-SA 2.5); nur verlinkt und zusammengefasst.'),
    ],
    verification: 'Die Tests im vue-lab laufen grün (Router mit Speicher-Historie), der Build wurde ausgeführt. NICHT geprüft: Serverfallback auf einem echten Host (die 404-Aussage stammt aus der Router-Dokumentation), Verhalten der Navigation per Tastatur und Screenreader sowie Laravel-Statuscode 419 (nur beschrieben).',
  },

  // ───────────────────────────── l13: Pinia ─────────────────────────────
  {
    id: 'js-m1-l13', title: 'Pinia: Zustand teilen, Aktionen und storeToRefs', minutes: 45,
    prerequisites: 'Lektionen „Reaktivität“ (js-m1-l9) und „Composables“ (js-m1-l11).',
    objectives: [
      'Entscheiden, wann Zustand in einen Store gehört und wann er lokal in der Komponente bleibt',
      'Einen Setup-Store mit Zustand (ref), Gettern (computed) und Aktionen (Funktionen) lesen und schreiben',
      'Mit storeToRefs reaktive Verbindungen beim Destrukturieren erhalten und begründen, warum Aktionen direkt destrukturiert werden dürfen',
      'Fremde Daten vor dem Ersetzen prüfen, sodass bei einem Fehler die alte Liste vollständig bleibt',
    ],
    simple: `Nicht jeder Wert gehört in einen Store. Ein halb getippter Text im Eingabefeld gehört in die Komponente. Die Liste der Aufgaben dagegen braucht die Listenansicht, die Anzeige „3 offen“ und vielleicht eine Detailseite: mehrere Stellen, ein Zustand. Dafür ist ein Store da: ein gemeinsamer Ort für Daten und für die Funktionen, die sie ändern.

Pinia bietet Stores in der Schreibweise der Composition API. Das ist dasselbe, was du schon kennst: refs für den Zustand, computed für abgeleitete Werte, Funktionen für Änderungen. defineStore("tasks", () => { ... }) packt das zusammen und gibt zurück, was nach außen sichtbar sein soll.

Eine Falle gibt es beim Benutzen: Wer aus dem Store eine Zahl herausholt (const { remaining } = store), bekommt eine Momentaufnahme. Der Wert ändert sich nicht mehr mit. storeToRefs liefert stattdessen Refs, die mit dem Store verbunden bleiben. Funktionen (Aktionen) sind davon nicht betroffen: Sie haben keinen Zustand, den man verlieren könnte.`,
    steps: [
      'defineStore("tasks", () => { ... }) erzeugt einen Setup-Store. Der erste Parameter ist die eindeutige Kennung, der zweite die Funktion, die den Store aufbaut.',
      'const tasks = ref<Task[]>([]) ist der Zustand. const remaining = computed(() => tasks.value.filter(task => !task.done).length) ist der abgeleitete Wert (Getter).',
      'add(input) prüft zuerst mit normalizeTitle (leer oder über 120 Zeichen wirft), vergibt dann die nächste ID und fügt hinzu. Die ID-Vergabe mit Math.max ist nur für diese lokale Demo gedacht: Mehrere Nutzer bräuchten IDs vom Server.',
      'toggle(id) sucht die Aufgabe und wirft einen Fehler, wenn sie fehlt. Ein stilles Ignorieren würde Programmierfehler verstecken.',
      'replace(input) ruft parseTasks(input) auf und ersetzt erst danach tasks.value. Wirft die Prüfung, bleibt die alte Liste unverändert. Der Test belegt das: Nach einem ungültigen Aufruf steht weiter "Alt" in der Liste.',
      'return { tasks, remaining, add, toggle, replace } bestimmt, was von außen sichtbar ist. Alles, was nicht zurückgegeben wird, bleibt privat.',
      'In TasksView holt const { tasks, remaining } = storeToRefs(store) Zustand und Getter als Refs. Die Aktionen kommen direkt über store.add und store.toggle.',
      'Der Test vergleicht beides: const { remaining } = storeToRefs(store) zeigt nach zwei add-Aufrufen 2; const { remaining: snapshot } = store bleibt bei 0.',
      'useTasksStore() liefert bei jedem Aufruf denselben Store (gleiche Instanz). Das ist der Zweck: gemeinsamer Zustand ohne Weiterreichen.',
    ],
    background: `Warum verliert man beim Destrukturieren die Verbindung? Pinia gibt den Store als reaktives Objekt zurück. Beim Destrukturieren wird die Eigenschaft einmal gelesen und der Wert in eine normale Variable kopiert; danach gibt es keine Verbindung mehr, genau wie bei reactive in der Lektion zur Reaktivität. storeToRefs macht aus Zustand und Gettern Refs, die auf den Store zeigen. Funktionen werden dabei bewusst ausgelassen: Sie lassen sich ohne Verlust direkt destrukturieren.

Wann ist ein Store zu viel? Faustregel: Flüchtiger Zustand einer einzelnen Komponente (Eingabefeld, aufgeklapptes Menü) bleibt lokal. Zustand, den mehrere entfernte Komponenten lesen oder schreiben (Anmeldung, Warenkorb, Aufgabenliste), gehört in einen Store. Zu viele Stores erzeugen Kopplung; zu wenige führen zu Props, die durch fünf Ebenen gereicht werden.

Wichtig bei Server-Rendering: Ein Store ist ein gemeinsames Objekt. Auf dem Server darf nutzerspezifischer Zustand nicht in einem Modul-Singleton zwischen Anfragen geteilt werden, sonst sieht eine Nutzerin die Daten einer anderen. Pinia erzeugt dafür pro Anfrage eine eigene Instanz (createPinia je Anfrage). Dieser Kurs rendert nur im Browser; das Thema wird hier nicht praktisch geprüft.`,
    terms: [
      { term: 'Store', text: 'Gemeinsamer Ort für Zustand und die Funktionen, die ihn ändern. Mehrere Komponenten nutzen denselben Store.' },
      { term: 'Getter', text: 'Abgeleiteter Wert im Store, im Setup-Store ein computed.' },
      { term: 'Aktion', text: 'Funktion im Store, die den Zustand ändert, oft mit Prüfung der Eingabe.' },
      { term: 'storeToRefs', text: 'Wandelt Zustand und Getter eines Stores in Refs um, die beim Destrukturieren mit dem Store verbunden bleiben.' },
      { term: 'Singleton', text: 'Ein Objekt, das es pro Anwendung nur einmal gibt. Auf dem Server heißt das: nicht für nutzerspezifische Daten zwischen Anfragen teilen.' },
    ],
    code: { file: lab + 'src/stores/tasks.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/basics.spec.ts', lang: 'TypeScript', from: "describe('Pinia (js-m1-l13)'", plus: 0 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest (tests/basics.spec.ts, Block „Pinia“): 3 Tests grün
 - storeToRefs: remaining.value = 2 nach zwei add(); einfach destrukturierter Wert bleibt 0
 - replace([{ id: 1, title: "x", done: "nein" }]) wirft; die Liste enthält weiter ["Alt"]
 - useTasksStore() === useTasksStore()
vitest (tests/learning.spec.ts): add("Learn") -> remaining 1; toggle(1) -> 0; toggle(99) wirft`,
    mistakes: [
      { wrong: 'const { tasks } = store zu schreiben und anzunehmen, die Variable bleibe aktuell.',
        why: 'Beim Destrukturieren wird nur der aktuelle Wert kopiert; spätere Änderungen kommen nicht an.',
        fix: 'const { tasks, remaining } = storeToRefs(store) verwenden. Aktionen dürfen direkt aus dem Store destrukturiert oder über store.add aufgerufen werden.' },
      { wrong: 'API-Daten ungeprüft in den Store zu schreiben (store.tasks = await response.json()).',
        why: 'Fehlerhafte Daten zerstören die gültige Liste; die Oberfläche bricht an einer unklaren Stelle.',
        fix: 'Eine Aktion wie replace nutzen, die zuerst prüft und erst bei Erfolg ersetzt. Bei Fehlern bleibt die alte Liste erhalten.' },
      { wrong: 'Jeden ref in einen globalen Store zu legen.',
        why: 'Das koppelt unabhängige Komponenten und erschwert Tests; flüchtiger Zustand lebt dann ewig.',
        fix: 'Nur Zustand mit mehreren Verbrauchern in den Store legen; Eingabefelder und UI-Zustand einer Komponente bleiben lokal.' },
      { wrong: 'Math.max-IDs als Verfahren für mehrere Nutzer zu betrachten.',
        why: 'Zwei Nutzer können gleichzeitig dieselbe neue ID erzeugen. Die Vergabe im Browser ist keine verlässliche Quelle.',
        fix: 'IDs vom Server vergeben lassen und Konfliktregeln definieren; die lokale Demo darauf hinweisen.' },
      { wrong: 'Fehlende Einträge in Aktionen still zu ignorieren (if (!task) return).',
        why: 'Ein falscher Aufruf bleibt unbemerkt; der Fehler tritt später als „es passiert nichts“ auf.',
        fix: 'Einen Fehler werfen, wie toggle es tut, und den Fall im Test abdecken (toggle(99) wirft).' },
    ],
    practice: 'Schreibe zu jedem Store zwei Arten von Tests: Aktionen im Erfolgsfall und im Fehlerfall (mit setActivePinia(createPinia()) ohne Oberfläche) und mindestens einen Test, der die Anzeige über storeToRefs prüft. Wenn der Fehlerfall die alte Liste verändert, ist die Aktion nicht atomar. Das ist der häufigste Fehler.',
    exercises: [
      { task: 'Ergänze im Store die Aktion remove(id) mit einem Fehler für unbekannte IDs und einen Getter doneCount. Teste beide, auch den Fehlerfall.', acceptance: 'remove entfernt genau einen Eintrag; unbekannte ID wirft; doneCount ändert sich nach toggle; kein Test verändert fremden Zustand (jeder Test erzeugt ein neues Pinia).' },
      { task: 'Grenzfall: Rufe add mit genau 120 und mit 121 Zeichen auf und mit einem Titel aus Leerzeichen. Prüfe, welche akzeptiert werden und dass die Liste bei Fehlern unverändert bleibt.', acceptance: '120 Zeichen werden akzeptiert, 121 und der Leerzeichen-Titel werden abgelehnt; die Länge der Liste ändert sich bei Ablehnung nicht.' },
      { task: 'Fehlerfall: Ersetze replace probeweise durch tasks.value = input (ohne Prüfung) und lasse den Test mit ungültigen Daten laufen. Beschreibe, was der Test meldet, und stelle die Prüfung wieder her.', acceptance: 'Der Test schlägt fehl (kein Fehler wird geworfen, die Liste ist zerstört); nach der Wiederherstellung besteht er wieder.' },
    ],
    quiz: [
      { q: 'Welche Aufgabe hat storeToRefs?',
        options: ['Zustand und Getter als Refs bereitstellen, die beim Destrukturieren mit dem Store verbunden bleiben', 'Alle API-Daten automatisch gegen ein Schema prüfen', 'Passwörter dauerhaft verschlüsselt speichern'],
        correct: 0,
        rationales: ['Genau dafür gibt es die Funktion; im Test bleibt remaining.value aktuell, ein einfach destrukturierter Wert nicht.', 'Pinia prüft keine API-Daten; das macht eine Aktion wie replace.', 'Pinia speichert nichts dauerhaft und verschlüsselt nichts.'],
        explain: 'storeToRefs erhält die Verbindung zum Store; Funktionen müssen nicht umgewandelt werden.' },
      { q: 'Warum ruft replace zuerst parseTasks auf, bevor tasks.value gesetzt wird?',
        options: ['Damit bei ungültigen Daten die alte Liste vollständig erhalten bleibt', 'Weil Pinia sonst eine Warnung ausgibt', 'Damit die Liste schneller geladen wird'],
        correct: 0,
        rationales: ['Die Aktion ist atomar: entweder die gültige neue Liste oder gar keine Änderung.', 'Pinia warnt nicht vor ungeprüften Daten.', 'Die Prüfung kostet etwas Zeit; es geht um Korrektheit, nicht um Geschwindigkeit.'],
        explain: 'Erst prüfen, dann ersetzen: So bleibt der Zustand bei Fehlern unversehrt.' },
      { q: 'Welcher Zustand gehört typischerweise in einen Store?',
        options: ['Der halb getippte Text in einem einzelnen Eingabefeld', 'Die Aufgabenliste, die Liste, Anzeige und Detailseite gemeinsam brauchen', 'Der Hover-Zustand eines Knopfes'],
        correct: 1,
        rationales: ['Flüchtiger Zustand einer Komponente bleibt lokal.', 'Mehrere entfernte Verbraucher teilen einen Zustand; dafür ist der Store gedacht.', 'Reiner UI-Zustand gehört in CSS oder die Komponente.'],
        explain: 'Geteilter, fachlicher Zustand gehört in einen Store; flüchtiger UI-Zustand bleibt lokal.' },
    ],
    sources: [
      mit('Pinia: Kernkonzepte (Stores)', 'https://pinia.vuejs.org/core-concepts/', 'Pinia'),
      mit('Pinia: State und storeToRefs', 'https://pinia.vuejs.org/core-concepts/state.html', 'Pinia'),
      mit('Pinia: Server-Side Rendering', 'https://pinia.vuejs.org/ssr/', 'Pinia'),
      vueDocs('Vue: State Management', 'https://vuejs.org/guide/scaling-up/state-management.html'),
    ],
    verification: 'Die Tests im vue-lab laufen grün (Pinia 4.1.0 installiert und getestet, nicht nur aus der Dokumentation übernommen). NICHT geprüft: Server-Rendering (nur beschrieben), Persistenz der Daten und Mehrbenutzerbetrieb.',
  },

  // ───────────────────────────── l14: Tests ─────────────────────────────
  {
    id: 'js-m1-l14', title: 'Tests: Unit-, Komponenten- und Ende-zu-Ende-Tests', minutes: 50,
    prerequisites: 'Lektionen „Props, Emits, Slots“ (js-m1-l10), „Composables“ (js-m1-l11) und „Pinia“ (js-m1-l13).',
    objectives: [
      'Unit-, Komponenten- und Ende-zu-Ende-Tests unterscheiden und je einen Fall zuordnen',
      'Eine Komponente mit mount, setValue, trigger und emitted über sichtbares Verhalten testen',
      'Grenzfälle und Fehlerfälle in Tests aufnehmen (leer, zu lang, doppelt, HTTP-Fehler, verspätete Antwort)',
      'Die Grenzen von jsdom nennen und festlegen, was einen echten Browser braucht',
    ],
    simple: `Tests sind kein Selbstzweck. Sie beantworten die Frage: Woran merke ich, dass ich beim Ändern etwas kaputt gemacht habe? Dazu gibt es drei Ebenen. Unit-Tests prüfen kleine, reine Regeln: Wird ein leerer Titel abgelehnt? Komponententests prüfen, was eine Komponente nach außen zeigt und meldet: Ein Klick erzeugt das Ereignis mit der richtigen ID. Ende-zu-Ende-Tests (E2E) steuern einen echten Browser durch die ganze Anwendung: hinzufügen, abhaken, filtern, Seite wechseln.

Je weiter oben, desto näher an der Wirklichkeit, aber auch langsamer und anfälliger. Deshalb besteht eine gute Sammlung aus vielen kleinen und wenigen großen Tests.

Wichtig ist, was getestet wird: Beobachtbares Verhalten, nicht die Innereien. Ein Test, der prüft, dass eine private Funktion aufgerufen wurde, bricht bei jeder harmlosen Umbenennung. Ein Test, der klickt und das Ergebnis liest, bricht nur, wenn sich das Verhalten ändert.`,
    steps: [
      'learning.spec.ts beginnt mit reinen Regeln: parseTasks akzeptiert eine gültige Liste und trimmt den Titel, weist aber einen falschen Typ (done: "false"), doppelte IDs und leere oder zu lange Titel zurück. Das sind Unit-Tests, schnell und ohne Oberfläche.',
      'Der Store-Test legt mit setActivePinia(createPinia()) einen frischen Store an, fügt hinzu, schaltet um und prüft remaining. Ein Fehlerfall (toggle(99)) gehört dazu.',
      'Der Komponententest mountet TaskItem mit einer Aufgabe, deren Titel HTML enthält, löst mit setValue(true) die Checkbox aus und prüft drei Dinge: emitted("toggle") ist [[7]], die Prop task.done bleibt false, es gibt kein img-Element.',
      'Der Formulartest mountet TasksView mit createPinia() als Plugin, sendet das leere Formular ab (Meldung erscheint) und danach mit gültigem Text (Aufgabe erscheint, Meldung weg).',
      'Die API-Tests übergeben eine Attrappe statt fetch: einmal HTTP 503, dann gültige Daten; und einmal eine verspätete alte Antwort. Kein Test spricht mit einem echten Server.',
      'Jeder Test räumt auf (wrapper.unmount(), scope.stop()), damit Zustand nicht in den nächsten Test hineinläuft.',
      'Ausgeführt wird mit npm test (Vitest, Umgebung jsdom). Das Lab hat jetzt 11 Dateien mit 125 Tests.',
      'Ein E2E-Test (Playwright) würde dieselben Schritte in einem echten Browser durchlaufen: hinzufügen, abhaken, filtern, Seite wechseln. Das Lab enthält ihn nicht; die Übung beschreibt, wie er aussähe.',
    ],
    background: `Was jsdom nicht kann: jsdom ist eine Nachbildung von Browser-Teilen in JavaScript, keine Rendering-Engine. Es gibt kein echtes Layout (Größen, Umbrüche), keine echte Fokus- und Tastaturführung und keine vollständige Navigation. Darum haben die Dialog- und Animationstests im Lab Nachbildungen (siehe README). Alles, was von diesen Dingen abhängt, braucht einen echten Browser.

Warum Fehlerfälle? Der Normalfall funktioniert meistens beim ersten Versuch. Fehler lauern bei Leerem, Zu-Langem, Doppeltem, bei HTTP-Fehlern und bei Antworten in falscher Reihenfolge. Die Testzahl sagt nichts über Qualität; entscheidend ist, ob die Fehlerfälle abgedeckt sind.

Warum nicht jede Zeile prüfen? Ein Snapshot-Test, der das gesamte HTML speichert, schlägt bei jeder kleinen Änderung an, und man gewöhnt sich ans Bestätigen. Er sagt nichts darüber, ob Autorisierung, Validierung und Bedienung stimmen. Gezielte Behauptungen (dieser Text, dieses Ereignis, dieser Zustand) sind aussagekräftiger.`,
    terms: [
      { term: 'Unit-Test', text: 'Prüft eine kleine, einzelne Einheit (eine Funktion, eine Regel) isoliert und schnell.' },
      { term: 'Komponententest', text: 'Mountet eine Komponente und prüft Anzeige, Ereignisse und Zustand über die Oberfläche (mount, trigger, emitted).' },
      { term: 'E2E-Test', text: 'Steuert einen echten Browser durch die Anwendung (zum Beispiel mit Playwright). Nah an der Wirklichkeit, aber langsamer.' },
      { term: 'jsdom', text: 'Nachbildung von Browser-Schnittstellen in JavaScript für Tests. Kein Layout, kein vollständiges Fokusverhalten.' },
      { term: 'Attrappe (Mock)', text: 'Kontrollierter Ersatz für eine Abhängigkeit, etwa ein gefälschtes fetch, damit Tests ohne Netzwerk laufen.' },
    ],
    code: { file: lab + 'tests/learning.spec.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'body2'],
    output: `vitest run (vue-lab, 11 Dateien): 125 Tests grün, davon tests/learning.spec.ts 6 Tests
 - Datenvertrag und Store: parseTasks (Typ, Länge, doppelte IDs), normalizeTitle, add/toggle/remaining
 - Komponentenverträge: emitted statt Mutation, HTML als Text, Formular mit Fehlermeldung
 - API-Grenze: HTTP 503, gültige Daten, verspätete alte Antwort (alles mit Attrappen)
vue-tsc --noEmit: fehlerfrei`,
    mistakes: [
      { wrong: 'Private Methoden oder die Reihenfolge interner Aufrufe zu testen.',
        why: 'Solche Tests brechen bei jeder Umstrukturierung, ohne dass sich das Verhalten ändert. Sie verhindern Verbesserungen.',
        fix: 'Über die öffentliche Oberfläche prüfen: klicken, tippen, sichtbare Texte und emitted-Ereignisse lesen.' },
      { wrong: 'Nur den Normalfall zu testen.',
        why: 'Die Fehler sitzen in leeren, zu langen, doppelten oder verspäteten Eingaben und in HTTP-Fehlern.',
        fix: 'Zu jeder Funktion mindestens einen Grenzfall und einen Fehlerfall aufnehmen (Lab: 120 gegen 121 Zeichen, 503, verspätete Antwort).' },
      { wrong: 'Echte Netzwerkaufrufe in Tests zu machen.',
        why: 'Tests werden langsam, hängen von fremden Diensten ab und scheitern zufällig.',
        fix: 'Externe Grenzen mit Attrappen ersetzen (übergebener fetcher, Fake-Server); nur wenige E2E-Tests dürfen eine echte Umgebung nutzen.' },
      { wrong: 'Sich auf einen großen Snapshot zu verlassen.',
        why: 'Er speichert alles und prüft nichts Bestimmtes; Änderungen werden aus Gewohnheit bestätigt.',
        fix: 'Gezielt behaupten, was wichtig ist (Text, Ereignis, Attribut, Zustand).' },
      { wrong: 'Aus bestandenen jsdom-Tests zu schließen, dass Fokus, Layout und Navigation im Browser funktionieren.',
        why: 'jsdom bildet diese Dinge nicht vollständig nach.',
        fix: 'Fokus, Tastatur, Umbrüche und echte Navigation zusätzlich in einem echten Browser prüfen (E2E oder manuell).' },
    ],
    practice: 'Lege für jede neue Funktion drei Testfälle an, bevor du sie benutzt: Normalfall, Grenzfall, Fehlerfall. Lass den Test absichtlich einmal fehlschlagen (Code kurz kaputt machen), um zu sehen, ob er wirklich etwas prüft. Das wiederholst du bei Tests, die „zu leicht“ grün sind.',
    exercises: [
      { task: 'Schreibe einen Test für normalizeTitle mit einem Titel aus genau 120 Zeichen, mit Leerzeichen am Rand und mit Zeilenumbruch. Dokumentiere, welche Fälle akzeptiert werden.', acceptance: '120 Zeichen werden akzeptiert, Leerzeichen am Rand entfernt; der Test prüft den zurückgegebenen Wert, nicht nur, dass nichts wirft.' },
      { task: 'Grenzfall: Teste TaskItem mit einer leeren Titelzeichenkette und einer Aufgabe mit sehr langem Titel (500 Zeichen) auf Überlauf im Text (nur Test der Textausgabe, nicht des Layouts). Beschreibe, was jsdom hier nicht prüfen kann.', acceptance: 'Der Text erscheint vollständig im DOM; die Beschreibung nennt, dass Umbruch und Überlauf nur im echten Browser sichtbar sind.' },
      { task: 'Fehlerfall: Beschreibe (oder schreibe, falls Playwright installiert ist) einen E2E-Ablauf mit den Schritten hinzufügen, abhaken, filtern, Seite wechseln. Lege fest, welche Prüfung nur dort sinnvoll ist (zum Beispiel Fokus nach dem Hinzufügen).', acceptance: 'Vier Schritte mit je einer Prüfung; mindestens eine Prüfung betrifft Fokus oder Navigation und ist ausdrücklich als „nur im echten Browser“ markiert.' },
    ],
    quiz: [
      { q: 'Welcher Fall braucht zusätzlich einen echten Browser?',
        options: ['Die Addition zweier Zahlen', 'Prüfung von Tastaturbedienung, Fokus und realer Navigation', 'Ein String-trim ohne Ein- und Ausgabe'],
        correct: 1,
        rationales: ['Reine Berechnung läuft in jedem Unit-Test.', 'jsdom bildet Fokus und Navigation nicht vollständig nach; echte Prüfung braucht einen Browser.', 'Auch das ist ein reiner Unit-Test.'],
        explain: 'Fokus, Layout und Navigation sind die Grenze von jsdom und gehören in einen Browser-Test.' },
      { q: 'Was prüft der Test von TaskItem im Lab, wenn die Checkbox ausgelöst wird?',
        options: ['Dass die Prop task.done jetzt true ist', 'Dass emitted("toggle") die ID enthält und die Prop unverändert bleibt', 'Dass die Komponente intern eine bestimmte Funktion aufgerufen hat'],
        correct: 1,
        rationales: ['Im Vertrag ändert das Kind die Prop gerade nicht.', 'Das ist beobachtbares Verhalten: Ereignis gesendet, Prop unverändert.', 'Interne Aufrufe sind Details, die ein Test nicht festschreiben sollte.'],
        explain: 'Getestet wird der Vertrag nach außen, nicht die Innereien.' },
      { q: 'Warum gibt useTaskApi in den Tests eine Attrappe statt fetch zu bekommen?',
        options: ['Damit Tests schneller sind und ohne Netzwerk und Fremddienste kontrolliert Fehler und Verzögerungen auslösen können', 'Weil fetch in Tests grundsätzlich verboten ist', 'Damit der Server weniger belastet wird, mehr aber nicht'],
        correct: 0,
        rationales: ['Kontrolle über Erfolg, 503 und späte Antworten macht die Tests reproduzierbar.', 'fetch ist nicht verboten; es wäre nur unzuverlässig.', 'Die Serverlast ist ein Nebeneffekt; der Hauptgrund ist Kontrolle und Zuverlässigkeit.'],
        explain: 'Externe Grenzen werden in Tests ersetzt, damit sie schnell und wiederholbar bleiben.' },
    ],
    sources: [
      vueDocs('Vue: Testing', 'https://vuejs.org/guide/scaling-up/testing.html'),
      mit('Vue Test Utils: Einführung', 'https://test-utils.vuejs.org/guide/', 'Vue Test Utils'),
      mit('Vitest: Einstieg', 'https://vitest.dev/guide/', 'Vitest'),
      linkOnly('Playwright: Einführung (für E2E-Tests)', 'https://playwright.dev/docs/intro', 'Dokumentation von Playwright; nur verlinkt und zusammengefasst.'),
    ],
    verification: 'Alle Tests im vue-lab laufen grün (125 Tests in 11 Dateien), vue-tsc ist fehlerfrei. NICHT geprüft: ein E2E-Test im echten Browser (das Lab enthält keinen), Fokusverhalten, Layout und Screenreader. Die Testanzahl ist kein Qualitätsbeweis.',
  },

  // ───────────────────────────── l15: Sicherheit, A11y, Performance, Deployment ─────────────────────────────
  {
    id: 'js-m1-l15', title: 'Sicherheit, Barrierefreiheit, Performance und Deployment', minutes: 50,
    prerequisites: 'Lektionen „Props, Emits, Slots“ (js-m1-l10), „Router“ (js-m1-l12) und „Tests“ (js-m1-l14).',
    objectives: [
      'Begründen, warum Interpolation sicherer ist als v-html, und welche Grenzen sie nicht ersetzt (Server-Prüfung, CSP)',
      'Erklären, warum alles im Clientcode öffentlich ist und was das für Konfiguration und Geheimnisse bedeutet',
      'Grundlegende Barrierefreiheit an einer Vue-Anwendung prüfen (Sprunglink, Landmarken, Live-Regionen, Tastatur)',
      'Ein Release vorbereiten: Build, Direktaufruf, Cache-Strategie und Rückweg dokumentieren',
    ],
    simple: `Eine Anwendung ist erst fertig, wenn sie sicher, bedienbar und auslieferbar ist. Vier Themen gehören dazu, und alle lassen sich an der kleinen Aufgabenliste des Labs zeigen.

Sicherheit: Vue gibt Daten mit {{ }} als Text aus. Ein Titel wie <img src=x onerror=alert(1)> wird deshalb nur angezeigt, nicht ausgeführt. Das schützt vor einer häufigen Lücke, ersetzt aber nicht die Prüfung auf dem Server und keine Sicherheitsheader. Und: Alles, was in den Browser ausgeliefert wird, kann jeder lesen. Auch ein Schlüssel in einer Umgebungsvariablen, die im Build landet, ist danach öffentlich.

Barrierefreiheit: Menschen bedienen Anwendungen mit Tastatur, Screenreader, Zoom oder Sprachsteuerung. Das Lab hat einen Sprunglink, eine beschriftete Navigation, ein Hauptelement und Live-Regionen für Status und Fehler.

Performance und Deployment: Gemessen wird, nicht geraten. Lazy Loading verkleinert das Startpaket (siehe Router-Lektion). Beim Ausliefern gehören HTTPS, ein Fallback für Direktaufrufe, Cache-Header und ein Rückweg dazu.`,
    steps: [
      'Textausgabe: In TaskItem steht der Titel in {{ task.title }}. Der Test aus der Lektion zu den Tests belegt, dass dabei kein img-Element entsteht. v-html kommt im Lab nirgends vor.',
      'Clientcode ist öffentlich: Variablen mit dem Präfix VITE_ werden von Vite in das Paket eingebaut und sind danach für alle lesbar. Das Lab speichert deshalb keine Tokens oder Geheimnisse (siehe AboutView).',
      'App.vue beginnt mit <a href="#main">Zum Inhalt</a>, gefolgt von <nav aria-label="Hauptnavigation"> und <main id="main" tabindex="-1">. Der Link springt per Tastatur zum Inhalt, tabindex="-1" erlaubt, den Fokus dorthin zu setzen.',
      'TasksView hat <p role="status"> für „3 Aufgaben offen“ und Lade-Hinweis sowie <p role="alert"> für Fehler. Beide existieren schon beim ersten Rendern, damit Screenreader spätere Änderungen ansagen.',
      'Das Formular verknüpft Label und Feld (for und id), setzt aria-invalid bei Fehlern und aria-describedby auf die Meldung. Die Bedienung läuft komplett über echte Elemente (<button>, <input>), nicht über klickbare Container.',
      'Performance messen: npm run build (vue-tsc, dann vite build) ergibt 104,17 kB (gzip 40,71 kB) für das Hauptpaket und ein eigenes Paket von 0,40 kB für die About-Seite. Das Ergebnis ist ein Messwert dieses Labs, kein Maßstab für andere Projekte.',
      'Deployment: Das Ergebnis liegt in dist/. Geliefert werden nur diese statischen Dateien. Der Host braucht HTTPS, einen Fallback auf index.html für Direktaufrufe, ein passendes Base-Path und Caching: gehashte Dateien lange und unveränderlich, index.html mit Revalidierung.',
      'Ein Releaseprotokoll hält fest: Build erfolgreich, Tests grün, Direktaufruf einer Unterseite geprüft, Fehlerseite (404 und HTTP-Fehler der API) geprüft, Rückweg (vorherige Version wiederherstellen) beschrieben.',
    ],
    background: `Warum reicht Textausgabe nicht als Sicherheitskonzept? Sie verhindert, dass Daten als Markup ausgeführt werden, aber es gibt weitere Wege: v-html mit fremdem Text, href-Werte wie javascript:…, Daten, die in Skripte oder Stile eingesetzt werden, und Lücken in Abhängigkeiten. Eine Content-Security-Policy (CSP) kann Schaden begrenzen, indem sie festlegt, welche Skripte laufen dürfen; sie ersetzt aber nicht die saubere Ausgabe. Die Schichten ergänzen sich.

Warum ist „VITE_“ öffentlich? Vite ersetzt beim Bauen Verweise auf import.meta.env.VITE_… durch den Wert. Er steht dann im JavaScript, das jeder herunterladen kann. Alles, was nicht öffentlich sein soll (Datenbankpasswörter, private API-Schlüssel), gehört auf den Server. Im Browser darf nur stehen, was auch auf einer öffentlichen Webseite stehen dürfte.

Zur Performance: Bundle-Größe allein sagt wenig. Was Nutzer spüren, sind Ladezeit, Reaktionszeit und Layoutsprünge. Diese Werte misst man (zum Beispiel mit Lighthouse im Labor und mit echten Nutzerdaten im Feld). Server-Rendering oder statische Erzeugung (zum Beispiel mit Nuxt) sind spätere Architekturentscheidungen und kein automatischer Gewinn für Sicherheit oder Suchmaschinen.`,
    terms: [
      { term: 'XSS', text: 'Cross-Site-Scripting: Fremder Text wird als ausführbarer Code im Browser eingesetzt. Textausgabe verhindert das; v-html mit fremdem Text öffnet die Lücke.' },
      { term: 'CSP', text: 'Content-Security-Policy: Header, der festlegt, welche Quellen für Skripte, Stile und mehr erlaubt sind. Zusätzlicher Schutz, kein Ersatz für saubere Ausgabe.' },
      { term: 'VITE_-Variable', text: 'Umgebungsvariable, die Vite in das Paket einbaut. Danach öffentlich lesbar. Keine Geheimnisse hierhin.' },
      { term: 'Live-Region', text: 'Bereich (role="status" oder role="alert"), dessen Änderungen von Screenreadern angesagt werden.' },
      { term: 'Fallback', text: 'Serverregel, die für unbekannte Pfade die index.html liefert, damit der Router Direktaufrufe bearbeiten kann.' },
    ],
    code: { file: lab + 'src/App.vue', lang: 'Vue' },
    code2: { file: lab + 'tests/learning.spec.ts', lang: 'TypeScript', from: "it('emittiert statt Props zu mutieren", to: "expect(wrapper.find('img').exists()).toBe(false);", plus: 2 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vue-tsc --noEmit && vite build (vue-lab): erfolgreich, 33 Module
 - dist/assets/index-….js      104,17 kB (gzip 40,71 kB)
 - dist/assets/AboutView-….js    0,40 kB (gzip 0,31 kB)
 - dist/assets/index-….css       0,56 kB (gzip 0,37 kB)
vitest: Titel "<img src=x onerror=alert(1)>" erscheint als Text, kein img-Element`,
    mistakes: [
      { wrong: 'v-html für fremde Titel oder Kommentare zu verwenden.',
        why: 'Eingebettetes Markup mit Skript oder Event-Handlern wird ausgeführt (XSS).',
        fix: 'Mit {{ }} als Text ausgeben. Wenn Formatierung nötig ist, ein eingeschränktes Format (zum Beispiel Markdown) mit geprüfter Bereinigung nutzen.' },
      { wrong: 'Secrets in VITE_-Variablen oder im Quelltext des Frontends abzulegen.',
        why: 'Alles im Bundle ist öffentlich, auch minifiziert. Wer das Paket lädt, liest den Wert.',
        fix: 'Geheimnisse nur auf dem Server halten und über eine eigene API-Schnittstelle nutzen. Im Client nur öffentliche Konfiguration.' },
      { wrong: 'Eine CSP als Ersatz für saubere Ausgabe zu betrachten.',
        why: 'Eine falsch gesetzte oder zu lockere CSP schützt nicht; und sie ersetzt nicht die Prüfung der Daten.',
        fix: 'Ausgabe sauber halten, Header schrittweise einführen und im Browser prüfen (Konsole meldet Verstöße).' },
      { wrong: 'Klickbare <div>- oder <span>-Elemente als Knöpfe zu verwenden.',
        why: 'Sie sind nicht per Tastatur erreichbar und haben keine Rolle für Screenreader.',
        fix: 'Natives <button type="button"> (oder <a href>) verwenden; sichtbaren Fokus nie entfernen.' },
      { wrong: 'Aus der Paketgröße allein auf gute Performance zu schließen.',
        why: 'Nutzer erleben Ladezeit, Reaktionszeit und Layoutsprünge; die hängen von Netzwerk, Gerät und Ablauf ab.',
        fix: 'Mit Lighthouse und echten Nutzerdaten messen; Lazy Loading nur dort, wo der Nutzen im Build und in der Messung sichtbar ist.' },
    ],
    practice: 'Erstelle für jede Veröffentlichung ein kurzes Releaseprotokoll: Welche Version, Build und Tests grün, welche Direktaufrufe geprüft, wie ist der Rückweg? Prüfe vor dem Veröffentlichen einmal die ganze Anwendung nur mit der Tastatur und einmal mit 200 % Zoom und notiere, was nicht erreichbar oder abgeschnitten ist.',
    exercises: [
      { task: 'Schreibe einen Test, der einem TaskItem einen Titel mit <script>-Tag und einen mit einem Anführungszeichen übergibt, und prüfe, dass beide als Text ausgegeben werden und nichts ausgeführt wird.', acceptance: 'Es entsteht weder script- noch img-Element; der angezeigte Text entspricht Zeichen für Zeichen der Eingabe.' },
      { task: 'Grenzfall: Durchlaufe die Anwendung ausschließlich mit der Tastatur (Tab, Umschalt+Tab, Enter, Leertaste). Notiere die Reihenfolge, den sichtbaren Fokus und alle Stellen, die nicht erreichbar sind.', acceptance: 'Eine Liste der Tab-Stopps; alle Aktionen sind erreichbar; Fokus ist an jeder Stelle sichtbar, oder die Lücken sind mit Zeile und Datei notiert.' },
      { task: 'Fehlerfall: Führe npm run build aus, beschreibe die erzeugten Dateien und prüfe in ihnen mit einer Suche, ob ein Wert aus einer VITE_-Variable (Testwert) auffindbar ist. Entferne den Testwert danach.', acceptance: 'Der Testwert steht im Klartext im Bundle; das Ergebnis ist mit dem Satz „alles im Client ist öffentlich“ begründet; die Testvariable ist entfernt.' },
    ],
    quiz: [
      { q: 'Welche Aussage über Werte aus VITE_-Variablen trifft zu?',
        options: ['Vite verschlüsselt private Werte im Bundle dauerhaft', 'In den Browser ausgelieferte Werte sind nicht geheim und können gelesen werden', 'Ein minifiziertes Token ist dadurch sicher'],
        correct: 1,
        rationales: ['Vite verschlüsselt nichts; es ersetzt die Platzhalter durch die Werte.', 'Alles im Bundle ist öffentlich. Geheimnisse gehören auf den Server.', 'Minifizierung ist keine Geheimhaltung.'],
        explain: 'Clientcode ist öffentlich; Geheimnisse dürfen nie im Frontend stehen.' },
      { q: 'Warum zeigt {{ task.title }} einen Titel wie <img src=x onerror=alert(1)> harmlos an?',
        options: ['Weil Vue den Text vor der Ausgabe als Text maskiert, statt ihn als HTML einzusetzen', 'Weil Browser keine onerror-Attribute mehr unterstützen', 'Weil die Server-CSP das automatisch blockiert'],
        correct: 0,
        rationales: ['Der Test im Lab zeigt: kein img-Element, die Zeichen erscheinen als Text.', 'onerror wird weiter unterstützt; ohne Maskierung wäre der Code ausführbar.', 'Das Lab setzt keine CSP voraus; die Maskierung wirkt unabhängig davon.'],
        explain: 'Interpolation setzt Text ein; v-html würde dasselbe Markup einsetzen und ausführen lassen.' },
      { q: 'Welche Maßnahme gehört zu einer Single-Page-Anwendung im History-Modus beim Deployment?',
        options: ['Ein Fallback auf index.html für Pfade, die keine Dateien sind, damit Direktaufrufe funktionieren', 'Das Entfernen aller Cache-Header, damit nichts veraltet', 'Das Ausliefern des Quelltextordners src/ statt von dist/'],
        correct: 0,
        rationales: ['Ohne den Fallback liefert ein Direktaufruf von /about einen 404.', 'Gehashte Dateien dürfen lange gecacht werden; ohne Header wird die Auslieferung langsamer.', 'Ausgeliefert wird das Build-Ergebnis in dist/, nicht der Quelltext.'],
        explain: 'Direktaufrufe brauchen den Fallback; ausgeliefert wird nur dist/.' },
    ],
    sources: [
      vueDocs('Vue: Security', 'https://vuejs.org/guide/best-practices/security.html'),
      vueDocs('Vue: Accessibility', 'https://vuejs.org/guide/best-practices/accessibility.html'),
      vueDocs('Vue: Performance', 'https://vuejs.org/guide/best-practices/performance.html'),
      linkOnly('Vite: Umgebungsvariablen und Modi (VITE_)', 'https://vite.dev/guide/env-and-mode.html', 'Vite-Dokumentation (MIT-Lizenz); nur verlinkt und zusammengefasst.'),
      linkOnly('Vite: Statisches Deployment', 'https://vite.dev/guide/static-deploy.html', 'Vite-Dokumentation (MIT-Lizenz); nur verlinkt und zusammengefasst.'),
      linkOnly('OWASP: Cross-Site Scripting Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', 'OWASP Cheat Sheet Series (CC BY-SA 4.0); nur verlinkt und zusammengefasst.'),
    ],
    verification: 'Build und Tests des vue-lab sind grün; die Paketgrößen sind echte Messwerte dieses Labs (Vite 8.3.6). NICHT geprüft: Lighthouse- oder Feldmessungen, Screenreader und Tastatur im echten Browser, Server-Header und Fallback auf einem echten Host, CSP und ein tatsächliches Deployment.',
  },

  // ───────────────────────────── l16: Abschlussprojekt ─────────────────────────────
  {
    id: 'js-m1-l16', title: 'Abschlussprojekt: Aufgaben-Dashboard mit API-Vertrag', minutes: 70,
    prerequisites: 'Alle Lektionen dieses Moduls, vor allem „Props, Emits, Slots“ (js-m1-l10), „Composables“ (js-m1-l11), „Router“ (js-m1-l12), „Pinia“ (js-m1-l13) und „Tests“ (js-m1-l14).',
    objectives: [
      'Die Bausteine Router, Store, Formular, Komponenten, API-Composable und Tests zu einer Anwendung zusammenfügen',
      'In vertikalen Scheiben arbeiten: je Scheibe Normalfall, Fehlerfall und Fremdzugriffsregel prüfen',
      'Demo-Grenzen ehrlich benennen (keine Persistenz, keine Anmeldung, lokale IDs) und Voraussetzungen für den Mehrbenutzerbetrieb nennen',
      'Ein Abnahmeprotokoll schreiben, das auch zeigt, was nicht geprüft wurde',
    ],
    simple: `Im Abschlussprojekt kommt alles zusammen. TasksView ist die Hauptansicht: Sie liest und schreibt die Aufgaben im Store, zeigt sie mit TaskItem an, nimmt neue Aufgaben über ein zugängliches Formular entgegen und lädt Demo-Aufgaben über das Composable. Der Router bringt den Nutzer zwischen den Seiten hin und her.

Ein Projekt wächst am besten in dünnen, vollständigen Scheiben statt in Schichten. Erst nur „Liste lesen“, dann „Aufgabe anlegen“, dann „Status ändern“, dann „Filter“, dann „Daten von einer Schnittstelle laden“. Nach jeder Scheibe läuft die Anwendung, die Tests sind grün, und du hast Normalfall, Fehlerfall und Fremdzugriff geprüft.

Das Wichtigste zum Schluss ist Ehrlichkeit. Das Lab ist eine Demo: Die Daten leben im Arbeitsspeicher und verschwinden beim Neuladen, es gibt keine Anmeldung, IDs werden lokal vergeben. Das ist in Ordnung, solange man es sagt. Ein vollständiges Produkt braucht zusätzlich Persistenz, Anmeldung, Berechtigungen und Regeln für gleichzeitige Änderungen.`,
    steps: [
      'Scheibe 1, Liste lesen: Der Store hält tasks, TasksView zeigt sie über storeToRefs an. Leerzustand: „Keine passenden Aufgaben“ erscheint, wenn die gefilterte Liste leer ist.',
      'Scheibe 2, Aufgabe anlegen: Formular mit Label, add() im Store und Fehlermeldung als Text (role="alert"). Bei Fehlern bleibt die Eingabe stehen.',
      'Scheibe 3, Status ändern: TaskItem meldet toggle mit der ID, der Store ändert. Die Anzeige „n Aufgaben offen“ ist ein computed (remaining) und eine Live-Region (role="status").',
      'Scheibe 4, Filter: Die Checkbox „Nur offene Aufgaben“ steuert onlyOpen. visible = computed(() => tasks.filter(…)) liefert die gefilterte Liste; die Liste selbst bleibt unverändert.',
      'Scheibe 5, Demo laden: importDemo ruft api.load() auf. Nur wenn kein Fehler aufgetreten ist, ersetzt store.replace(api.tasks.value) die Liste, und diese Prüfung läuft erneut über parseTasks. Der Knopf ist während des Ladens deaktiviert.',
      'Scheibe 6, Navigation: App.vue verbindet Sprunglink, Navigation und RouterView; die About-Seite lädt lazy.',
      'Scheibe 7, Abnahme: npm test (125 Tests), vue-tsc, npm run build. Dazu eine Tastaturprüfung und ein Abnahmeprotokoll mit „nicht geprüft“-Liste.',
      'domain.ts ist die gemeinsame Grundlage: Task, parseTasks und normalizeTitle liegen an einer Stelle und werden von Store, Composable und Tests gleichermaßen genutzt.',
    ],
    background: `Warum vertikale Scheiben? Wer erst alle Typen, dann alle Stores, dann alle Ansichten baut, sieht erst am Ende, ob die Teile zusammenpassen. Eine vertikale Scheibe geht durch alle Schichten (Oberfläche, Zustand, Daten, Test) und ist nach kurzer Zeit nutzbar. Fehler in den Annahmen zeigen sich früh und kosten wenig.

Warum die „Fremdzugriffsregel“? Bei jedem Feature gehört die Frage dazu: Was passiert, wenn jemand anderes dieselbe Aktion versucht oder Daten sieht, die ihm nicht gehören? Im Lab gibt es keine Nutzer, aber die Gewohnheit zählt: Beim Anbinden eines Backends wird aus der Frage eine Regel, die getrennt für Eigentümer, Fremde, Gäste und fehlerhafte Anfragen getestet wird.

Was fehlt für Mehrbenutzerbetrieb? Mindestens: Persistenz (Datenbank), Anmeldung und Sitzungen, Autorisierung je Anfrage auf dem Server, serverseitig vergebene IDs, ein Umgang mit gleichzeitigen Änderungen (zum Beispiel Versionsnummern), Validierung auf dem Server, Protokollierung, Datensicherung. Der Laravel-Pfad dieses Kurses liefert die Backendbegriffe dazu.`,
    terms: [
      { term: 'Vertikale Scheibe', text: 'Ein kleiner, vollständiger Funktionsschnitt durch alle Schichten, der danach sofort nutzbar und prüfbar ist.' },
      { term: 'Datenvertrag', text: 'Festlegung, wie Daten aussehen dürfen (Typen, Längen, Eindeutigkeit), geprüft zur Laufzeit, zum Beispiel mit parseTasks.' },
      { term: 'Leerzustand', text: 'Anzeige, wenn eine Liste keine Einträge hat. Er erklärt, warum nichts da ist und was zu tun ist.' },
      { term: 'Abnahmeprotokoll', text: 'Dokument mit dem, was geprüft wurde und wie, und mit dem, was ausdrücklich nicht geprüft wurde.' },
      { term: 'Konfliktregel', text: 'Festlegung, was passiert, wenn zwei Nutzer dasselbe gleichzeitig ändern (zum Beispiel „letzte Änderung gewinnt“ oder Versionsprüfung).' },
    ],
    code: { file: lab + 'src/views/TasksView.vue', lang: 'Vue' },
    code2: { file: lab + 'src/domain.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `vitest run (vue-lab): 11 Dateien, 125 Tests grün; vue-tsc --noEmit fehlerfrei; vite build erfolgreich
Demo-Grenzen (aus dem README des Labs): Daten nur im Arbeitsspeicher; Demo-Import ersetzt die Liste;
Math.max-IDs nur lokal; keine Anmeldung, kein Mehrbenutzerbetrieb`,
    mistakes: [
      { wrong: 'Ein lokales Aufgabenarray als fertige Mehrbenutzer-Anwendung zu bezeichnen.',
        why: 'Ohne Persistenz, Anmeldung und serverseitige Regeln ist das eine Demo. Wer es anders darstellt, täuscht über die Reife.',
        fix: 'Demo-Daten kennzeichnen, die fehlenden Teile aufschreiben und Konflikt- und Eigentümerregeln vor dem Backend-Anschluss planen.' },
      { wrong: 'Erst alle Schichten einzeln zu bauen und am Ende zusammenzustecken.',
        why: 'Unstimmigkeiten zeigen sich spät und sind teuer zu beheben.',
        fix: 'In vertikalen Scheiben arbeiten und nach jeder Scheibe Tests und Build ausführen.' },
      { wrong: 'Beim Import von Daten die Liste vor der Prüfung zu ersetzen.',
        why: 'Bei einem Fehler wären die bisherigen Daten verloren.',
        fix: 'Erst parseTasks, dann ersetzen (store.replace) und bei Fehlern die Liste behalten; die Meldung zeigt den Grund.' },
      { wrong: 'Neben Erfolg keinen Lade-, Fehler- und Leerzustand zu zeigen.',
        why: 'Nutzer sehen eine leere Seite und wissen nicht, ob etwas lädt, fehlschlug oder nichts da ist.',
        fix: 'Alle drei Zustände ausdrücklich darstellen (Lädt …, Fehlermeldung als Text, „Keine passenden Aufgaben“).' },
      { wrong: 'Ein Abnahmeprotokoll nur mit „alles grün“ zu schreiben.',
        why: 'Es verschweigt die Grenzen und erzeugt falsches Vertrauen.',
        fix: 'Geprüftes mit Nachweis (Testlauf, Build) und Nichtgeprüftes ausdrücklich nennen (Browser, Screenreader, Backend, Last).' },
    ],
    practice: 'Schreibe zum Abschluss ein Protokoll mit vier Spalten: Scheibe, Normalfall, Fehlerfall, Fremdzugriffsregel. Fülle es nur mit dem, was du wirklich ausgeführt hast. Ergänze eine Liste „nicht geprüft“. Wenn die Liste leer bleibt, hast du vermutlich etwas übersehen.',
    exercises: [
      { task: 'Starte das Lab (npm run dev, Port 5190) und dokumentiere alle Ansichten mit je einer Beobachtung: Startseite mit Liste, About-Seite, Fehlermeldung bei leerer Eingabe, Demo-Import.', acceptance: 'Zu jeder Ansicht steht, was sichtbar ist und was beim Fehler passiert; der Import ersetzt die Liste, und das ist als Demo-Verhalten vermerkt.' },
      { task: 'Grenzfall: Füge eine getestete Filterfunktion hinzu (zum Beispiel Suche im Titel, ohne Beachtung der Groß- und Kleinschreibung), die den Datenvertrag (domain.ts) nicht ändert. Teste leere Suche, Treffer ohne Ergebnis und Sonderzeichen.', acceptance: 'Die Funktion ist rein und getestet; die Liste im Store bleibt unverändert; Sonderzeichen werden nicht als Muster ausgewertet; der Leerzustand erscheint bei null Treffern.' },
      { task: 'Fehlerfall: Plane (nicht programmiere) einen Backend-Endpunkt für Aufgaben mit Anmeldung, Eigentümer-Prüfung, Validierung und Schutz vor CSRF. Lege fest, wie das Frontend auf 401, 403, 419 und 422 reagiert.', acceptance: 'Eine Tabelle ordnet jedem Statuscode eine Reaktion zu; der Plan nennt Tests für Eigentümer, Fremde, Gäste und fehlerhafte Nutzdaten; das bestehende Lab bleibt ohne Backend ausführbar.' },
    ],
    quiz: [
      { q: 'Was fehlt dem lokalen Lernlabor für echten Mehrbenutzerbetrieb?',
        options: ['Nur ein anderes Farbschema', 'Persistenz, Anmeldung, serverseitige Berechtigungen und eine Konfliktstrategie', 'Ein weiteres console.log'],
        correct: 1,
        rationales: ['Die Gestaltung ist nicht das Problem.', 'Ohne diese Teile gibt es keine dauerhaften, getrennten, geschützten Daten.', 'Protokollausgaben ändern an den Grenzen nichts.'],
        explain: 'Das Lab ist eine Demo; für Mehrbenutzerbetrieb braucht es ein Backend mit den genannten Teilen.' },
      { q: 'Warum arbeitet man in vertikalen Scheiben statt Schicht für Schicht?',
        options: ['Weil Schichten in Vue nicht getrennt werden können', 'Damit jede Scheibe nach kurzer Zeit lauffähig und prüfbar ist und Fehler in den Annahmen früh auffallen', 'Weil Tests dann nicht mehr nötig sind'],
        correct: 1,
        rationales: ['Schichten lassen sich trennen; das ist nicht der Grund.', 'Früh sichtbare Probleme sind billiger zu beheben.', 'Tests sind in jeder Scheibe weiter nötig.'],
        explain: 'Vertikale Scheiben liefern früh lauffähige, getestete Teile und verkürzen die Rückmeldung.' },
      { q: 'importDemo ersetzt die Liste erst nach der Prüfung der Daten. Welchen Vorteil hat das?',
        options: ['Bei fehlerhaften Daten bleibt die bisherige Liste erhalten und eine Meldung erscheint', 'Die Liste lädt dadurch doppelt so schnell', 'Es werden keine Tests mehr benötigt'],
        correct: 0,
        rationales: ['Der Store bleibt gültig: alte Daten oder geprüfte neue Daten, nie etwas Halbes.', 'Die Prüfung kostet Zeit und beschleunigt nichts.', 'Die Prüfung ersetzt keinen Test, sie ist der Grund für einen.'],
        explain: 'Erst prüfen, dann ersetzen: So gibt es nie einen kaputten Zwischenzustand.' },
    ],
    sources: [
      vueDocs('Vue: Tooling (Vite, TypeScript, Testen)', 'https://vuejs.org/guide/scaling-up/tooling.html'),
      vueDocs('Vue: Application API (createApp, Plugins)', 'https://vuejs.org/api/application.html'),
      mit('Pinia: Kernkonzepte', 'https://pinia.vuejs.org/core-concepts/', 'Pinia'),
      mit('Vue Router: Einführung', 'https://router.vuejs.org/guide/', 'Vue Router'),
    ],
    verification: 'Alle Tests (125 in 11 Dateien), vue-tsc und der Build laufen im vue-lab fehlerfrei. NICHT geprüft: Bedienung im echten Browser (manuell), Screenreader, Last, Mehrbenutzerbetrieb und jede Anbindung an ein echtes Backend. Das Lab ist eine Demo und kein produktionsreifes Produkt.',
  },
];
