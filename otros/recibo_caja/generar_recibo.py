# -*- coding: utf-8 -*-
"""
Generador de Recibos de Caja - Borondo Tours SAS
=====================================================
Genera PDFs con el diseño del recibo de caja RC-9063.

Uso:
    from generar_recibo import crear_recibo
    crear_recibo(datos_recibo)

Dependencias:
    pip install fpdf2
"""

import os
from fpdf import FPDF
from config import EMPRESA, ASSETS, OUTPUT_DIR, TEXTO_REEMBOLSO, TEXTO_ADVERTENCIA, ELABORADO_POR


class ReciboCajaPDF(FPDF):
    """Clase que genera el PDF del Recibo de Caja con el diseño Borondo Tours."""

    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="letter")
        self.set_auto_page_break(auto=False)
        self.add_page()
        self.set_margins(10, 10, 10)

    # ─── ENCABEZADO ──────────────────────────────────────────────────────────────

    def dibujar_encabezado(self, numero_rc, fecha_emision, ciudad):
        """Dibuja el encabezado: logo + datos empresa + cuadro recibo de caja."""
        x_inicio = 10
        y_inicio = 10

        # Logo (si existe)
        logo_path = ASSETS.get("logo", "")
        if logo_path and os.path.isfile(logo_path):
            self.image(logo_path, x=x_inicio, y=y_inicio, w=45)

        # Datos de la empresa (al lado del logo)
        self.set_xy(58, y_inicio)
        self.set_font("Arial", "B", 8)
        self.cell(0, 4, EMPRESA["nombre"], ln=True)
        self.set_x(58)
        self.set_font("Arial", "", 7)
        self.cell(0, 3.5, f"NIT {EMPRESA['nit']}", ln=True)
        self.set_x(58)
        self.cell(0, 3.5, EMPRESA["direccion"], ln=True)
        self.set_x(58)
        self.cell(0, 3.5, f"TELEFONOS: {EMPRESA['telefonos'].split(chr(10))[0]}", ln=True)
        self.set_x(58)
        if "\n" in EMPRESA["telefonos"]:
            self.cell(0, 3.5, EMPRESA["telefonos"].split("\n")[1], ln=True)
            self.set_x(58)
        self.cell(0, 3.5, EMPRESA["web"], ln=True)
        self.set_x(58)
        self.cell(0, 3.5, EMPRESA["email"], ln=True)

        # Cuadro RECIBO DE CAJA (derecha)
        rx = 150
        ry = y_inicio
        rw = 56
        self.set_draw_color(0, 0, 0)
        self.set_line_width(0.3)

        # Título "RECIBO DE CAJA"
        self.set_xy(rx, ry)
        self.set_font("Arial", "B", 10)
        self.set_fill_color(240, 240, 240)
        self.cell(rw, 7, "RECIBO DE CAJA", border=1, align="C", fill=True, ln=True)

        # Número RC
        self.set_xy(rx, ry + 7)
        self.set_font("Arial", "B", 11)
        self.cell(rw, 7, f"RC- {numero_rc}", border=1, align="C", ln=True)

        # Fecha emisión
        self.set_xy(rx, ry + 14)
        self.set_font("Arial", "", 8)
        self.cell(rw / 2, 6, "FECHA EMISION", border=1, align="C")
        self.set_font("Arial", "B", 9)
        self.cell(rw / 2, 6, fecha_emision, border=1, align="C", ln=True)

        # Ciudad
        self.set_xy(rx, ry + 20)
        self.set_font("Arial", "", 9)
        self.cell(rw, 6, ciudad or EMPRESA["ciudad"], border=1, align="C", ln=True)

        return ry + 30  # Y donde termina el encabezado

    # ─── DATOS DEL COMPRADOR ─────────────────────────────────────────────────────

    def dibujar_datos_comprador(self, y_pos, comprador):
        """Dibuja la sección de datos del comprador."""
        x = 10
        w_total = 196  # ancho total disponible

        # Título "Datos comprador"
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.set_fill_color(220, 220, 220)
        self.cell(w_total, 6, "Datos comprador", border=1, align="C", fill=True, ln=True)
        y_pos += 6

        # Fila 1: Recibido de
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(25, 6, "Recibido de:", border=1)
        self.set_font("Arial", "", 8)
        self.cell(w_total - 25, 6, f"  {comprador['nombre']}", border=1, ln=True)
        y_pos += 6

        # Fila 2: Documento + Email
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(25, 6, "Documento:", border=1)
        self.set_font("Arial", "", 8)
        self.cell(73, 6, f"  {comprador.get('documento', '')}", border=1)
        self.set_font("Arial", "B", 8)
        self.cell(15, 6, "Email:", border=1)
        self.set_font("Arial", "", 8)
        self.cell(w_total - 25 - 73 - 15, 6, f"  {comprador.get('email', '')}", border=1, ln=True)
        y_pos += 6

        # Fila 3: Dirección + Teléfono
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(25, 6, "Direccion:", border=1)
        self.set_font("Arial", "", 8)
        self.cell(73, 6, f"  {comprador.get('direccion', '')}", border=1)
        self.set_font("Arial", "B", 8)
        self.cell(15, 6, "Telefono:", border=1)
        self.set_font("Arial", "", 8)
        self.cell(w_total - 25 - 73 - 15, 6, f"  {comprador.get('telefono', '')}", border=1, ln=True)
        y_pos += 6

        return y_pos

    # ─── TABLA DE CONCEPTOS ──────────────────────────────────────────────────────

    def dibujar_tabla_conceptos(self, y_pos, conceptos):
        """Dibuja la tabla con los conceptos del recibo."""
        x = 10
        w_total = 196

        # Anchos de columnas
        w_concepto = 80
        w_banco = 40
        w_valor = 40
        w_saldo = 36

        # Encabezado de tabla
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.set_fill_color(220, 220, 220)
        self.cell(w_concepto, 6, "Concepto", border=1, align="C", fill=True)
        self.cell(w_banco, 6, "Banco", border=1, align="C", fill=True)
        self.cell(w_valor, 6, "Valor abonado", border=1, align="C", fill=True)
        self.cell(w_saldo, 6, "Saldo", border=1, align="C", fill=True, ln=True)
        y_pos += 6

        # Filas de conceptos
        self.set_font("Arial", "", 8)
        for item in conceptos:
            concepto_text = item.get("concepto", "")
            banco = item.get("banco", "")
            valor = item.get("valor", "")
            saldo = item.get("saldo", "")

            # Calcular altura necesaria para el concepto (multi-linea)
            # Estimar líneas necesarias
            lineas = max(1, len(concepto_text) // 40 + 1)
            h_fila = max(18, lineas * 5)

            self.set_xy(x, y_pos)

            # Concepto (multi-celda)
            x_actual = self.get_x()
            y_actual = self.get_y()

            # Dibujar bordes de las celdas con la altura calculada
            self.rect(x_actual, y_actual, w_concepto, h_fila)
            self.rect(x_actual + w_concepto, y_actual, w_banco, h_fila)
            self.rect(x_actual + w_concepto + w_banco, y_actual, w_valor, h_fila)
            self.rect(x_actual + w_concepto + w_banco + w_valor, y_actual, w_saldo, h_fila)

            # Escribir texto concepto
            self.set_xy(x_actual + 1, y_actual + 2)
            self.set_font("Arial", "BI", 7)
            self.multi_cell(w_concepto - 2, 4, concepto_text, border=0)

            # Escribir banco (centrado vertical)
            self.set_xy(x_actual + w_concepto, y_actual + h_fila / 2 - 3)
            self.set_font("Arial", "B", 8)
            self.cell(w_banco, 6, banco, border=0, align="C")

            # Escribir valor
            self.set_xy(x_actual + w_concepto + w_banco, y_actual + h_fila / 2 - 3)
            self.set_font("Arial", "", 9)
            self.cell(w_valor, 6, valor, border=0, align="C")

            # Escribir saldo
            self.set_xy(x_actual + w_concepto + w_banco + w_valor, y_actual + h_fila / 2 - 3)
            self.cell(w_saldo, 6, saldo, border=0, align="C")

            y_pos += h_fila

        # Fila TOTAL
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 9)
        self.cell(w_concepto, 7, "", border=1)
        self.cell(w_banco, 7, "Total", border=1, align="C")

        # Calcular total
        total_valor = sum(
            float(c.get("valor_num", 0)) for c in conceptos
        )
        total_saldo = sum(
            float(c.get("saldo_num", 0)) for c in conceptos
        )

        self.set_font("Arial", "B", 9)
        self.cell(w_valor, 7, f"${total_valor:,.0f}", border=1, align="C")
        self.cell(w_saldo, 7, f"${total_saldo:,.0f}", border=1, align="C", ln=True)
        y_pos += 7

        return y_pos

    # ─── SECCIÓN FIRMA ───────────────────────────────────────────────────────────

    def dibujar_firma(self, y_pos):
        """Dibuja la sección de firma y elaborado por."""
        x = 10
        w_total = 196

        y_pos += 3

        # Imagen de firma (si existe)
        firma_path = ASSETS.get("firma", "")
        if firma_path and os.path.isfile(firma_path):
            self.image(firma_path, x=x + w_total / 2 + 10, y=y_pos, w=45)

        y_pos += 20

        # Línea de recibido
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(20, 5, "Recibido:", border=0)
        self.line(x + 22, y_pos + 5, x + 80, y_pos + 5)

        # Elaborado por
        self.set_xy(x + 85, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(0, 5, f"Elaborado por: {ELABORADO_POR}", border=0, ln=True)
        y_pos += 5

        # CC/NIT
        self.set_xy(x, y_pos)
        self.set_font("Arial", "B", 8)
        self.cell(20, 5, "CC /NIT", border=0)

        # Info web en elaborado
        self.set_xy(x + 85, y_pos)
        self.set_font("Arial", "", 6)
        self.cell(0, 4, f"{EMPRESA['web']} - {EMPRESA['email']}", ln=True)
        self.set_xy(x + 85, y_pos + 4)
        self.cell(0, 4, f"Dir: {EMPRESA['direccion']} Tel: {EMPRESA['telefonos'].split(chr(10))[0].split()[0]}", ln=True)

        y_pos += 12
        return y_pos

    # ─── PIE DE PÁGINA ───────────────────────────────────────────────────────────

    def dibujar_pie(self, y_pos):
        """Dibuja los textos legales al pie."""
        x = 10
        w_total = 196

        y_pos += 5

        # Texto reembolso
        self.set_xy(x, y_pos)
        self.set_font("Arial", "BI", 7)
        self.set_text_color(180, 0, 0)
        self.cell(w_total, 5, TEXTO_REEMBOLSO, border=0, align="C", ln=True)
        y_pos += 6

        # Texto advertencia
        self.set_xy(x, y_pos)
        self.set_font("Arial", "", 5.5)
        self.set_text_color(0, 0, 0)
        texto_adv = TEXTO_ADVERTENCIA.format(rnt=EMPRESA["rnt"])
        self.multi_cell(w_total, 3, texto_adv, border=0, align="C")


def crear_recibo(datos):
    """
    Crea un recibo de caja en PDF.

    Parámetros:
    -----------
    datos : dict con las siguientes claves:
        - numero_rc: str, número del recibo (ej: "9063")
        - fecha_emision: str, fecha (ej: "02/07/2026")
        - ciudad: str, ciudad (ej: "CALI") [opcional, usa config]
        - comprador: dict con:
            - nombre: str
            - documento: str
            - email: str
            - direccion: str
            - telefono: str
        - conceptos: lista de dicts, cada uno con:
            - concepto: str (descripción del servicio)
            - banco: str (nombre del banco)
            - valor: str (valor formateado, ej: "$535.000,00")
            - valor_num: float (valor numérico para totales)
            - saldo: str (saldo formateado)
            - saldo_num: float (saldo numérico para totales)

    Retorna:
    --------
    str: ruta al archivo PDF generado.
    """
    # Crear directorio de salida si no existe
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    pdf = ReciboCajaPDF()

    # Encabezado
    y = pdf.dibujar_encabezado(
        numero_rc=datos["numero_rc"],
        fecha_emision=datos["fecha_emision"],
        ciudad=datos.get("ciudad", EMPRESA["ciudad"]),
    )

    # Espacio
    y += 3

    # Datos comprador
    y = pdf.dibujar_datos_comprador(y, datos["comprador"])

    # Espacio
    y += 2

    # Tabla de conceptos
    y = pdf.dibujar_tabla_conceptos(y, datos["conceptos"])

    # Firma
    y = pdf.dibujar_firma(y)

    # Pie de página
    pdf.dibujar_pie(y)

    # Guardar PDF
    nombre_archivo = f"RC-{datos['numero_rc']} {datos['conceptos'][0]['banco']} ${datos['conceptos'][0]['valor_num']:,.0f}.pdf"
    nombre_archivo = nombre_archivo.replace(",", ".")
    ruta_salida = os.path.join(OUTPUT_DIR, nombre_archivo)

    pdf.output(ruta_salida)
    print(f"[OK] Recibo generado: {ruta_salida}")
    return ruta_salida


if __name__ == "__main__":
    # Ejemplo de uso rápido
    ejemplo = {
        "numero_rc": "9063",
        "fecha_emision": "02/07/2026",
        "ciudad": "CALI",
        "comprador": {
            "nombre": "ORDOÑEZ HEVERT HUMBERTO",
            "documento": "16603197",
            "email": "ordonezevert@gmail.com",
            "direccion": "Carrera 1 # 70-180",
            "telefono": "3163691717 - 34698283318",
        },
        "conceptos": [
            {
                "concepto": "*PASADÍA SALENTO - VALLE DEL COCORA - FILANDIA*\nFecha de Viaje: Julio 5 de 2026\n5 PERSONAS",
                "banco": "BANCOLOMBIA",
                "valor": "$535.000,00",
                "valor_num": 535000,
                "saldo": "$0,00",
                "saldo_num": 0,
            }
        ],
    }
    crear_recibo(ejemplo)
