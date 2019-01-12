const request = require('request'),
    lame = require('lame'),
    airtunes = require('airtunes2');

class HomePodPlayer {

    constructor(config) {
        this.config = config;
        console.log("Config: %j", config);
        this.playing = false;
        this.lastVolume = 1;
        this.device = null;
    }

    isPlaying() {
        return this.playing;
    }

    play() {
        if (!this.playing) {
            var device = airtunes.add(this.config.homepodHost, this.config.homepodPort);

            var self = this;

            device.on('status', function (status) {
                if (status !== 'ready') {
                    return;
                }
                request(self.config.streamURL)
                    .pipe(new lame.Decoder)
                    .pipe(airtunes);

                self.playing = true;
            });
        }
    }

    stop() {
        if (this.playing) {
            airtunes.stopAll(function () {});
            this.playing = false;
        }
    }

    setVolume(value) {
        this.lastVolume = value;
        if (this.device) {
            this.device.setVolume(value);
        }
    }

    getVolume() {
        return this.lastVolume;
    }

    mute() {
        this.lastVolume = 0;
        if (this.device) {
            this.device.setVolume(0);
        }
    }

}

module.exports = HomePodPlayer;