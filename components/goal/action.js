var html = require('choo/html')

module.exports = action

function action (props) {
  return html`
    <a class="Goal-action" href="${props.href}">
      <svg class="Goal-arrow" width="20" height="20" viewBox="0 0 20 20">
        <g transform="rotate(90 10 10)" fill="none" fill-rule="evenodd">
          <path d="M11.52 10L8 13.52l.73.73L12.98 10 8.73 5.75 8 6.48 11.52 10z" fill="currentColor" />
          <circle stroke="currentColor" cx="10" cy="10" r="9.5" />
        </g>
      </svg> ${props.text}
    </a>
  `
}
