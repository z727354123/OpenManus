import axios from "axios"
import { ElMessage } from 'element-plus'
import { Greet } from '@/../wailsjs/go/main/App.js'

/** axios start */
// Create axios instance
const $axios = axios.create({
  baseURL: "api",
  timeout: 12000
})

// Request interceptor
$axios.interceptors.request.use(
  (config) => {
    config.headers["token"] = ''
    if (config.method == "post" || config.method == "put") {
      delNullProperty(config.data)
      fomateDateProperty(config.data)
    } else if (config.method == "get" || config.method == "delete") {
      delNullProperty(config.params)
      fomateDateProperty(config.params)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
$axios.interceptors.response.use(
  (response) => {
    //  console.log("response:", response)
    if (response.status == 200) {
      return response.data
    } else {
      pop("Request error:" + response.status)
    }
  },
  (error) => {
    console.log("error:" + JSON.stringify(error))
    if (error.response == undefined || error.response == null) {
      pop("Unknown request error!")
    } else if (error.response.status == 500) {
      pop("Backend service error, please try again later!")
    } else {
      pop("Request error:" + error)
    }
    return Promise.reject(error)
  }
)

function get(url, param) {
  return $axios.get(url, { params: param })
}

async function awaitGet(url, param) {
  return await $axios.get(url, { params: param })
}

function post(url, param) {
  return $axios.post(url, param)
}

async function awaitPost(url, param) {
  return await $axios.post(url, param)
}

function del(url, param) {
  return $axios.delete(url, { params: param })
}

async function awaitDel(url, param) {
  return await $axios.delete(url, { params: param })
}

/**
 * Demo call to go interface
 */
function greet(name) {
  return Greet(name).then(resp => {
    console.log("greet resp:", resp)
    return resp
  })
}

/**
 * Check if object is null
 */
function isNull(obj) {
  return obj == undefined || obj == null
}

/**
 * Check if object is not null
 */
function notNull(obj) {
  return obj != undefined && obj != null
}

/**
 * Check if string is blank
 */
function isBlank(str) {
  return str == undefined || str == null || /^s*$/.test(str)
}

/**
 * Check if string is not blank
 */
function notBlank(str) {
  return !isBlank(str)
}

/**
 * Check if array is empty
 */
function isEmpty(arr) {
  return arr == undefined || arr == null || (arr instanceof Array && arr.length == 0)
}

/**
 * Check if array is not empty
 */
function notEmpty(arr) {
  return arr != undefined && arr != null && arr instanceof Array && arr.length > 0
}

/**
 * Check if object is true
 */
function isTrue(obj) {
  return obj == true || obj == 'true'
}

/**
 * Check if object is false
 */
function isFalse(obj) {
  return !isTrue(obj)
}

/** Get the count of a character in a string
* @param {string} str - The string to search
* @param {string} char - The character to find
* @returns {number} - The count of the character in the string
*/
function getCharCount(str, char) {
  // Use g to match the entire string
  var regex = new RegExp(char, 'g')
  // match method can search for specified values in a string or find one or more matches of a regular expression
  var result = str.match(regex)
  var count = !result ? 0 : result.length
  return count
}

/**
 * Date format
 * Default format is yyyy-MM-dd HH:mm:ss
 */
function dateFormat(date, format) {
  if (date == undefined || date == null || date == '') {
    return date
  }
  if (format == undefined || format == null
    || format == '' || format == 0
    || format == "datetime" || format == 'date_time'
    || format == 'DATE_TIME' || format == 'DATETIME') {
    format = "yyyy-MM-dd HH:mm:ss"
  } else if (format == 'date' || format == 'DATE' || format == 1) {
    format = "yyyy-MM-dd"
  }
  date = new Date(date)
  const Y = date.getFullYear() + '',
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds()
  return format.replace(/YYYY|yyyy/g, Y)
    .replace(/YY|yy/g, Y.substring(2, 2))
    .replace(/MM/g, (M < 10 ? '0' : '') + M)
    .replace(/dd/g, (D < 10 ? '0' : '') + D)
    .replace(/HH|hh/g, (H < 10 ? '0' : '') + H)
    .replace(/mm/g, (m < 10 ? '0' : '') + m)
    .replace(/ss/g, (s < 10 ? '0' : '') + s)
}

/**
 * Traverse and format date properties in object
 */
function fomateDateProperty(obj) {
  for (let i in obj) {
    // Traverse properties in object
    if (obj[i] == null) {
      continue
    } else if (obj[i] instanceof Date) {
      // Format to yyyy-MM-dd HH:mm:ss
      obj[i] = dateFormat(obj[i])
    } else if (obj[i].constructor === Object) {
      // If the property value is still an object, check if it's empty and then iterate
      if (Object.keys(obj[i]).length > 0) {
        // Check if the object has properties, delete if it's an empty object
        fomateDateProperty(obj[i])
      }
    } else if (obj[i].constructor === Array) {
      // If the object value is an array, check if it's empty and then iterate
      if (obj[i].length > 0) {
        for (let j = 0; j < obj[i].length; j++) {
          // Traverse array
          fomateDateProperty(obj[i][j])
        }
      }
    }
  }
}


// Traverse and delete null properties in object
function delNullProperty(obj) {
  for (let i in obj) {
    // Traverse properties in object
    if (obj[i] === undefined || obj[i] === null || obj[i] === "") {
      // First remove regular empty data using delete keyword
      delete obj[i]
    } else if (obj[i].constructor === Object) {
      // If the property value is still an object, check if it's empty and then iterate
      if (Object.keys(obj[i]).length === 0) delete obj[i]
      // Check if the object has properties, delete if it's an empty object
      delNullProperty(obj[i])
    } else if (obj[i].constructor === Array) {
      // If the object value is an array, check if it's empty and then iterate
      if (obj[i].length === 0) {
        // If the array is empty, delete it
        delete obj[i]
      } else {
        for (let index = 0; index < obj[i].length; index++) {
          // Traverse array
          if (obj[i][index] === undefined || obj[i][index] === null || obj[i][index] === "" || JSON.stringify(obj[i][index]) === "{}") {
            obj[i].splice(index, 1)
            // If the array value is one of the above empty values, modify the array length, move subsequent values forward
            index--
            // Since the current index content has been replaced by the next value, the counter needs to decrement to offset the subsequent increment
          }
          if (obj[i].constructor === Object) {
            // If an object is found in the array value, iterate again
            delNullProperty(obj[i])
          }
        }
      }
    }
  }
}

/**
  * Show message box
  * @param msg Message content
  * @param type
  */
function pop(msg, type) {
  ElMessage({ message: msg, type: type })
}

function popNoData(data) {
  if (data == undefined || data == null || (data instanceof Array && data.length == 0)) {
    ElMessage("No data!")
  }
}

/**
 * Current datetime string
 */
function nowDatetimeStr() {
  const date = new Date()
  const datetimeStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  return datetimeStr
}

/**
 * Build pagination
 */
function buildPage(source, target) {
  target.pageNum = source.pageNum
  target.pageSize = source.pageSize
  target.total = source.total
  target.pages = source.pages
  copyArray(source.list, target.list)
}
/**
 * Clear array
 */
function clearArray(arr) {
  if (arr == undefined || arr == null || arr.length == 0) {
    return
  }
  arr.splice(0, arr.length)
}
/**
 * Clear properties
 */
function clearProps(obj) {
  if (obj == undefined || obj == null) {
    return
  }
  for (let i in obj) {
    obj[i] = null
  }
}

/**
 * Copy object properties
 */
function copyProps(source, target) {
  if (target == undefined || target == null) {
    target = {}
  }
  if (source == undefined || source == null) {
    source = new Object()
  }
  for (let i in target) {
    target[i] = (source[i] != undefined ? source[i] : null)
  }
}
/**
 * Copy array
 */
function copyArray(source, target) {
  if (target == undefined || target == null) {
    return
  }
  // Clear array first
  if (target.length > 0) {
    target.splice(0, target.length)
    /* while (target.length > 0) {
        target.pop()
    } */
  }
  if (source == undefined || source == null) {
    return
  }
  for (let i of source) {
    target.push(i)
  }
}

/**
 * Changed properties
 */
function dfProps(origin, target) {
  if (origin == undefined || origin == null || target == undefined || target == null) {
    return target
  }
  var dfObj = {}
  for (let i in target) {
    if (target[i] != null && target[i] != origin[i]) {
      dfObj[i] = target[i]
    }
  }
  return dfObj
}


/**
 * Check if there are different properties
 */
function hasDfProps(origin, target) {
  const df = dfProps(origin, target)
  for (let i in df) {
    if (df[i] != null) {
      return true
    }
  }
  return false
}

/**
 * All fields are empty
 */
function isAllPropsNull(target) {
  if (target == undefined || target == null) {
    return true
  }
  for (let i in target) {
    if (target[i] != null) {
      return false
    }
  }
  return true
}

function colorByLabel(label) {
  if ('ADD' == label) {
    return 'bg-success'
  }
  if ('UPD' == label) {
    return 'bg-primary'
  }
  if ('DEL' == label) {
    return 'bg-danger'
  }
  if ('step' == label) {
    return 'bg-primary'
  }
  if ('log' == label) {
    return 'bg-success'
  }
  if ('tool' == label) {
    return 'bg-primary'
  }
  if ('think' == label) {
    return 'bg-danger'
  }
  if ('run' == label) {
    return 'bg-success'
  }
  if ('message' == label) {
    return 'bg-success'
  }
  if ('act' == label) {
    return 'bg-danger'
  }


}

function descByLabel(label) {
  if ('ADD' == label) {
    return 'Add'
  }
  if ('UPD' == label) {
    return 'Update'
  }
  if ('DEL' == label) {
    return 'Delete'
  }
  return label
}

/**
 * Retry call
 */
function retry(method) {
  const params = []
  for (var i = 1; i < arguments.length; i++) {
    params.push(arguments[i])
  }
  setTimeout(() => {
    method(params)
  }, 500)
}

/**
 * Match Chinese label from opts encoding
 */
function resolveLabelFromOpts(keyOrVal, opts) {
  if (isEmpty(opts)) {
    return keyOrVal
  }
  for (let opt of opts) {
    if (opt.key == keyOrVal || opt.value == keyOrVal) {
      return opt.label
    }
  }
  return keyOrVal
}

/** Convert underscore to camel case with first letter lowercase */
function underScoreToCamelCase(underscore) {
  if (isNull(underscore) || !underscore.includes('_')) {
    return underscore
  }
  const words = underscore.split('_')
  for (let i = 1; i < words.length; i++) {
    if (words[i] == "") {
      words[i] = ""
      continue
    }
    words[i] = words[i].substring(0, 1).toUpperCase() + words[i].substring(1, words[i].length)
  }
  return words.join("")
}

/** Debounce function */
function debounce(func, delay) {
  let timer
  return function () {
    const context = this
    const args = arguments

    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(context, args)
    }, delay)
  }
}

/**
 * Convert string to lines
 */
function stringToLines(str) {
  if (str == undefined || str == null) {
    return []
  }
  return str.split('\n')
}

export default {
  /**
   * HTTP request GET
   */
  get,

  /**
   * HTTP request, async await GET
   */
  awaitGet,

  /**
   * HTTP request POST
   */
  post,

  /**
   * HTTP request, async await POST
   */
  awaitPost,

  /**
   * HTTP request DELETE
   */
  del,

  /**
   * HTTP request, async await DELETE
   */
  awaitDel,

  /**
   * Check if object is null
   */
  isNull,

  /**
   * Check if object is not null
   */
  notNull,

  isBlank,

  notBlank,

  /**
   * Check if array is empty
   */
  isEmpty,

  /**
   * Check if array is not empty
   */
  notEmpty,

  isTrue,

  isFalse,

  getCharCount,

  /**
   * Show message popup
   */
  pop,

  /**
   * Check if data is empty, if empty show "No data" message
   */
  popNoData,

  /**
   * Traverse and delete null properties in object
   */
  delNullProperty,

  /**
   * Current datetime string
   */
  nowDatetimeStr,

  /**
   * Build pagination
   */
  buildPage,

  /**
   * Clear array
   */
  clearArray,

  /**
   * Clear properties
   */
  clearProps,

  /**
   * Copy object properties
   */
  copyProps,

  /**
   * Copy array
   */
  copyArray,

  /**
   * Date format
   * Default format is yyyy-MM-dd HH:mm:ss
   */
  dateFormat,

  /**
   * Traverse and format date properties in object
   */
  fomateDateProperty,

  /**
   * Changed properties
   */
  dfProps,

  hasDfProps,

  isAllPropsNull,

  colorByLabel,

  descByLabel,

  /**
   * Retry call
   */
  retry,

  resolveLabelFromOpts,

  underScoreToCamelCase,

  debounce,

  stringToLines,

}
