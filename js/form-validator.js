// Form Validator Module
const FormValidator = {
  validateCurrentStep() {
    const currentStepEl = document.querySelector('.form-step.active');
    if (!currentStepEl) return true;

    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous error states
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      }
    });

    if (!isValid) {
      this.showErrorMessage(currentStepEl, 'Please fill in all required fields.');
    }

    return isValid;
  },

  showErrorMessage(container, message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    const cardBody = container.querySelector('.card__body');
    const formActions = container.querySelector('.form-actions');
    if (cardBody && formActions) {
      cardBody.insertBefore(errorEl, formActions);
    }
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
} else {
  window.FormValidator = FormValidator;
}
