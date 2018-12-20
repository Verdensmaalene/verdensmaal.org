// split string into rows of max length
// (str, num?) -> arr
exports.rows = function rows (str, length = 35) {
  return str.split('').reduce(function (rows, char) {
    var last = rows.length - 1
    if (rows[last].length < length) {
      rows[last] += char
    } else if (char !== ' ') {
      var tail = rows[last].match(/\S+?$/)
      if (tail) {
        rows[last] = rows[last].substr(0, tail.index)
        char = tail[0] + char
      }
      rows.push(char)
    }
    return rows
  }, [''])
}

// parse string to number
// any -> num
exports.parse = parse
function parse (val) {
  return parseFloat(val.replace(',', '.'))
}

// format number as string
// num -> str
exports.format = function format (val) {
  var num = typeof val === 'number' ? val : parse(val)
  if (isNaN(num)) return val

  var str = num + ''
  var unit = typeof val === 'number' ? null : val.match(/[^\d]+$/)
  if (num < 10000) return str.replace('.', ',') + (unit ? unit[0] : '')

  var res = []
  var [int, dec] = str.split('.')
  var chars = int.split('').reverse()
  for (let i = 0, len = chars.length; i < len; i++) {
    res.push(i && !(i % 3) ? '.' + chars[i] : chars[i])
  }
  return res.reverse().join('') + (dec ? ',' + dec : '') + (unit ? unit[0] : '')
}
