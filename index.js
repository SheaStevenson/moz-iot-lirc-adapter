'use strict';

const {Adapter, Device, Property} = require('gateway-addon');
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
        debug_mode && console.log("Found Remotes", response);

        // Add each available remote
        for (const remote of response) {
          debug_mode && console.log("Adding Remote", remote);

          // Start getting available commands
          lirc.list(remote).then(function(response){
            // Set up device, and add availble commands
            debug_mode && console.log("Remote has commands", remote, response);
            adapter.handleDeviceAdded(new LIRCDevice(adapter, remote, response));
          }).catch(function(error) {
            debug_mode && console.log("Problem getting or adding commands", error);
          });
        }

      }).catch(function(error) {
        debug_mode && console.log("Problem getting or adding remotes", error);
      });
    });
  }
}

class LIRCDevice extends Device {
  constructor(adapter, remote, commands) {
    super(adapter, `lirc-${remote}`);

    this.remote = remote;

    this.name = `Remote (${remote})`;
    this.description = `Remote (${remote})`;
    this['@context'] = 'https://iot.mozilla.org/schemas';
    this['@type'] = [];


    try {
      // Add an extension for this remote if available
      debug_mode && console.log("Adding extension", this.remote);
      this.extension = require('./remote_extensions/'+this.remote);

    } catch (error) {
      if (error instanceof Error && error.code === "MODULE_NOT_FOUND") {
        // No extension for this remote
        debug_mode && console.log("No extension", this.remote);
      } else {
        // Something broke
        throw error;
      }
    }


    // Add each available command
    for (const command of commands) {
      // Separate the code and label
      let command_code = command.split(" ")[1];

      // Process the label name
      let command_label = command_code.replace('KEY_','').replace('_',' ');

      // Add the command
      debug_mode && console.log("Adding command", command_code, command_label);
      this.addAction(command_code, {label: command_label});
    }


    // Run the Post Setup extension
    this.hasExtensionFunction('postSetup') && this.extension.postSetup(this);

  }


  notifyPropertyChanged(property) {
    // Let the Gateway itself know so it can update the interface
    super.notifyPropertyChanged(property);

    // Hook for extension function
    this.hasExtensionFunction('propertyChanged') && this.extension.propertyChanged(this, property);
  }


  performAction(action) {
    // Send an IR command
    return new Promise((resolve, reject) => {
      this.sendIRCommand(action.name);
    });
  }


  sendIRCommand(commandName) {
    // Actually send the command
    // If you understand how promises work please fix this for me
    lirc.sendOnce(this.remote, commandName).then(
      result => { return Promise.resolve(); },
      error => {
        if (error) console.log(error);
        return Promise.reject('Command failed: ' + error);
      }
    );
  }


  hasExtensionFunction(functionName) {
    // Safety check for extension functions
    return (this.hasOwnProperty('extension')) &&
      (this.extension.hasOwnProperty(functionName)) &&
      (typeof this.extension[functionName] === "function");
  }
}

module.exports = (addonManager, manifest) => {
  new LIRCAdapter(addonManager, manifest);
};
