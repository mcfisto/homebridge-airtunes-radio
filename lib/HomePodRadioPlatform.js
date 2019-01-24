const HomePodPlayer = require('./HomePodPlayer');

let Service, Characteristic;


function setHomebridge(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
}

class HomePodRadioPlatform {

    /**
     * Creates an instance of HomePodRadioPlatform.
     * @param {any} log
     * @param {any} config
     */
    constructor(log, config) {
        this.log = log;
        this.name = config.name;

        this.informationService = new Service.AccessoryInformation();
        this.informationService
            .setCharacteristic(Characteristic.Manufacturer, 'Daniel Man')
            .setCharacteristic(Characteristic.Model, 'v1.0.0')
            .setCharacteristic(Characteristic.SerialNumber, '482-14-669');

        this.speakerService = new Service.Lightbulb(this.name);
        this.speakerService.getCharacteristic(Characteristic.On)
            .on('get', this.getSwitchOnCharacteristic.bind(this))
            .on('set', this.setSwitchOnCharacteristic.bind(this));

        this.speakerService.getCharacteristic(Characteristic.Brightness)
            .on('get', this.getVolume.bind(this))
            .on('set', this.setVolume.bind(this));
        this.player = new HomePodPlayer(config);

        this.shutdownTimer = 0;
    }

    /**
     *
     *
     * @returns
     * @memberof HomePodRadioPlatform
     */
    getServices() {
        return [this.informationService, this.speakerService];
    }

    /**
     *
     *
     * @param {any} next
     * @returns
     * @memberof HomePodRadioPlatform
     */
    getSwitchOnCharacteristic(next) {
        const currentState = this.player.isPlaying();
        return next(null, currentState);
    }


    /**
     *
     *
     * @param {any} on
     * @param {any} next
     * @returns
     * @memberof HomePodRadioPlatform
     */
    setSwitchOnCharacteristic(on, next) {
        // set player state here
        if (on) {
            if (new Date().getTime() - this.shutdownTimer > 3000 && !this.player.isPlaying()) {
                this.log.info('Turning ' + this.name + ' on');
                this.player.play();
            }
        } else {
            this.log.info('Turning ' + this.name + ' off');
            this.shutdownTimer = new Date().getTime();
            this.player.stop();
        }
        return next();
    }

    /**
     *
     *
     * @param {any} next
     * @returns
     * @memberof HomePodRadioPlatform
     */
    getVolume(next) {
        const volume = this.player.getVolume() * 100;
        return next(null, volume);
    }

    /**
     *
     *
     * @param {any} volume
     * @param {any} next
     * @returns
     * @memberof HomePodRadioPlatform
     */
    setVolume(volume, next) {
        this.log('Setting ' + this.name + ' to ' + volume + '%');
        this.player.setVolume(volume);
        return next();
    }
}

module.exports = {
    HomePodRadioPlatform: HomePodRadioPlatform,
    setHomebridge: setHomebridge
}