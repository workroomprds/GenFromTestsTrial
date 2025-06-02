import inspect
import pytest
from src.python.relative_sizes import RelativeSizes

@pytest.fixture
def rs():
    """Create a fresh RelativeSizes instance for each test"""
    return RelativeSizes()

@pytest.fixture
def simple_scale():
    """Simple scale configuration for testing convert method"""
    return {
        "units": [
            {"name": "thousandth", "plural": "thousandths", "conversionFactor": 0.001, "decimalPlaces": 0},
            {"name": "one", "plural": "ones", "conversionFactor": 1, "decimalPlaces": 1},
            {"name": "hundred", "plural": "hundreds", "conversionFactor": 100, "decimalPlaces": 2}
        ],
        "defaultUnit": "one"
    }

class TestConvertBasic:
    @pytest.mark.parametrize("value, unit, expected", [
        # No conversion
        (1, "one", "1 one is 1.0 one"),
        
        # Basic conversions
        (1000, "thousandth", "1000 thousandths is 1.0 one"),
        
        # Plural handling
        (2000, "thousandth", "2000 thousandths is 2.0 ones"),
        
        # Skip unit (going from thousandth directly to hundred)
        (212000, "thousandth", "212000 thousandths is 2.12 hundreds"),
                
        # pass through input to output
        (3.001, "one", "3.001 ones is 3.0 ones"),

        # Scientific notation
        (1e3, "thousandth", "1000 thousandths is 1.0 one"),
        
        # Threshold behavior
        (949, "thousandth", "949 thousandths is 949 thousandths"),
        (950, "thousandth", "950 thousandths is 1.0 one"),
    ])
    def test_convert_success_cases(self, rs, simple_scale, value, unit, expected):
        result = rs.convert(value, unit, simple_scale)
        assert result == expected, f"Failed with {value} {unit}"

    @pytest.mark.parametrize("value, unit, expected_output", [
        # Rounding behavior test cases
        (9.84, "one", "9.8 ones"),  # Round down
        (9.85, "one", "9.9 ones"),  # Round up at midpoint. Do not use Pythonn default rounding
        (9.86, "one", "9.9 ones"),  # Round up
    ])
    def test_rounding_behavior(self, rs, simple_scale, value, unit, expected_output):
        result = rs.convert(value, unit, simple_scale)
        assert expected_output in result, f"Failed to find '{expected_output}' in '{result}'"

    @pytest.mark.parametrize("value, unit, expected", [
        # Negative values
        (-1000, "thousandth", "-1000 thousandths is -1.0 one"),
        (-2000, "thousandth", "-2000 thousandths is -2.0 ones"),
        (-100, "one", "-100 ones is -1.00 hundred"),
    ])
    def test_convert_negative_values(self, rs, simple_scale, value, unit, expected):
        result = rs.convert(value, unit, simple_scale)
        assert result == expected, f"Failed with negative value {value} {unit}"

class TestConvertFailures:
    @pytest.mark.parametrize("value, unit, scale, expected_error", [
        # Invalid value
        ("not_a_number", "one", {"units": [], "defaultUnit": "one"}, "Please provide a valid number"),
        (None, "one", {"units": [], "defaultUnit": "one"}, "Please provide a valid number"),
        
        # Invalid unit
        (10, "", {"units": [], "defaultUnit": "one"}, "Please provide a valid unit"),
        (10, None, {"units": [], "defaultUnit": "one"}, "Please provide a valid unit"),
        
        # Unknown unit
        (10, "unknown", {"units": [{"name": "one", "plural": "ones", "conversionFactor": 1}], "defaultUnit": "one"}, 
         "Unknown unit: unknown"),
        
        # Invalid scale
        (10, "one", {}, "Invalid scale configuration"),
        (10, "one", {"units": []}, "Invalid scale configuration"),
        (10, "one", {"units": [], "missing": "one"}, "Invalid scale configuration"),
        (10, "one", None, "Invalid scale configuration"),
        (10, "one", "not_a_dict", "Invalid scale configuration"),
        (10, "one", {"units": "not_a_list", "defaultUnit": "one"}, "Invalid scale configuration"),
        (10, "one", {"units": ["not_a_dict"], "defaultUnit": "one"}, "Invalid scale configuration"),
    ])
    def test_convert_error_cases(self, rs, value, unit, scale, expected_error):
        result = rs.convert(value, unit, scale)
        assert result == expected_error, f"Expected error message '{expected_error}' but got '{result}'"

class TestRelativeSizesSignature:
    def test_class_exists(self):
        """Verify that the RelativeSizes class exists."""
        assert inspect.isclass(RelativeSizes)
    
    def test_method_signatures(self):
        """Verify method signatures of RelativeSizes class."""
        # Define expected signatures
        expected_signatures = {
            'convert': ['self', 'value', 'unit', 'scale']
        }
        
        # Check each method
        for method_name, expected_params in expected_signatures.items():
            assert hasattr(RelativeSizes, method_name)
            method = getattr(RelativeSizes, method_name)
            sig = inspect.signature(method)
            params = list(sig.parameters.keys())
            assert params == expected_params, f"Method {method_name} has incorrect parameters"
    
    def test_import_relative_sizes(self): # the rest of the system expects a module-level singleton pattern providing a convenience API to allow users to directly import and use a pre-configured instance without initialization boilerplate.
        """Test that relative_sizes can be imported."""
        try: 
            from src.python.relative_sizes import relative_sizes
            # If import succeeds, check that it's the right type
            from src.python.relative_sizes import RelativeSizes
            assert isinstance(relative_sizes, RelativeSizes)
            print("\nSuccessfully imported relative_sizes and confirmed it's an instance of RelativeSizes")
        except ImportError as e:
            pytest.fail(f"Failed to import relative_sizes: {e}")
        except Exception as e:
            pytest.fail(f"Unexpected error during import: {e}")