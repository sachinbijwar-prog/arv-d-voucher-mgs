/**
 * SDVMS - AuthService + VendorService
 */

var AuthService = (function () {

  const ROLE_MAP = {
    treasurer: 'treasurer',
    manager:   'manager',
    chairman:  'chairman',
    auditor:   'auditor',
    committee: 'committee',
  }

  function getUserRole(email) {
    if (!email) return { role: 'committee', email: '' }
    try {
      const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.USERS)
      const user = rows.find(r => r['Email'] && r['Email'].toLowerCase() === email.toLowerCase())
      if (user && user['Active'] !== false) {
        return { role: user['Role'] || 'committee', email: email, name: user['Name'] }
      }
    } catch (_) {}
    return { role: 'committee', email: email }
  }

  function verifyToken(accessToken) {
    // Validate Google OAuth token
    const url  = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
    if (resp.getResponseCode() !== 200) return null
    return JSON.parse(resp.getContentText())
  }

  return { getUserRole, verifyToken }
})()


var VendorService = (function () {

  const HEADERS = ['VendorID','Name','Contact','Email','Category','Address','Active']

  function getVendors() {
    const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.VENDORS_MASTER)
    return rows.filter(r => r['Active'] !== false).map(r => ({
      id:       r['VendorID'],
      name:     r['Name'],
      contact:  r['Contact'],
      email:    r['Email'],
      category: r['Category'],
      address:  r['Address'],
      active:   r['Active'] !== false,
    }))
  }

  function createVendor(data) {
    const id  = 'VN-' + Date.now()
    const row = {
      VendorID: id, Name: data.name, Contact: data.contact || '',
      Email: data.email || '', Category: data.category || '',
      Address: data.address || '', Active: true,
    }
    SheetsService.appendRow(SheetsService.SHEET_NAMES.VENDORS_MASTER, row, HEADERS)
    return { success: true, id, vendor: row }
  }

  function updateVendor(id, data) {
    const updates = {}
    if (data.name)     updates['Name']     = data.name
    if (data.contact)  updates['Contact']  = data.contact
    if (data.email)    updates['Email']    = data.email
    if (data.category) updates['Category'] = data.category
    if (data.address)  updates['Address']  = data.address
    if (data.active !== undefined) updates['Active'] = data.active
    const ok = SheetsService.updateRow(SheetsService.SHEET_NAMES.VENDORS_MASTER, 'VendorID', id, updates)
    return { success: ok }
  }

  return { getVendors, createVendor, updateVendor }
})()
