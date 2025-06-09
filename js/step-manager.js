// Step Manager Module
const StepManager = {
  currentStep: 1,
  totalSteps: 5,
  stepStartTime: null,
  stepInteractions: {},

  stepComponents: {
    1: 'components/step1-basic-info.html',
    2: 'components/step2-newsletter-platform.html',
    3: 'components/step3-social-team.html',
    4: 'components/step4-revenue-monetization.html',
    5: 'components/step5-tools-upload.html',
  },

  async loadStep(stepNumber) {
    const componentPath = this.stepComponents[stepNumber];
    if (componentPath) {
      await ComponentLoader.loadComponent(componentPath, 'formContainer');
      this.showStep(stepNumber);
    }
  },

  showStep(step) {
    // Update current step
    this.currentStep = step;

    // Reset timing and interactions for new step
    this.stepStartTime = Date.now();
    this.stepInteractions = {
      field_focuses: 0,
      field_changes: 0,
      validation_errors: 0,
      button_clicks: 0,
    };

    // Remove active class from all steps and add to current step
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(stepEl => stepEl.classList.remove('active'));

    const currentStepEl = document.getElementById(`step${step}`);
    if (currentStepEl) {
      currentStepEl.classList.add('active');
    }

    // Update step counter if element exists
    const stepCounter = document.getElementById('currentStep');
    if (stepCounter) {
      stepCounter.textContent = step;
    }

    // Update progress
    ProgressManager.updateProgress(step, this.totalSteps);

    // Set up field interaction tracking for this step
    this.setupFieldTracking();
  },

  async nextStep() {
    this.stepInteractions.button_clicks++;

    if (FormValidator.validateCurrentStep()) {
      const stepData = DataCollector.collectStepData(this.currentStep);
      const now = new Date();
      const timestamp = Math.floor(now.getTime() / 1000);

      // Identify user to Customer.io on the first step
      if (this.currentStep === 1 && stepData.email) {
        cioanalytics.identify(stepData.email, {
          firstName: stepData.firstName,
          lastName: stepData.lastName,
          created_at: timestamp,
        });
      }

      cioanalytics.track(`Audit Step ${this.currentStep} Completed`, stepData, { timestamp: now });
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        await this.loadStep(this.currentStep);
      }
    } else {
      this.stepInteractions.validation_errors++;
    }
  },

  async prevStep() {
    this.stepInteractions.button_clicks++;

    if (this.currentStep > 1) {
      this.currentStep--;
      await this.loadStep(this.currentStep);
    }
  },

  setupFieldTracking() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const formContainer = document.getElementById('formContainer');
      if (!formContainer) return;

      // Track all input, select, and textarea interactions
      const fields = formContainer.querySelectorAll('input, select, textarea');

      fields.forEach(field => {
        // Remove existing listeners to avoid duplicates
        field.removeEventListener('focus', this.handleFieldFocus);
        field.removeEventListener('blur', this.handleFieldBlur);
        field.removeEventListener('change', this.handleFieldChange);
        field.removeEventListener('input', this.handleFieldInput);

        // Add new listeners
        field.addEventListener('focus', this.handleFieldFocus.bind(this));
        field.addEventListener('blur', this.handleFieldBlur.bind(this));
        field.addEventListener('change', this.handleFieldChange.bind(this));
        field.addEventListener('input', this.handleFieldInput.bind(this));
      });
    }, 100);
  },

  handleFieldFocus() {
    this.stepInteractions.field_focuses++;
  },

  handleFieldBlur() {
    // Can add logic for when a field loses focus
  },

  handleFieldChange() {
    this.stepInteractions.field_changes++;
  },

  handleFieldInput() {
    // Can add logic for real-time input handling
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StepManager;
} else {
  window.StepManager = StepManager;
}
