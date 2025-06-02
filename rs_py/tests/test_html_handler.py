# test_html_handler.py
import pytest
import os
from unittest.mock import MagicMock, patch
from bs4 import BeautifulSoup
from flask import Flask
from src.python.html_handler import HTMLHandler

@pytest.fixture
def app():
    """Create a Flask test app with proper template directory"""
    # Get the project root directory (assuming tests are in webpy01/tests/)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_dir = os.path.join(project_root, 'templates')
    
    app = Flask(__name__, template_folder=template_dir)
    app.config['TESTING'] = True
    return app

@pytest.fixture
def test_client(app):
    """Create a test client"""
    return app.test_client()

@pytest.fixture
def soup():
    """Create a BeautifulSoup instance with test DOM elements"""
    html = """
    <div id="test-container">
        <input id="input_value" type="text" />
        <input id="input_slider" type="range" min="0" max="100" />
        <select id="scale_choice"></select>
        <select id="unit_choice"></select>
        <div id="output_info"></div>
    </div>
    """
    return BeautifulSoup(html, 'html.parser')

@pytest.fixture
def mock_dom_elements(monkeypatch):
    """Mock document.getElementById to return elements"""
    elements = {
        'input_value': MagicMock(value="1"),
        'input_slider': MagicMock(value="1", min="0", max="100"),
        'scale_choice': MagicMock(options=[]),
        'unit_choice': MagicMock(options=[]),
        'output_info': MagicMock(textContent="")
    }
    
    # Add common methods to all elements
    for element in elements.values():
        element.addEventListener = MagicMock()
        if hasattr(element, 'appendChild'):
            continue
        element.appendChild = MagicMock()
    
    # Mock document.getElementById
    def mock_get_element_by_id(element_id):
        return elements.get(element_id)
    
    document_mock = MagicMock()
    document_mock.getElementById = mock_get_element_by_id
    monkeypatch.setattr("src.python.html_handler.document", document_mock, raising=False)
    
    return elements

@pytest.fixture
def mock_config():
    """Create mock config object with test data"""
    return {
        "scales": [
            {
                "name": "time",
                "defaultUnit": "second",
                "units": [
                    {"name": "second", "plural": "seconds", "conversionFactor": 1,"decimalPlaces": 0},
                    {"name": "minute", "plural": "minutes", "conversionFactor": 60,"decimalPlaces": 1}
                ]
            },
            {
                "name": "distance",
                "defaultUnit": "meter",
                "units": [
                    {"name": "meter", "plural": "meters", "conversionFactor": 1,"decimalPlaces": 0},
                    {"name": "kilometer", "plural": "kilometers", "conversionFactor": 1000,"decimalPlaces": 0}
                ]
            }
        ]
    }

@pytest.fixture
def mock_relative_sizes():
    """Create mock relativeSizes object"""
    mock = MagicMock()
    mock.convert.return_value = "Converted 1 second in time scale"
    return mock

@pytest.fixture
def handler(mock_relative_sizes, mock_config):
    """Create and initialize the HTMLHandler"""
    return HTMLHandler(mock_relative_sizes, mock_config)

@pytest.fixture
def registered_app(app, handler):
    """Create app with all routes registered for testing"""
    @app.route('/')
    def index():
        return handler.render_index()
    
    @app.route('/api/scales')
    def get_scales():
        return handler.get_all_scales()
    
    @app.route('/api/units/<scale>')
    def get_units(scale):
        return handler.get_units_for_scale(scale)
    
    @app.route('/api/convert', methods=['POST'])
    def convert():
        return handler.perform_conversion()
    
    return app

class TestHTMLHandlerAPI:
    """Test the basic API structure of HTMLHandler"""
    
    def test_exports_expected_methods(self, handler):
        """Test that HTMLHandler has the expected public methods"""
        expected_methods = ['render_index', 'get_all_scales', 'get_units_for_scale', 'perform_conversion']
        
        for method_name in expected_methods:
            assert hasattr(handler, method_name), f"Missing method: {method_name}"
            assert callable(getattr(handler, method_name)), f"Method not callable: {method_name}"

class TestScalesAPI:
    """Test scale-related API endpoints"""
    
    def test_get_all_scales(self, registered_app, mock_config):
        """Test the API endpoint for retrieving all scales"""
        with registered_app.test_client() as client:
            response = client.get('/api/scales')
            
            assert response.status_code == 200
            data = response.get_json()
            assert len(data) == 2
            assert data[0]['name'] == 'time'
            assert data[1]['name'] == 'distance'
    
    def test_get_units_for_valid_scale(self, registered_app):
        """Test the API endpoint for retrieving units for a valid scale"""
        with registered_app.test_client() as client:
            response = client.get('/api/units/time')
            
            assert response.status_code == 200
            data = response.get_json()
            assert len(data) == 2
            assert data[0]['name'] == 'second'
            assert data[0]['plural'] == 'seconds'
            assert data[1]['name'] == 'minute'
            assert data[1]['plural'] == 'minutes'
    
    def test_get_units_for_nonexistent_scale(self, registered_app):
        """Test handling of non-existent scales"""
        with registered_app.test_client() as client:
            response = client.get('/api/units/nonexistent')
            
            assert response.status_code == 404
            data = response.get_json()
            assert 'error' in data

