/* Werkstattaufgaben der Spur vue (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'vue-w1',modules:['js-m2'],level:'schwer',type:'write',language:'vue',rows:26,
    title:'Aufgabenliste als Komponente',
    text:'Schreibe eine Single-File-Komponente mit <script setup>, einer Liste von Aufgaben, einem Eingabefeld zum Hinzufügen und einer Anzeige der offenen Aufgaben.',
    details:['Im Script: ref für die Aufgabenliste und das Eingabefeld, computed für die Zahl offener Aufgaben, eine Funktion add.','Im Template: v-model am Eingabefeld, @submit.prevent am <form>, v-for mit einem stabilen :key (task.id, nicht der Index), die Zahl der offenen Aufgaben im Text.','v-if und v-for stehen nie am selben Element.'],
    starter:L('<script setup>','','</script>','','<template>','','</template>'),
    rules:[
      need('<script setup>',/<script\s+setup\b/i),
      need('ref(…) für den Zustand',/\bref\s*\(/),
      need('computed(…) für offene Aufgaben',/\bcomputed\s*\(/),
      need('Funktion add',/\bfunction\s+add\s*\(|\bconst\s+add\s*=/),
      need('v-model am Eingabefeld',/<input\b[^>]*\bv-model=/i),
      need('@submit.prevent am Formular',/<form\b[^>]*@submit\.prevent=/i),
      need('v-for mit :key',/<[^>]*\bv-for=[^>]*:key=|<[^>]*:key=[^>]*\bv-for=/i),
      need('Anzeige der offenen Aufgaben im Template ({{ … }})',/\{\{[^}]*(?:open|remaining|offen)[^}]*\}\}/i),
      bad(/:key=["']\s*(?:i|idx|index)\s*["']/,'Der Index als key bricht bei Umsortieren und Löschen. Nimm eine stabile id.'),
      bad(/<[^>]*\bv-if=[^>]*\bv-for=|<[^>]*\bv-for=[^>]*\bv-if=/i,'v-if und v-for nicht am selben Element: filtere vorher mit computed.'),
      bad(/\.value\s*\.value/,'Doppeltes .value – eine ref braucht .value nur einmal im Script.'),
      bad(/\{\{[^}]*\.value[^}]*\}\}/,'Im Template werden refs automatisch entpackt – lass .value weg.')
    ],
    solution:L('<script setup>','import { ref, computed } from "vue";','','const tasks = ref([{ id: 1, title: "Vue lernen", done: false }]);','const title = ref("");','const open = computed(() => tasks.value.filter((task) => !task.done).length);','','function add() {','  const text = title.value.trim();','  if (text === "") return;','  tasks.value.push({ id: Date.now(), title: text, done: false });','  title.value = "";','}','</script>','','<template>','  <form @submit.prevent="add">','    <label>Neue Aufgabe <input v-model="title"></label>','    <button type="submit">Hinzufügen</button>','  </form>','  <p>{{ open }} Aufgaben offen</p>','  <ul>','    <li v-for="task in tasks" :key="task.id">{{ task.title }}</li>','  </ul>','</template>'),
    hint:'refs brauchst du im Script mit .value, im Template nicht. Der key identifiziert jedes Element dauerhaft.',
    why:'Reaktiver Zustand (ref), abgeleitete Werte (computed) und stabile Schlüssel sind die Grundlage jeder Vue-Liste. Ohne sie entstehen veraltete Anzeigen und Fehler beim Umsortieren.'},
  {id:'vue-w2',modules:['js-m2'],level:'schwer',type:'write',language:'vue',rows:24,
    title:'Child-Komponente mit Props und Events',
    text:'Schreibe die Komponente TaskItem: Sie bekommt eine Aufgabe als Prop, zeigt sie an und meldet Änderungen per Event nach oben.',
    details:['defineProps mit der Prop task (Objekt mit id, title, done). Nicht verändern!','defineEmits mit dem Event toggle.','Eine Checkbox, die den Zustand von task.done anzeigt (:checked) und beim Ändern das Event toggle mit der id auslöst.','Der Titel wird im Template angezeigt; durchgestrichen, wenn die Aufgabe erledigt ist (class-Bindung).'],
    starter:L('<script setup>','','</script>','','<template>','','</template>'),
    rules:[
      need('<script setup>',/<script\s+setup\b/i),
      need('defineProps mit task',/\bdefineProps\s*(?:<[^>]*>)?\s*\([^)]*\btask\b|\bdefineProps\s*<[^>]*\btask\b/),
      need('defineEmits mit toggle',/\bdefineEmits\s*(?:<[^>]*>)?\s*\([^)]*["']toggle["']|\bdefineEmits\s*<[^>]*\btoggle\b/),
      need('Checkbox mit :checked',/<input\b(?=[^>]*\btype=["']checkbox["'])(?=[^>]*:checked=)[^>]*>/i),
      need('Änderung löst emit("toggle", …) aus',/\bemit\s*\(\s*["']toggle["']\s*,\s*[\w.]*id\b/),
      need('Titel im Template',/\{\{\s*[\w.]*task\.title\s*\}\}|\{\{\s*title\s*\}\}/),
      need('class-Bindung für erledigte Aufgaben',/:class=/),
      bad(/\bprops\s*\.\s*task(?:\.\w+)*\s*=[^=]|\btask\s*\.\s*done\s*=[^=]|v-model=["']task\./,'Props sind schreibgeschützt. Melde die Änderung mit emit an die Elternkomponente.'),
      bad(/\$emit\s*\(\s*["']toggle["']\s*\)/,'Gib die id der Aufgabe mit: emit("toggle", task.id).')
    ],
    solution:L('<script setup>','const props = defineProps({ task: { type: Object, required: true } });','const emit = defineEmits(["toggle"]);','','function toggle() {','  emit("toggle", props.task.id);','}','</script>','','<template>','  <label>','    <input type="checkbox" :checked="task.done" @change="toggle">','    <span :class="{ done: task.done }">{{ task.title }}</span>','  </label>','</template>'),
    hint:'Daten fließen per Props nach unten, Änderungen per Events nach oben. Das Kind ändert die Prop nie selbst.',
    why:'Einseitiger Datenfluss macht Komponenten vorhersagbar. Mutierte Props führen zu Zuständen, die sich nur schwer nachvollziehen lassen.'}
];
W.add('vue',tasks);
W.add('vue',[
{id:'vue-w3',modules:['js-m3'],level:'schwer',type:'write',language:'vue',rows:34,
  title:'Formular mit Zod-Validierung',
  text:'Schreibe eine Komponente mit einem Anmeldeformular, das die Eingaben mit Zod prüft und Fehler zugänglich anzeigt.',
  details:['<script setup lang="ts"> mit import { z } from \'zod\' und const schema = z.object({ email: z.string().email(), minutes: z.coerce.number().int().min(1).max(600) }).','reaktive Felder form = reactive({ email: \'\', minutes: \'\' }) und errors = ref<Record<string, string>>({}).','submit(): schema.safeParse(form); bei !result.success werden die Meldungen aus result.error.issues in errors gesammelt (issue.path[0]) und die Funktion beendet; sonst emit(\'saved\', result.data).','Template: <form @submit.prevent="submit" novalidate>, je Feld <label for>, v-model, bei Fehler aria-invalid und aria-describedby auf ein <p :id role="alert"> mit der Meldung.','Der Button ist ein <button type="submit">.'],
  starter:L('<script setup lang="ts">','','</script>','','<template>','','</template>'),
  rules:[
    need('<script setup lang="ts">',/<script\s+setup\s+lang=["']ts["']/i),
    need('import { z } from "zod"',/\bimport\s*\{\s*z\s*\}\s*from\s*["']zod["']/),
    need('Schema mit z.object, email und coerce.number',/\bz\s*\.\s*object\s*\(\s*\{[\s\S]*email\s*:\s*z\s*\.\s*string\s*\(\s*\)\s*\.\s*email\s*\(\s*(?:["'][^"']*["']\s*)?\)[\s\S]*minutes\s*:\s*z\s*\.\s*coerce\s*\.\s*number\s*\(\s*\)\s*\.\s*int\s*\(\s*\)\s*\.\s*min\s*\(\s*1\s*(?:,\s*["'][^"']*["']\s*)?\)\s*\.\s*max\s*\(\s*600\s*(?:,\s*["'][^"']*["']\s*)?\)/),
    need('reactive form',/\bconst\s+form\s*=\s*reactive\s*\(\s*\{[\s\S]*email\s*:\s*["']{2}[\s\S]*minutes\s*:\s*["']{2}/),
    need('errors als ref',/\bconst\s+errors\s*=\s*ref\s*<\s*Record\s*<\s*string\s*,\s*string\s*>\s*>\s*\(\s*\{\s*\}\s*\)/),
    need('safeParse und Fehlerauswertung',/\bschema\s*\.\s*safeParse\s*\(\s*form\s*\)[\s\S]*\bresult\s*\.\s*error\s*\.\s*issues\b[\s\S]*\bpath\s*\[\s*0\s*\]/),
    need('emit("saved", result.data)',/\bemit\s*\(\s*["']saved["']\s*,\s*result\s*\.\s*data\s*\)/),
    need('<form @submit.prevent novalidate>',/<form\b[^>]*@submit\.prevent=["']submit["'][^>]*\bnovalidate\b|<form\b[^>]*\bnovalidate\b[^>]*@submit\.prevent=["']submit["']/),
    need('Labels mit for und v-model',/<label\b[^>]*\bfor=["']\w+["'][\s\S]*<input\b[^>]*\bv-model=["']form\.email["']/),
    need('aria-invalid und aria-describedby',/\baria-invalid\b[\s\S]*\baria-describedby\b/),
    need('Fehlermeldung mit role="alert"',/<p\b[^>]*\brole=["']alert["']/),
    need('Button type="submit"',/<button\b[^>]*\btype=["']submit["']/),
    bad(/\bz\.parse\s*\(|\bschema\s*\.\s*parse\s*\(/,'parse wirft bei Fehlern. Für Formulare nimmst du safeParse und zeigst die Meldungen an.'),
    bad(/\binnerHTML\b|\bv-html\b/,'Fehlermeldungen kommen als Text ({{ }}), nie als HTML.'),
    bad(/<div\b[^>]*@click=|<span\b[^>]*@click=/,'Aktionen gehören auf <button>, nicht auf <div> oder <span>.')
  ],
  solution:L('<script setup lang="ts">','import { reactive, ref } from "vue";','import { z } from "zod";','','const emit = defineEmits<{ saved: [data: { email: string; minutes: number }] }>();','','const schema = z.object({','  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),','  minutes: z.coerce.number().int().min(1, "Mindestens 1 Minute.").max(600, "Höchstens 600 Minuten."),','});','','const form = reactive({ email: "", minutes: "" });','const errors = ref<Record<string, string>>({});','','function submit() {','  const result = schema.safeParse(form);','  if (!result.success) {','    const next: Record<string, string> = {};','    for (const issue of result.error.issues) {','      const key = String(issue.path[0]);','      if (!(key in next)) next[key] = issue.message;','    }','    errors.value = next;','    return;','  }','  errors.value = {};','  emit("saved", result.data);','}','</script>','','<template>','  <form @submit.prevent="submit" novalidate>','    <label for="email">E-Mail</label>','    <input id="email" type="email" autocomplete="email" v-model="form.email" :aria-invalid="Boolean(errors.email)" aria-describedby="email-error" />','    <p id="email-error" v-if="errors.email" role="alert">{{ errors.email }}</p>','','    <label for="minutes">Minuten</label>','    <input id="minutes" inputmode="numeric" v-model="form.minutes" :aria-invalid="Boolean(errors.minutes)" aria-describedby="minutes-error" />','    <p id="minutes-error" v-if="errors.minutes" role="alert">{{ errors.minutes }}</p>','','    <button type="submit">Speichern</button>','  </form>','</template>'),
  hint:'safeParse liefert ein Objekt mit success statt zu werfen. Die Pfade der Issues sagen dir, zu welchem Feld jede Meldung gehört.',
  why:'Ein Schema ist die einzige Wahrheit über gültige Eingaben (Typen und Prüfung zugleich). Fehler am Feld, mit aria-describedby verknüpft, sind für alle Nutzer erreichbar.'},
{id:'vue-w4',modules:['js-m4'],level:'schwer',type:'write',language:'typescript',rows:30,
  title:'Router mit Anmelde-Schutz',
  text:'Schreibe die Datei router.ts mit geschützten Routen, einem Guard und Lazy Loading.',
  details:['import { createRouter, createWebHistory } from \'vue-router\' und import { useAuth } from \'./auth\'.','Routen: "/" (Name home, HomeView), "/login" (Name login, lazy per () => import(\'./views/LoginView.vue\')), "/tasks" (Name tasks, lazy, meta: { requiresAuth: true }) und ein Catch-all "/:pathMatch(.*)*" auf NotFoundView.','router.beforeEach((to) => { … }): ist to.meta.requiresAuth gesetzt und useAuth().isLoggedIn.value false, gib { name: \'login\', query: { redirect: to.fullPath } } zurück. Sonst liefere true.','export default router. Kein window.location, kein next()-Callback.'],
  starter:L('// Schreibe hier die Datei router.ts','',''),
  rules:[
    need('createRouter und createWebHistory importieren',/\bimport\s*\{\s*createRouter\s*,\s*createWebHistory\s*\}\s*from\s*["']vue-router["']/),
    need('useAuth importieren',/\bimport\s*\{\s*useAuth\s*\}\s*from\s*["']\.\/auth["']/),
    need('createRouter mit createWebHistory()',/\bconst\s+router\s*=\s*createRouter\s*\(\s*\{[\s\S]*history\s*:\s*createWebHistory\s*\(\s*\)/),
    need('Route home',/\bpath\s*:\s*["']\/["']\s*,\s*name\s*:\s*["']home["']\s*,\s*component\s*:\s*HomeView\b/),
    need('Route login mit Lazy Loading',/\bpath\s*:\s*["']\/login["']\s*,\s*name\s*:\s*["']login["']\s*,\s*component\s*:\s*\(\s*\)\s*=>\s*import\s*\(\s*["']\.\/views\/LoginView\.vue["']\s*\)/),
    need('Route tasks mit meta.requiresAuth',/\bpath\s*:\s*["']\/tasks["']\s*,\s*name\s*:\s*["']tasks["']\s*,\s*component\s*:\s*\(\s*\)\s*=>\s*import\s*\([^)]*\)\s*,\s*meta\s*:\s*\{\s*requiresAuth\s*:\s*true\s*\}/),
    need('Catch-all-Route',/\bpath\s*:\s*["']\/:pathMatch\(\.\*\)\*["']\s*,\s*component\s*:\s*NotFoundView\b/),
    need('beforeEach mit Prüfung',/\brouter\s*\.\s*beforeEach\s*\(\s*\(\s*to\s*\)\s*=>\s*\{[\s\S]*to\s*\.\s*meta\s*\.\s*requiresAuth\s*&&\s*!\s*useAuth\s*\(\s*\)\s*\.\s*isLoggedIn\s*\.\s*value/),
    need('Umleitung mit redirect-Parameter',/return\s*\{\s*name\s*:\s*["']login["']\s*,\s*query\s*:\s*\{\s*redirect\s*:\s*to\s*\.\s*fullPath\s*\}\s*\}\s*;/),
    need('return true',/\breturn\s+true\s*;/),
    need('export default router',/\bexport\s+default\s+router\b/),
    bad(/\bnext\s*\(|\(\s*to\s*,\s*from\s*,\s*next\s*\)/,'Der next()-Callback ist veraltet. Gib true, false oder ein Ziel einfach zurück.'),
    bad(/\bwindow\s*\.\s*location\b|\blocation\s*\.\s*href\b/,'Eine harte Navigation lädt die ganze Seite neu und verliert den Zustand. Gib ein Routenziel zurück.'),
    bad(/\bas\s+(?!const\b)\w+|:\s*any\b|@ts-ignore/,'Keine Typ-Umgehungen: Nutze die Typen von vue-router.')
  ],
  solution:L('import { createRouter, createWebHistory } from "vue-router";','import HomeView from "./views/HomeView.vue";','import NotFoundView from "./views/NotFoundView.vue";','import { useAuth } from "./auth";','','const router = createRouter({','  history: createWebHistory(),','  routes: [','    { path: "/", name: "home", component: HomeView },','    { path: "/login", name: "login", component: () => import("./views/LoginView.vue") },','    { path: "/tasks", name: "tasks", component: () => import("./views/TasksView.vue"), meta: { requiresAuth: true } },','    { path: "/:pathMatch(.*)*", component: NotFoundView },','  ],','});','','router.beforeEach((to) => {','  if (to.meta.requiresAuth && !useAuth().isLoggedIn.value) {','    return { name: "login", query: { redirect: to.fullPath } };','  }','  return true;','});','','export default router;'),
  hint:'Der Guard läuft vor jeder Navigation. Mit dem redirect-Parameter kann die Login-Seite nach der Anmeldung zurück zum gewünschten Ziel führen.',
  why:'Ein Router-Guard ersetzt keine Zugriffskontrolle auf dem Server, verbessert aber die Bedienung. Lazy Loading hält das Startpaket klein, weil Seiten erst bei Bedarf geladen werden.'}
]);
})();
