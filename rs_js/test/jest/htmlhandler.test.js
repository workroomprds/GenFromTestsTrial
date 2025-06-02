/**
 * @jest-environment jsdom
 */

// Import Jest functions for ESM
import { jest, expect, describe, beforeEach, test } from '@jest/globals';

// Import the module to test
import { HTMLHandler } from '../../src/js/htmlhandler.js';

describe('HTML Handler', () => {
  // Setup function to create DOM elements
  function setupTestDOM() {
    // Create container for test elements
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Create required HTML elements
    const elements = {
      inputValue: document.createElement('input'),
      inputSlider: document.createElement('input'),
      scaleChoice: document.createElement('select'),
      unitChoice: document.createElement('select'),
      outputInfo: document.createElement('div')
    };

    elements.inputValue.id = 'input_value';
    elements.inputValue.type = 'text';

    elements.inputSlider.id = 'input_slider';
    elements.inputSlider.type = 'range';
    elements.inputSlider.min = '0';
    elements.inputSlider.max = '100';

    elements.scaleChoice.id = 'scale_choice';
    elements.unitChoice.id = 'unit_choice';
    elements.outputInfo.id = 'output_info';

    // Append all elements to the container
    Object.values(elements).forEach(el => container.appendChild(el));

    return elements;
  }

  // Create factory function for mocks
  function createMocks() {
    return {
      relativeSizes: {
        convert: jest.fn((value, unit, scale) => 
          `Converted ${value} ${unit} in ${scale.name} scale`)
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
  }

  let elements;
  let mocks;

  beforeEach(() => {
    document.body.innerHTML = '';
    elements = setupTestDOM();
    mocks = createMocks();
    
    // By default, initialize the handler
    HTMLHandler.init(mocks.relativeSizes, mocks.config);
  });

  describe('Module API', () => {
    test('exports expected public methods', () => {
      expect(HTMLHandler).toEqual(expect.objectContaining({
        init: expect.any(Function),
        updateOutput: expect.any(Function),
        updateInputValue: expect.any(Function),
        updateUnitDropdown: expect.any(Function)
      }));
    });
  });

  describe('Initialization', () => {
    // Reset before each test in this block to avoid auto-init
    beforeEach(() => {
      document.body.innerHTML = '';
      elements = setupTestDOM();
      mocks = createMocks();
      // Don't auto-initialize
    });
    
    test('populates scale dropdown with correct options', () => {
      HTMLHandler.init(mocks.relativeSizes, mocks.config);
      
      const scaleSelect = document.getElementById('scale_choice');
      expect(scaleSelect.options.length).toBe(2);
      
      // Check both value and text
      expect(scaleSelect.options[0].value).toBe('time');
      expect(scaleSelect.options[0].textContent).toBe('time');
      
      expect(scaleSelect.options[1].value).toBe('distance');
      expect(scaleSelect.options[1].textContent).toBe('distance');
    });
    
    test('populates unit dropdown with units from default scale', () => {
      HTMLHandler.init(mocks.relativeSizes, mocks.config);
      
      const unitSelect = document.getElementById('unit_choice');
      expect(unitSelect.options.length).toBe(2);
      
      // Check both value and text
      expect(unitSelect.options[0].value).toBe('second');
      expect(unitSelect.options[0].textContent).toBe('seconds');
      
      expect(unitSelect.options[1].value).toBe('minute');
      expect(unitSelect.options[1].textContent).toBe('minutes');
    });
    
    test('throws specific error when DOM elements are missing', () => {
      elements.inputValue.remove();
      
      expect(() => {
        HTMLHandler.init(mocks.relativeSizes, mocks.config);
      }).toThrow(/input_value/i); // Should mention the missing element
    });
    
    test('performs initial conversion with default values', () => {
      HTMLHandler.init(mocks.relativeSizes, mocks.config);
      
      expect(mocks.relativeSizes.convert).toHaveBeenCalledTimes(1);
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        1, // Default value
        "second", // Default unit
        mocks.config.scales[0] // Time scale
      );
      
      // Verify output is displayed
      expect(elements.outputInfo.textContent).toBe(
        "Converted 1 second in time scale"
      );
    });
  });

  describe('UI Element Updates', () => {
    test('updateOutput sets the text content of the output element', () => {
      const testMessage = "Test output message";
      HTMLHandler.updateOutput(testMessage);
      
      expect(elements.outputInfo.textContent).toBe(testMessage);
    });
    
    test('updateInputValue updates both input field and slider with string value', () => {
      HTMLHandler.updateInputValue(42);
      
      expect(elements.inputValue.value).toBe('42');
      expect(elements.inputSlider.value).toBe('42');
    });
    
    test('updateInputValue respects slider min/max constraints', () => {
      // Test value below min
      HTMLHandler.updateInputValue(-10);
      expect(elements.inputSlider.value).toBe('0'); // Constrained to min
      
      // Test value above max
      HTMLHandler.updateInputValue(150);
      expect(elements.inputSlider.value).toBe('100'); // Constrained to max
      
      // Input field should show actual value, not constrained
      expect(elements.inputValue.value).toBe('150');
    });
    
    test('updateUnitDropdown populates dropdown with unit names and plural forms', () => {
      const testScale = {
        name: "test-scale",
        units: [
          { name: "test-unit-1", plural: "test-units-1" },
          { name: "test-unit-2", plural: "test-units-2" }
        ]
      };
      
      HTMLHandler.updateUnitDropdown(testScale);
      
      expect(elements.unitChoice.options.length).toBe(2);
      
      // Check values and text content
      expect(elements.unitChoice.options[0].value).toBe('test-unit-1');
      expect(elements.unitChoice.options[0].textContent).toBe('test-units-1');
      
      expect(elements.unitChoice.options[1].value).toBe('test-unit-2');
      expect(elements.unitChoice.options[1].textContent).toBe('test-units-2');
    });
  });

  describe('Event Handling', () => {
    test('input field change triggers conversion and updates output', () => {
      elements.inputValue.value = '50';
      elements.inputValue.dispatchEvent(new Event('change'));
      
      // Check conversion was called correctly
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        50, 
        "second", 
        mocks.config.scales[0]
      );
      
      // Check output was updated
      expect(elements.outputInfo.textContent).toBe(
        "Converted 50 second in time scale"
      );
    });
    
    test('slider input updates text field and triggers conversion', () => {
      elements.inputSlider.value = '75';
      elements.inputSlider.dispatchEvent(new Event('input'));
      
      // Text field should be updated
      expect(elements.inputValue.value).toBe('75');
      
      // Conversion should be triggered
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        75, 
        "second", 
        mocks.config.scales[0]
      );
      
      // Output should be updated
      expect(elements.outputInfo.textContent).toBe(
        "Converted 75 second in time scale"
      );
    });
    
    test('changing unit resets input to 1 and triggers conversion', () => {
      // Set initial value and clear mock
      elements.inputValue.value = '50';
      mocks.relativeSizes.convert.mockClear();
      
      // Change unit
      elements.unitChoice.value = 'minute';
      elements.unitChoice.dispatchEvent(new Event('change'));
      
      // Input should be reset to 1
      expect(elements.inputValue.value).toBe('1');
      expect(elements.inputSlider.value).toBe('1');
      
      // Conversion should use new unit
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        1, 
        "minute", 
        mocks.config.scales[0]
      );
      
      // Output should be updated
      expect(elements.outputInfo.textContent).toBe(
        "Converted 1 minute in time scale"
      );
    });
    
    test('changing scale updates units, resets value, and triggers conversion', () => {
      // Set initial value and clear mock
      elements.inputValue.value = '50';
      mocks.relativeSizes.convert.mockClear();
      
      // Change scale
      elements.scaleChoice.value = 'distance';
      elements.scaleChoice.dispatchEvent(new Event('change'));
      
      // Input fields should be reset
      expect(elements.inputValue.value).toBe('1');
      expect(elements.inputSlider.value).toBe('1');
      
      // Units dropdown should be updated
      expect(elements.unitChoice.options.length).toBe(2);
      expect(elements.unitChoice.options[0].value).toBe('meter');
      expect(elements.unitChoice.options[0].textContent).toBe('meters');
      expect(elements.unitChoice.options[1].value).toBe('kilometer');
      expect(elements.unitChoice.options[1].textContent).toBe('kilometers');
      
      // Default unit should be selected
      expect(elements.unitChoice.value).toBe('meter');
      
      // Conversion should use new scale and default unit
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        1, 
        "meter", 
        mocks.config.scales[1]
      );
      
      // Output should be updated
      expect(elements.outputInfo.textContent).toBe(
        "Converted 1 meter in distance scale"
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles negative values correctly', () => {
      elements.inputValue.value = '-10';
      elements.inputValue.dispatchEvent(new Event('change'));
      
      expect(mocks.relativeSizes.convert).toHaveBeenCalledWith(
        -10, 
        "second", 
        mocks.config.scales[0]
      );
      
      // Slider should be constrained to min
      expect(elements.inputSlider.value).toBe('0');
      
      // But input field should show actual value
      expect(elements.inputValue.value).toBe('-10');
    });
    
    test('handles empty input by using default value', () => {
      elements.inputValue.value = '';
      elements.inputValue.dispatchEvent(new Event('change'));
      
      // Should use a default value, probably 0 or 1
      const callArgs = mocks.relativeSizes.convert.mock.calls[0];
      expect(typeof callArgs[0]).toBe('number');
      
      // Input fields should be updated with the default
      expect(elements.inputValue.value).not.toBe('');
    });
  });

  describe('Integration Behavior', () => {
    test('end-to-end conversion flow from input to output', () => {
      // Start with fresh instance
      mocks.relativeSizes.convert.mockClear();
      
      // 1. Change scale
      elements.scaleChoice.value = 'distance';
      elements.scaleChoice.dispatchEvent(new Event('change'));
      
      // 2. Change unit
      elements.unitChoice.value = 'kilometer';
      elements.unitChoice.dispatchEvent(new Event('change'));
      
      // 3. Input value
      elements.inputValue.value = '5.5';
      elements.inputValue.dispatchEvent(new Event('change'));
      
      // Verify the final conversion call
      expect(mocks.relativeSizes.convert).toHaveBeenLastCalledWith(
        5.5, 
        'kilometer', 
        mocks.config.scales[1]
      );
      
      // Verify output displays conversion result
      expect(elements.outputInfo.textContent).toBe(
        "Converted 5.5 kilometer in distance scale"
      );
    });
    
    test('maintains correct state through multiple operations', () => {
      // Simulate a sequence of operations
      
      // 1. Initial state - time/second
      expect(elements.scaleChoice.value).toBe('time');
      expect(elements.unitChoice.value).toBe('second');
      
      // 2. Change unit to minute
      elements.unitChoice.value = 'minute';
      elements.unitChoice.dispatchEvent(new Event('change'));
      
      // 3. Set a value
      elements.inputValue.value = '2';
      elements.inputValue.dispatchEvent(new Event('change'));
      
      // 4. Change scale to distance
      elements.scaleChoice.value = 'distance';
      elements.scaleChoice.dispatchEvent(new Event('change'));
      
      // State should now be: distance/meter/1
      expect(elements.scaleChoice.value).toBe('distance');
      expect(elements.unitChoice.value).toBe('meter');
      expect(elements.inputValue.value).toBe('1');
      
      // 5. Change back to time
      elements.scaleChoice.value = 'time';
      elements.scaleChoice.dispatchEvent(new Event('change'));
      
      // State should now be: time/second/1
      expect(elements.scaleChoice.value).toBe('time');
      expect(elements.unitChoice.value).toBe('second');
      expect(elements.inputValue.value).toBe('1');
      
      // Final conversion call should match state
      expect(mocks.relativeSizes.convert).toHaveBeenLastCalledWith(
        1, 
        'second', 
        mocks.config.scales[0]
      );
    });
  });
});