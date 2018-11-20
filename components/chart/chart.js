var nanoraf = require('nanoraf')
var raw = require('choo/html/raw')
var Component = require('choo/component')
var { vh } = require('../base')

var SIZE = 560

module.exports = class Chart extends Component {
  constructor (id) {
    super(id)
    this.id = id
    this.style = null
  }

  load (element) {
    var offset, height

    var onscroll = nanoraf(function () {
      var { scrollY } = window
      if (scrollY + vh() < offset + height / 2) return
      if (scrollY > offset + height) return
      element.classList.add('in-view')
      window.removeEventListener('scroll', onscroll)
    })
    var onresize = nanoraf(function () {
      var parent = element.parentElement
      offset = parent.offsetTop
      height = parent.offsetHeight
      element.style.setProperty('--Chart-scale-factor', SIZE / height)
      while ((parent = parent.offsetParent)) offset += parent.offsetTop
    })

    window.requestAnimationFrame(function () {
      onresize()
      onscroll()
    })

    window.addEventListener('scroll', onscroll, { passive: true })
    window.addEventListener('resize', onresize)
    this.unload = unload

    function unload () {
      window.removeEventListener('scroll', onscroll)
      window.removeEventListener('resize', onresize)
    }
  }

  update () {
    return false
  }

  _handleRender (args) {
    var el = super._handleRender(args)
    if (typeof window === 'undefined') return el
    // hack to preserve xmlns namespaces
    return raw((new window.XMLSerializer()).serializeToString(el))[0]
  }

  render (props) {
    if (!props.standalone || this.style) return super.render(props)
    return import('./style').then((style) => {
      this.style = style
      return super.render(props)
    })
  }
}
