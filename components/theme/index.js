module.exports = theme

function theme (el, theme) {
  el.className = el.className.replace(/Theme--\d+/, '')
  if (theme) el.className = el.className.replace(/\s*$/, ` Theme--${theme}`)
}
