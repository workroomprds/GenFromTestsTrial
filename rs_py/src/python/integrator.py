# src/python/integrator.py
from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
import sys

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.python.main import main
from src.python.html_handler import HTMLHandler
from src.python.relative_sizes import relative_sizes

# Create Flask app
app = Flask(__name__, 
            template_folder='../../templates',
            static_folder='../../static')

# Load configuration
config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'config.json')
with open(config_path, 'r') as f:
    config = json.load(f)

# Initialize components
html_handler = HTMLHandler(relative_sizes, config)
main.init(html_handler, relative_sizes, config)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.root_path, '../../src/css'), filename)

@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.get_json()
    
    # Update main state
    main.state["inputValue"] = data.get("inputValue", 1)
    main.state["currentUnit"] = data.get("currentUnit", main.state["currentUnit"])
    main.state["currentScale"] = data.get("currentScale", main.state["currentScale"])
    
    # Perform conversion
    result = main.update_conversion()
    
    return jsonify({"result": result})

@app.route('/api/config')
def get_config():
    return jsonify(config)

@app.route('/api/scales')
def get_scales():
    return jsonify({"scales": [s["name"] for s in config["scales"]]})

@app.route('/api/units/<scale>')
def get_units_for_scale(scale):
    scale_config = next((s for s in config["scales"] if s["name"] == scale), None)
    if not scale_config:
        return jsonify({"error": "Scale not found"}), 404
    
    return jsonify({
        "units": scale_config["units"],
        "defaultUnit": scale_config["defaultUnit"]
    })

def create_app():
    return app

# For direct running
if __name__ == "__main__":
    app.run(debug=True)