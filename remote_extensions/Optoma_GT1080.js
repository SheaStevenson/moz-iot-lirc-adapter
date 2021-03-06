const {Adapter, Device, Property} = require('gateway-addon');

module.exports = {
  postSetup: function(device) {
    // Change the icon to an On/Off Switch
    device["@type"] = [ "OnOffSwitch" ];

    // Actually make the On/Off switch clickable
    device.properties.set('power', new Property(device, 'power', {
      title: 'On/Off',
      type: 'boolean',
      "@type": 'OnOffProperty'
    }));

    // Remove commands that will be set up manually
    device.actions.delete('KEY_POWER');
    device.actions.delete('KEY_POWER2');
  },

  propertyChanged: function(device, property) {
    // If the power property changes, manually send the power command
    if (property.name == 'power') {
      if (property.value) {
        // Power On
        device.sendIRCommand('KEY_POWER');

      } else {
        // Power Off
        let count = 3; // Send 3 times in case one misses
        let button_repeat = setInterval(() => {
          device.sendIRCommand('KEY_POWER2');
          if (--count === 0) clearInterval(button_repeat);
        }, 500);
      }
    }
  }
}