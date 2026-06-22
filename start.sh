#!/bin/bash
# Script de inicio para Railway
echo "=== SMOP - Inicio en produccion ==="

# Construir frontend si existe carpeta client
if [ -d "client" ]; then
  echo "[1/2] Construyendo frontend..."
  cd client && npm install --loglevel=error && npm run build --loglevel=error
  cd ..
  echo "[1/2] Frontend listo."
fi

echo "[2/2] Iniciando servidor..."
cd server && node index.js
