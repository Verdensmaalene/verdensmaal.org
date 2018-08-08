var html = require('choo/html')
var view = require('../components/view')
var {i18n} = require('../components/base')
var card = require('../components/card')

var text = i18n()

module.exports = view(home, meta)

function home (state, emit) {
  return html`
    <main class="View-container">
      ${card({
    title: 'external',
    body: 'text',
    link: {
      href: 'https://google.com/'
    },
    figure: {
      src: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    }
  })}

  ${card({
    title: 'news article',
    body: 'text',
    date: new Date(),
    link: {
      href: 'http://localhost:8080/test'
    },
    figure: {
      src: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    }
  })}

  ${card({
    title: 'internal',
    body: 'text',
    color: '#ff3a21',
    link: {
      href: 'http://localhost:8080/test'
    },
    figure: {
      src: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    }
  })}

  ${card({
    title: 'file download',
    body: 'text',
    link: {
      href: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    },
    figure: {
      src: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    }
  })}
    </main>
  `
}

function meta (state) {
  return {
    'og:image': '/share.png',
    title: text`SITE_TITLE`,
    description: text`SITE_DESCRIPTION`
  }
}
