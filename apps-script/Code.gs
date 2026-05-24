/**
 * SDVMS - Society Digital Voucher Management System
 * Google Apps Script Backend - Main Router
 * 
 * Deploy as Web App:
 * - Execute as: Me (society Google account)
 * - Who has access: Anyone with Google Account (or Anyone for testing)
 * 
 * After deploying, paste the Web App URL into VITE_APPS_SCRIPT_URL in your .env
 */

// ── Script Properties Keys ─────────────────────────────────────
const PROPS = {
  SHEET_ID:        'SHEET_ID',        // Google Sheet ID
  ROOT_FOLDER_ID:  'ROOT_FOLDER_ID',  // Root Drive folder ID
}

// ── CORS Headers ───────────────────────────────────────────────
function corsHeaders() {
  return ContentService.createTextOutput()
}

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
  output.setMimeType(ContentService.MimeType.JSON)
  return output
}

function errorResponse(message, code = 400) {
  return jsonResponse({ success: false, message, code })
}

// ── Main GET Handler ───────────────────────────────────────────
function doGet(e) {
  try {
    const params = e.parameter || {}
    const action = params.action || ''

    // Verify token
    const token = (e.parameter.token || '').replace('Bearer ', '')
    // Note: for GET requests, token comes as query param

    switch (action) {
      case 'getVouchers':
        return jsonResponse(VoucherService.getVouchers(params))

      case 'getVoucherById':
        return jsonResponse(VoucherService.getVoucherById(params.id))

      case 'generateVoucherNumber':
        return jsonResponse({ voucherNumber: VoucherService.generateVoucherNumber() })

      case 'getDashboardStats':
        return jsonResponse(VoucherService.getDashboardStats())

      case 'getVendors':
        return jsonResponse(VendorService.getVendors())

      case 'getCategories':
        return jsonResponse(SheetsService.getCategories())

      case 'getUserRole':
        return jsonResponse(AuthService.getUserRole(params.email))

      default:
        return errorResponse('Unknown action: ' + action)
    }
  } catch (err) {
    console.error(err)
    return errorResponse('Server error: ' + err.message, 500)
  }
}

// ── Main POST Handler ──────────────────────────────────────────
function doPost(e) {
  try {
    let body = {}
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents)
    }

    // Verify token
    const authHeader = e.parameter?.Authorization || body.token || ''
    // In production: AuthService.verifyToken(authHeader.replace('Bearer ', ''))

    const action = body.action || ''

    switch (action) {
      case 'createVoucher':
        return jsonResponse(VoucherService.createVoucher(body))

      case 'updateVoucher':
        return jsonResponse(VoucherService.updateVoucher(body.id, body))

      case 'approveVoucher':
        return jsonResponse(VoucherService.approveVoucher(body.id, body.approval, body.comment, body.approverEmail))

      case 'uploadFile':
        return jsonResponse(DriveService.uploadFile(body.base64, body.name, body.mimeType, body.folder))

      case 'createVendor':
        return jsonResponse(VendorService.createVendor(body))

      case 'updateVendor':
        return jsonResponse(VendorService.updateVendor(body.id, body))

      case 'getUserRole':
        return jsonResponse(AuthService.getUserRole(body.email))

      case 'generatePDF':
        return jsonResponse(PDFService.generateAndSave(body.voucherId))

      default:
        return errorResponse('Unknown action: ' + action)
    }
  } catch (err) {
    console.error(err)
    return errorResponse('Server error: ' + err.message, 500)
  }
}
