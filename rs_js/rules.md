## about the system
The system takes input in the form of an _inputValue_ and a _unit_, and a _scale_ to contextualise the number and the unit, and converts that number to a _textOutput_ expressing that number as something else in the scale, typically of the right size to be comprehensible.
Typical scales are time and distance. The system can be configured with custom scales.
A user can interact with the system via a web page.

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



## file organisation
The system will be organised as a set of javascript files, with a test runner and a test runner page.
At the top level, there will be `index.html` and directories `src/js` (for javascript), `src/css` (for css), `src/config` for config and `test` for test javascript and html. 


## about test organization
* Jest is used to test individual components
* Each javascript file `name.js` will have a corresponding test file `name.test.js`.
* Test files should be self-contained and not depend on other test files



## About the UI
UI allows input via a text entry and a slider, updating the output when enter is pressed on the entry field, and when the slider is moved.
The slider and the entry field are linked, so that the slider updates the entry field and the entry field updates the slider.
The scale and the unit are each selected from a dropdown menu.
The scale defaults to the first scale in the list, and the unit defaults to the scale's default unit.
When the scale or the unit is changed, the _inputValue_ is updated to 1.
The web interface should be modern, clean, accessible and interactive. It should be work well on laptops, tablets and phones, responding to screen size, browser capabilities and differeing input methods.


## Examples
_inputValue_ is 60, _unit_ is seconds, _scale_ is time, _output_ is "60 seconds is 1 minute".
_inputValue_ is 3600, _unit_ is seconds, _scale_ is time, _output_ is "3600 seconds is 1 hour".
_inputValue_ is "1000", _unit_ is meters, _scale_ is distance, _output_ is "1000 meters is 1 kilometer".
