const request = require('request'),
    lame = require('lame'),
    AirTunes = require('airtunes2');

class HomePodPlayer {

    constructor(config) {
        this.config = config;
        console.log("Config: %j", config);
        this.playing = false;
        this.lastVolume = 1;
        this.device = null;
        this.airtunes = null;
    }

    isPlaying() {
        return this.playing;
    }

    play() {
        if (!this.playing) {
            console.log("Config2: %j", this.config);
            this.airtunes = new AirTunes();

            this.device = this.airtunes.add(this.config.host, this.config);
            console.log("Device: %j", this.device);

            var self = this;

            this.device.on('status', function (status) {
                if (status !== 'ready') {
                    return;
                }
                console.log("URL: %j", self.config.streamUrl);

                request(self.config.streamUrl)
                    .pipe(new lame.Decoder)
                    .pipe(self.airtunes);

                self.playing = true;
            });
        }
    }

    stop() {
        if (this.playing) {
            this.airtunes.stopAll(function () {});
            this.airtunes.reset();
            this.playing = false;
            this.device = null;
            this.airtunes = null;
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