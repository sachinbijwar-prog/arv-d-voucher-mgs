/**
 * SDVMS - SheetsService
 * Generic Google Sheets read/write helpers
 */

const SHEET_NAMES = {
  VOUCHER_MASTER:     'Voucher_Master',
  VENDORS_MASTER:     'Vendors_Master',
  EXPENSE_CATEGORIES: 'Expense_Categories',
  APPROVAL_LOG:       'Approval_Log',
  AUDIT_LOG:          'Audit_Log',
  USERS:              'Users',
}

var SheetsService = (function () {

  function getSpreadsheet() {
    const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID')
    if (!id) throw new Error('SHEET_ID not set in Script Properties')
    return SpreadsheetApp.openById(id)
  }

  function getSheet(name) {
    const ss = getSpreadsheet()
    let sheet = ss.getSheetByName(name)
    if (!sheet) {
      sheet = ss.insertSheet(name)
    }
    return sheet
  }

  function getAllRows(sheetName) {
    const sheet = getSheet(sheetName)
    const data  = sheet.getDataRange().getValues()
    if (data.length < 2) return []
    const headers = data[0]
    return data.slice(1).map(row => {
      const obj = {}
      headers.forEach((h, i) => { obj[h] = row[i] })
      return obj
    })
  }

  function appendRow(sheetName, rowObj, headers) {
    const sheet = getSheet(sheetName)

    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers)
    }

    const allHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    const row = allHeaders.map(h => rowObj[h] !== undefined ? rowObj[h] : '')
    sheet.appendRow(row)
  }

  function updateRow(sheetName, idColumn, idValue, updates) {
    const sheet = getSheet(sheetName)
    const data  = sheet.getDataRange().getValues()
    if (data.length < 2) return false

    const headers   = data[0]
    const idColIdx  = headers.indexOf(idColumn)
    if (idColIdx === -1) return false

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idColIdx]) === String(idValue)) {
        Object.entries(updates).forEach(([key, val]) => {
          const colIdx = headers.indexOf(key)
          if (colIdx !== -1) {
            sheet.getRange(i + 1, colIdx + 1).setValue(val)
          }
        })
        return true
      }
    }
    return false
  }

  function findRow(sheetName, idColumn, idValue) {
    const rows = getAllRows(sheetName)
    return rows.find(r => String(r[idColumn]) === String(idValue)) || null
  }

  function getCategories() {
    try {
      const rows = getAllRows(SHEET_NAMES.EXPENSE_CATEGORIES)
      if (rows.length === 0) {
        // Return defaults if no categories set up yet
        return [
          'Electrical','Plumbing','Civil Work','Housekeeping','Lift Maintenance',
          'Security','Gardening','Water Supply','Pest Control','Other'
        ]
      }
      return rows.filter(r => r['Active'] !== false).map(r => r['Name'])
    } catch (_) {
      return ['Electrical','Plumbing','Civil Work','Housekeeping','Lift Maintenance','Security','Other']
    }
  }

  return { getSheet, getAllRows, appendRow, updateRow, findRow, getCategories, SHEET_NAMES }
})()
