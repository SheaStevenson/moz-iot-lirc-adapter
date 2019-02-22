'use strict';

const {Adapter, Device} = require('gateway-addon');
const lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});

class LIRCAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, manifest.name, manifest.name);
    addonManager.addAdapter(this);

    console.log('constructing');

    lirc.on('connect', () => {
      console.log('connecting');

      lirc.send('VERSION').then(res => {
        console.log('LIRC Version', res);
      });

      // Get available remote configs
      lirc.list().then(function(response) {
        console.log("Remotes", response);
      }).catch(function(error) {
        console.log("Problems", error);
      });
    });

    for (const remote of manifest.moziot.config.devices) {
      this.handleDeviceAdded(new LIRCDevice(this, remote));
    }
  }
}

class LIRCDevice extends Device {
  constructor(adapter, remote) {
    super(adapter, `lirc-${remote}`);

    this.remote = remote;
    this.name = `Remote (${remote})`;
    this.description = `Remote (${remote})`;
    this['@context'] = 'https://iot.mozilla.org/schemas';
    this['@type'] = [];
    this.addAction('wake', {label: 'Wake'});
  }

  performAction(action) {
    if (action.name !== 'wake') {
      //return Promise.reject('Unknown action');
      console.log(action.name+' is not the wake command.');
    }

    return new Promise((resolve, reject) => {

      lirc.sendOnce(this.remote, 'KEY_POWER').catch(error => {
        console.log(action.name);
        if (error) {
          reject('Command failed: ' + error);
        } else {
          resolve();
        }
      });

      /*
      lirc.wake(this.remote, (err, res) => {
        if (err || !res) {
          reject('Wake failed');
          return;
        }

        resolve();
      });
      */
    });
  }
}

module.exports = (addonManager, manifest) => {
  new LIRCAdapter(addonManager, manifest);
};
