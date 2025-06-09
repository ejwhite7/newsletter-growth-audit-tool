// Core Customer.io analytics wrapper
/* eslint-disable no-console */

/**
 * Core Customer.io analytics wrapper
 * Handles basic tracking functionality and queue management
 */
class CustomerIOCore {
  constructor() {
    this.userId = null;
    this.auditId = null;
    this.trackingQueue = [];
  }

  /**
   * Check if Customer.io is available and ready
   */
  isAvailable() {
    return !window.cioanalyticsUnavailable &&
           window.cioanalytics &&
           !Array.isArray(window.cioanalytics);
  }

  /**
   * Initialize user identification
   */
  identifyUser(userData) {
    // Always set userId regardless of Customer.io state
    this.userId = userData.email;

    if (!this.isAvailable()) {
      return;
    }

    try {
      window.cioanalytics.identify(this.userId, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        newsletterName: userData.newsletterName,
        createdAt: new Date().toISOString(),
        source: 'newsletter_audit_tool',
      });
    } catch (error) {
      console.error('Customer.io identify call failed:', error);
    }
  }

  /**
   * Track an event with Customer.io
   */
  track(eventName, eventData) {
    if (!this.userId) {
      return false;
    }

    if (!this.isAvailable()) {
      this.queueTracking('track', [eventName, eventData]);
      return false;
    }

    try {
      window.cioanalytics.track(eventName, {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        ...eventData,
      });
      return true;
    } catch (error) {
      console.error(`Customer.io track call failed for ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Create a Customer.io group
   */
  group(groupId, groupData) {
    if (!this.isAvailable() || !this.userId) {
      return false;
    }

    try {
      window.cioanalytics.group(groupId, groupData);
      return true;
    } catch (error) {
      console.error('Customer.io group call failed:', error);
      return false;
    }
  }

  /**
   * Queue tracking calls when Customer.io isn't ready
   */
  queueTracking(methodName, args) {
    this.trackingQueue.push({ method: methodName, args });
  }

  /**
   * Process queued tracking calls
   */
  processTrackingQueue() {
    if (this.trackingQueue.length === 0) return;

    const queue = [...this.trackingQueue];
    this.trackingQueue = [];

    queue.forEach(({ method, args }) => {
      if (this[method]) {
        this[method](...args);
      }
    });
  }

  /**
   * Generate unique audit ID
   */
  generateAuditId() {
    this.auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.auditId;
  }
}

// Export for browser use
window.CustomerIOCore = CustomerIOCore;
