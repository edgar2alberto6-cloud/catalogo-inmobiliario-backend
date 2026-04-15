@echo off
title Iniciador Catalogo Inmobiliario

echo ================================
echo Iniciando proyecto...
echo ================================

echo.
echo Abriendo backend Django...

start "Backend Django" powershell -NoExit -Command ^
"Set-Location 'C:\Users\EDGAR ALBERTO AY MAY\Documents\PROYECTOS\catalogo_inmobiliario\backend'; ^
..\venv\Scripts\Activate.ps1; ^
python manage.py runserver"

echo.
echo Abriendo frontend React...

start "Frontend Vite" powershell -NoExit -Command ^
"Set-Location 'C:\Users\EDGAR ALBERTO AY MAY\Documents\PROYECTOS\catalogo_inmobiliario\frontend'; ^
npm run dev"

echo.
echo Proyecto levantado correctamente 🚀

exit