@echo off
title SMOP - Sistema de Monitoreo de Obras Publicas
echo.
echo === SMOP - Sistema de Monitoreo de Obras Publicas ===
echo === Alcaldia del Municipio Plaza ===
echo.

echo [1/3] Instalando dependencias del servidor...
cd /d "%~dp0server"
call npm install --loglevel=error
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion del servidor.
    pause
    exit /b 1
)

echo [2/3] Instalando dependencias del cliente...
cd /d "%~dp0client"
call npm install --loglevel=error
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion del cliente.
    pause
    exit /b 1
)

echo [3/3] Construyendo el cliente...
call npm run build --loglevel=error
if %errorlevel% neq 0 (
    echo ERROR: Fallo la construccion del cliente.
    pause
    exit /b 1
)

echo.
echo === INICIO DEL SERVIDOR ===
cd /d "%~dp0server"
node index.js

pause
