#!/usr/bin/env bash
set -euo pipefail

# Usar directorio del usuario en lugar de /opt
SIGNALONE_DIR="$HOME/.signalone"
ENV_FILE="$SIGNALONE_DIR/.env"

# Crear directorio en el home del usuario
mkdir -p "$SIGNALONE_DIR"

# Copiar archivos al directorio del usuario
rsync -a --delete ~/Escritorio/signalone/ "$SIGNALONE_DIR/"

# Crear archivo de configuración en el directorio del proyecto
echo -e "API_KEY=change_me\nPORT=8080\nDB_PATH=$SIGNALONE_DIR/db.sqlite" > "$ENV_FILE"

# Cambiar al directorio e instalar dependencias
cd "$SIGNALONE_DIR"
npm init -y >/dev/null 2>&1 || true
npm i express cors better-sqlite3

# Crear servicio systemd para el usuario actual (sin sudo)
mkdir -p "$HOME/.config/systemd/user"
tee "$HOME/.config/systemd/user/signalone-portal.service" >/dev/null <<UNIT
[Unit]
Description=SignalOne Admin Portal
After=network.target

[Service]
EnvironmentFile=$ENV_FILE
WorkingDirectory=$SIGNALONE_DIR
ExecStart=/usr/bin/node $SIGNALONE_DIR/server.cjs
Restart=always

[Install]
WantedBy=default.target
UNIT

# Recargar y habilitar el servicio de usuario
systemctl --user daemon-reload
systemctl --user enable --now signalone-portal
systemctl --user status -n 20 signalone-portal
