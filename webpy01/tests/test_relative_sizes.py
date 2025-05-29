# tests/test_relative_sizes.py

import pytest
import math
from src.python.relative_sizes import RelativeSizes

@pytest.fixture
def relative_sizes():
    """Create a fresh instance of RelativeSizes for each test"""
    return RelativeSizes()


@pytest.fixture
def test_scale():
    """Scale configuration for test purposes"""
    return {
        "name": "testscale",
        "defaultUnit": "ones",
        "units": [
            {
                "name": "one",
                "plural": "ones",
                "conversionFactor": 1,
                "max_use": 5,
                "decimalPlaces": 0
            },
            {
                "name": "hundredth",
                "plural": "hundredths",
                "conversionFactor": 0.01,
                "max_use": 300,
                "decimalPlaces": 2
            },
            {
                "name": "ten",
                "plural": "tens",
                "conversionFactor": 10,
                "decimalPlaces": 1
            }
        ]
    }

@pytest.fixture
def time_scale():
    """Sample time scale configuration"""
    return {
        "name": "time",
        "defaultUnit": "second",
        "units": [
            {
                "name": "second",
                "plural": "seconds",
                "conversionFactor": 1,
                "max_use": 1000,
                "decimalPlaces": 0
            },
            {
                "name": "minute",
                "plural": "minutes",
                "conversionFactor": 60,
                "max_use": 90,
                "decimalPlaces": 1
            },
            {
                "name": "hour",
                "plural": "hours",
                "conversionFactor": 3600,
                "decimalPlaces": 1
            }
        ]
    }

@pytest.fixture
def distance_scale():
    """Sample distance scale configuration"""
    return {
        "name": "distance",
        "defaultUnit": "meter",
        "units": [
            {
                "name": "millimeter",
                "plural": "millimeters",
                "conversionFactor": 0.001,
                "max_use":600,
                "decimalPlaces": 1
            },
            {
                "name": "centimeter",
                "plural": "centimeters",
                "conversionFactor": 0.01,
                "max_use": 500,
                "decimalPlaces": 1
            },
            {
                "name": "meter",
                "plural": "meters",
                "conversionFactor": 1,
                "max_use": 500,
                "decimalPlaces": 1
            },
            {
                "name": "kilometer",
                "plural": "kilometers",
                "conversionFactor": 1000,
                "decimalPlaces": 1
            }
        ]
    }

@pytest.fixture
def simple_units():
    """Simple units configuration for testing unit selection"""
    return [
        {"name": "small", "conversionFactor": 0.01},
        {"name": "medium", "conversionFactor": 1},
        {"name": "large", "conversionFactor": 100}
    ]



class TestRelativeSizesValidation:
    """Tests for validation methods in RelativeSizes"""
    
    @pytest.mark.parametrize("input_val,expected", [
        (0, True),
        (1, True),
        (-1, True),
        (1.5, True),
        ("10", True),
        ("-3.14", True),
    ])
    def test_is_valid_number_with_valid_numbers(self, relative_sizes, input_val, expected):
        """Test is_valid_number with various valid numbers"""
        assert relative_sizes.is_valid_number(input_val) is expected
    
    @pytest.mark.parametrize("input_val,expected", [
        (None, False),
        ("", False),
        ("abc", False),
        ("10a", False),
        ({}, False),
        ([], False),
    ])
    def test_is_valid_number_with_invalid_input(self, relative_sizes, input_val, expected):
        """Test is_valid_number with various invalid inputs"""
        assert relative_sizes.is_valid_number(input_val) is expected
    
    def test_is_valid_scale_with_valid_scale(self, relative_sizes, time_scale):
        """Test is_valid_scale with a valid scale configuration"""
        assert relative_sizes.is_valid_scale(time_scale) is True
    
    @pytest.mark.parametrize("input_val,expected", [
        (None, False),
        ({}, False),
        ([], False),
        ("scale", False),
        ({"units": []}, False),
        ({"units": [1, 2], "defaultUnit": "x"}, False),
        ({"units": "not a list", "defaultUnit": "x"}, False),
        ({"units": [], "defaultUnit": "x"}, False),
    ])
    def test_is_valid_scale_with_invalid_input(self, relative_sizes, input_val, expected):
        """Test is_valid_scale with various invalid inputs"""
        assert relative_sizes.is_valid_scale(input_val) is expected


