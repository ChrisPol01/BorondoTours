@echo off
rem Envoltorio de Windows (cmd) del lanzador del proyecto: node .megafactory\bin\factory.mjs
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Falta node en el PATH: instala Node 22 o superior y revisa con mf doctor. 1>&2
  exit /b 127
)
node "%~dp0factory.mjs" %*
exit /b %ERRORLEVEL%
