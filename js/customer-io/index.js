// Main Customer.io Tracker - Combines all functionality
/* eslint-disable no-console */

/**
 * Main Customer.io Tracker - Combines all functionality
 */
class CustomerIOTracker {
  constructor() {
    // In browser environment, classes are loaded via script tags
    // No need for require() - they're available on window object

    // Check if dependencies are available
    if (!window.CustomerIOCore) {
      throw new Error('CustomerIOCore not available');
    }
    if (!window.CustomerIOUtils) {
      throw new Error('CustomerIOUtils not available');
    }
    if (!window.StepTracker) {
      throw new Error('StepTracker not available');
    }
    if (!window.AuditTracker) {
      throw new Error('AuditTracker not available');
    }
    if (!window.BusinessTracker) {
      throw new Error('BusinessTracker not available');
    }
    if (!window.ChiliPiperTracker) {
      throw new Error('ChiliPiperTracker not available');
    }

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
}

// Initialize CustomerIOTracker when Customer.io analytics is ready
function initializeCustomerIOTracker() {
  try {
    const customerIOTracker = new CustomerIOTracker();
    window.CustomerIOTracker = customerIOTracker;
  } catch (error) {
    console.error('Failed to initialize CustomerIOTracker:', error);

    // Create a minimal fallback object to prevent errors
    window.CustomerIOTracker = {
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
}

// Initialize CustomerIOTracker immediately when modules are loaded
initializeCustomerIOTracker();

// Also try to initialize via Customer.io ready callback if available
if (window.cioanalytics && typeof window.cioanalytics.ready === 'function') {
  window.cioanalytics.ready(() => {
    // CustomerIOTracker is already initialized, nothing to do
  });
}
