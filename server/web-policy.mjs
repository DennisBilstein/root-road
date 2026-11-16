// Sicherheitsrichtlinien, die der Express-Server (server.mjs) und der Static-Build (scripts/build-static.mjs) gemeinsam nutzen.

// Skript-Richtlinie: Skripte nur von der eigenen Herkunft, keine Inline-<script>-Blöcke, kein eval, Worker nur von der eigenen Herkunft.
// Inline-Ereignisattribute sind verboten (script-src-attr 'none'); die Oberfläche nutzt data-on…-Attribute und assets/actions.js.
const scriptPolicy = "script-src 'self'; script-src-attr 'none'; worker-src 'self'";

// Ausnahme nur für die Sandbox der Code-Werkstatt (assets/guided-sandbox.html): Sie läuft im iframe mit sandbox="allow-scripts" (eigene, leere
// Herkunft, kein Netz, keine Cookies) und führt Nutzercode in einem Blob-Worker mit new Function aus. Dafür braucht nur dieses Dokument
// Inline-Skript und eval; die Seite selbst bekommt beides nicht.
export const sandboxPath = '/assets/guided-sandbox.html';
export const sandboxPolicy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none'; frame-ancestors 'self'";

// Haupt-CSP: alles standardmäßig nur von der eigenen Herkunft. Ausnahmen: style-src 'unsafe-inline' (style-Attribute in der Oberfläche),
// img-src data:/blob: (Favicon, Erfolgskarte, Export) und connect-src http:/https: (der KI-Tutor spricht einen frei einstellbaren
// lokalen oder entfernten Endpunkt an). Skripte nur von der eigenen Herkunft, keine Inline-Ereignisattribute, keine Plugins.
export const mainPolicy = ["default-src 'self'", scriptPolicy, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self'", "connect-src 'self' http: https:",
  "frame-src 'self' https://www.youtube-nocookie.com", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join('; ');

// Die App nutzt keine dieser Browser-Funktionen; so kann auch eingebundener Fremdcode sie nicht anfordern.
export const permissionsPolicy = 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()';