class TestRelativeSizesUnitSelection:
    """Tests for unit selection functionality"""
    
    @pytest.mark.parametrize("target_value,expected_unit", [
        (0.05, "small"),  # For small value, should select small unit
        (5, "medium"),    # For medium value, should select medium unit
        (500, "large"),   # For large value, should select large unit
    ])
    def test_find_best_unit_selects_appropriate_unit(self, relative_sizes, simple_units, target_value, expected_unit):
        """Test that find_best_unit selects the most appropriate unit"""
        assert relative_sizes.find_best_unit(target_value, simple_units)["name"] == expected_unit
    
    @pytest.mark.parametrize("target_value,expected_unit", [
        (1, "small"),      # Exactly at boundary should pick the next down
        (0.95, "small"),   # close to but below boundary (0.95 * conversionFactor)
        (1.05, "medium"),   # close to but above boundary (1.05 * conversionFactor)
        (-5, "medium"),    # Negative values (should use absolute value)
        (0, "small"),      # Zero should use the smallest unit
    ])
    def test_find_best_unit_handles_edge_cases(self, relative_sizes, simple_units, target_value, expected_unit):
        """Test find_best_unit with edge cases"""
        assert relative_sizes.find_best_unit(target_value, simple_units)["name"] == expected_unit


class TestRelativeSizesFormatting:
    """Tests for number formatting functionality"""
    
    @pytest.mark.parametrize("input_val,decimal_places,expected", [
        (1, 0, "1"),
        (1.4, 0, "1"),
        (1.5, 0, "2"),  # Rounds up
        (-1.5, 0, "-2"),  # Rounds away from zero
    ])
    def test_format_number_with_zero_decimal_places(self, relative_sizes, input_val, decimal_places, expected):
        """Test format_number with zero decimal places"""
        assert relative_sizes.format_number(input_val, decimal_places) == expected
    
    @pytest.mark.parametrize("input_val,decimal_places,expected", [
        (1, 1, "1.0"),
        (1.23, 1, "1.2"),
        (1.25, 1, "1.3"),  # Rounds up
        (1.234, 2, "1.23"),
    ])
    def test_format_number_with_decimal_places(self, relative_sizes, input_val, decimal_places, expected):
        """Test format_number with various decimal places"""
        assert relative_sizes.format_number(input_val, decimal_places) == expected

    def test_convert_integer_shows_decimal_places_when_required_on_target(self, relative_sizes, test_scale):
        """Test that integers are formatted with decimal places when the target unit requires them"""
        # 110 ones should be shown as 11.0 tens
        result = relative_sizes.convert(110, "one", test_scale)
        assert result == "110 ones is 11.0 tens"

    def test_convert_integer_shows_decimal_places_when_required_on_source(self, relative_sizes, test_scale):
        """Test that integers are formatted with decimal places when the source unit requires them"""
        # 10001 hundredths should be shown as 10001.00 hundredths, and should convert to 10.0 tens
        result = relative_sizes.convert(10001, "hundredth", test_scale)
        assert result == "10001.00 hundredths is 10.0 tens"

    @pytest.mark.parametrize("input_val,decimal_places,expected", [
        (2.5, 0, "3"),    # Implementation should round-half-up - CONFLICTS with Python's round-half-to-even
        (1.45, 1, "1.5"), # Implementation should round-half-up - CONFLICTS with Python's round-half-to-even
    ])
    def test_format_number_rounding_conflicts(self, relative_sizes, input_val, decimal_places, expected):
        """Test that exposes rounding behavior conflicts"""
        assert relative_sizes.format_number(input_val, decimal_places) == expected
        
    @pytest.mark.parametrize("value,unit,expected_result", [
        # Source unit has 0 decimal places but we're testing fractional inputs
        (1.5, "one", "2 ones is 2 ones"),     # "2 ones" is to spec as ones is to 0dp.
    ])
    def test_decimal_places_formatting_conflicts(self, relative_sizes, test_scale, value, unit, expected_result):
        """Test that decimal places aren't included when precision is low"""
        result = relative_sizes.convert(value, unit, test_scale)
        assert result == expected_result



