/**
 * ARCHIVO: Codigo.gs
 * Backend Controller SaaS Multi-Tenant
 */

function doGet(e) {
  // Retorna la vista principal combinada.
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CopuRails - ERP Cooperativo')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Función helper para incluir archivos HTML parciales en el Index.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ==========================================
 * LÓGICA DE NEGOCIO: MÓDULO DE CAJA
 * ==========================================
 */

/**
 * Intenta abrir la caja para un usuario en una sucursal específica.
 * @param {Object} formData - Contiene {montoInicial, tenantId, sucursalId, userId}
 * @return {Object} Resultado de la operación
 */
function procesarAperturaCaja(formData) {
  try {
    // 1. Validar Contexto Multi-Tenant
    if (!formData.tenantId) throw new Error("Falta el identificador de la Cooperativa.");
    
    // 2. Simulación de Registro en Base de Datos (Hoja 'Control_Cajas')
    // let ss = SpreadsheetApp.getActiveSpreadsheet();
    // let sheet = ss.getSheetByName('Control_Cajas');
    // sheet.appendRow([new Date(), formData.tenantId, formData.sucursalId, formData.userId, formData.montoInicial, 'ABIERTA']);

    // 3. Transición de Estado (Logica)
    const estadoRespuesta = {
      status: 'success',
      message: 'Caja abierta exitosamente',
      cajaAbierta: true,
      saldoInicialConfirmado: formData.montoInicial,
      timestamp: new Date().toISOString()
    };
    
    return estadoRespuesta;
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}