// main.js - Module for handling unit conversions and user interactions
export const Main = {
  htmlHandler: null,
  relativeSizes: null,
  config: null,
  currentInputValue: 0,
  currentUnit: '',
  currentScale: '',

  init(htmlHandler, relativeSizes, config) {
    if (!htmlHandler || !relativeSizes || !config) {
      throw new Error('Missing required dependencies');
    }

    this.htmlHandler = htmlHandler;
    this.relativeSizes = relativeSizes;
    this.config = config;

    this.htmlHandler.init(relativeSizes, config);
    
    // Set initial scale and unit
    this.currentScale = this.config.scales[0].name;
    this.currentUnit = this.config.scales[0].defaultUnit;
  },

  getInputValue() {
    return this.currentInputValue;
  },

  getCurrentUnit() {
    return this.currentUnit;
  },

  getCurrentScale() {
    return this.currentScale;
  },

  setInputValue(value) {
    this.currentInputValue = value;
    this.performConversion();
  },

  setCurrentUnit(unit) {
    this.currentUnit = unit;
    this.performConversion();
  },

  setCurrentScale(scale) {
    this.currentScale = scale;
    
    // Find the scale configuration
    const scaleConfig = this.config.scales.find(s => s.name === scale);
    
    // Reset to default unit for new scale
    this.currentUnit = scaleConfig.defaultUnit;
    
    // Update UI unit dropdown
    this.htmlHandler.updateUnitDropdown(scaleConfig);
    
    this.performConversion();
  },

  performConversion() {
    const scaleConfig = this.config.scales.find(s => s.name === this.currentScale);
    const result = this.relativeSizes.convert(
      this.currentInputValue,
      this.currentUnit,
      scaleConfig
    );
    this.htmlHandler.updateOutput(result);
  }
};
