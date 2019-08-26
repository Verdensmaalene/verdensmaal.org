var { colors } = require('../components/base')

module.exports = svg

// handle svg document response
// (obj, num) -> str
function svg (doc, goal) {
  var style = require('../components/chart/style')

  var { title, value, color, source } = doc.data
  var goalColors = [colors[`goal${goal}`], colors[`goal${goal}Shaded`]]
  var props = {
    title,
    series: [],
    standalone: true
  }

  if (typeof doc.data.min_y !== 'undefined') props.min = doc.data.min_y
  if (typeof doc.data.max_y !== 'undefined') props.max = doc.data.max_y
  if (Array.isArray(doc.data.labels)) {
    props.labels = doc.data.labels.map((block) => block.label)
  }

  if (source.url) {
    props.source = {
      text: doc.data.link_text || source.url.replace(/^https?:\/\//, ''),
      url: source.url
    }
  }

  if (doc.data.series) {
    for (let i = 0, len = doc.data.series.length; i < len; i++) {
      const serie = doc.data.series[i]
      if (serie.items && serie.primary) {
        props.series.push(Object.assign({}, serie.primary, {
          color: serie.primary.color || goalColors[i] || '#F1F1F1',
          data: serie.items
        }))
      } else {
        props.series.push(Object.assign({}, serie, {
          color: serie.color || goalColors[i] || '#F1F1F1'
        }))
      }
    }
  } else {
    props.series.push({ value: value, color: color || goalColors[0] })
  }

  switch (doc.type) {
    case 'bar_chart': {
      const barChart = require('../components/chart/bar')
      return document(barChart(props, style))
    }
    case 'numeric_chart': {
      const bigNumber = require('../components/chart/number')
      return document(bigNumber(props, style))
    }
    case 'pie_chart': {
      const pieChart = require('../components/chart/pie')
      return document(pieChart(props, style))
    }
    case 'line_chart': {
      const lineChart = require('../components/chart/line')
      return document(lineChart(props, style))
    }
    default: throw new Error('Chart type not recognized')
  }
}

function document (children) {
  return `
    <?xml version="1.0"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    ${children}
  `.trim()
}
