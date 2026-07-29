# -*- coding: utf-8 -*-
"""
Configuración de la empresa para el generador de Recibos de Caja.
Modifica estos valores con tu información real.
"""

EMPRESA = {
    "nombre": "BORONDO TOURS SAS",
    "nit": "902.080.0308-7",
    "direccion": "CALI, VALLE DEL CAUCA",
    "telefonos": "3152812298",
    "web": "https://www.borondotours.com",
    "email": "borondo.tours01@gmail.com",
    "ciudad": "CALI",
    "rnt": "294364",
}

# Rutas a los archivos de imagen (logo y firma)
# Coloca tus archivos en la carpeta 'assets/'
ASSETS = {
    "logo": "assets/logo.png",        # Logo de la empresa (recomendado ~200x80 px)
    "firma": "assets/firma.png",       # Imagen de la firma manuscrita (~200x60 px)
}

# Carpeta donde se guardan los PDFs generados
OUTPUT_DIR = "output"

# Texto legal al pie del recibo
TEXTO_REEMBOLSO = "Estimado cliente por reembolso se cobra el 20% de gastos administrativos."

TEXTO_ADVERTENCIA = (
    "ADVERTENCIA: Art 17 ley 679 de 2.001 advertimos a los clientes que la explotación "
    "sexual comercial y el abuso sexual de niños, niñas y adolescentes en el país son "
    "sancionados hasta con 35 años de prisión conforme al código penal colombiano. "
    "(art 217 Ley 599 de 2000). RNT {rnt}."
)

# Nombre del asesor que elabora el recibo
ELABORADO_POR = "EJECUTIVO COMERCIAL"
