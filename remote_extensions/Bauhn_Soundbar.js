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
  },

  propertyChanged: function(device, property) {
    // If the power property changes, manually send the power command
    if (property.name == 'power') {
      // Super simple toggle
      // There's nothing I can do to keep this remote in sync with the gateway
      // But it doesn't really matter that much either
      device.sendIRCommand('KEY_POWER');
    }
  }
}