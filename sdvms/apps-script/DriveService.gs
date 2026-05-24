/**
 * SDVMS - DriveService
 * Google Drive file uploads and folder management
 */

var DriveService = (function () {

  function getRootFolder() {
    const rootId = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID')
    if (rootId) {
      try { return DriveApp.getFolderById(rootId) } catch (_) {}
    }
    const root = DriveApp.createFolder('Society Accounts - ARV ROYALE D WING CHS')
    PropertiesService.getScriptProperties().setProperty('ROOT_FOLDER_ID', root.getId())
    return root
  }

  function getFiscalYearLabel() {
    const now = new Date(), month = now.getMonth(), year = now.getFullYear()
    return month >= 3 ? `FY ${year}-${String(year+1).slice(2)}` : `FY ${year-1}-${String(year).slice(2)}`
  }

  function getOrCreateFolder(parent, name) {
    const existing = parent.getFoldersByName(name)
    return existing.hasNext() ? existing.next() : parent.createFolder(name)
  }

  function getFolderForType(type) {
    const root = getRootFolder()
    const fyFolder = getOrCreateFolder(root, getFiscalYearLabel())
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const currentMonth = MONTHS[new Date().getMonth()]
    switch (type) {
      case 'invoice':
      case 'voucher': return getOrCreateFolder(getOrCreateFolder(fyFolder, 'Vendor Vouchers'), currentMonth)
      case 'payment_proof': return getOrCreateFolder(fyFolder, 'Payment Proofs')
      case 'signature':     return getOrCreateFolder(fyFolder, 'Signatures')
      case 'pdf':           return getOrCreateFolder(fyFolder, 'Signed PDFs')
      case 'audit':         return getOrCreateFolder(fyFolder, 'Audit Exports')
      default:              return fyFolder
    }
  }

  function uploadFile(base64Data, fileName, mimeType, folderType) {
    try {
      const folder  = getFolderForType(folderType || 'voucher')
      const decoded = Utilities.base64Decode(base64Data)
      const blob    = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', fileName)
      const file    = folder.createFile(blob)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
      return { success: true, fileId: file.getId(), link: file.getUrl(), name: file.getName() }
    } catch (err) {
      return { success: false, message: 'Upload failed: ' + err.message }
    }
  }

  function savePDF(base64Data, fileName) { return uploadFile(base64Data, fileName, 'application/pdf', 'pdf') }

  function createFolderStructure() {
    const root = getRootFolder()
    const fy   = getOrCreateFolder(root, getFiscalYearLabel())
    const vf   = getOrCreateFolder(fy, 'Vendor Vouchers')
    ;['April','May','June','July','August','September','October','November','December','January','February','March']
      .forEach(m => getOrCreateFolder(vf, m))
    ;['Vendor Bills','Payment Proofs','Signatures','Signed PDFs','Audit Exports']
      .forEach(n => getOrCreateFolder(fy, n))
    return { success: true, folderId: fy.getId(), folderUrl: fy.getUrl() }
  }

  return { uploadFile, savePDF, createFolderStructure, getFolderForType }
})()
