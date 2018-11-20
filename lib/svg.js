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
  switch (type) {
    case 'bar_chart': {
      var BarChart = require('../components/chart/bar')
      var barChart = new BarChart()
      return barChart.render(props)
    }
    case 'big_number': {
      var BigNumber = require('../components/chart/number')
      var bigNumber = new BigNumber()
      return bigNumber.render(props)
    }
    default: throw new Error('Chart type not recognized')
  }
}
