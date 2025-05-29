/**
 * Jest Test Suite for main.js
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { Main } from '../../src/js/main.js';

// main.js should be a singleton

// Mock dependencies
const createMocks = () => {
  return {
    htmlHandler: {
      init: jest.fn().mockReturnValue(true),
      updateOutput: jest.fn(),
      updateInputValue: jest.fn(),
      updateUnitDropdown: jest.fn()
    },
    relativeSizes: {
      convert: jest.fn().mockReturnValue("Mock conversion result")
    },
    config: {
      scales: [
        {
          name: "time",
          defaultUnit: "second",
          units: [
            { name: "second", plural: "seconds" },
            { name: "minute", plural: "minutes" }
          ]
        },
        {
          name: "distance",
          defaultUnit: "meter",
          units: [
            { name: "meter", plural: "meters" },
            { name: "kilometer", plural: "kilometers" }
          ]
        }
      ]
    }
  };
};

describe('Main Module', () => {
  let mocks;
  
  // Create fresh mocks and reset module state before each test
  beforeEach(() => {
    // Create new instances of mocks to prevent shared state
    mocks = createMocks();
    
    // Reset any module state
    jest.clearAllMocks();
    
    // Initialize with fresh dependencies
    Main.init(mocks.htmlHandler, mocks.relativeSizes, mocks.config);
  });

  describe('Module structure', () => {
    test('exports expected API', () => {
      expect(Main).toEqual(expect.objectContaining({
        init: expect.any(Function),
        getInputValue: expect.any(Function),
        getCurrentUnit: expect.any(Function),
        getCurrentScale: expect.any(Function),
        setInputValue: expect.any(Function),
        setCurrentUnit: expect.any(Function),
        setCurrentScale: expect.any(Function)
      }));
    });
  });

  describe('Initialization', () => {
    test('calls HTMLHandler.init with dependencies', () => {
      // Clear previous init call from beforeEach
      mocks.htmlHandler.init.mockClear();
      
      Main.init(mocks.htmlHandler, mocks.relativeSizes, mocks.config);
      
      expect(mocks.htmlHandler.init).toHaveBeenCalledWith(
        mocks.relativeSizes, 
        mocks.config
      );
    });
    
    test('initializes with default scale and unit from config', () => {
      expect(Main.getCurrentScale()).toBe("time");
      expect(Main.getCurrentUnit()).toBe("second");
    });
    
    test('throws error when HTMLHandler is missing', () => {
      expect(() => Main.init(null, mocks.relativeSizes, mocks.config))
        .toThrow();
    });
    
    test('throws error when RelativeSizes is missing', () => {
      expect(() => Main.init(mocks.htmlHandler, null, mocks.config))
        .toThrow();
    });
    
    test('throws error when config is missing', () => {
      expect(() => Main.init(mocks.htmlHandler, mocks.relativeSizes, null))
        .toThrow();
    });
  });
  
  describe('Input value handling', () => {
    test('stores and retrieves input value correctly', () => {
      Main.setInputValue(42);
      expect(Main.getInputValue()).toBe(42);
    });
    
    test('triggers conversion when input value changes', () => {
      Main.setInputValue(50);
      
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        50,
        "second",
        expect.objectContaining({
          name: "time",
          defaultUnit: "second",
          units: expect.any(Array)
        })
      );
    });
    
    test('updates UI with conversion result when input changes', () => {
      Main.setInputValue(50);
      
      expect(mocks.htmlHandler.updateOutput).toHaveBeenCalledWith(
        "Mock conversion result"
      );
    });
  });
  
  describe('Unit handling', () => {
    test('stores and retrieves current unit correctly', () => {
      Main.setCurrentUnit("minute");
      expect(Main.getCurrentUnit()).toBe("minute");
    });
    
    xtest('triggers conversion with correct parameters when unit changes', () => {
      Main.setInputValue(60); // Set initial value
      mocks.relativeSizes.convert.mockClear(); // Clear previous calls
      
      Main.setCurrentUnit("minute");
      
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        60,
        "minute",
        expect.objectContaining({
          name: "time",
          defaultUnit: "second"
        })
      );
    });
    
    test('updates UI with conversion result when unit changes', () => {
      Main.setCurrentUnit("minute");
      
      expect(mocks.htmlHandler.updateOutput).toHaveBeenCalledWith(
        "Mock conversion result"
      );
    });
  });
  
  describe('Scale handling', () => {
    test('stores and retrieves current scale correctly', () => {
      Main.setCurrentScale("distance");
      expect(Main.getCurrentScale()).toBe("distance");
    });
    
    test('updates unit dropdown when scale changes', () => {
      Main.setCurrentScale("distance");
      
      expect(mocks.htmlHandler.updateUnitDropdown).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "distance",
          units: expect.any(Array)
        })
      );
    });
    
    test('resets to default unit of new scale when scale changes', () => {
      Main.setCurrentScale("distance");
      
      expect(Main.getCurrentUnit()).toBe("meter");
    });
    
    xtest('triggers conversion with new scale when scale changes', () => {
      Main.setInputValue(100); // Set initial value
      mocks.relativeSizes.convert.mockClear(); // Clear previous calls
      
      Main.setCurrentScale("distance");
      
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        100,
        "meter",
        expect.objectContaining({
          name: "distance",
          defaultUnit: "meter"
        })
      );
    });
  });
  
  describe('Conversion process', () => {    
    test('preserves complete conversion flow across multiple changes', () => {
      // Set initial state
      Main.setInputValue(100);
      mocks.relativeSizes.convert.mockClear();
      mocks.htmlHandler.updateOutput.mockClear();
      mocks.htmlHandler.updateUnitDropdown.mockClear();
      
      // Change scale
      Main.setCurrentScale("distance");
      expect(mocks.relativeSizes.convert).toHaveBeenCalledTimes(1);
      expect(mocks.htmlHandler.updateOutput).toHaveBeenCalledTimes(1);
      expect(mocks.htmlHandler.updateUnitDropdown).toHaveBeenCalledTimes(1);
      
      mocks.relativeSizes.convert.mockClear();
      mocks.htmlHandler.updateOutput.mockClear();
      mocks.htmlHandler.updateUnitDropdown.mockClear();
      
      // Change unit
      Main.setCurrentUnit("kilometer");
      expect(mocks.relativeSizes.convert).toHaveBeenCalledTimes(1);
      expect(mocks.htmlHandler.updateOutput).toHaveBeenCalledTimes(1);
      
      mocks.relativeSizes.convert.mockClear();
      mocks.htmlHandler.updateOutput.mockClear();
      
      // Change value
      Main.setInputValue(50);
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        50,
        "kilometer",
        expect.objectContaining({ name: "distance" })
      );
      expect(mocks.htmlHandler.updateOutput).toHaveBeenCalledTimes(1);
    });
  });
});