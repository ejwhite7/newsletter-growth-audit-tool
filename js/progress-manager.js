// Progress Manager Module
const ProgressManager = {
  updateProgress(currentStep, totalSteps) {
    this.updateProgressBar(currentStep, totalSteps);
    this.updateProgressSteps(currentStep);
  },

  updateProgressBar(currentStep, totalSteps) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      const percentage = (currentStep / totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  },

  updateProgressSteps(currentStep) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');

      if (stepNumber === currentStep) {
        step.classList.add('active');
      } else if (stepNumber < currentStep) {
        step.classList.add('completed');
      }
    });
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressManager;
} else {
  window.ProgressManager = ProgressManager;
}
