#!/usr/bin/env bash
set -euo pipefail

echo "Iniciando SignalOne en modo desarrollo..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no está instalado"
    exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm init -y >/dev/null 2>&1 || true
    npm install express cors better-sqlite3
fi

# Configurar variables de entorno para desarrollo
export API_KEY=${API_KEY:-"change_me"}
export PORT=${PORT:-8080}
export DB_PATH=${DB_PATH:-"./db.sqlite"}

echo "Configuración:"
echo "  Puerto: $PORT"
echo "  API Key: $API_KEY"
echo "  Base de datos: $DB_PATH"
echo ""
echo "Accede al portal en: http://localhost:$PORT/admin.html"
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor
node server.cjs
