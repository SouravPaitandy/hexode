const pkg = require('y-websocket');
console.log('Keys:', Object.keys(pkg));
try {
  const utils = require('y-websocket/bin/utils');
  console.log('Utils found!');
} catch (e) {
  console.log('Utils NOT found via require');
}
