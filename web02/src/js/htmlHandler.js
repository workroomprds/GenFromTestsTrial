// HTMLHandler.js - Handles HTML interactions and updates
export const HTMLHandler = {
  relativeSizes: null,
  config: null,
  elements: {},

  init(relativeSizes, config) {
    this.relativeSizes = relativeSizes;
    this.config = config;

    // Get and validate all required DOM elements
    const requiredElements = [
      'input_value',
      'input_slider',
      'scale_choice',
      'unit_choice',
      'output_info'
    ];

    requiredElements.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Required element ${id} not found`);
      }
      this.elements[id] = element;
    });

    // Setup event listeners
    this.elements.input_value.addEventListener('change', this.handleInputChange.bind(this));
    this.elements.input_slider.addEventListener('input', this.handleSliderInput.bind(this));
    this.elements.scale_choice.addEventListener('change', this.handleScaleChange.bind(this));
    this.elements.unit_choice.addEventListener('change', this.handleUnitChange.bind(this));

    // Populate scale dropdown
    this.config.scales.forEach(scale => {
      const option = document.createElement('option');
      option.value = scale.name;
      option.textContent = scale.name;
      this.elements.scale_choice.appendChild(option);
    });

    // Set initial scale and units
    const initialScale = this.config.scales[0];
    this.updateUnitDropdown(initialScale);
    
    // Set initial values and perform conversion
    this.updateInputValue(1);
    this.performConversion();
  },

  updateOutput(message) {
    this.elements.output_info.textContent = message;
  },

  updateInputValue(value) {
    const stringValue = String(value);
    this.elements.input_value.value = stringValue;
    
    // Constrain slider value to min/max range
    const numValue = Number(value);
    const constrainedValue = Math.max(
      Number(this.elements.input_slider.min),
      Math.min(Number(this.elements.input_slider.max), numValue)
    );
    this.elements.input_slider.value = String(constrainedValue);
  },

  updateUnitDropdown(scale) {
    this.elements.unit_choice.innerHTML = '';
    scale.units.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit.name;
      option.textContent = unit.plural;
      this.elements.unit_choice.appendChild(option);
    });
    
    // Set to default unit if available
    if (scale.defaultUnit) {
      this.elements.unit_choice.value = scale.defaultUnit;
    }
  },

  getCurrentScale() {
    const scaleName = this.elements.scale_choice.value;
    return this.config.scales.find(scale => scale.name === scaleName);
  },

  performConversion() {
    const value = Number(this.elements.input_value.value) || 1;
    const unit = this.elements.unit_choice.value;
    const scale = this.getCurrentScale();
    
    const result = this.relativeSizes.convert(value, unit, scale);
    this.updateOutput(result);
  },

  handleInputChange(event) {
    const value = event.target.value || '1';
    this.updateInputValue(value);
    this.performConversion();
  },

  handleSliderInput(event) {
    this.updateInputValue(event.target.value);
    this.performConversion();
  },

  handleScaleChange() {
    const newScale = this.getCurrentScale();
    this.updateUnitDropdown(newScale);
    this.updateInputValue(1);
    this.performConversion();
  },

  handleUnitChange() {
    this.updateInputValue(1);
    this.performConversion();
  }
};
