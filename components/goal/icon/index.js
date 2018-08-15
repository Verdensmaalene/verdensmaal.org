var html = require('choo/html')
var {className, i18n} = require('../../base')

var icons = [
  require('./1'),
  require('./2'),
  require('./3'),
  require('./4'),
  require('./5'),
  require('./6'),
  require('./7'),
  require('./8'),
  require('./9'),
  require('./10'),
  require('./11'),
  require('./12'),
  require('./13'),
  require('./14'),
  require('./15'),
  require('./16'),
  require('./17')
]

var text = i18n()

var AR_NUMBERS = '۰۱۲۳۴۵۶۷۸۹'
var AR_LANGREG = /^ar(-\w|$)/
var LANG_MULTIPLIERS = {
  'ja-jp': 0.75,
  'ru': 0.78,
  'zh-cn': 0.9,
  'ar-eg': 1
}

module.exports = icon
module.exports.label = label
module.exports.glyph = glyph
module.exports.loading = loading

// render complete icon, label + glyph
// (num, str, str?) -> HTMLElement
function icon (num, title, lang = 'en') {
  return html`
    <div class="Goal-icon Goal-icon--${num}">
      ${draw(num, title, lang)}
      <div class="Goal-glyph">${icons[num - 1]()}</div>
    </div>
  `
}

// render icon loading state
// (num, str?) -> HTMLElement
function loading (num, lang = 'en') {
  var height = 48
  var digitPos = 30

  return html`
    <div class="Goal-icon Goal-icon--${num}">
      <span class="u-hiddenVisually">${text`LOADING_TEXT_MEDIUM`}</span>
      <svg role="presentational" aria-hidden="true" class="Goal-label" viewBox="0 0 200 ${height}" style="-ms-flex: 1 1 ${height}px;" preserveAspectRatio="xMidYMin meet">
        <g transform="scale(0.94)">
          <text class="Goal-number" font-size="59.4" fill="currentColor" text-anchor="middle" alignment-baseline="hanging">
            <tspan x="${digitPos}" y="41" letter-spacing="-0.1" text-anchor="middle">${translate(num, lang)}</tspan>
          </text>
          <g y="0" class="Icon-text Hero-iconText">
            <rect x="57" y="0.5" width="120" height="16.5" fill="rgba(255, 255, 255, 0.5)" />
            <rect x="57" y="24.5" width="90" height="16.5" fill="rgba(255, 255, 255, 0.5)" />
          </g>
        </g>
      </svg>
    </div>
  `
}

// render text (num + title) section of icon
// (num, str, str?) -> HTMLElement
function label (num, title, lang = 'en') {
  return html`
    <div class="Goal-icon Goal-icon--${num}">
      ${draw(num, title, lang)}
    </div>
  `
}

// render glyph section of icon
// num -> HTMLElement
function glyph (num) {
  return html`
    <div class="Goal-icon Goal-icon--${num}">
      <div class="Goal-glyph">${icons[num - 1]()}</div>
    </div>
  `
}

// construct text section as svg element
// (num, str, str) -> HTMLElement
function draw (number, text, lang) {
  var lines = text.split('\n')
  var doubleDigit = (number > 9)
  var isArabic = AR_LANGREG.test(lang)
  var multiplier = LANG_MULTIPLIERS[lang] || 1
  var height = lines.length === 1 ? 48 : (lines.length * 24)
  var longLine = lines.find(line => line.length > (multiplier * 14))
  var longerLine = lines.find(line => line.length > (multiplier * 17))

  // Deduct 5% on long lines for extra measure
  if (longerLine) multiplier -= 0.05

  var textPos = 57
  textPos -= longLine ? 4 : 0
  textPos -= longerLine ? 6 : 0
  textPos += doubleDigit ? 5 : 0
  if (isArabic) textPos = 200 - textPos

  var digitPos = 30
  digitPos -= longerLine ? 4 : 0
  if (isArabic) digitPos = 200 - digitPos

  return html`
    <svg role="presentational" aria-hidden="true" class="${className('Goal-label', {'u-rtl': isArabic})}" height="${height * 0.92}" viewBox="0 0 200 ${height}" style="-ms-flex: 1 1 ${height}px;" preserveAspectRatio="xMidYMin meet">
      <g transform="scale(0.94)">
        <text class="Goal-number" font-size="59.4" fill="currentColor" text-anchor="middle" alignment-baseline="hanging">
          <tspan x="${digitPos}" y="41" letter-spacing="${isArabic ? '-0.1' : ''}" text-anchor="middle">
            ${isArabic ? number.toString().split('').map(num => AR_NUMBERS[+num]).join('') : number}
          </tspan>
        </text>
        <text class="Goal-text" font-size="${multiplier * 24}" y="-7" fill="currentColor" text-anchor="start" alignment-baseline="hanging">
          ${lines.map((line) => {
            var styles = lineStyles(line, lang)
            return html`
              <tspan x="${textPos}" dy="24" word-spacing="${!isArabic ? styles.wordSpacing : ''}" letter-spacing="${!isArabic ? styles.letterSpacing : ''}" text-anchor="start">${line}</tspan>
            `
          })}
        </text>
      </g>
    </svg>
  `
}

// calculate line style properties
// (str, str) -> obj
function lineStyles (line, lang) {
  var wordSpacing = '1.5'
  var letterSpacing = '0.5'
  var multiplier = LANG_MULTIPLIERS[lang] || 1
  var longLine = line.length > (multiplier * 14)
  var longerLine = line.length > (multiplier * 19)

  wordSpacing = longLine ? '1.2' : wordSpacing
  wordSpacing = longerLine ? '0.5' : wordSpacing
  letterSpacing = longLine ? '0.3' : letterSpacing
  letterSpacing = longerLine ? '-0.05' : letterSpacing

  return {wordSpacing, letterSpacing}
}

// translate number
// (num|str, str) -> num|str
function translate (num, lang) {
  if (!AR_LANGREG.test(lang)) return num
  return ('' + num).split('').map((num) => AR_NUMBERS[+num]).join('')
}
