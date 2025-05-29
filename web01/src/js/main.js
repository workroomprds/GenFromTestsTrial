/**
 * Main module for relative size converter application
 */
export const Main = {
  htmlHandler: null,
  relativeSizes: null,
  config: null,
  state: {
    inputValue: 1,
    currentUnit: '',
    currentScale: ''
  },

  init(htmlHandler, relativeSizes, config) {
    if (!htmlHandler) throw new Error('HTMLHandler is required');
    if (!relativeSizes) throw new Error('RelativeSizes is required'); 
    if (!config) throw new Error('Config is required');

    this.htmlHandler = htmlHandler;
    this.relativeSizes = relativeSizes;
    this.config = config;

    // Initialize with first scale and its default unit
    this.state.currentScale = this.config.scales[0].name;
    this.state.currentUnit = this.config.scales[0].defaultUnit;

    this.htmlHandler.init(relativeSizes, config);
    this.updateConversion();

    return true;
  },

  getInputValue() {
    return this.state.inputValue;
  },

  getCurrentUnit() {
    return this.state.currentUnit;
  },

  getCurrentScale() {
    return this.state.currentScale;
  },

  setInputValue(value) {
    this.state.inputValue = value;
    this.updateConversion();
  },

  setCurrentUnit(unit) {
    this.state.currentUnit = unit;
    this.updateConversion();
  },

  setCurrentScale(scale) {
    this.state.currentScale = scale;

    // Find the scale configuration
    const scaleConfig = this.config.scales.find(s => s.name === scale);
    
    // Reset to default unit for new scale
    this.state.currentUnit = scaleConfig.defaultUnit;

    // Update UI for new scale
    this.htmlHandler.updateUnitDropdown(scaleConfig);
    
    this.updateConversion();
  },

  updateConversion() {
    const currentScaleConfig = this.config.scales.find(
      s => s.name === this.state.currentScale
    );

    const result = this.relativeSizes.convert(
      this.state.inputValue,
      this.state.currentUnit,
      currentScaleConfig
    );

    this.htmlHandler.updateOutput(result);
  }
};
