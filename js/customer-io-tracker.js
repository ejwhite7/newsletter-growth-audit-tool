// Customer.io Tracking Module - Modular Entry Point
/* eslint-disable no-console */

// Import all modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = require('./customer-io/index.js');
} else {
  // Browser environment - load modules in order

  // Load dependencies in the correct order
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Load all modules sequentially
  Promise.resolve()
    .then(() => loadScript('js/customer-io/core.js'))
    .then(() => loadScript('js/customer-io/utils.js'))
    .then(() => loadScript('js/customer-io/step-tracker.js'))
    .then(() => loadScript('js/customer-io/audit-tracker.js'))
    .then(() => loadScript('js/customer-io/business-tracker.js'))
    .then(() => loadScript('js/customer-io/chilipiper-tracker.js'))
    .then(() => loadScript('js/customer-io/index.js'))
    .catch(error => {
      console.error('Failed to load Customer.io tracking modules:', error);
    });
} 