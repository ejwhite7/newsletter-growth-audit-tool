// Step Manager Module
const StepManager = {
    currentStep: 1,
    totalSteps: 5,
    
    stepComponents: {
        1: 'components/step1-basic-info.html',
        2: 'components/step2-newsletter-platform.html',
        3: 'components/step3-social-team.html',
        4: 'components/step4-revenue-monetization.html',
        5: 'components/step5-tools-upload.html'
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
    },

    async nextStep() {
        if (FormValidator.validateCurrentStep()) {
            DataCollector.collectStepData(this.currentStep);
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                await this.loadStep(this.currentStep);
            }
        }
    },

    async prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            await this.loadStep(this.currentStep);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StepManager;
} else {
    window.StepManager = StepManager;
} 