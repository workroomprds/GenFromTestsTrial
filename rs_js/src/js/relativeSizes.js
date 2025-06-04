/* relativeSizes.js - A module for handling relative size conversions */

export const relativeSizes = {
  init() {
    // Initialize module if needed
  },

  convert(value, unit, scale) {
    // Input validation
    if (!this.isValidNumber(value)) {
      return "Please provide a valid number";
    }
    if (!this.isValidUnit(unit)) {
      return "Please provide a valid unit";
    }
    if (!this.isValidScale(scale)) {
      return "Please provide a valid scale";
    }

    // Find the unit in the scale
    const inputUnit = scale.units.find(u => u.name === unit);
    if (!inputUnit) {
      return `Unknown unit: ${unit}`;
    }

    // Convert input value to base value
    const baseValue = value * inputUnit.conversionFactor;

    // Find appropriate output unit
    let outputUnit = this.findOutputUnit(baseValue, scale.units);
    if (!outputUnit) {
      outputUnit = inputUnit;
    }

    // Calculate output value
    const outputValue = baseValue / outputUnit.conversionFactor;

    // Format the output string
    return this.formatOutput(value, outputValue, inputUnit, outputUnit);
  },

  isValidNumber(value) {
    return value !== null && !isNaN(value) && value !== "";
  },

  isValidUnit(unit) {
    return unit !== null && unit !== "";
  },

  isValidScale(scale) {
    return scale &&
           typeof scale === 'object' &&
           Array.isArray(scale.units) &&
           scale.units.length > 0 &&
           scale.defaultUnit &&
           scale.units.every(unit => 
             typeof unit === 'object' &&
             'name' in unit &&
             'plural' in unit &&
             'conversionFactor' in unit
           );
  },

  findOutputUnit(baseValue, units) {
    const absValue = Math.abs(baseValue);
    const sortedUnits = [...units].sort((a, b) => b.conversionFactor - a.conversionFactor);
    
    // Use the largest unit where the result would be >= 0.95
    const outputUnit = sortedUnits.find(unit => absValue / unit.conversionFactor >= 0.95);
    return outputUnit || units[0];
  },

  formatOutput(inputValue, outputValue, inputUnit, outputUnit) {
    const inputPlural = Math.abs(inputValue) === 1 ? inputUnit.name : inputUnit.plural;
    
    // Round the output value using half-up rounding
    const decimalPlaces = outputUnit.decimalPlaces !== undefined ? outputUnit.decimalPlaces : 1;
    const factor = Math.pow(10, decimalPlaces);
    const roundedOutput = Math.round(outputValue * factor) / factor;
    
    // Determine plural form after rounding
    const outputPlural = Math.abs(roundedOutput) === 1 ? outputUnit.name : outputUnit.plural;
    
    // Format input value to preserve original precision
    const formattedInput = typeof inputValue === 'number' ? inputValue : Number(inputValue);
    
    // Always show decimal places according to unit specification
    const formattedOutput = roundedOutput.toFixed(decimalPlaces);
    
    return `${formattedInput} ${inputPlural} is ${formattedOutput} ${outputPlural}`;
  }
};

// Make the module available in browser environment
if (typeof window !== 'undefined') {
  window.thing = relativeSizes;
}