class TestConversionAPI:
    """Test conversion-related API endpoints"""
    
    def test_valid_conversion(self, registered_app, mock_relative_sizes, mock_config):
        """Test successful conversion"""
        with registered_app.test_client() as client:
            response = client.post('/api/convert', json={
                "inputValue": 1, 
                "currentUnit": "second", 
                "currentScale": "time"
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'result' in data
            
            # Verify the mock was called correctly
            mock_relative_sizes.convert.assert_called_with(
                1, 'second', mock_config["scales"][0])
    
    def test_conversion_with_missing_data(self, registered_app):
        """Test handling of invalid conversion data"""
        with registered_app.test_client() as client:
            # Test with missing data
            response = client.post('/api/convert', json={})
            assert response.status_code == 400
    
    def test_conversion_with_invalid_scale(self, registered_app):
        """Test conversion with invalid scale"""
        with registered_app.test_client() as client:
            response = client.post('/api/convert', json={
                "inputValue": 1,
                "currentUnit": "second",
                "currentScale": "nonexistent"
            })
            assert response.status_code == 400
    
    def test_conversion_with_different_units(self, registered_app, mock_relative_sizes):
        """Test conversion with different units and scales"""
        # Setup mock to return different results based on input
        mock_relative_sizes.convert.side_effect = lambda value, unit, scale: \
            f"Converted {value} {unit} in {scale['name']} scale"
        
        test_cases = [
            {
                "input": {"inputValue": 60, "currentUnit": "second", "currentScale": "time"},
                "expected": "Converted 60 second in time scale"
            },
            {
                "input": {"inputValue": 1000, "currentUnit": "meter", "currentScale": "distance"},
                "expected": "Converted 1000 meter in distance scale"
            }
        ]
        
        with registered_app.test_client() as client:
            for case in test_cases:
                response = client.post('/api/convert', json=case["input"])
                assert response.status_code == 200
                assert response.get_json()['result'] == case["expected"]
    
    def test_error_handling_during_conversion(self, registered_app, mock_relative_sizes):
        """Test error handling when conversion fails"""
        # Setup mock to raise an exception
        mock_relative_sizes.convert.side_effect = ValueError("Test error")
        
        with registered_app.test_client() as client:
            response = client.post('/api/convert', json={
                "inputValue": 1,
                "currentUnit": "second",
                "currentScale": "time"
            })
            assert response.status_code == 500
            assert 'error' in response.get_json()

class TestTemplateRendering:
    """Test template rendering functionality"""
    
    def test_render_index_with_mock(self, app, handler):
        """Test that render_index calls the correct template"""
        with app.test_request_context():
            with app.app_context():
                with patch('src.python.html_handler.render_template') as mock_render:
                    mock_render.return_value = '<html>Test</html>'
                    
                    result = handler.render_index()
                    
                    mock_render.assert_called_once_with('index.html')
                    assert result == '<html>Test</html>'
    
    def test_render_index_integration(self, registered_app):
        """Test render_index with actual template file"""
        with registered_app.test_client() as client:
            response = client.get('/')
            
            assert response.status_code == 200
            content = response.get_data(as_text=True)
            assert 'Relative Sizes Converter' in content
            assert 'input_value' in content

class TestEndToEndFlow:
    """Test complete application flow"""
    
    def test_complete_user_workflow(self, registered_app):
        """Test the complete flow from loading page to performing conversion"""
        with registered_app.test_client() as client:
            # 1. Load the main page
            response = client.get('/')
            assert response.status_code == 200
            
            # 2. Get available scales
            response = client.get('/api/scales')
            assert response.status_code == 200
            scales = response.get_json()
            assert len(scales) > 0
            
            # 3. Get units for the first scale
            first_scale = scales[0]["name"]
            response = client.get(f'/api/units/{first_scale}')
            assert response.status_code == 200
            units = response.get_json()
            assert len(units) > 0
            
            # 4. Perform a conversion
            response = client.post('/api/convert', json={
                "inputValue": 60,
                "currentUnit": units[0]["name"],
                "currentScale": first_scale
            })
            assert response.status_code == 200
            result = response.get_json()
            assert 'result' in result