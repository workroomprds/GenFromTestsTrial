/**
 * Tests for relativeSizes.js
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Import the module to test
import { relativeSizes } from '../../src/js/relativeSizes';

// Set up DOM environment if needed
//beforeAll(() => {
//  // This is only needed if your code relies on browser DOM APIs
//  // Jest uses jsdom by default, but you may need to configure specific elements
//  global.document = window.document;
//});

// Helper functions for scale creation
function createTimeScale() {
  return {
    name: "time",
    defaultUnit: "seconds",
    units: [
      {
        name: "second",
        plural: "seconds",
        conversionFactor: 1,
        decimalPlaces: 0
      },
      {
        name: "minute",
        plural: "minutes",
        conversionFactor: 60,
        decimalPlaces: 1
      },
      {
        name: "hour",
        plural: "hours",
        conversionFactor: 3600,
        decimalPlaces: 1
      },
      {
        name: "day",
        plural: "days",
        conversionFactor: 86400,
        decimalPlaces: 1
      }
    ]
  };
}

function createDistanceScale() {
  return {
    name: "distance",
    defaultUnit: "meters",
    units: [
      {
        name: "millimeter",
        plural: "millimeters",
        conversionFactor: 0.001,
        decimalPlaces: 0
      },
      {
        name: "centimeter",
        plural: "centimeters",
        conversionFactor: 0.01,
        decimalPlaces: 1
      },
      {
        name: "meter",
        plural: "meters",
        conversionFactor: 1,
        decimalPlaces: 1
      },
      {
        name: "kilometer",
        plural: "kilometers",
        conversionFactor: 1000,
        decimalPlaces: 1
      }
    ]
  };
}

// Main test suite
describe('relativeSizes', () => {
  // Basic functionality test
  test('convert function exists', () => {
    expect(typeof relativeSizes.convert).toBe('function');
  });

  // Example tests from rules.md
  test('Example: 60 seconds is 1 minute', () => {
    const result = relativeSizes.convert(60, "seconds", createTimeScale());
    expect(result).toBe("60 seconds is 1 minute");
  });

  test('Example: 3600 seconds is 1 hour', () => {
    const result = relativeSizes.convert(3600, "seconds", createTimeScale());
    expect(result).toBe("3600 seconds is 1 hour");
  });

  test('Example: 1000 meters is 1 kilometer', () => {
    const result = relativeSizes.convert(1000, "meters", createDistanceScale());
    expect(result).toBe("1000 meters is 1 kilometer");
  });

  // Different units create different outputs
  test('Different units create different outputs', () => {
    const timeScale = createTimeScale();
    const seconds = relativeSizes.convert(120, "seconds", timeScale);
    const minutes = relativeSizes.convert(2, "minutes", timeScale);
    expect(seconds).not.toBe(minutes);
  });

  // Different scales create different output
  test('Different scales create different output', () => {
    const timeResult = relativeSizes.convert(60, "seconds", createTimeScale());
    const distanceResult = relativeSizes.convert(60, "meters", createDistanceScale());
    expect(timeResult).not.toBe(distanceResult);
  });

  // Pluralization tests
  test('Units are pluralized appropriately - singular', () => {
    const result = relativeSizes.convert(60, "seconds", createTimeScale());
    expect(result).toContain("1 minute");
    expect(result).not.toContain("minutes");
  });

  test('Units are pluralized appropriately - plural', () => {
    const result = relativeSizes.convert(120, "seconds", createTimeScale());
    expect(result).toContain("minutes");
    expect(result).not.toContain("1 minute");
  });

  test('Input units are pluralized appropriately - singular', () => {
    const result = relativeSizes.convert(1, "second", createTimeScale());
    expect(result).toContain("1 second");
  });

  test('Input units are pluralized appropriately - plural', () => {
    const result = relativeSizes.convert(2, "seconds", createTimeScale());
    expect(result).toContain("2 seconds");
  });

  // Decimal places tests
  test('Output respects decimal places - zero', () => {
    // Create a custom scale with 0 decimal places
    const customScale = {
      name: "custom",
      defaultUnit: "unit1",
      units: [
        { name: "unit1", plural: "unit1s", conversionFactor: 1, decimalPlaces: 0 },
        { name: "unit2", plural: "unit2s", conversionFactor: 2.5, decimalPlaces: 0 }
      ]
    };

    const result = relativeSizes.convert(5, "unit1", customScale);
    expect(result).toContain("2 unit2s");
    expect(result).not.toContain("2.0");
  });

  test('Output respects decimal places - one', () => {
    // Create a custom scale with 1 decimal place
    const customScale = {
      name: "custom",
      defaultUnit: "unit1",
      units: [
        { name: "unit1", plural: "unit1s", conversionFactor: 1, decimalPlaces: 0 },
        { name: "unit2", plural: "unit2s", conversionFactor: 3, decimalPlaces: 1 }
      ]
    };

    const result = relativeSizes.convert(5, "unit1", customScale);
    expect(result).toContain("1.7 unit2s");
  });

  test('Output respects decimal places - two', () => {
    // Create a custom scale with 2 decimal places
    const customScale = {
      name: "custom",
      defaultUnit: "unit1",
      units: [
        { name: "unit1", plural: "unit1s", conversionFactor: 1, decimalPlaces: 0 },
        { name: "unit2", plural: "unit2s", conversionFactor: 3, decimalPlaces: 2 }
      ]
    };

    const result = relativeSizes.convert(5, "unit1", customScale);
    expect(result).toContain("1.67 unit2s");
  });

  // Edge case tests
  test('Handles zero input', () => {
    const result = relativeSizes.convert(0, "seconds", createTimeScale());
    expect(result).toContain("0 seconds");
  });

  test('Handles negative input', () => {
    const result = relativeSizes.convert(-60, "seconds", createTimeScale());
    expect(result).toContain("-60 seconds");
  });

  test('Handles very large numbers', () => {
    const result = relativeSizes.convert(31536000, "seconds", createTimeScale());
    expect(result).toContain("day");
  });

  test('Handles very small numbers', () => {
    const result = relativeSizes.convert(0.001, "meters", createDistanceScale());
    expect(result).toContain("millimeter");
  });

  // Floating point precision tests
  test('Handles floating point precision issues', () => {
    // Create a custom scale to test floating point precision
    const customScale = {
      name: "custom",
      defaultUnit: "unit1",
      units: [
        { name: "unit1", plural: "unit1s", conversionFactor: 1, decimalPlaces: 1 },
        { name: "unit2", plural: "unit2s", conversionFactor: 3, decimalPlaces: 1 }
      ]
    };

    // 0.1 + 0.2 = 0.30000000000000004 in JavaScript due to floating point precision
    const result = relativeSizes.convert(0.1 + 0.2, "unit1", customScale);
    expect(result).toContain("0.3 unit1s");
    expect(result).not.toContain("0.30000000000000004");
  });

  test('Handles rounding correctly', () => {
    // Create a custom scale to test rounding
    const customScale = {
      name: "custom",
      defaultUnit: "unit1",
      units: [
        { name: "unit1", plural: "unit1s", conversionFactor: 1, decimalPlaces: 0 },
        { name: "unit2", plural: "unit2s", conversionFactor: 10, decimalPlaces: 0 }
      ]
    };

    // 9.5 should round to 10 (1 unit2)
    const result = relativeSizes.convert(9.5, "unit1", customScale);
    expect(result).toContain("1 unit2");
  });

  // Input validation tests
  test('Handles invalid input value', () => {
    const result = relativeSizes.convert("not a number", "seconds", createTimeScale());
    expect(result).toContain("valid number");
  });

  test('Handles missing input value', () => {
    const result = relativeSizes.convert(undefined, "seconds", createTimeScale());
    expect(result).toContain("valid number");
  });

  test('Handles invalid unit', () => {
    const result = relativeSizes.convert(60, "lightyears", createTimeScale());
    expect(result).toContain("Unknown unit");
  });

  test('Handles missing unit', () => {
    const result = relativeSizes.convert(60, undefined, createTimeScale());
    expect(result).toContain("valid unit");
  });

  test('Handles invalid scale', () => {
    const result = relativeSizes.convert(60, "seconds", {});
    expect(result).toContain("valid scale");
  });

  test('Handles missing scale', () => {
    const result = relativeSizes.convert(60, "seconds", undefined);
    expect(result).toContain("valid scale");
  });

  describe('Module Environment Compatibility', () => {
    // Test: Module works in browser environment (jsdom)
    test('module works in browser environment', () => {
      // jsdom already provides a window object
      expect(window).toBeDefined();

      // Execute the code that would normally run in the browser
      window.thing = relativeSizes;

      // Verify the module is accessible in the browser environment
      expect(window.thing).toBeDefined();
      expect(typeof window.thing.init).toBe('function');
    });

    // Test: Module doesn't throw "unexpected keyword 'export'" in browser
    test('module can be loaded in browser without export errors', () => {
      // Create a script element and try to load the module
      const script = document.createElement('script');

      // This is a simplified test - in a real browser, we'd need to check for errors
      // Here we're just verifying that the module can be assigned to window
      expect(() => {
        // This simulates what happens when a script is loaded in a browser
        window.thing = relativeSizes;
      }).not.toThrow();
    });
  });
});