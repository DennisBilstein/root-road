# Docker-Lab

Gehört zu den Lektionen `dk-m1-*`. Ein kleiner Node-Dienst (`app/`, nur eingebaute Module, `npm test` im Ordner `app`) und sechs Fallstudien in `cases/`,
die echte Container starten: Schichten und Build-Cache, `.dockerignore` und mehrstufige Builds mit Tests, Härtung, Volumes und Netzwerke, Betrieb
(Geheimnisse, Gesundheitscheck, Signale) und ein Compose-Projekt mit zwei Diensten (`compose.yaml`). Jede Fallstudie druckt deterministische Aussagen,
die mit der `.expected`-Datei daneben verglichen werden.

```bash
node content/examples/docker-lab/run.mjs            # alle Fälle prüfen
node content/examples/docker-lab/run.mjs 03         # nur Fall 3
node content/examples/docker-lab/run.mjs --update   # erwartete Ausgaben neu schreiben, danach `git diff` lesen
```

Voraussetzungen: laufendes Docker (getestet mit der in `cases/_version.txt` genannten Version, Docker Desktop auf macOS), Compose-Plugin und das lokal
vorhandene Image `node:24-slim`. Es wird nichts heruntergeladen. Alle angelegten Ressourcen (Images, Container, Netzwerke, Volumes, Compose-Projekt) haben den
Präfix `rootpfad-dk-<pid>` und das Label `rootpfad.lab=docker-lab`; aufgeräumt wird nur, was der Lauf selbst angelegt hat. Fremde Container und Images bleiben
unberührt. Veröffentlichte Ports sind an 127.0.0.1 gebunden. Nicht Teil von `npm test` oder der CI, weil Docker gebraucht wird; die App-Tests laufen in
`npm run test:labs`. Die Fälle 3 und 5 hängen vom Kernel der Docker-VM ab (Capabilities, OOM-Kill, Signale) und wurden nur dort geprüft.
