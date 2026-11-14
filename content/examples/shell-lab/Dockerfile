# Wegwerf-Umgebung für die Shell-Lektionen: Debian 13 (trixie) mit Bash 5.2 und den benötigten Werkzeugen.
FROM debian:trixie-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl rsync openssh-client iproute2 procps python3 shellcheck file less \
 && rm -rf /var/lib/apt/lists/*
# Normaler Benutzer für die Rechte-Beispiele; die Skripte laufen nicht als root.
RUN useradd --create-home --shell /bin/bash lernen
USER lernen
WORKDIR /lab
