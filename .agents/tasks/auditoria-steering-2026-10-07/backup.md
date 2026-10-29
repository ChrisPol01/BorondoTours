# Respaldo previo a auditoria de steering

Metodo: copia fuera del workspace (el repo tiene ~126 cambios ajenos sin commitear, no se hizo commit). HEAD de referencia: a76b808 (main).
Ruta: C:\Users\Administrador\BorondoTours-backup-steering-2026-10-07  (subcarpetas steering y docs)

## Reversion
Remove-Item -Recurse -Force 'c:\Users\Administrador\BorondoTours\.kiro\steering'
Copy-Item -Recurse -Force 'C:\Users\Administrador\BorondoTours-backup-steering-2026-10-07\steering' 'c:\Users\Administrador\BorondoTours\.kiro\steering'
Remove-Item -Recurse -Force 'c:\Users\Administrador\BorondoTours\docs'
Copy-Item -Recurse -Force 'C:\Users\Administrador\BorondoTours-backup-steering-2026-10-07\docs' 'c:\Users\Administrador\BorondoTours\docs'
