module.exports = ssr

function ssr (state, emitter) {
  // prevent leaking component state in-between renders
  state.components = {}

  // ensure document language
  state.language = 'dn'
}
