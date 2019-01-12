const HomePodRadioPlatform = require('./lib/HomePodRadioPlatform');

let Service, Characteristic;

module.exports = function (homebridge) {
    homebridge.registerAccessory("homebridge-homepod-radio", "HomePodRadio", HomePodRadioPlatform);
}