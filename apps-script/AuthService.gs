/**
 * SDVMS - AuthService + VendorService
 */

var AuthService = (function () {

  function getUsers() {
    try {
      const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.USERS)
      return rows.map(r => ({
        id: r['Username'], // Using Username as ID
        username: r['Username'],
        password: r['Password'], // In a real app this should be hashed, but as requested it's plain text here
        name: r['Name'],
        role: r['Role'],
        active: r['Active'] !== false
      }))
    } catch (_) {
      return []
    }
  }

  function updatePassword(username, oldPassword, newPassword) {
    const rows = SheetsService.getAllRows(SheetsService.SHEET_NAMES.USERS)
    const user = rows.find(r => r['Username'] && r['Username'].toLowerCase() === username.toLowerCase())
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }
    if (user['Password'] !== oldPassword) {
      return { success: false, message: 'Incorrect old password' }
    }

    const ok = SheetsService.updateRow(SheetsService.SHEET_NAMES.USERS, 'Username', user['Username'], {
      Password: newPassword
    })

    return { success: ok, message: ok ? 'Password updated' : 'Failed to update password' }
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

  return { getUsers, updatePassword, getUserRole }
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
