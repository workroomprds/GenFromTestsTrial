#!/usr/bin/env python3

class RelativeSizes:
    def is_valid_number(self, value):
        """Check if a value can be converted to a valid number."""
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False

    def is_valid_scale(self, scale):
        """Validate the scale configuration."""
        if not isinstance(scale, dict):
            return False
        if 'units' not in scale or 'defaultUnit' not in scale:
            return False
        if not isinstance(scale['units'], list) or not scale['units']:
            return False
        for unit in scale['units']:
            if not isinstance(unit, dict):
                return False
        return True

    def find_best_unit(self, value, units):
        """Find the most appropriate unit for the given value."""
        abs_value = abs(float(value))
        if abs_value == 0:
            return min(units, key=lambda x: x['conversionFactor'])

        sorted_units = sorted(units, key=lambda x: x['conversionFactor'], reverse=True)
        
        for unit in sorted_units:
            converted = abs_value / unit['conversionFactor']
            if converted >= 0.95:
                return unit
        
        return min(units, key=lambda x: x['conversionFactor'])

    def format_number(self, value, decimal_places):
        """Format a number with specified decimal places using round-half-up."""
        if decimal_places == 0:
            if value >= 0:
                return str(int(value + 0.5))
            return str(int(value - 0.5))
        
        multiplier = 10 ** decimal_places
        if value >= 0:
            rounded = int(value * multiplier + 0.5) / multiplier
        else:
            rounded = int(value * multiplier - 0.5) / multiplier
        
        return f"{rounded:.{decimal_places}f}"

    def convert(self, value, unit, scale):
        """Convert a value from one unit to the most appropriate unit."""
        if not self.is_valid_number(value):
            return "Please provide a valid number"
        if not isinstance(unit, str) or not unit:
            return "Please provide a valid unit"
        if not self.is_valid_scale(scale):
            return "Invalid scale configuration"

        source_unit = None
        for u in scale['units']:
            if unit.rstrip('s') == u['name']:
                source_unit = u
                break

        if not source_unit:
            return f"Unknown unit: {unit}"

        base_value = float(value) * source_unit['conversionFactor']
        
        # For the same unit case
        if abs(base_value) < source_unit['conversionFactor'] * 0.95:
            target_unit = source_unit
        else:
            # Find best larger unit first
            sorted_units = sorted(scale['units'], key=lambda x: x['conversionFactor'], reverse=True)
            target_unit = None
            for u in sorted_units:
                if base_value / u['conversionFactor'] >= 0.95:
                    target_unit = u
                    break
            
            # If no larger unit found and source is not smallest, convert to next smaller unit
            if not target_unit and source_unit['conversionFactor'] > min(u['conversionFactor'] for u in scale['units']):
                smaller_units = [u for u in scale['units'] if u['conversionFactor'] < source_unit['conversionFactor']]
                if smaller_units:
                    target_unit = max(smaller_units, key=lambda x: x['conversionFactor'])
            
            # Default to source unit if no better unit found
            if not target_unit:
                target_unit = source_unit

        target_value = base_value / target_unit['conversionFactor']

        source_str = self.format_number(float(value), source_unit.get('decimalPlaces', 0))
        source_name = source_unit['plural'] if abs(float(value)) != 1 else source_unit['name']
        
        target_str = self.format_number(target_value, target_unit.get('decimalPlaces', 0))
        target_name = target_unit['plural'] if abs(target_value) != 1 else target_unit['name']

        return f"{source_str} {source_name} is {target_str} {target_name}"

relative_sizes = RelativeSizes()
