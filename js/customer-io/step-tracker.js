// Step and form tracking functionality
/**
 * Step and form tracking functionality
 */
class StepTracker {
  constructor(core, utils) {
    this.core = core;
    this.utils = utils;
    this.stepNames = {
      1: 'basic_info',
      2: 'newsletter_platform',
      3: 'social_team',
      4: 'revenue_monetization',
      5: 'tools_upload',
    };
  }

  /**
   * Track step completion
   */
  trackStepCompletion(stepNumber, stepData) {
    const eventName = `audit_step_${stepNumber}_completed`;
    const trackData = {
      stepNumber,
      stepName: this.stepNames[stepNumber],
      completedAt: new Date().toISOString(),
      ...stepData,
    };

    return this.core.track(eventName, trackData);
  }

  /**
   * Track step timing and interactions
   */
  trackStepTiming(stepNumber, timeSpent, interactions = {}) {
    const trackData = {
      step_number: stepNumber,
      time_spent_seconds: timeSpent,
      time_spent_category: this.utils.categorizeTimeSpent(timeSpent),
      ...interactions,
    };

    return this.core.track('step_timing_analysis', trackData);
  }

  /**
   * Track field interactions
   */
  trackFieldInteraction(fieldName, action, value = null, stepNumber = null) {
    const trackData = {
      field_name: fieldName,
      action,
      step_number: stepNumber,
      timestamp: new Date().toISOString(),
    };

    if (value !== null && value !== undefined) {
      trackData.field_value = String(value).substring(0, 100); // Limit length
    }

    return this.core.track('field_interaction', trackData);
  }

  /**
   * Track form abandonment
   */
  trackFormAbandonment(currentStep, formData) {
    const trackData = {
      abandonedAt: new Date().toISOString(),
      currentStep,
      totalSteps: 5,
      completionPercentage: (currentStep / 5) * 100,
      partialData: this.utils.sanitizeFormData(formData),
    };

    return this.core.track('audit_form_abandoned', trackData);
  }
}

// Export for browser use
window.StepTracker = StepTracker;