class TestRelativeSizesConversion:
    """Tests for the main conversion functionality"""
    
    @pytest.mark.parametrize("input_val,unit,expected_message", [
        ("abc", "second", "provide a valid number"),     # Invalid number
        (1, "", "provide a valid unit"),                 # Invalid unit (empty)
        (1, 123, "provide a valid unit"),                # Invalid unit (not a string)
    ])
    def test_convert_returns_error_for_invalid_input(self, relative_sizes, time_scale, input_val, unit, expected_message):
        """Test convert handles invalid inputs gracefully"""
        result = relative_sizes.convert(input_val, unit, time_scale)
        assert expected_message in result
    
    def test_convert_handles_unknown_unit(self, relative_sizes, time_scale):
        """Test convert handles unknown unit gracefully"""
        result = relative_sizes.convert(1, "unknown", time_scale)
        assert "Unknown unit: unknown" in result
    
    @pytest.mark.parametrize("value,unit,expected", [
        (60, "second", "60 seconds is 1.0 minute"),    
        (1, "minute", "1.0 minute is 60 seconds"),     
        (60, "minute", "60.0 minutes is 1.0 hour"),      
    ])
    def test_convert_simple_time_conversions(self, relative_sizes, time_scale, value, unit, expected):
        """Test basic time conversions"""
        result = relative_sizes.convert(value, unit, time_scale)
        assert result == expected
    
    @pytest.mark.parametrize("value,unit,expected", [
        (1000, "meter", "1000.0 meters is 1.0 kilometer"),      
        (1, "kilometer", "1.0 kilometer is 1000.0 meters"),     
        (100, "centimeter", "100.0 centimeters is 1.0 meter"),  
    ])
    def test_convert_simple_distance_conversions(self, relative_sizes, distance_scale, value, unit, expected):
        """Test basic distance conversions"""
        result = relative_sizes.convert(value, unit, distance_scale)
        assert result == expected
    
    @pytest.mark.parametrize("value,unit,expected", [
        (1, "second", "1 second is 1 second"),        # Singular to singular
        (1, "minute", "1.0 minute is 60 seconds"),      # Singular to plural
        (60, "second", "60 seconds is 1.0 minute"),     # Plural to singular
        (120, "second", "120 seconds is 2.0 minutes"),  # Plural to plural
        (0, "seconds", "0 seconds is 0 seconds"),     # Pluralise 0s
    ])
    def test_convert_handles_pluralization(self, relative_sizes, time_scale, value, unit, expected):
        """Test that convert correctly handles singular and plural forms"""
        result = relative_sizes.convert(value, unit, time_scale)
        assert result == expected
    
    @pytest.mark.parametrize("value,unit,expected", [
        (0.05, "one", "0 ones is 5.00 hundredths"),      # Test with hundredths (2 decimal places)
        (50, "one", "50 ones is 5.0 tens"),                 # Test with tens (1 decimal place)
        (0.0567, "one", "0 ones is 5.67 hundredths"),  # Test fractional conversion to hundredths
    ])
    def test_convert_handles_decimal_places(self, relative_sizes, test_scale, value, unit, expected):
        """Test that convert respects decimal places setting"""
        result = relative_sizes.convert(value, unit, test_scale)
        assert result == expected

class TestRelativeSizesEdgeCases:
    """Tests for edge cases and special scenarios"""
    
    def test_convert_with_very_small_values(self, relative_sizes, test_scale):
        """Test handling of very small values"""
        # Very small value should use the smallest unit (hundredth)
        result = relative_sizes.convert(0.0001, "one", test_scale)
        assert "hundredth" in result
    
    def test_convert_with_very_large_values(self, relative_sizes, test_scale):
        """Test handling of very large values"""
        # Very large value should use the largest unit (tens)
        result = relative_sizes.convert(5000, "one", test_scale)
        assert "tens" in result
    
    def test_convert_with_negative_values(self, relative_sizes, test_scale):
        """Test handling of negative values"""
        # Negative values should work the same way
        result = relative_sizes.convert(-10, "one", test_scale)
        assert "-10 ones" in result
    
    def test_convert_with_zero(self, relative_sizes, test_scale):
        """Test handling of zero values"""
        # Zero should be formatted correctly
        result = relative_sizes.convert(0, "one", test_scale)
        assert result == "0 ones is 0.00 hundredths"