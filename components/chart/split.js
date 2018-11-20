module.exports = title

function title (str, length = 40) {
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
