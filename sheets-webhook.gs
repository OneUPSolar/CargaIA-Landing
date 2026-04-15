/**
 * CargaIA — Google Sheets Webhook
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1vdwdJZvBy6Sir1h5zckT_d7HPBJSuc1NSq8fQ5tEIug
 * Web App URL: https://script.google.com/macros/s/AKfycbyGC43LO1vYrCql73lZvZ1mRHByTeToEQtSki2W_wJ-XezAt0IcVqgF75d6ORI0RyXDdg/exec
 * Deployed: Apr 15, 2026 · Version 1
 */

const SPREADSHEET_ID = '1vdwdJZvBy6Sir1h5zckT_d7HPBJSuc1NSq8fQ5tEIug';
const SHEET_NAME     = 'Registros';

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    const ts  = data.timestamp ? new Date(data.timestamp) : new Date();
    const fmt = Utilities.formatDate(ts, 'America/Tijuana', 'dd/MM/yyyy HH:mm');
    sheet.appendRow([
      fmt,
      data.nombre         || '',
      data.email          || '',
      data.region         || '',
      data.tipo_usuario   || data.tipo || '',
      data.fuente         || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CargaIA Webhook Active' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet  = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['Fecha/Hora','Nombre','Email','Región','Tipo de Usuario','Fuente'];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setColumnWidths(1, headers.length, 180);
  }
  return sheet;
}
