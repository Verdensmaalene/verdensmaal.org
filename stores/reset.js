module.exports = reset

function reset (state, emitter) {
  // properly reset eventbus on ssr
  if (typeof window === 'undefined') emitter.removeAllListeners()
}
