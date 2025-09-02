#!/usr/bin/env bash
set -euo pipefail
sudo install -d -m 755 /opt/signalone
sudo rsync -a --delete ~/Escritorio/signalone/ /opt/signalone/
echo -e "API_KEY=change_me\nPORT=8080\nDB_PATH=/opt/signalone/db.sqlite" | sudo tee /etc/signalone.env >/dev/null
cd /opt/signalone
sudo npm init -y >/dev/null 2>&1 || true
sudo npm i express cors better-sqlite3
sudo tee /etc/systemd/system/signalone-portal.service >/dev/null <<'UNIT'
[Unit]
Description=SignalOne Admin Portal
After=network.target
[Service]
EnvironmentFile=/etc/signalone.env
WorkingDirectory=/opt/signalone
ExecStart=/usr/bin/node /opt/signalone/server.cjs
Restart=always
User=root
[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now signalone-portal
sudo systemctl status -n 20 signalone-portal
