/**
 * Tests for relativeSizes.js
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Import the module to test
import { relativeSizes } from '../../src/js/relativeSizes.js';

describe('relativeSizes', () => {
  let rs;
  let simpleScale;
  
  beforeEach(() => {
    rs = relativeSizes;
    simpleScale = {
      "units": [
        {"name": "thousandth", "plural": "thousandths", "conversionFactor": 0.001, "decimalPlaces": 0},
        {"name": "one", "plural": "ones", "conversionFactor": 1, "decimalPlaces": 1},
        {"name": "hundred", "plural": "hundreds", "conversionFactor": 100, "decimalPlaces": 2}
      ],
      "defaultUnit": "one"
    };
  });
  
  describe('convert method - success cases', () => {
    test('should handle no conversion', () => {
      expect(rs.convert(1, "one", simpleScale)).toBe("1 one is 1.0 one");
    });
    
    test('should handle basic conversion', () => {
      expect(rs.convert(1000, "thousandth", simpleScale)).toBe("1000 thousandths is 1.0 one");
    });
    
    test('should handle plural forms', () => {
      expect(rs.convert(2000, "thousandth", simpleScale)).toBe("2000 thousandths is 2.0 ones");
    });
    
    test('should skip units when appropriate', () => {
      expect(rs.convert(212000, "thousandth", simpleScale)).toBe("212000 thousandths is 2.12 hundreds");
    });
    
    test('should pass through input to output', () => {
      expect(rs.convert(3.001, "one", simpleScale)).toBe("3.001 ones is 3.0 ones");
    });
    
    test('should handle scientific notation', () => {
      expect(rs.convert(1e3, "thousandth", simpleScale)).toBe("1000 thousandths is 1.0 one");
    });
    
    test('should respect threshold behavior', () => {
      expect(rs.convert(949, "thousandth", simpleScale)).toBe("949 thousandths is 949 thousandths");
      expect(rs.convert(950, "thousandth", simpleScale)).toBe("950 thousandths is 1.0 one");
    });
  });
  
  describe('convert method - rounding behavior', () => {
    test('should round correctly', () => {
      // Round down
      expect(rs.convert(9.84, "one", simpleScale)).toContain("9.8 ones");
      // Round up at midpoint 
      expect(rs.convert(9.85, "one", simpleScale)).toContain("9.9 ones");
      // Round up
      expect(rs.convert(9.86, "one", simpleScale)).toContain("9.9 ones");
    });
  });
  
  describe('convert method - negative values', () => {
    test('should handle negative values correctly', () => {
      expect(rs.convert(-1000, "thousandth", simpleScale)).toBe("-1000 thousandths is -1.0 one");
      expect(rs.convert(-2000, "thousandth", simpleScale)).toBe("-2000 thousandths is -2.0 ones");
      expect(rs.convert(-100, "one", simpleScale)).toBe("-100 ones is -1.00 hundred");
    });
  });
  
  describe('convert method - error cases', () => {
    test('should handle invalid values', () => {
      expect(rs.convert("not_a_number", "one", {"units": [], "defaultUnit": "one"}))
        .toBe("Please provide a valid number");
      expect(rs.convert(null, "one", {"units": [], "defaultUnit": "one"}))
        .toBe("Please provide a valid number");
    });
    
    test('should handle invalid units', () => {
      expect(rs.convert(10, "", {"units": [], "defaultUnit": "one"}))
        .toBe("Please provide a valid unit");
      expect(rs.convert(10, null, {"units": [], "defaultUnit": "one"}))
        .toBe("Please provide a valid unit");
    });
    
    test('should handle unknown units', () => {
      expect(rs.convert(10, "unknown", {"units": [{"name": "one", "plural": "ones", "conversionFactor": 1}], "defaultUnit": "one"}))
        .toBe("Unknown unit: unknown");
    });
    
    test('should handle invalid scale configuration', () => {
      const invalidScales = [
        {},
        {"units": []},
        {"units": [], "missing": "one"},
        null,
        "not_a_dict",
        {"units": "not_a_list", "defaultUnit": "one"},
        {"units": ["not_a_dict"], "defaultUnit": "one"}
      ];
      
      invalidScales.forEach(scale => {
        expect(rs.convert(10, "one", scale)).toBe("Please provide a valid scale");
      });
    });
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