import http from 'http'

import app from './app.js'

const server = http.createServer(app);
let currentApp = app;
server.listen(3000);

if (module.hot) {
  console.log('MODULE HOT')
  module.hot.accept('./app.js', () => {
    console.log('🔁 HMR Reloading `./app`...');
    server.removeListener('request', currentApp)
    server.on('request', app)
    currentApp = app
  })

  console.info('✅  Server-side HMR Enabled!');
} else {
  console.log('NO MODULE HOT')
}

