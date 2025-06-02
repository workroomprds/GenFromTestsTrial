/**
 * Tests for config.js
 * @jest-environment jsdom
 */

import { jest, describe, test, expect } from '@jest/globals';
import { config } from '../../src/config/config.js';

describe('Config tests', () => {
  // Test: Config structure validation
  test('should have valid scales array', () => {
    expect(config.scales).toBeDefined();
    expect(Array.isArray(config.scales)).toBeTruthy();
    expect(config.scales.length).toBeGreaterThan(0);
  });

  // Test: Each scale has required properties
  test('each scale should have required properties', () => {
    for (const scale of config.scales) {
      expect(scale.name).toBeDefined();
      expect(scale.defaultUnit).toBeDefined();
      expect(scale.units).toBeDefined();
      expect(Array.isArray(scale.units)).toBeTruthy();
      expect(scale.units.length).toBeGreaterThan(0);
      
      // Check if default unit exists in units
      const defaultUnitExists = scale.units.some(
        unit => unit.name === scale.defaultUnit || unit.plural === scale.defaultUnit
      );
      expect(defaultUnitExists).toBeTruthy();
    }
  });

  // Check each scale
  test('each scale must have a name', () => {
    config.scales.forEach(scale => {
      expect(scale.name).toBeDefined();
    });
  });

  test('each scale must have a default unit', () => {
    config.scales.forEach(scale => {
      expect(scale.defaultUnit).toBeDefined();
    });
  });

  test('each scale must have a non-empty array of units', () => {
    config.scales.forEach(scale => {
      expect(scale.units).toBeDefined();
      expect(Array.isArray(scale.units)).toBe(true);
      expect(scale.units.length).toBeGreaterThan(0);
    });
  });

  test('default unit should exist in units for each scale', () => {
    config.scales.forEach(scale => {
      const defaultUnitExists = scale.units.some(
        unit => unit.name === scale.defaultUnit || unit.plural === scale.defaultUnit
      );
      expect(defaultUnitExists).toBe(true);
    });
  });

  // Check each unit
  test('each unit must have a name', () => {
    config.scales.forEach(scale => {
      scale.units.forEach(unit => {
        expect(unit.name).toBeDefined();
      });
    });
  });

  test('each unit must have a plural form', () => {
    config.scales.forEach(scale => {
      scale.units.forEach(unit => {
        expect(unit.plural).toBeDefined();
      });
    });
  });

  test('each unit must have a conversion factor', () => {
    config.scales.forEach(scale => {
      scale.units.forEach(unit => {
        expect(unit.conversionFactor).toBeDefined();
      });
    });
  });

  test('each unit must specify decimal places', () => {
    config.scales.forEach(scale => {
      scale.units.forEach(unit => {
        expect(unit.decimalPlaces).toBeDefined();
      });
    });
  });

  test('decimal places must be a non-negative integer', () => {
    config.scales.forEach(scale => {
      scale.units.forEach(unit => {
        expect(Number.isInteger(unit.decimalPlaces)).toBe(true);
        expect(unit.decimalPlaces).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // Test specific examples from rules.md
  test('time scale should exist', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    expect(timeScale).toBeDefined();
  });

  test('distance scale should exist', () => {
    const distanceScale = config.scales.find(scale => scale.name === "distance");
    expect(distanceScale).toBeDefined();
  });

  test('seconds unit should exist in time scale', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    const secondsUnit = timeScale.units.find(
      unit => unit.name === "second" || unit.plural === "seconds"
    );
    expect(secondsUnit).toBeDefined();
  });

  test('minutes unit should exist in time scale', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    const minuteUnit = timeScale.units.find(
      unit => unit.name === "minute" || unit.plural === "minutes"
    );
    expect(minuteUnit).toBeDefined();
  });

  test('hours unit should exist in time scale', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    const hourUnit = timeScale.units.find(
      unit => unit.name === "hour" || unit.plural === "hours"
    );
    expect(hourUnit).toBeDefined();
  });

  test('minutes should have conversion factor of 60', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    const minuteUnit = timeScale.units.find(
      unit => unit.name === "minute" || unit.plural === "minutes"
    );
    expect(minuteUnit.conversionFactor).toBe(60);
  });

  test('hours should have conversion factor of 3600', () => {
    const timeScale = config.scales.find(scale => scale.name === "time");
    const hourUnit = timeScale.units.find(
      unit => unit.name === "hour" || unit.plural === "hours"
    );
    expect(hourUnit.conversionFactor).toBe(3600);
  });

  test('meters unit should exist in distance scale', () => {
    const distanceScale = config.scales.find(scale => scale.name === "distance");
    const metersUnit = distanceScale.units.find(
      unit => unit.name === "meter" || unit.plural === "meters"
    );
    expect(metersUnit).toBeDefined();
  });

  test('kilometers unit should exist in distance scale', () => {
    const distanceScale = config.scales.find(scale => scale.name === "distance");
    const kilometerUnit = distanceScale.units.find(
      unit => unit.name === "kilometer" || unit.plural === "kilometers"
    );
    expect(kilometerUnit).toBeDefined();
  });

  test('kilometers should have conversion factor of 1000', () => {
    const distanceScale = config.scales.find(scale => scale.name === "distance");
    const kilometerUnit = distanceScale.units.find(
      unit => unit.name === "kilometer" || unit.plural === "kilometers"
    );
    expect(kilometerUnit.conversionFactor).toBe(1000);
  });
});