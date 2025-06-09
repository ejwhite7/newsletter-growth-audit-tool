// Customer.io Tracking Module
/* eslint-disable no-console */
const CustomerIOTracker = {
  // Generate a unique audit ID for grouping
  auditId: null,
  userId: null,
  trackingQueue: [],

  // Initialize tracking with user identification
  identifyUser(userData) {
    // Always set userId regardless of Customer.io state
    this.userId = userData.email;

    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics)) {
      return;
    }

    try {
      // Identify user with PII using correct syntax
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
  },

  // Create slugified group ID from object name
  createGroupId(firstName, lastName) {
    const objectName = `Newsletter Audit ${firstName} ${lastName}`;
    return objectName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  },

  // Track step completion with form data
  trackStepCompletion(stepNumber, stepData) {
    if (!this.userId) {
      return;
    }

    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics)) {
      // Queue the tracking for when Customer.io loads
      this.queueTracking('trackStepCompletion', [stepNumber, stepData]);
      return;
    }

    const eventName = `audit_step_${stepNumber}_completed`;
    const stepNames = {
      1: 'basic_info',
      2: 'newsletter_platform',
      3: 'social_team',
      4: 'revenue_monetization',
      5: 'tools_upload',
    };

    const trackData = {
      userId: this.userId,
      stepNumber,
      stepName: stepNames[stepNumber],
      completedAt: new Date().toISOString(),
      ...stepData,
    };

    try {
      window.cioanalytics.track(eventName, trackData);
    } catch (error) {
      console.error('Customer.io track call failed:', error);
    }
  },

  // Track audit generation start
  trackAuditGenerationStart(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    // Generate unique audit ID
    this.auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      window.cioanalytics.track('audit_generation_started', {
        userId: this.userId,
        auditId: this.auditId,
        startedAt: new Date().toISOString(),
        totalSteps: 5,
        formData: this.sanitizeFormData(formData),
      });
    } catch (error) {
      console.error('Customer.io audit generation start tracking failed:', error);
    }
  },

  // Track audit completion and create group
  trackAuditCompletion(formData, auditContent) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (
      !window.cioanalytics ||
      Array.isArray(window.cioanalytics) ||
      !this.userId ||
      !this.auditId
    ) {
      return;
    }

    try {
      // Track completion event
      const completionData = {
        userId: this.userId,
        auditId: this.auditId,
        completedAt: new Date().toISOString(),
        success: true,
        formData: this.sanitizeFormData(formData),
      };

      window.cioanalytics.track('audit_generation_completed', completionData);

      // Create slugified group ID from object name
      const groupId = this.createGroupId(formData.firstName, formData.lastName);

      // Create group for the audit with all data using correct syntax
      const groupData = {
        name: `Newsletter Audit - ${formData.firstName} ${formData.lastName}`,
        audit_type: 'newsletter_audit',
        created_at: new Date().toISOString(),
        user_id: this.userId,
        group_type: '134178211',

        // User information
        user_first_name: formData.firstName,
        user_last_name: formData.lastName,
        user_email: formData.email,
        user_newsletter_name: formData.newsletterName,

        // Newsletter data
        platform: formData.platform,
        subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
        open_rate: formData.openRate,
        click_rate: formData.clickRate,
        monthly_revenue: formData.customMonthlyRevenue || formData.monthlyRevenue,
        monetization_methods: Array.isArray(formData.monetizationMethods)
          ? formData.monetizationMethods.join(', ')
          : '',

        // Social presence
        twitter_handle: formData.twitterHandle,
        linkedin_handle: formData.linkedinHandle,
        instagram_handle: formData.instagramHandle,
        tiktok_handle: formData.tiktokHandle,

        // Other data
        team_size: formData.teamSize,
        additional_tools: formData.additionalTools,
        archive_link: formData.archiveLink,

        // Audit metadata
        audit_generated_at: new Date().toISOString(),
        audit_content_length: auditContent ? auditContent.length : 0,
        audit_generation_type: auditContent ? 'ai_generated' : 'fallback_template',
      };

      window.cioanalytics.group(groupId, groupData);
    } catch (error) {
      console.error('Customer.io audit completion tracking failed:', error);
    }
  },

  // Track audit download
  trackAuditDownload() {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (
      !window.cioanalytics ||
      Array.isArray(window.cioanalytics) ||
      !this.userId ||
      !this.auditId
    ) {
      return;
    }

    try {
      window.cioanalytics.track('audit_downloaded', {
        userId: this.userId,
        auditId: this.auditId,
        downloadedAt: new Date().toISOString(),
        downloadType: 'pdf',
      });
    } catch (error) {
      console.error('Customer.io audit download tracking failed:', error);
    }
  },

  // Track enterprise user (100k+ subscribers)
  trackEnterpriseUser(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('enterprise_user_identified', {
        userId: this.userId,
        subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
        monthly_revenue: formData.customMonthlyRevenue || formData.monthlyRevenue,
        platform: formData.platform,
        timestamp: new Date().toISOString(),
        user_type: 'enterprise',
        requires_manual_audit: true,
        scheduling_widget_shown: true,
      });
    } catch (error) {
      console.error('Customer.io enterprise user tracking failed:', error);
    }
  },

  // Track ChiliPiper widget interactions
  trackChilipiperWidgetLoad(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('chilipiper_widget_loaded', {
        userId: this.userId,
        subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
        platform: formData.platform,
        timestamp: new Date().toISOString(),
        widget_type: 'scheduling',
      });
    } catch (error) {
      console.error('Customer.io ChiliPiper widget load tracking failed:', error);
    }
  },

  // Track ChiliPiper scheduling attempts
  trackChilipiperSchedulingAttempt(formData, method = 'widget') {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('chilipiper_scheduling_attempt', {
        userId: this.userId,
        subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
        platform: formData.platform,
        method, // 'widget' or 'fallback_button'
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Customer.io ChiliPiper scheduling attempt tracking failed:', error);
    }
  },

  // Track ChiliPiper fallback usage
  trackChilipiperFallback(formData, reason = 'widget_failed') {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('chilipiper_fallback_shown', {
        userId: this.userId,
        subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
        platform: formData.platform,
        reason, // 'widget_failed', 'script_error', etc.
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Customer.io ChiliPiper fallback tracking failed:', error);
    }
  },

  // Track social media presence analysis
  trackSocialMediaAnalysis(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      const socialChannels = formData.socialChannels || [];
      const totalFollowing = Number.parseInt(formData.totalSocialFollowing) || 0;

      // Analyze social presence
      const socialAnalysis = {
        total_platforms: socialChannels.length,
        platforms_used: socialChannels.map(ch => ch.platform).join(', '),
        has_twitter: socialChannels.some(ch => ch.platform === 'twitter'),
        has_linkedin: socialChannels.some(ch => ch.platform === 'linkedin'),
        has_instagram: socialChannels.some(ch => ch.platform === 'instagram'),
        has_tiktok: socialChannels.some(ch => ch.platform === 'tiktok'),
        has_youtube: socialChannels.some(ch => ch.platform === 'youtube'),
        has_facebook: socialChannels.some(ch => ch.platform === 'facebook'),
        total_following: totalFollowing,
        following_tier: this.categorizeSocialFollowing(totalFollowing),
        has_no_social: socialChannels.some(ch => ch.platform === 'none'),
      };

      window.cioanalytics.track('social_media_analysis', {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        ...socialAnalysis,
      });
    } catch (error) {
      console.error('Customer.io social media analysis tracking failed:', error);
    }
  },

  // Track step timing and user behavior
  trackStepTiming(stepNumber, timeSpent, interactions = {}) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('step_timing_analysis', {
        userId: this.userId,
        step_number: stepNumber,
        time_spent_seconds: timeSpent,
        time_spent_category: this.categorizeTimeSpent(timeSpent),
        interactions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Customer.io step timing tracking failed:', error);
    }
  },

  // Track field-specific interactions
  trackFieldInteraction(fieldName, action, value = null, stepNumber = null) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('field_interaction', {
        userId: this.userId,
        field_name: fieldName,
        action, // 'focus', 'blur', 'change', 'error'
        value_length: value ? value.toString().length : 0,
        step_number: stepNumber,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Customer.io field interaction tracking failed:', error);
    }
  },

  // Track user engagement patterns
  trackEngagementPattern(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      const engagement = {
        has_open_rate: !!(formData.openRate && formData.openRate !== 'Unknown'),
        has_click_rate: !!(formData.clickRate && formData.clickRate !== 'Unknown'),
        has_archive_link: !!formData.archiveLink,
        has_monetization: !!(
          formData.monetizationMethods &&
          formData.monetizationMethods.length > 0 &&
          !formData.monetizationMethods.includes('none')
        ),
        has_social_presence: !!(
          formData.socialChannels &&
          formData.socialChannels.length > 0 &&
          !formData.socialChannels.some(ch => ch.platform === 'none')
        ),
        has_team: !!(formData.teamSize && formData.teamSize !== 'Just me'),
        uses_tools: !!(formData.additionalTools && formData.additionalTools.trim() !== ''),
        engagement_score: this.calculateEngagementScore(formData),
      };

      window.cioanalytics.track('user_engagement_pattern', {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        ...engagement,
      });
    } catch (error) {
      console.error('Customer.io engagement pattern tracking failed:', error);
    }
  },

  // Track platform migration potential
  trackPlatformMigrationPotential(formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      const migrationFactors = {
        current_platform: formData.platform,
        is_on_beehiiv: formData.platform === 'beehiiv',
        subscriber_tier: this.determineSubscriberTier(
          formData.customSubscriberCount || formData.subscriberCount
        ),
        has_revenue: !!(formData.customMonthlyRevenue || formData.monthlyRevenue),
        revenue_tier: this.determineRevenueTier(
          formData.customMonthlyRevenue || formData.monthlyRevenue
        ),
        migration_likelihood: this.calculateMigrationLikelihood(formData),
      };

      window.cioanalytics.track('platform_migration_analysis', {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        ...migrationFactors,
      });
    } catch (error) {
      console.error('Customer.io platform migration tracking failed:', error);
    }
  },

  // Helper functions for categorization
  categorizeSocialFollowing(following) {
    if (following === 0) return 'none';
    if (following < 1000) return 'micro';
    if (following < 10000) return 'small';
    if (following < 50000) return 'medium';
    if (following < 100000) return 'large';
    return 'mega';
  },

  categorizeTimeSpent(seconds) {
    if (seconds < 30) return 'very_fast';
    if (seconds < 60) return 'fast';
    if (seconds < 120) return 'normal';
    if (seconds < 300) return 'slow';
    return 'very_slow';
  },

  determineSubscriberTier(subscriberCount) {
    if (!subscriberCount) return 'unknown';

    const count = Number.parseInt(subscriberCount) || 0;
    if (count < 1000) return 'starter';
    if (count < 10000) return 'growing';
    if (count < 100000) return 'established';
    return 'enterprise';
  },

  determineRevenueTier(revenue) {
    if (!revenue) return 'none';

    const amount = Number.parseInt(revenue) || 0;
    if (amount === 0) return 'none';
    if (amount < 1000) return 'low';
    if (amount < 5000) return 'medium';
    if (amount < 10000) return 'high';
    return 'very_high';
  },

  calculateEngagementScore(formData) {
    let score = 0;

    // Basic info completeness (20 points)
    if (formData.firstName && formData.lastName && formData.email) score += 20;

    // Newsletter metrics (30 points)
    if (formData.openRate && formData.openRate !== 'Unknown') score += 15;
    if (formData.clickRate && formData.clickRate !== 'Unknown') score += 15;

    // Social presence (20 points)
    if (formData.socialChannels && formData.socialChannels.length > 0) score += 20;

    // Monetization (15 points)
    if (formData.monetizationMethods && formData.monetizationMethods.length > 0) score += 15;

    // Additional details (15 points)
    if (formData.archiveLink) score += 5;
    if (formData.additionalTools) score += 5;
    if (formData.teamSize && formData.teamSize !== 'Just me') score += 5;

    return score;
  },

  calculateMigrationLikelihood(formData) {
    if (formData.platform === 'beehiiv') return 'already_on_beehiiv';

    let likelihood = 0;

    // Higher subscriber count = more likely to migrate
    const subscriberCount =
      Number.parseInt(formData.customSubscriberCount || formData.subscriberCount) || 0;
    if (subscriberCount > 10000) likelihood += 30;
    else if (subscriberCount > 1000) likelihood += 20;
    else likelihood += 10;

    // Revenue indicates serious business
    const revenue = Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0;
    if (revenue > 1000) likelihood += 25;
    else if (revenue > 0) likelihood += 15;

    // Social presence indicates growth focus
    if (formData.socialChannels && formData.socialChannels.length > 2) likelihood += 20;

    // Team size indicates scaling
    if (formData.teamSize && formData.teamSize !== 'Just me') likelihood += 15;

    // Platform limitations
    if (['Mailchimp', 'Constant Contact'].includes(formData.platform)) likelihood += 10;

    if (likelihood >= 70) return 'high';
    if (likelihood >= 50) return 'medium';
    if (likelihood >= 30) return 'low';
    return 'very_low';
  },

  // Track form abandonment
  trackFormAbandonment(currentStep, formData) {
    if (window.cioanalyticsUnavailable) {
      return;
    }

    if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
      return;
    }

    try {
      window.cioanalytics.track('audit_form_abandoned', {
        userId: this.userId,
        abandonedAt: new Date().toISOString(),
        currentStep,
        totalSteps: 5,
        completionPercentage: (currentStep / 5) * 100,
        partialData: this.sanitizeFormData(formData),
      });
    } catch (error) {
      console.error('Customer.io form abandonment tracking failed:', error);
    }
  },

  // Sanitize form data for tracking (remove sensitive info if needed)
  sanitizeFormData(formData) {
    const sanitized = { ...formData };

    // Remove file uploads and other sensitive data
    sanitized.newsletterUpload = undefined;

    return sanitized;
  },

  // Track page visibility changes for abandonment detection
  // Queue tracking calls when Customer.io isn't ready yet
  queueTracking(methodName, args) {
    this.trackingQueue.push({ method: methodName, args: args });
  },

  // Process queued tracking calls when Customer.io becomes available
  processTrackingQueue() {
    if (this.trackingQueue.length === 0) return;

    const queue = [...this.trackingQueue];
    this.trackingQueue = [];

    queue.forEach(({ method, args }) => {
      if (this[method]) {
        this[method](...args);
      }
    });
  },

  initializeAbandonmentTracking() {
    let isFormStarted = false;

    // Track when user starts the form
    document.addEventListener('DOMContentLoaded', () => {
      isFormStarted = true;
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isFormStarted && this.userId) {
        const currentStep = StepManager.currentStep;
        const formData = DataCollector.getFormData();

        // Only track abandonment if they haven't completed the audit
        if (currentStep < 5 && !document.getElementById('auditContent')?.innerHTML) {
          this.trackFormAbandonment(currentStep, formData);
        }
      }
    });

    // Track beforeunload for abandonment
    window.addEventListener('beforeunload', () => {
      if (isFormStarted && this.userId) {
        const currentStep = StepManager.currentStep;
        const formData = DataCollector.getFormData();

        if (currentStep < 5 && !document.getElementById('auditContent')?.innerHTML) {
          this.trackFormAbandonment(currentStep, formData);
        }
      }
    });

    // Check periodically if Customer.io has loaded and process queue
    const checkCustomerIO = setInterval(() => {
      if (window.cioanalytics && !Array.isArray(window.cioanalytics)) {
        this.processTrackingQueue();
        clearInterval(checkCustomerIO);
      }
    }, 1000);

    // Clear interval after 30 seconds to avoid infinite checking
    setTimeout(() => clearInterval(checkCustomerIO), 30000);
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomerIOTracker;
} else {
  window.CustomerIOTracker = CustomerIOTracker;
}
