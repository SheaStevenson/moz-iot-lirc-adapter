'use strict';

const {Adapter, Device} = require('gateway-addon');
const lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});

class LIRCAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, manifest.name, manifest.name);
    const adapter = this;
    addonManager.addAdapter(adapter);

    lirc.on('connect', () => {
      lirc.send('VERSION').then(res => {
        console.log('LIRC Version Connected', res);
      });

      // Get available remote configs
      lirc.list().then(function(response) {
        console.log("Remotes", typeof response, response);

        // Add each available remote
        for (const remote of response) {
          console.log("Adding Remote", remote);
          adapter.handleDeviceAdded(new LIRCDevice(adapter, remote));
        }
      }).catch(function(error) {
        console.log("Problems", error);
      });
    });
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
    this.addAction('key_power', {label: 'Power'});
  }

  performAction(action) {
    if (action.name !== 'key_power') {
      //return Promise.reject('Unknown action');
      console.log(action.name+' is not the wake command.');
    }

    return new Promise((resolve, reject) => {

      lirc.sendOnce(this.remote, action.name).catch(error => {
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
