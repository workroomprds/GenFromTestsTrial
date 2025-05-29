# src/python/main.py
class Main:
    def __init__(self):
        self.html_handler = None
        self.relative_sizes = None
        self.config = None
        self.state = {
            "inputValue": 1,
            "currentUnit": "",
            "currentScale": ""
        }

    def init(self, html_handler, relative_sizes, config):
        if not html_handler:
            raise ValueError("HTMLHandler is required")
        if not relative_sizes:
            raise ValueError("RelativeSizes is required")
        if not config:
            raise ValueError("Config is required")

        self.html_handler = html_handler
        self.relative_sizes = relative_sizes
        self.config = config

        # Initialize with first scale and its default unit
        self.state["currentScale"] = self.config["scales"][0]["name"]
        self.state["currentUnit"] = self.config["scales"][0]["defaultUnit"]

        return True
    
    def get_input_value(self):
        return self.state["inputValue"]
    
    def get_current_unit(self):
        return self.state["currentUnit"]
    
    def get_current_scale(self):
        return self.state["currentScale"]
    
    def set_input_value(self, value):
        self.state["inputValue"] = value
        return self.update_conversion()
    
    def set_current_unit(self, unit):
        self.state["currentUnit"] = unit
        return self.update_conversion()
    
    def set_current_scale(self, scale):
        self.state["currentScale"] = scale
        
        # Find the scale configuration
        scale_config = next((s for s in self.config["scales"] if s["name"] == scale), None)
        
        # Reset to default unit for new scale
        self.state["currentUnit"] = scale_config["defaultUnit"]
        
        return self.update_conversion()
    
    def update_conversion(self):
        current_scale_config = next(
            (s for s in self.config["scales"] if s["name"] == self.state["currentScale"]), 
            None
        )
        
        result = self.relative_sizes.convert(
            self.state["inputValue"],
            self.state["currentUnit"],
            current_scale_config
        )
        
        return result

# Main instance
main = Main()