module.exports = svg

// handle svg document response
async function svg (type, props) {
  return `
    <?xml version="1.0"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    ${await render(type, Object.assign({ standalone: true }, props))}
  `.trim()
}

async function render (type, props) {
  var style = require('../components/chart/style')

  switch (type) {
    case 'bar_chart': {
      let barChart = require('../components/chart/bar')
      return barChart(props, style)
    }
    case 'numeric_chart': {
      let bigNumber = require('../components/chart/number')
      return bigNumber(props, style)
    }
    case 'pie_chart': {
      let pieChart = require('../components/chart/pie')
      return pieChart(props, style)
    }
    case 'line_chart': {
      let lineChart = require('../components/chart/line')
      return lineChart(props, style)
    }
    default: throw new Error('Chart type not recognized')
  }
}
