/**
 * Generate a squiggly line path following given path
 * @see https://stackoverflow.com/questions/42441472/draw-a-squiggly-line-in-svg
 * @param {Element} follow
 * @param {number} step
 * @param {number} amplitude
 * @param {number} side
 * @returns {string} SVG path
 */

module.exports = function createPath (follow, step = 15, amplitude = 4, side = -1) {
  var pathLen = follow.getTotalLength()

  // adjust step so that there are a whole number of steps along the path
  var numSteps = Math.round(pathLen / step)

  var pos = follow.getPointAtLength(0)
  var newPath = 'M' + [pos.x, pos.y].join(',')

  for (let i = 1; i <= numSteps; i++) {
    const last = pos
    pos = follow.getPointAtLength(i * pathLen / numSteps)

    // Find a point halfway between last and pos. Then find the point that is
    // perpendicular to that line segment, and is amplitude away from
    // it on the side of the line designated by 'side' (-1 or +1).
    // This point will be the control point of the quadratic curve forming the
    // squiggle step.

    // the vector from the last point to this one
    const vector = {
      x: (pos.x - last.x),
      y: (pos.y - last.y)
    }
    // the length of this vector
    const vectorLen = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    // the point halfwasy between last point and tis one
    const half = {
      x: (last.x + vector.x / 2),
      y: (last.y + vector.y / 2)
    }
    // the vector that is perpendicular to 'vector'
    const perpVector = {
      x: -(amplitude * vector.y / vectorLen),
      y: (amplitude * vector.x / vectorLen)
    }
    // now calculate the control point position
    const controlPoint = {
      x: (half.x + perpVector.x * side),
      y: (half.y + perpVector.y * side)
    }

    newPath += ('Q' + [controlPoint.x, controlPoint.y, pos.x, pos.y].join(','))
    // switch the side (for next step)
    side = -side
  }

  return newPath
}
