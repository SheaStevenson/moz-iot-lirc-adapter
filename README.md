# About

This is a LIRC Adapter for the Mozilla IoT Gateway, made to work with my very specific hardware setup.

Currently, it creates a new device for each remote control you have configured, and adds a button action for each of its commands.

Unfortunately, it's not quite install and go - you'll have to do some work to get everything running on your own gateway, but I've tried to

### Prerequisites (AKA my specific setup)
* A Raspberry Pi running Mozilla's Web of Things Gateway. [Instructions here](https://iot.mozilla.org/gateway/).
* An Infrared Shield. I use the one that [looks like this](http://www.raspberrypiwiki.com/index.php/Raspberry_Pi_IR_Control_Expansion_Board), because I'm not a wizard. If you are a wizard, you could probably just plug an IR LED straight into the GPIO pins.
* LIRC installed and configured on the Pi. Github user [prasanthj](https://gist.github.com/prasanthj) has written [some awesome instructions](https://gist.github.com/prasanthj/c15a5298eb682bde34961c322c95378b).
* At least one remote control configured. If you can manually run a command like `irsend SEND_ONCE <device-name> KEY_POWER` then you're good to go.
* SSH access to the gateway. You should be able to switch this on [through the Gateway interface under Settings > Developer](https://gateway.local/settings/developer). [The Mozilla wiki](https://github.com/mozilla-iot/wiki/wiki/Logging-into-the-Raspberry-Pi) has more info if necessary.


### Build & Testing Process

I haven't yet figured out how to make this a proper addon, so here's what I do to build and install it.

1. On the Raspberry Pi (SSHd into the Pi, Browsed to ~):
* (Optional) `rm -rf ~/.mozilla-iot/log`
* `rm -rf ~/.mozilla-iot/addons/lirc-adapter/`
2. Switch to Dev machine (Browsed to project folder):
* `./package.sh`
* `scp -r . pi@gateway.local:~/.mozilla-iot/addons/lirc-adapter`
3. Switch back to Pi
* `sudo systemctl restart mozilla-iot-gateway.service`
4. Wait a reasonable amount of time for the gateway to restart
5. View logs if necessary
* `(cd ~/.mozilla-iot/log && cat "$(ls -1rt | tail -n1)")`

### Thanks

* [Mozilla](https://github.com/mozilla-iot) for the gateway and example addons. The [Wake On Lan Adapter](https://github.com/mozilla-iot/wake-on-lan-adapter) was the most useful for starting out.
* [hobbyquaker](https://github.com/hobbyquaker/lirc-client) for the NodeJS LIRC client which is one less thing I have to figure out myself.
* [prasanthj](https://gist.github.com/prasanthj) for saving my sanity when starting out with LIRC.