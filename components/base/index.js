var fs = require('fs')
var path = require('path')
var assert = require('assert')
var common = require('./lang.json')

if (typeof window !== 'undefined') {
  require('smoothscroll-polyfill').polyfill()
  let scrollIntoView = window.Element.prototype.scrollIntoView
  window.Element.prototype.scrollIntoView = function (opts) {
    if (typeof opts === 'boolean') {
      if (opts) opts = { block: 'start', inline: 'nearest' }
      else opts = { block: 'end', inline: 'nearest' }
    }
    opts = opts || {}
    opts.behavior = opts.behavior || 'smooth'
    return scrollIntoView.call(this, opts)
  }
}

// initialize translation utility with given language file
// obj -> str
exports.i18n = i18n
function i18n (source) {
  source = source || common

  // get text by applying as tagged template literal i.e. text`Hello ${str}`
  // (arr|str[, ...str]) -> str
  return function (strings, ...parts) {
    parts = parts || []

    var key = Array.isArray(strings) ? strings.join('%s') : strings
    var value = source[key] || common[key]

    if (!value) {
      value = common[key] = key
      if (typeof window === 'undefined') {
        var file = path.join(__dirname, 'lang.json')
        fs.writeFileSync(file, JSON.stringify(common, null, 2))
      }
    }

    return value.split('%s').reduce(function (result, str, index) {
      return result + str + (parts[index] || '')
    }, '')
  }
}

// check if an URL is on the the current domain
// str -> bool
exports.isSameDomain = isSameDomain
function isSameDomain (url) {
  var external = /^[\w-]+:\/{2,}\[?[\w.:-]+\]?(?::[0-9]*)?/

  try {
    var result = external.test(url) && new window.URL(url)
    return !result || (result.hostname === window.location.hostname)
  } catch (err) {
    return true
  }
}

// get color ligtness from hex
// str -> num

exports.luma = luma
function luma (str) {
  var hex = str.replace(/^#/, '')
  var rgb = parseInt(hex, 16)
  var r = (rgb >> 16) & 0xff
  var g = (rgb >> 8) & 0xff
  var b = (rgb >> 0) & 0xff

  // per ITU-R BT.709
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// returns a general file type from an url
// str -> str
exports.filetype = filetype
function filetype (url) {
  if (!url) return null
  var type = url.toLowerCase().match(/[^.]+$/)

  if (!type) return null

  switch (type[0]) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'tiff':
    case 'bmp':
    case 'svg':
    case 'webp': return 'image'
    case 'mp4':
    case 'webm':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'mpg':
    case 'wmv': return 'video'
    case 'mp3':
    case 'wma':
    case 'flac':
    case 'wav': return 'audio'
    case 'tar':
    case 'zip': return 'zip'
    case 'key':
    case 'ppt':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'pdf': return 'document'
    default: return null
  }
}

// get viewport height
// () -> num
exports.vh = vh
function vh () {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
}

// get viewport width
// () -> num
exports.vw = vw
function vw () {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

// compose class name based on supplied conditions
// (str|obj, obj?) -> str
exports.className = className
function className (root, classes) {
  if (typeof root === 'object') {
    classes = root
    root = ''
  }

  return Object.keys(classes).reduce((str, key) => {
    if (!classes[key]) return str
    return str + ' ' + key
  }, root).trim()
}

// detect if meta key was pressed on event
// obj -> bool
exports.metaKey = metaKey
function metaKey (e) {
  if (e.button && e.button !== 0) return true
  return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
}

// pick props from object
// (obj, arr|...str) -> obj
exports.pluck = pluck
function pluck (src, ...keys) {
  keys = Array.isArray(keys[0]) ? keys[0] : keys
  return keys.reduce(function (obj, key) {
    if (src[key]) obj[key] = src[key]
    return obj
  }, {})
}

// compose reduce middlewares that boils down list ot truthy values
// (arr, ...fn) -> arr
exports.reduce = reduce
function reduce (list) {
  var middleware = Array.prototype.slice.call(arguments, 1)
  return list.reduce(function (result, initial, i, from) {
    var val = middleware.reduce((val, fn) => val && fn(val, i, from), initial)
    if (val) result.push(val)
    return result
  }, [])
}

// compose srcset attribute from url for given sizes
// (str, arr, obj?) -> str
exports.srcset = srcset
function srcset (url, sizes, opts) {
  var transforms = opts.transforms
  if (!transforms) transforms = 'c_fill,f_auto,q_auto'
  if (!/c_/.test(transforms)) transforms += ',c_fill'
  if (!/f_/.test(transforms)) transforms += ',f_auto'
  if (!/q_/.test(transforms)) transforms += ',q_auto'

  var uri = url.split('verdensmaalene.cdn.prismic.io/verdensmaalene/')[1]
  assert(uri, 'srcset: url should be a prismic media asset')

  return sizes.map(function (size) {
    var transform = transforms
    if (Array.isArray(size)) {
      transform = size[1]
      if (!/c_/.test(transform)) transform += ',c_fill'
      if (!/f_/.test(transform)) transform += ',f_auto'
      if (!/q_/.test(transform)) transform += ',q_auto'
      size = size[0]
    }
    if (opts.aspect) transform += `,h_${Math.floor(size * opts.aspect)}`

    return `/media/fetch/${transform},w_${size}/${uri} ${size}w`
  }).join(', ')
}
