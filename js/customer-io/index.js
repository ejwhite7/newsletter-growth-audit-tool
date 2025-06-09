// Main Customer.io Tracker - Combines all functionality
/* eslint-disable no-console */

/**
 * Main Customer.io Tracker - Combines all functionality
 */
class CustomerIOTracker {
  constructor() {
    // In browser environment, classes are loaded via script tags
    // No need for require() - they're available on window object

    // Initialize core and utils
    this.core = new window.CustomerIOCore();
    this.utils = window.CustomerIOUtils;

    // Initialize all trackers with dependencies
    this.stepTracker = new window.StepTracker(this.core, this.utils);
    this.auditTracker = new window.AuditTracker(this.core, this.utils);
    this.businessTracker = new window.BusinessTracker(this.core, this.utils);
    this.chiliPiperTracker = new window.ChiliPiperTracker(this.core, this.utils);
  }

  /**
   * Get userId from core
   */
  get userId() {
    return this.core.userId;
  }

  /**
   * Set userId and sync across all trackers
   */
  set userId(value) {
    this.core.userId = value;
  }

  /**
   * Get auditId from core
   */
  get auditId() {
    return this.core.auditId;
  }

  /**
   * Set auditId and sync across all trackers
   */
  set auditId(value) {
    this.core.auditId = value;
  }

  /**
   * Initialize user identification
   */
  identifyUser(userData) {
    return this.core.identifyUser(userData);
  }

  /**
   * Track step completion
   */
  trackStepCompletion(stepNumber, stepData) {
    return this.stepTracker.trackStepCompletion(stepNumber, stepData);
  }

  /**
   * Track step timing
   */
  trackStepTiming(stepNumber, timeSpent, interactions = {}) {
    return this.stepTracker.trackStepTiming(stepNumber, timeSpent, interactions);
  }

  /**
   * Track field interactions
   */
  trackFieldInteraction(fieldName, action, value = null, stepNumber = null) {
    return this.stepTracker.trackFieldInteraction(fieldName, action, value, stepNumber);
  }

  /**
   * Track audit generation start
   */
  trackAuditGenerationStart(formData) {
    return this.auditTracker.trackAuditGenerationStart(formData);
  }

  /**
   * Track audit completion
   */
  trackAuditCompletion(formData, auditContent) {
    return this.auditTracker.trackAuditCompletion(formData, auditContent);
  }

  /**
   * Track audit download
   */
  trackAuditDownload() {
    return this.auditTracker.trackAuditDownload();
  }

  /**
   * Track enterprise user
   */
  trackEnterpriseUser(formData) {
    return this.businessTracker.trackEnterpriseUser(formData);
  }

  /**
   * Track social media analysis
   */
  trackSocialMediaAnalysis(formData) {
    return this.businessTracker.trackSocialMediaAnalysis(formData);
  }

  /**
   * Track engagement patterns
   */
  trackEngagementPattern(formData) {
    return this.businessTracker.trackEngagementPattern(formData);
  }

  /**
   * Track platform migration potential
   */
  trackPlatformMigrationPotential(formData) {
    return this.businessTracker.trackPlatformMigrationPotential(formData);
  }

  /**
   * Track ChiliPiper widget load
   */
  trackChilipiperWidgetLoad(formData) {
    return this.chiliPiperTracker.trackChilipiperWidgetLoad(formData);
  }

  /**
   * Track ChiliPiper scheduling attempt
   */
  trackChilipiperSchedulingAttempt(formData, method = 'widget') {
    return this.chiliPiperTracker.trackChilipiperSchedulingAttempt(formData, method);
  }

  /**
   * Track ChiliPiper fallback
   */
  trackChilipiperFallback(formData, reason = 'widget_failed') {
    return this.chiliPiperTracker.trackChilipiperFallback(formData, reason);
  }

  /**
   * Track form abandonment
   */
  trackFormAbandonment(currentStep, formData) {
    return this.stepTracker.trackFormAbandonment(currentStep, formData);
  }

  /**
   * Initialize abandonment tracking
   */
  initializeAbandonmentTracking() {
    let isFormStarted = false;

    // Track when user starts the form
    document.addEventListener('DOMContentLoaded', () => {
      isFormStarted = true;
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isFormStarted && this.userId) {
        const currentStep = window.StepManager?.currentStep || 1;
        const formData = window.DataCollector?.getFormData() || {};

        // Only track abandonment if they haven't completed the audit
        if (currentStep < 5 && !document.getElementById('auditContent')?.innerHTML) {
          this.trackFormAbandonment(currentStep, formData);
        }
      }
    });

    // Track beforeunload for abandonment
    window.addEventListener('beforeunload', () => {
      if (isFormStarted && this.userId) {
        const currentStep = window.StepManager?.currentStep || 1;
        const formData = window.DataCollector?.getFormData() || {};

        if (currentStep < 5 && !document.getElementById('auditContent')?.innerHTML) {
          this.trackFormAbandonment(currentStep, formData);
        }
      }
    });

    // Check periodically if Customer.io has loaded and process queue
    const checkCustomerIO = setInterval(() => {
      if (this.core.isAvailable()) {
        this.core.processTrackingQueue();
        clearInterval(checkCustomerIO);
      }
    }, 1000);

    // Clear interval after 30 seconds to avoid infinite checking
    setTimeout(() => clearInterval(checkCustomerIO), 30000);
  }
}

// Create and export a single instance for browser use
// Add error handling for initialization
try {
  const customerIOTracker = new CustomerIOTracker();
  window.CustomerIOTracker = customerIOTracker;
} catch (error) {
  console.error('Failed to initialize CustomerIOTracker:', error);
  // Create a minimal fallback object to prevent errors
  window.CustomerIOTracker = {
    initializeAbandonmentTracking: () => {},
    identifyUser: () => {},
    trackStepCompletion: () => {},
    trackStepTiming: () => {},
    trackFieldInteraction: () => {},
    trackAuditGenerationStart: () => {},
    trackAuditCompletion: () => {},
    trackAuditDownload: () => {},
    trackEnterpriseUser: () => {},
    trackSocialMediaAnalysis: () => {},
    trackEngagementPattern: () => {},
    trackPlatformMigrationPotential: () => {},
    trackChilipiperWidgetLoad: () => {},
    trackChilipiperSchedulingAttempt: () => {},
    trackChilipiperFallback: () => {},
    trackFormAbandonment: () => {}
  };
}
