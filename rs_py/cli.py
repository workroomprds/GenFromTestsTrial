#!/usr/bin/env python3
# cli.py
import argparse
import json
import os
import sys
import cmd
from src.python.relative_sizes import relative_sizes

# Add color support if available
try:
    import colorama
    from colorama import Fore, Style
    colorama.init()
    USE_COLOR = True
except ImportError:
    USE_COLOR = False
    class DummyFore:
        def __getattr__(self, name):
            return ""
    class DummyStyle:
        def __getattr__(self, name):
            return ""
    Fore = DummyFore()
    Style = DummyStyle()

def load_config():
    """Load the configuration file"""
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                              'src', 'config', 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"{Fore.RED}Error: Config file not found at {config_path}{Style.RESET_ALL}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"{Fore.RED}Error: Config file contains invalid JSON{Style.RESET_ALL}")
        sys.exit(1)

def print_scales(config):
    """List all available scales"""
    print(f"{Fore.CYAN}Available scales:{Style.RESET_ALL}")
    for scale in config["scales"]:
        print(f"  {Fore.GREEN}{scale['name']}{Style.RESET_ALL}")

def print_units(config, scale_name):
    """List all units for a given scale"""
    scale = next((s for s in config["scales"] if s["name"] == scale_name), None)
    if not scale:
        print(f"{Fore.RED}Error: Scale '{scale_name}' not found{Style.RESET_ALL}")
        return False
    
    print(f"{Fore.CYAN}Units for scale '{scale_name}':{Style.RESET_ALL}")
    for unit in scale["units"]:
        print(f"  {Fore.GREEN}{unit['name']}{Style.RESET_ALL} ({unit['plural']})")
        print(f"    Conversion factor: {Fore.YELLOW}{unit['conversionFactor']}{Style.RESET_ALL}")
    return True

def perform_conversion(config, scale_name, input_value, unit):
    """Convert a value using the relative sizes module"""
    # Find the scale
    scale = next((s for s in config["scales"] if s["name"] == scale_name), None)
    if not scale:
        print(f"{Fore.RED}Error: Scale '{scale_name}' not found{Style.RESET_ALL}")
        return None
    
    # Perform conversion
    try:
        float_value = float(input_value)
    except ValueError:
        print(f"{Fore.RED}Error: '{input_value}' is not a valid number{Style.RESET_ALL}")
        return None
    
    result = relative_sizes.convert(float_value, unit, scale)
    print(f"{Fore.CYAN}{result}{Style.RESET_ALL}")
    return result

class RelativeSizesShell(cmd.Cmd):
    intro = f"{Fore.GREEN}Relative Sizes Converter Interactive Shell.{Style.RESET_ALL} Type help or ? to list commands.\n"
    prompt = f"{Fore.BLUE}converter> {Style.RESET_ALL}"
    
    def __init__(self):
        super().__init__()
        self.config = load_config()
    
    def do_scales(self, arg):
        """List all available scales"""
        print_scales(self.config)
    
    def do_units(self, arg):
        """List units for a scale: units SCALE_NAME"""
        if not arg:
            print(f"{Fore.RED}Error: Scale name is required{Style.RESET_ALL}")
            return
        print_units(self.config, arg)
    
    def do_convert(self, arg):
        """Convert a value: convert SCALE VALUE UNIT"""
        args = arg.split()
        if len(args) < 3:
            print(f"{Fore.RED}Error: Not enough arguments. Usage: convert SCALE VALUE UNIT{Style.RESET_ALL}")
            return
        
        scale, value, unit = args[0], args[1], args[2]
        perform_conversion(self.config, scale, value, unit)
    
    def do_exit(self, arg):
        """Exit the interactive shell"""
        print(f"{Fore.GREEN}Goodbye!{Style.RESET_ALL}")
        return True
    
    def do_quit(self, arg):
        """Exit the interactive shell"""
        return self.do_exit(arg)
    
    def do_EOF(self, arg):
        """Exit on Ctrl+D"""
        print()
        return self.do_exit(arg)
    
    def emptyline(self):
        """Do nothing on empty line"""
        pass

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Relative Sizes Converter CLI",
        epilog="Example: python cli.py convert time 60 seconds"
    )
    
    parser.add_argument('--interactive', '-i', action='store_true', 
                        help='Start interactive shell')
    
    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # 'scales' command for listing scales
    subparsers.add_parser('scales', help='List available scales')
    
    # 'units' command for listing units
    units_parser = subparsers.add_parser('units', help='List units for a scale')
    units_parser.add_argument('scale', help='Scale name')
    
    # 'convert' command for performing conversions
    convert_parser = subparsers.add_parser('convert', help='Convert a value')
    convert_parser.add_argument('scale', help='Scale name (time, distance, weight)')
    convert_parser.add_argument('value', help='Value to convert')
    convert_parser.add_argument('unit', help='Source unit name')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Interactive mode
    if args.interactive:
        RelativeSizesShell().cmdloop()
        return
    
    # Load configuration
    config = load_config()
    
    # Handle commands
    if args.command == 'scales':
        print_scales(config)
    elif args.command == 'units':
        print_units(config, args.scale)
    elif args.command == 'convert':
        perform_conversion(config, args.scale, args.value, args.unit)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()