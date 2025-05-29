/**
 * Tests for integrator.js using ESM-compatible mocking
 * @jest-environment jsdom
 */

import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Create mock functions
const mockMainInit = jest.fn().mockReturnValue(true);

// Setup mocks using unstable_mockModule for ESM compatibility
await jest.unstable_mockModule('../../src/js/main.js', () => ({
    Main: {
        init: mockMainInit
    }
}));

await jest.unstable_mockModule('../../src/js/htmlhandler.js', () => ({
    HTMLHandler: 'mocked-html-handler'
}));

await jest.unstable_mockModule('../../src/js/relativeSizes.js', () => ({
    relativeSizes: 'mocked-relative-sizes'
}));

await jest.unstable_mockModule('../../src/config/config.js', () => ({
    config: 'mocked-config'
}));

// Dynamically import the mocked dependencies AFTER setting up mocks
const { Main } = await import('../../src/js/main.js');
const { HTMLHandler } = await import('../../src/js/htmlhandler.js');
const { relativeSizes } = await import('../../src/js/relativeSizes.js');
const { config } = await import('../../src/config/config.js');

describe('Integrator Module', () => {
    let consoleErrorSpy;
    let outputInfoElement;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup DOM elements
        document.body.innerHTML = '';
        outputInfoElement = document.createElement('div');
        outputInfoElement.id = 'output_info';
        document.body.appendChild(outputInfoElement);

        // Spy on console.error - use global.console to avoid ESLint errors
        // eslint-disable-next-line no-undef
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore console.error
        consoleErrorSpy.mockRestore();

        // Reset modules
        jest.resetModules();
    });

    test('should initialize Main with correct dependencies when DOM is loaded', async () => {
        // Dynamically import the module under test AFTER setting up mocks
        const integratorModule = await import('../../src/js/integrator.js');

        // Trigger the DOMContentLoaded event
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Verify Main.init was called with correct dependencies
        expect(mockMainInit).toHaveBeenCalledTimes(1);
        expect(mockMainInit).toHaveBeenCalledWith(
            'mocked-html-handler',
            'mocked-relative-sizes',
            'mocked-config'
        );
    });

    test('should handle initialization errors gracefully', async () => {
        // Setup Main.init to throw an error
        mockMainInit.mockImplementationOnce(() => {
            throw new Error('Test initialization error');
        });

        // Dynamically import the module under test
        const integratorModule = await import('../../src/js/integrator.js');

        // Trigger the DOMContentLoaded event
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Verify error handling
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to initialize application:',
            expect.any(Error)
        );
        expect(outputInfoElement.textContent).toBe(
            'Error loading application. Please try again later.'
        );
    });

    test('should only initialize once even if DOMContentLoaded fires multiple times', async () => {
        // Dynamically import the module under test
        const integratorModule = await import('../../src/js/integrator.js');

        // Trigger the DOMContentLoaded event multiple times
        document.dispatchEvent(new Event('DOMContentLoaded'));
        document.dispatchEvent(new Event('DOMContentLoaded'));
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Verify Main.init was only called once
        expect(mockMainInit).toHaveBeenCalledTimes(1);
    });
});