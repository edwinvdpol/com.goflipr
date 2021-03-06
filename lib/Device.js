'use strict';

const {OAuth2Device} = require('homey-oauth2app');
const Timer = require('./Timer');
const {filled} = require('./Utils');

class Device extends OAuth2Device {

  /*
  | Device events
  */

  // Device added
  async onOAuth2Added() {
    this.log('Added');
  }

  // Device deleted
  async onOAuth2Deleted() {
    // Stop timer
    await this.timer.stop();

    // Remove event listeners
    await this.removeEventListeners();

    this.log('Deleted');
  }

  // Device initialized
  async onOAuth2Init() {
    // Register event listeners
    await this.registerEventListeners();

    // Register timer
    this.timer = new Timer({
      homey: this.homey,
      id: this.getData().id
    });

    // Start timer
    await this.timer.start();

    // Wait for driver to become ready
    await this.driver.ready();

    this.log('Initialized');

    // Sync device
    this.homey.emit('sync', this.getData().id);
  }

  // Device destroyed
  async onOAuth2Uninit() {
    this.log('Destroyed');
  }

  /*
  | Synchronization functions
  */

  // Set device data
  handleSyncData(data) {
    this.log('Update device', this.getData().id, JSON.stringify(data));

    if (filled(data.Temperature)) {
      this.setCapabilityValue('measure_temperature', data.Temperature).catch(this.error);
    }

    if (filled(data.Desinfectant.Value)) {
        this.setCapabilityValue('measure_ci', data.Desinfectant.Value).catch(this.error);
      }

    if (filled(data.Desinfectant.DeviationSector)) {
      this.setCapabilityValue('status_ci', data.Desinfectant.DeviationSector).catch(this.error);
    }

    if (filled(data.PH.Value)) {
      this.setCapabilityValue('measure_ph', data.PH.Value).catch(this.error);
    }

    if (filled(data.PH.DeviationSector)) {
      this.setCapabilityValue('status_ph', data.PH.DeviationSector).catch(this.error);
    }

    if (filled(data.OxydoReductionPotentiel.Value)) {
      this.setCapabilityValue('measure_orp', data.OxydoReductionPotentiel.Value).catch(this.error);
    }

    this.setAvailable().catch(this.error);
  }

  /*
  | Listener functions
  */

  // Register event listeners
  async registerEventListeners() {
    const {id} = this.getData();

    this.onSync = this.handleSyncData.bind(this);
    this.onError = this.setUnavailable.bind(this);

    this.homey.on(`error:${id}`, this.onError);
    this.homey.on(`sync:${id}`, this.onSync);

    this.log(`Event listeners registered (${id})`);
  }

  // Remove event listeners
  async removeEventListeners() {
    const {id} = this.getData();

    this.homey.off(`error:${id}`, this.onError);
    this.homey.off(`sync:${id}`, this.onSync);

    this.onError = null;
    this.onSync = null;

    this.log(`Event listeners removed (${id})`);
  }

}

module.exports = Device;
