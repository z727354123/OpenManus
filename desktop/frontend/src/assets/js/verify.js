import utils from '@/assets/js/utils'

/** English code regex */
const codeReg = /^[A-Za-z0-9_\-\.]+$/

/** Mobile number regex */
const mobileReg = /^1[3456789]\d{9}$/

/** Mainland ID card regex */
const idNoReg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/

/** Email regex */
const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

const commonValidator = (rule, value, callback) => {
  if (utils.isNull(value)) {
    callback()
  } else {
    callback()
  }
}

const notBlankValidator = (rule, value, callback) => {
  if (utils.isBlank(value)) {
    callback(new Error('Input cannot be empty'))
  } else {
    callback()
  }
}

const nameValidator = (rule, value, callback) => {
  if (utils.isBlank(value)) {
    callback()
  } else if (value.length > 50) {
    callback(new Error('Character count cannot exceed 50'))
  } else {
    callback()
  }
}

const mobileValidator = (rule, value, callback) => {
  if (utils.isNull(value)) {
    callback()
  } else if (!mobileReg.test(value)) {
    callback(new Error('Invalid mobile number format'))
  } else {
    callback()
  }
}

const idNoValidator = (rule, value, callback) => {
  if (utils.isNull(value)) {
    callback()
  } else if (!idNoReg.test(value)) {
    callback(new Error('Invalid ID number format'))
  } else {
    callback()
  }
}

const emailValidator = (rule, value, callback) => {
  if (utils.isNull(value)) {
    callback()
  } else if (!emailReg.test(value)) {
    callback(new Error('Invalid email format'))
  } else {
    callback()
  }
}

const codeValidator = (rule, value, callback) => {
  if (utils.isBlank(value)) {
    callback()
  } else if (!codeReg.test(value)) {
    callback(new Error('Invalid code format'))
  } else {
    callback()
  }
}

const intValidator = (rule, value, callback) => {
  if (utils.isBlank(value)) {
    callback()
  } else if (!Number.isInteger(value)) {
    callback(new Error('Please enter an integer'))
  } else {
    callback()
  }
}

function validator() {
  console.log("arguments:", arguments)
  if (arguments.length <= 1) {
    const type = arguments[0]
    // Default validation logic, no special characters
    if (utils.isBlank(type)) {
      return commonValidator
    } else if (type == 'notBlank') {
      return notBlankValidator
    } else if (type == 'name') {
      return nameValidator
    } else if (type == 'mobile') {
      return mobileValidator
    } else if (type == 'idNo') {
      return idNoValidator
    } else if (type == 'email') {
      return emailValidator
    } else if (type == 'code') {
      return codeValidator
    } else if (type == 'int') {
      return intValidator
    } else {
      return commonValidator
    }
  }
  // Complex validator
  const complexValidator = (rule, value, callback) => {
    for (let i = 0; i < arguments.length; i++) {
      const typeStr = arguments[i]
      if (typeStr == 'notBlank' && utils.isBlank(value)) {
        callback(new Error('Input cannot be empty'))
        break
      } else if (typeStr == 'code' && !codeReg.test(value)) {
        callback(new Error('Invalid code format'))
        break
      } else if (typeStr == 'int' && Number.isInteger(value)) {
        callback(new Error('Please enter an integer'))
        break
      }
    }
    // Fallback callback() will only trigger once
    callback()
  }
  return complexValidator
}

export default {

  username: (username) => {
    if (typeof (username) == "undefined" || username == null) {
      return "Username cannot be empty"
    }
    username = username.trim()
    if (username.length < 4) {
      return "Username must be at least 4 characters"
    }
    if (username.length > 20) {
      return "Username cannot exceed 20 characters"
    }
    const reg = /^[A-Za-z0-9]+$/
    if (!reg.test(username)) {
      return "Username must be letters and numbers only"
    }
    return null
  },

  password: (password) => {
    if (typeof (password) == "undefined" || password == null) {
      return "Password cannot be empty"
    }
    password = password.trim()
    if (password.length < 4) {
      return "Password must be at least 4 characters"
    }
    if (password.length > 20) {
      return "Password cannot exceed 20 characters"
    }
    const reg = /^[A-Za-z0-9\.\-\_\+]+$/
    if (!reg.test(password)) {
      return "Password must be letters, numbers, or .-+_"
    }
    return null
  },

  email: (email) => {
    if (typeof (email) == "undefined" || email == null) {
      return "Email cannot be empty"
    }
    const reg = /^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/
    if (!reg.test(email)) {
      return "Invalid email format"
    }
    return null
  },

  validCode: (validCode) => {
    if (typeof (validCode) == "undefined" || validCode == null) {
      return "Verification code cannot be empty"
    }
    validCode = validCode.trim()
    if (validCode.length != 6) {
      return "Verification code must be 6 digits"
    }
    const reg = /^[A-Za-z0-9]{6}$/
    if (!reg.test(validCode)) {
      return "Invalid verification code format"
    }
    return null
  },

  validator,


}
