// static/js/client.js
document.addEventListener('DOMContentLoaded', async function() {
    // Fetch configuration from backend
    const configResponse = await fetch('/api/config');
    const config = await configResponse.json();
    
    // Elements
    const elements = {
        input_value: document.getElementById('input_value'),
        input_slider: document.getElementById('input_slider'),
        scale_choice: document.getElementById('scale_choice'),
        unit_choice: document.getElementById('unit_choice'),
        output_info: document.getElementById('output_info')
    };
    
    // Application state
    let state = {
        inputValue: 1,
        currentUnit: '',
        currentScale: ''
    };
    
    // Populate scale dropdown
    config.scales.forEach(scale => {
        const option = document.createElement('option');
        option.value = scale.name;
        option.textContent = scale.name;
        elements.scale_choice.appendChild(option);
    });
    
    // Set initial scale and units
    const initialScale = config.scales[0];
    state.currentScale = initialScale.name;
    updateUnitDropdown(initialScale);
    state.currentUnit = initialScale.defaultUnit;
    
    // Set initial values
    elements.input_value.value = "1";
    elements.input_slider.value = "1";
    
    // Perform initial conversion
    await performConversion();
    
    // Event listeners
    elements.input_value.addEventListener('change', handleInputChange);
    elements.input_slider.addEventListener('input', handleSliderInput);
    elements.scale_choice.addEventListener('change', handleScaleChange);
    elements.unit_choice.addEventListener('change', handleUnitChange);
    
    function updateUnitDropdown(scale) {
        elements.unit_choice.innerHTML = '';
        scale.units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.name;
            option.textContent = unit.plural;
            elements.unit_choice.appendChild(option);
        });
        
        if (scale.defaultUnit) {
            elements.unit_choice.value = scale.defaultUnit;
            state.currentUnit = scale.defaultUnit;
        }
    }
    
    function getCurrentScale() {
        const scaleName = elements.scale_choice.value;
        return config.scales.find(scale => scale.name === scaleName);
    }
    
    async function performConversion() {
        const value = Number(elements.input_value.value) || 1;
        state.inputValue = value;
        
        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state),
            });
            
            const data = await response.json();
            if (data.result) {
                elements.output_info.textContent = data.result;
            } else if (data.error) {
                elements.output_info.textContent = data.error;
            }
        } catch (error) {
            elements.output_info.textContent = 'Error: ' + error.message;
        }
    }
    
    function handleInputChange(event) {
        const value = event.target.value || '1';
        elements.input_value.value = value;
        elements.input_slider.value = Math.min(Math.max(value, elements.input_slider.min), elements.input_slider.max);
        performConversion();
    }
    
    function handleSliderInput(event) {
        elements.input_value.value = event.target.value;
        performConversion();
    }
    
    async function handleScaleChange() {
        const newScale = getCurrentScale();
        state.currentScale = newScale.name;
        updateUnitDropdown(newScale);
        elements.input_value.value = "1";
        elements.input_slider.value = "1";
        state.inputValue = 1;
        await performConversion();
    }
    
    function handleUnitChange() {
        state.currentUnit = elements.unit_choice.value;
        performConversion();
    }
});