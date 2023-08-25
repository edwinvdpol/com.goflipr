'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

class Driver extends OAuth2Driver {

  /*
  | Driver events
  */

  // Driver initialized
  async onOAuth2Init() {
    this.log('Initialized');
  }

  // Driver destroyed
  async onUninit() {
    this.log('Destroyed');
  }

  /*
  | Pairing functions
  */

  // Pair devices
  async onPairListDevices({ oAuth2Client }) {
    this.log(`Pairing ${this.id}s...`);

    this.log('Get devices from API');
    const devices = await oAuth2Client.discoverDevices(this.id);

    return Promise.all(devices.map((device) => this.getDeviceData(oAuth2Client, device)).filter((e) => e));
  }

}

module.exports = Driver;
