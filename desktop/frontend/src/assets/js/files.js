import { ReadAll } from '@/../wailsjs/go/main/App.js'
import utils from '@/assets/js/utils'

// Temporary cache for file information
function cache(fileObj, $event) {
  console.log('Caching fileObj start:', fileObj, $event.target, $event.dataTransfer)
  console.log('typeof fileObj:', Array.isArray(fileObj))
  // If fileObj is an array, create new element and append to array
  // event.target.files and event.dataTransfer.files are properties related to file upload and drag-drop events
  // event.target.files: Used with <input type="file"> elements, contains list of files selected via change event
  // event.dataTransfer.files: Contains list of files dropped onto an element via drag-drop event
  console.log('$event:', $event, $event.type)
  let files
  if ($event.type == 'change') {
    files = $event.target.files
  } else if ($event.type == 'drop') {
    files = $event.dataTransfer.files
  } else {
    console.error("Unrecognized event type")
    return
  }
  const file = files[0]
  console.log("Selected file:", file)
  const fileInfo = Array.isArray(fileObj) ? new Object() : fileObj
  fileInfo.file = file
  let URL = window.URL || window.webkitURL
  fileInfo.fileUrl = URL.createObjectURL(file)
  const fileType = file.type
  console.log("File type:", fileType, typeof (fileType))
  if (utils.notNull(fileType) && fileType.startsWith("image")) {
    fileInfo.imgUrl = fileInfo.fileUrl
  }
  fileInfo.fileName = file.name
  console.log('Caching fileObj completed:', fileInfo)
  if (Array.isArray(fileObj)) {
    // Append to array after successful operation
    fileObj.push(fileInfo)
  }
  if ($event.type == 'change') {
    // Clear input to allow reselecting same file
    $event.target.value = null
  }
}

// Upload file
async function upload(fileObj) {
  console.log("Preparing to upload file...", fileObj, fileObj.file, fileObj.fileId)
  // Current location handling
  if (utils.isNull(fileObj.file)) {
    if (utils.notNull(fileObj.fileId) && fileObj.remark != fileObj.remarkUpd) {
      let remark = null
      if (utils.notNull(fileObj.remarkUpd)) {
        remark = fileObj.remarkUpd
      }
      await updRemark(fileObj.fileId, remark)
    }
    return
  }
  console.log("Starting file upload...", fileObj, fileObj.file, fileObj.fileId)
  const url = '/common/file/upload'
  const formData = new FormData()
  formData.append('file', fileObj.file)
  if (utils.notNull(fileObj.remark)) {
    formData.append('remark', fileObj.remark)
  } else if (utils.notNull(fileObj.remarkUpd)) {
    formData.append('remark', fileObj.remarkUpd)
  }
  const data = await utils.awaitPost(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  Object.assign(fileObj, data)
  console.log("File upload processed successfully", fileObj)
  return fileObj
}

// Update file remark
async function updRemark(fileId, remarkUpd) {
  const param = {
    fileId: fileId,
    remark: remarkUpd
  }
  await utils.awaitPost('/common/file/updRemark', param)
  console.log("File remark updated successfully")
}

// Batch upload files
async function uploads(fileObjs) {
  if (utils.isEmpty(fileObjs)) {
    return
  }
  for (let index in fileObjs) {
    console.log('Processing file object:', fileObjs, index, fileObjs.length, fileObjs[index])
    await upload(fileObjs[index])
    console.log("Upload completed for index:", index, fileObjs[index])
  }
}

// Handle file upload (onChange event)
function upOnChg(fileObj, $event) {
  const file = $event.target.files[0] || $event.dataTransfer.files[0]
  // Current location
  let URL = window.URL || window.webkitURL
  // Convert to blob URL
  fileObj.fileUrl = URL.createObjectURL(file)
  const url = '/common/file/upload'
  const formData = new FormData()
  formData.append('file', file)
  formData.append('remark', fileObj.remark)
  utils.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then((data) => {
    console.log("File upload result:", data)
    Object.assign(fileObj, data)
    fileObj.remarkUpd = data.remark
  })
}

// Add to component list
function add(fileList) {
  const comp = {
    index: fileList.length,
    file: null,
    fileId: null,
    fileName: null,
    fileUrl: null,
    imgUrl: null,
    remark: null
  }
  fileList.push(comp)
}

// Remove component from list
function del(fileObj, index) {
  console.log("Deleting file object:", fileObj, index)
  if (Array.isArray(fileObj)) {
    fileObj.splice(index, 1)
  } else {
    utils.clearProps(fileObj)
  }
}

// Convert between Java and JS file objects
function trans(javaFile, jsFile) {
  if (jsFile == undefined || jsFile == null) {
    return
  }
  // Clear array if present
  if (jsFile instanceof Array) {
    jsFile.splice(0, jsFile.length)
  } else {
    utils.clearProps(jsFile)
  }

  if (javaFile == undefined || javaFile == null) {
    return
  }
  // Handle array type
  if (jsFile instanceof Array) {
    for (let java of javaFile) {
      const js = {}
      java.remarkUpd = java.remark
      Object.assign(js, java)
      jsFile.push(js)
    }
  } else {
    // Handle object type
    console.log("Object type conversion", jsFile instanceof Array)
    javaFile.remarkUpd = javaFile.remark
    Object.assign(jsFile, javaFile)
  }
}

// Collect file IDs from components
function fileIds(fileList) {
  return fileList.map(comp => comp.fileId).join(',')
}

// Read file contents
function readAll(filePath) {
  return ReadAll(filePath)
}

export default {
  // Cache on change event
  cache,
  // Single file upload
  upload,
  // Batch file upload
  uploads,
  // Immediate upload on change
  upOnChg,
  // Add component
  add,
  // Remove component
  del,
  // Object conversion
  trans,
  // Collect file IDs
  fileIds,
  // Read file
  readAll
}
