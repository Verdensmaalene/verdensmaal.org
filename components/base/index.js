var fs = require('fs')
var path = require('path')
var html = require('choo/html')
var common = require('./lang.json')

if (typeof window !== 'undefined') {
  require('smoothscroll-polyfill').polyfill()
  const scrollIntoView = window.Element.prototype.scrollIntoView
  window.Element.prototype.scrollIntoView = function (opts) {
    if (typeof opts === 'boolean') {
      if (opts) opts = { block: 'start', inline: 'nearest' }
      else opts = { block: 'end', inline: 'nearest' }
    } else {
      opts = { block: 'start' }
    }
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

    var hasForeignPart = false
    var res = value.split('%s').reduce(function (result, str, index) {
      var part = parts[index] || ''
      if (!hasForeignPart) {
        hasForeignPart = (typeof part !== 'string' && typeof part !== 'number')
      }
      result.push(str, part)
      return result
    }, [])

    return hasForeignPart ? res : res.join('')
  }
}

// resolve document url
// obj -> str
exports.resolve = resolve
function resolve (doc) {
  switch (doc.type) {
    case 'website':
    case 'homepage': return '/'
    case 'goals': return '/maalene'
    case 'mission': return '/mission'
    case 'resources': return '/materialer'
    case 'goal': return `/${doc.data.number}-${doc.uid}`
    case 'partner': return doc.data.url
    case 'award': return '/verdensmaalsprisen'
    case 'page': {
      if (doc.tags.includes('verdensmålsprisen')) {
        return `/verdensmaalsprisen/${doc.uid}`
      }
      return `/${doc.uid}`
    }
    case 'sector': return `/${doc.uid}`
    case 'pie_chart':
    case 'line_chart':
    case 'numeric_chart':
    case 'bar_chart': return `/${doc.id}.svg`
    case 'news': return `/nyheder/${doc.uid}`
    case 'event': return `/events/${doc.uid}`
    case 'news_listing': return '/nyheder'
    case 'events_listing': return '/events'
    case 'verdenstimen': return '/verdenstimen'
    case 'subject': return `/verdenstimen/${doc.uid}`
    case 'material': return `/verdenstimen/materiale/${doc.uid}`
    case 'Web':
    case 'Media': return doc.url.replace(/^https?:\/\/#/, '#')
    default: {
      if (doc.type === 'page' && doc.uid === 'verdensmaalsprisen') return `/${doc.uid}`
      // handle links to web and media
      const type = doc.link_type
      if (type === 'Web' || type === 'Media' || type === 'Any') {
        return doc.url.replace(/^https?:\/\/#/, '#')
      }
      // handle archived sector page Verdenstimen
      if (doc.id === 'XvH3FBAAACIA135o') return '/verdenstimen'
      // Just throw an error for unknown page types
      throw new Error('Document not recognized')
    }
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
  return filter(src, (key) => keys.includes(key))
}

// pick props from object
// (obj, arr|...str) -> obj
exports.exclude = exclude
function exclude (src, ...keys) {
  keys = Array.isArray(keys[0]) ? keys[0] : keys
  return filter(src, (key) => !keys.includes(key))
}

// filter object by test
// (obj, fn) -> obj
function filter (src, test) {
  return Object.keys(src).reduce(function (obj, key) {
    if (test(key)) obj[key] = src[key]
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
function srcset (uri, sizes, opts = {}) {
  // detect prismic image object
  if (typeof uri === 'object' && uri.url) {
    var max = uri.dimensions.width
    uri = uri.url
  }

  var type = opts.type || 'fetch'
  var transforms = opts.transforms
  if (!transforms) transforms = 'c_fill,f_auto,q_auto'
  if (!/c_/.test(transforms)) transforms += ',c_fill'
  if (!/f_/.test(transforms)) transforms += ',f_auto'
  if (!/q_/.test(transforms)) transforms += ',q_auto'

  // trim prismic domain from uri
  var parts = uri.split('verdensmaalene.cdn.prismic.io/verdensmaalene/')
  uri = encodeURIComponent(parts[parts.length - 1])

  return sizes.map(function (size) {
    var transform = transforms
    if (Array.isArray(size)) {
      transform = size[1]
      if (!/c_/.test(transform)) transform += ',c_fill'
      if (!/f_/.test(transform)) transform += ',f_auto'
      if (!/q_/.test(transform)) transform += ',q_auto'
      size = size[0]
    }
    // don't bother upscaling images
    if (size > max) size = max
    if (opts.aspect) transform += `,h_${Math.floor(size * opts.aspect)}`

    return `/media/${type}/${transform},w_${size}/${uri} ${size}w`
  }).join(',')
}

// convert hex color code to rgb value
// str -> arr
exports.hexToRgb = hexToRgb
function hexToRgb (hex) {
  // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

// get HH:mm timestamp from date
// Date -> str
exports.timestamp = timestamp
function timestamp (date) {
  return [
    ('0' + date.getHours()).substr(-2),
    ('0' + date.getMinutes()).substr(-2)
  ].join('.')
}

// nullable text getter for Prismic text fields
// (arr?) -> str
exports.asText = asText
function asText (richtext) {
  if (!richtext || !richtext.length) return null
  var text = ''
  for (let i = 0, len = richtext.length; i < len; i++) {
    text += (i > 0 ? ' ' : '') + richtext[i].text
  }
  return text
}

// get truncated snippet of text
// (str, num?) = arr
exports.snippet = snippet
function snippet (str, maxlen = Infinity) {
  if (!str || str.length < maxlen) return str
  var words = str.split(' ')
  var snipped = ''
  while (snipped.length < maxlen) snipped += ' ' + words.shift()
  return [snipped, ' ', html`<span class="u-textNowrap">${words[0]}…</span>`]
}

// create placeholder loading text of given length
// (num, bool?) -> Element
exports.placeholder = placeholder
function placeholder (length, light = false) {
  var content = '⏳'.repeat(length).split('').reduce(function (str, char) {
    if (Math.random() > 0.7) char += ' '
    return str + char
  }, '')
  return html`<span class="u-loading${light ? 'Light' : ''}">${content}</span>`
}

exports.colors = {
  goal1: '#e5243b',
  goal1Shaded: '#75001f',
  goal2: '#dda63a',
  goal2Shaded: '#774804',
  goal3: '#4c9f38',
  goal3Shaded: '#0d3b06',
  goal4: '#c5192d',
  goal4Shaded: '#5b0104',
  goal5: '#ff3a21',
  goal5Shaded: '#800501',
  goal6: '#26bde2',
  goal6Shaded: '#015379',
  goal7: '#fcc30b',
  goal7Shaded: '#7b4a00',
  goal8: '#a21942',
  goal8Shaded: '#40002a',
  goal9: '#fd6925',
  goal9Shaded: '#872600',
  goal10: '#dd1367',
  goal10Shaded: '#6e0035',
  goal11: '#fd9d24',
  goal11Shaded: '#944009',
  goal12: '#bf8b2e',
  goal12Shaded: '#5b3203',
  goal13: '#3f7e44',
  goal13Shaded: '#00301f',
  goal14: '#0a97d9',
  goal14Shaded: '#003570',
  goal15: '#56c02b',
  goal15Shaded: '#105702',
  goal16: '#00689d',
  goal16Shaded: '#001b3c',
  goal17: '#19486a',
  goal17Shaded: '#00132e'
}
