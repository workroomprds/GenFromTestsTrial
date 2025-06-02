// Import dependencies as modules
import { Main } from './main.js';
import { HTMLHandler } from './htmlhandler.js';
import { relativeSizes } from './relativeSizes.js';
import { config } from '../config/config.js';

let isInitialized = false;
let initializeListener = null;

function handleInitError(error) {
    console.error('Failed to initialize application:', error);
    const outputElement = document.getElementById('output_info');
    if (outputElement) {
        outputElement.textContent = 'Error loading application. Please try again later.';
    }
}

async function initialize() {
    if (isInitialized) {
        return;
    }

    try {
        await Main.init(HTMLHandler, relativeSizes, config);
        isInitialized = true;
        if (initializeListener) {
            document.removeEventListener('DOMContentLoaded', initializeListener);
            initializeListener = null;
        }
    } catch (error) {
        handleInitError(error);
        throw error;
    }
}

// Create a one-time initialization function
const initOnce = () => {
    if (!isInitialized) {
        initialize().catch(() => {});
    }
};

// Store the listener reference
initializeListener = initOnce;

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeListener, { once: true });
} else {
    initOnce();
}

// Export for testing
export { initialize, handleInitError };
