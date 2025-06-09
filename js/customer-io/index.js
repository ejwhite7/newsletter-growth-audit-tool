// Main Customer.io Tracker - Combines all functionality
/* eslint-disable no-console */

/**
 * Main Customer.io Tracker - Combines all functionality
 */
class CustomerIOTracker {
  constructor() {
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
  // Wait for all dependencies to be available
  if (!window.CustomerIOCore || !window.CustomerIOUtils || !window.StepTracker ||
      !window.AuditTracker || !window.BusinessTracker || !window.ChiliPiperTracker) {
    // If dependencies aren't ready, try again in 100ms
    setTimeout(initializeCustomerIOTracker, 100);
    return;
  }

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

// Initialize immediately with fallback if dependencies aren't ready
if (window.CustomerIOCore && window.CustomerIOUtils && window.StepTracker &&
    window.AuditTracker && window.BusinessTracker && window.ChiliPiperTracker) {
  // All dependencies available, initialize now
  try {
    window.CustomerIOTracker = new CustomerIOTracker();
  } catch (error) {
    console.error('Failed to initialize CustomerIOTracker:', error);
    // Create fallback
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
} else {
  // Dependencies not ready, try with retry logic
  initializeCustomerIOTracker();
}
