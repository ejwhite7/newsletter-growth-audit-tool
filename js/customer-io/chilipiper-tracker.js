// ChiliPiper integration tracking
/**
 * ChiliPiper integration tracking
 */
class ChiliPiperTracker {
  constructor(core, utils) {
    this.core = core;
    this.utils = utils;
  }

  /**
   * Track ChiliPiper widget load
   */
  trackChilipiperWidgetLoad(formData) {
    const trackData = {
      widget_loaded_at: new Date().toISOString(),
      subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
      monthly_revenue: formData.customMonthlyRevenue || formData.monthlyRevenue,
      user_data: this.utils.sanitizeFormData(formData),
    };

    return this.core.track('chilipiper_widget_loaded', trackData);
  }

  /**
   * Track ChiliPiper scheduling attempt
   */
  trackChilipiperSchedulingAttempt(formData, method = 'widget') {
    const trackData = {
      scheduling_method: method,
      attempted_at: new Date().toISOString(),
      user_data: this.utils.sanitizeFormData(formData),
    };

    return this.core.track('chilipiper_scheduling_attempted', trackData);
  }

  /**
   * Track ChiliPiper fallback
   */
  trackChilipiperFallback(formData, reason = 'widget_failed') {
    const trackData = {
      fallback_reason: reason,
      fallback_at: new Date().toISOString(),
      user_data: this.utils.sanitizeFormData(formData),
    };

    return this.core.track('chilipiper_fallback_used', trackData);
  }
}

// Export for browser use
window.ChiliPiperTracker = ChiliPiperTracker;
