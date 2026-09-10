'use strict';

const { clean, filled } = require('./Utils');

class Data {

  constructor(raw) {
    Object.assign(this, clean(this.fromApiData(raw)));
  }

  get device() {
    return clean({
      name: this.name ?? 'Unknown',
      data: { id: this.id },
      settings: this.settings,
    });
  }

  get settings() {
    return {
      serial_number: String(this.serial_number),
      version: String(this.version),
      volume: `${this.volume} m³`,
      construction_year: String(this.construction_year),
    };
  }

  fromApiData(raw) {
    const data = {};

    if ('BuiltYear' in raw) data.construction_year = raw.BuiltYear;
    if ('Desinfectant' in raw && filled(raw.Desinfectant)) {
      if ('Value' in raw.Desinfectant) data.measure_ci = Math.round((raw.Desinfectant.Value + Number.EPSILON) * 100) / 100;
      if ('DeviationSector' in raw.Desinfectant) data.status_ci = raw.Desinfectant.DeviationSector;
    }
    if ('OxydoReductionPotentiel' in raw && 'Value' in raw.OxydoReductionPotentiel) data.measure_orp = raw.OxydoReductionPotentiel.Value;
    if ('PH' in raw && filled(raw.PH)) {
      if ('Value' in raw.PH) data.measure_ph = raw.PH.Value;
      if ('DeviationSector' in raw.PH) data.status_ph = raw.PH.DeviationSector;
    }
    if ('PrivateName' in raw) data.name = raw.PrivateName;
    if ('Temperature' in raw) data.measure_temperature = Math.round((raw.Temperature + Number.EPSILON) * 10) / 10;
    if ('Serial' in raw && filled(raw.Serial)) {
      data.id = raw.Serial;
      data.serial_number = raw.Serial;
    }
    if ('Version' in raw) data.version = raw.Version;
    if ('Volume' in raw) data.volume = raw.Volume;

    return data;
  }

}

module.exports = Data;
