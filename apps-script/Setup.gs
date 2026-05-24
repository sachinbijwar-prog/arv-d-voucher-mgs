/**
 * SDVMS Setup Helper
 * Run setupSDVMS() once after creating your Google Sheet to initialize it.
 */
function setupSDVMS() {
  Logger.log('Setting up SDVMS sheets...')
  
  // Set your Sheet ID here before running
  // PropertiesService.getScriptProperties().setProperty('SHEET_ID', 'YOUR_SHEET_ID_HERE')

  try {
    DriveService.createFolderStructure()
    Logger.log('Drive folder structure created.')
  } catch (e) {
    Logger.log('Drive setup error: ' + e.message)
  }

  // Initialize sheet headers
  const sheets = [
    { name: 'Voucher_Master', headers: [
      'VoucherID','VoucherNumber','Date','VendorName','VendorContact','Category',
      'Wing','Description','InvoiceNo','InvoiceDate','Amount','GST','Total',
      'PaymentMode','ChequeUTR','Status','Remarks',
      'InvoiceLink','PaymentProofLink','VendorSigLink','TreasurerSigLink','PDFLink',
      'CreatedBy','CreatedAt','SubmittedAt',
      'TreasurerVerifiedBy','TreasurerVerifiedAt',
      'ChairmanApprovedBy','ChairmanApprovedAt','CompletedAt','ArchivedAt'
    ]},
    { name: 'Vendors_Master',    headers: ['VendorID','Name','Contact','Email','Category','Address','Active'] },
    { name: 'Expense_Categories',headers: ['CategoryID','Name','Description','Active'] },
    { name: 'Approval_Log',      headers: ['LogID','VoucherID','Action','ByEmail','Comment','Timestamp'] },
    { name: 'Audit_Log',         headers: ['LogID','UserEmail','Action','Module','Details','Timestamp'] },
    { name: 'Users',             headers: ['Email','Name','Role','Active'] },
  ]

  const ss = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('SHEET_ID')
  )

  sheets.forEach(({ name, headers }) => {
    let sheet = ss.getSheetByName(name)
    if (!sheet) sheet = ss.insertSheet(name)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers)
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#1e40af')
        .setFontColor('#ffffff')
    }
  })

  // Seed default categories
  const catSheet = ss.getSheetByName('Expense_Categories')
  const categories = [
    'Electrical','Plumbing','Civil Work','Housekeeping','Lift Maintenance',
    'Security','Gardening','Water Supply','Pest Control','Other'
  ]
  categories.forEach((cat, i) => {
    catSheet.appendRow([`CAT-${String(i+1).padStart(3,'0')}`, cat, '', true])
  })

  Logger.log('SDVMS setup complete!')
  Logger.log('Share the spreadsheet with your society Gmail account and deploy this script as Web App.')
}
