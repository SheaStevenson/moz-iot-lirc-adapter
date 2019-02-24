'use strict';

const {Adapter, Device} = require('gateway-addon');
const lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});

const debug_mode = true;

class LIRCAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, manifest.name, manifest.name);
    const adapter = this;
    addonManager.addAdapter(adapter);

    lirc.on('connect', () => {
      if (debug_mode) {
        lirc.send('VERSION').then(res => {
          console.log('LIRC Version', res);
        });
      }

      // Get available remote configs
      lirc.list().then(function(response) {
        if (debug_mode) console.log("Found Remotes", response);

        // Add each available remote
        for (const remote of response) {
          if (debug_mode) console.log("Adding Remote", remote);

          // Start getting available commands
          lirc.list(remote).then(function(response){
            // Set up device, and add availble commands
            if (debug_mode) console.log("Remote has commands", remote, response);
            adapter.handleDeviceAdded(new LIRCDevice(adapter, remote, response));
          }).catch(function(error) {
            if (debug_mode) console.log("Problem getting or adding commands", error);
          });
        }

      }).catch(function(error) {
        if (debug_mode) console.log("Problem getting or adding remotes", error);
      });
    });
  }
}

class LIRCDevice extends Device {
  constructor(adapter, remote, commands) {
    super(adapter, `lirc-${remote}`);

    const device = this;

    this.remote = remote;
    this.name = `Remote (${remote})`;
    this.description = `Remote (${remote})`;
    this['@context'] = 'https://iot.mozilla.org/schemas';
    this['@type'] = [];

    // Add each available command
    for (const command of commands) {
      // Separate the code and label
      let command_code = command.split(" ")[1];

      // Process the label name
      let command_label = command_code.replace('KEY_','').replace('_',' ').toLowerCase();
      command_label = command_label.charAt(0).toUpperCase() + command_label.slice(1);

      // Add the command
      if (debug_mode) console.log("Adding Command", command_code, command_label);
      this.addAction(command_code, {label: command_label});
    }
  }


  performAction(action) {
    /*
    if (action.name !== 'KEY_POWER') {
      //return Promise.reject('Unknown action');
      console.log(action.name+' is not the wake command.');
    }
    */

    return new Promise((resolve, reject) => {
      lirc.sendOnce(this.remote, action.name).catch(error => {
        if (error) {
          reject('Command failed: ' + error);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = (addonManager, manifest) => {
  new LIRCAdapter(addonManager, manifest);
};
