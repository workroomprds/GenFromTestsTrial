# src/python/html_handler.py
from flask import render_template, jsonify, request

class HTMLHandler:
    def __init__(self, relative_sizes, config):
        self.relative_sizes = relative_sizes
        self.config = config
        
    def render_index(self):
        """Render the main index page"""
        return render_template('index.html')
    
    def get_all_scales(self):
        """Return all available scales"""
        return jsonify(self.config["scales"])
    
    def get_units_for_scale(self, scale_name):
        """Get units for a specific scale"""
        scale = next((s for s in self.config["scales"] if s["name"] == scale_name), None)
        if not scale:
            return jsonify({"error": "Scale not found"}), 404
        return jsonify(scale["units"])
    
    def get_default_unit(self, scale_name):
        """Get default unit for a scale"""
        scale = next((s for s in self.config["scales"] if s["name"] == scale_name), None)
        if not scale:
            return jsonify({"error": "Scale not found"}), 404
        return jsonify({"defaultUnit": scale["defaultUnit"]})

    def perform_conversion(self):
        """Handle conversion request"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
                
            input_value = data.get("inputValue")
            unit = data.get("currentUnit")
            scale_name = data.get("currentScale")
            
            if not scale_name:
                return jsonify({"error": "Scale not provided"}), 400
                
            scale = next((s for s in self.config["scales"] if s["name"] == scale_name), None)
            if not scale:
                return jsonify({"error": f"Unknown scale: {scale_name}"}), 400
                
            result = self.relative_sizes.convert(input_value, unit, scale)
            return jsonify({"result": result})
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# Note: We don't create an instance here because it needs config and relative_sizes
