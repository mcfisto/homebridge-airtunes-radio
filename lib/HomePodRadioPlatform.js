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
        this.config = config;
        this.name = config.name;

        this.generateRadioDepartment(config);

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
                this.updateStoreAmongRadioDepartment();
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
        const volume = this.player.getVolume();
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

    switchOff() {
        this.speakerService.getCharacteristic(Characteristic.On).updateValue(false);
        this.player.stop();
    }

    generateRadioDepartment() {
        global.homepodRadioDepartment = global.homepodRadioDepartment || [];

        const hostStore = global.homepodRadioDepartment.filter(item => item.host === this.config.host)[0];
        if (!hostStore) {
            global.homepodRadioDepartment.push({
                host: this.config.host,
                onPayingSteams: []
            })
        }
        return global.homepodRadioDepartment;
    }

    updateStoreAmongRadioDepartment() {
        const hostStore = global.homepodRadioDepartment.filter(item => item.host === this.config.host)[0];

        if (!hostStore) { return; }
        const self = this;
        this.log('[Update Store]: add stream -- ', this.config.streamUrl);
        hostStore.onPayingSteams.push({
            url: self.config.streamUrl,
            destroy: () => self.switchOff()
        })

        if (hostStore.onPayingSteams.length === 1) { return; }
        const stream = hostStore.onPayingSteams.shift();
        this.log('[Update Store]: delete stream -- ', stream.streamUrl);
        // this.log('[Store Result]: ', hostStore);
        stream.destroy();
    }
}

module.exports = {
    HomePodRadioPlatform: HomePodRadioPlatform,
    setHomebridge: setHomebridge
}