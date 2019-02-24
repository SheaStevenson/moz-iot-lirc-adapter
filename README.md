# A LIRC Adapter for the Mozilla Things Gateway

This kind of works.

### Build & Testing Process

1. On the Raspberry Pi (Browsed to ~):
* `rm -rf ~/.mozilla-iot/log`
* `rm -rf ~/.mozilla-iot/addons/lirc-adapter/`
2. Switch to Dev machine (Browsed to project folder):
* `./package.sh`
* `scp -r . pi@DEVICEIPADDRESSHERE:~/.mozilla-iot/addons/lirc-adapter`
3. Switch back to Pi
* `sudo systemctl restart mozilla-iot-gateway.service`
4. Wait a reasonable amount of time for the gateway to restart
5. View logs if necessary
* `(cd ~/.mozilla-iot/log && cat "$(ls -1rt | tail -n1)")`

### Useful Links

https://gist.github.com/prasanthj/c15a5298eb682bde34961c322c95378b
