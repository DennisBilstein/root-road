#!/usr/bin/env bash
# Baut das Image (Debian 13) und führt alle Tests als normaler Benutzer im Container aus.
# Das Lab wird nur lesend eingehängt: Die Tests schreiben ausschließlich in temporäre Verzeichnisse.
set -euo pipefail
cd "$(dirname "$0")"
docker build -q -t rootpfad-shell-lab . >/dev/null
docker run --rm -v "$PWD":/lab:ro -w /lab/tests rootpfad-shell-lab bash run-all.sh
