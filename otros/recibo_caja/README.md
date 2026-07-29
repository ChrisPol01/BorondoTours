# Generador de Recibos de Caja - Viajes Guiaplanet

Genera PDFs de recibos de caja con tu logo, firma e informacion de la empresa.

## Instalacion

```bash
pip install fpdf2
```

## Estructura

```
recibo_caja/
  assets/
    logo.png          <-- Coloca aqui tu logo (~200x80 px)
    firma.png         <-- Coloca aqui tu firma manuscrita (~200x60 px)
  output/             <-- Aqui se guardan los PDFs generados
  config.py           <-- Datos de la empresa (editar una vez)
  generar_recibo.py   <-- Script principal (no tocar)
  ejemplo.py          <-- Edita los datos y ejecuta para generar
```

## Uso rapido

1. Coloca tu **logo.png** y **firma.png** en la carpeta `assets/`
2. Edita `ejemplo.py` con los datos del nuevo recibo
3. Ejecuta:

```bash
python ejemplo.py
```

4. El PDF se guarda en `output/`

## Datos que debes cambiar en ejemplo.py

- `numero_rc` - Numero consecutivo del recibo
- `fecha_emision` - Fecha en formato DD/MM/AAAA
- `comprador` - Nombre, documento, email, direccion, telefono
- `conceptos` - Servicio, banco de pago, valor y saldo

## Notas

- Si no pones logo/firma, el recibo se genera sin ellas
- Puedes agregar multiples conceptos en la lista
- El total se calcula automaticamente
- El nombre del PDF se genera automaticamente con el formato: `RC-XXXX BANCO $VALOR.pdf`
