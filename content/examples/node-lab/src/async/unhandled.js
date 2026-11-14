// Wird als Kindprozess gestartet: Eine abgelehnte Promise ohne catch beendet Node.js seit Version 15 mit Exit-Code 1.
const mode = process.argv[2];
if (mode === 'handled') process.on('unhandledRejection', (reason) => { console.log('behandelt:', reason.message); });
Promise.reject(new Error('vergessen'));
setTimeout(() => console.log('weiter'), 20);
