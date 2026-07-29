# -*- coding: utf-8 -*-
"""
Ejemplo de cómo generar un recibo de caja.
Modifica los datos y ejecuta: python ejemplo.py
"""

from generar_recibo import crear_recibo

# ─── DATOS DEL RECIBO ────────────────────────────────────────────────────────
# Cambia estos valores cada vez que necesites un nuevo recibo

recibo = {
    # Número consecutivo del recibo
    "numero_rc": "0002",

    # Fecha de emisión (DD/MM/AAAA)
    "fecha_emision": "22/07/2026",

    # Ciudad (opcional, si no se pone usa la del config.py)
    "ciudad": "CALI",

    # Datos del comprador/cliente
    "comprador": {
        "nombre": "GLORIA NANCY ZAPATA",
        "documento": "38755376",
        "email": "",
        "direccion": "",
        "telefono": "3215205048 - 3153488577",
    },

    # Lista de conceptos (puedes agregar múltiples)
    "conceptos": [
        {
            "concepto": (
                "*PASADÍA SALENTO - VALLE DEL COCORA - FILANDIA*\n"
                "Fecha de Viaje: Julio 26 de 2026\n"
                "4 PERSONAS"
            ),
            "banco": "NEQUI",
            "valor": "$400.000",       # Valor formateado para mostrar
            "valor_num": 400000,           # Valor numérico para calcular total
            "saldo": "$428.000",             # Saldo formateado
            "saldo_num": 428000,               # Saldo numérico para calcular total
        },
        # ─── Descomenta y modifica para agregar más conceptos ───
        # {
        #     "concepto": "*TOUR CARTAGENA*\nFecha: Agosto 10 de 2026\n2 PERSONAS",
        #     "banco": "NEQUI",
        #     "valor": "$800.000,00",
        #     "valor_num": 800000,
        #     "saldo": "$200.000,00",
        #     "saldo_num": 200000,
        # },
    ],
}

# ─── GENERAR EL PDF ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    ruta = crear_recibo(recibo)
    print(f"\nArchivo listo en: {ruta}")
    print("Ábrelo con tu visor de PDF favorito.")
