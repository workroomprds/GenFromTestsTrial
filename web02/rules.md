## About the code
The system is to be written to be testable.
The system is to be written in plain modern javascript / HTML / CSS with no dependencies on external libraries.
Code should be written to pass tests / checks / examples in a general way. If code is needed to pass a specific test, and only for that test, then it is likely that the deeper design or implementation needs to change.

## about JavaScript modules
* Modules should be self-contained and independent, each responsible for a specific aspect of the system
* Export modules for use in other modules, and in the browser
* Keep configuration and magic numbers out of the code
* UI updates are driven by events
* Validate inputs before processing
* Validate UI elements before using them
* Use ES6 or newer syntax for modules
* Modules in ESM format rather than CommonJS format
