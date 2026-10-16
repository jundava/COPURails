/**
 * ARCHIVO: Codigo_Contabilidad.gs
 * Motor de Asientos Automáticos Multi-Tenant
 */

/**
 * Registra un movimiento financiero en el Libro Diario de la Cooperativa.
 * @param {string} tenantId - ID de la cooperativa (SaaS).
 * @param {string} tipoOperacion - Ej: "COBRO_PRESTAMO", "APORTE_SOCIETARIO".
 * @param {number} monto - Monto total de la transacción.
 * @param {string} usuarioId - Cajero o usuario que ejecuta.
 * @param {string} referencia - Número de comprobante o recibo.
 * @return {Object} - Estado de la transacción contable.
 */
function registrarAsientoAutomatico(tenantId, tipoOperacion, monto, usuarioId, referencia) {
  try {
    if (!tenantId) throw new Error("Acceso Denegado: Tenant ID no proporcionado.");
    if (monto <= 0) throw new Error("El monto de la transacción debe ser mayor a 0.");

    const fechaCreacion = new Date().toISOString();
    
    // 1. Mapeo de Reglas Contables (Hardcoded para el ejemplo, idealmente en base de datos)
    // Cada operación define qué cuentas se debitan (Debe) y acreditan (Haber)
    const reglasContables = {
      "COBRO_PRESTAMO": {
        debe: [{ cuentaCodigo: "1.1.1.01", cuentaNombre: "Caja Efectivo", porcentaje: 100 }],
        haber: [
          { cuentaCodigo: "1.2.1.01", cuentaNombre: "Préstamos Vigentes a Cobrar", porcentaje: 80 },
          { cuentaCodigo: "4.1.1.01", cuentaNombre: "Intereses por Préstamos", porcentaje: 20 } // Simulación de distribución
        ]
      },
      "APORTE_SOCIETARIO": {
        debe: [{ cuentaCodigo: "1.1.1.01", cuentaNombre: "Caja Efectivo", porcentaje: 100 }],
        haber: [{ cuentaCodigo: "3.1.1.01", cuentaNombre: "Capital Social Suscripto", porcentaje: 100 }]
      }
    };

    const regla = reglasContables[tipoOperacion];
    if (!regla) throw new Error("Tipo de operación financiera no reconocida por el motor contable.");

    // 2. Preparar el Asiento (Líneas del Diario)
    let lineasAsiento = [];
    let sumaDebe = 0;
    let sumaHaber = 0;

    // Procesar DEBE
    regla.debe.forEach(cta => {
      let valor = (monto * (cta.porcentaje / 100));
      sumaDebe += valor;
      lineasAsiento.push(crearEstructuraLinea(tenantId, fechaCreacion, referencia, cta.cuentaCodigo, cta.cuentaNombre, valor, 0, usuarioId));
    });

    // Procesar HABER
    regla.haber.forEach(cta => {
      let valor = (monto * (cta.porcentaje / 100));
      sumaHaber += valor;
      lineasAsiento.push(crearEstructuraLinea(tenantId, fechaCreacion, referencia, cta.cuentaCodigo, cta.cuentaNombre, 0, valor, usuarioId));
    });

    // 3. Validación de Cuadre (Principio de Partida Doble)
    // Usamos toFixed para evitar errores de coma flotante de JS
    if (sumaDebe.toFixed(2) !== sumaHaber.toFixed(2)) {
      throw new Error("ERROR DE CUADRE: El asiento contable no balancea. Transacción abortada.");
    }

    // 4. Inserción en Base de Datos (Simulación)
    // Aquí insertarías las lineasAsiento en tu hoja 'Libro_Diario' usando SpreadsheetApp
    // let ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Libro_Diario");
    // lineasAsiento.forEach(linea => ws.appendRow(Object.values(linea)));

    return {
      status: "success",
      message: `Asiento por ${tipoOperacion} registrado correctamente.`,
      asiento_id: referencia,
      timestamp: fechaCreacion
    };

  } catch (error) {
    return { status: "error", message: error.message };
  }
}

/**
 * Helper para estandarizar la estructura de datos del Libro Diario.
 */
function crearEstructuraLinea(tenantId, fecha, referencia, cuentaCodigo, cuentaNombre, debe, haber, usuarioId) {
  return {
    tenant_id: tenantId,           // CRÍTICO: Segregación Multiempresa
    fecha: fecha,
    comprobante_ref: referencia,
    cuenta_codigo: cuentaCodigo,
    cuenta_nombre: cuentaNombre,
    debe: debe,
    haber: haber,
    usuario_auditoria: usuarioId
  };
}