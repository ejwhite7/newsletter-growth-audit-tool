// Customer.io utility functions
/**
 * Utility functions for data processing and categorization
 */
const CustomerIOUtils = {
  /**
   * Create slugified group ID from name
   */
  createGroupId(firstName, lastName) {
    const objectName = `Newsletter Audit ${firstName} ${lastName}`;
    return objectName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  },

  /**
   * Sanitize form data for tracking
   */
  sanitizeFormData(formData) {
    const sanitized = { ...formData };

    // Remove sensitive or unnecessary data
    sanitized.newsletterUpload = null;

    // Ensure data types are correct for Customer.io
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null || sanitized[key] === undefined) {
        sanitized[key] = null;
      }
    });

    return sanitized;
  },

  /**
   * Categorize social following numbers
   */
  categorizeSocialFollowing(following) {
    const num = Number.parseInt(following) || 0;
    if (num === 0) return 'none';
    if (num < 1000) return 'micro';
    if (num < 10000) return 'growing';
    if (num < 100000) return 'established';
    return 'influencer';
  },

  /**
   * Categorize time spent on steps
   */
  categorizeTimeSpent(seconds) {
    if (seconds < 30) return 'rushed';
    if (seconds < 120) return 'normal';
    if (seconds < 300) return 'thoughtful';
    return 'deliberate';
  },

  /**
   * Determine subscriber tier
   */
  determineSubscriberTier(subscriberCount) {
    const count = Number.parseInt(subscriberCount) || 0;
    if (count < 100) return 'starter';
    if (count < 1000) return 'growing';
    if (count < 10000) return 'established';
    if (count < 100000) return 'scale';
    return 'enterprise';
  },

  /**
   * Determine revenue tier
   */
  determineRevenueTier(revenue) {
    const amount = Number.parseInt(revenue) || 0;
    if (amount === 0) return 'pre_revenue';
    if (amount < 1000) return 'early_revenue';
    if (amount < 5000) return 'growing_revenue';
    if (amount < 10000) return 'established_revenue';
    return 'high_revenue';
  },

  /**
   * Calculate engagement score based on form data
   */
  calculateEngagementScore(formData) {
    let score = 0;

    // Open rate scoring
    const openRate = Number.parseFloat(formData.openRate) || 0;
    if (openRate > 40) score += 30;
    else if (openRate > 25) score += 20;
    else if (openRate > 15) score += 10;

    // Click rate scoring
    const clickRate = Number.parseFloat(formData.clickRate) || 0;
    if (clickRate > 5) score += 25;
    else if (clickRate > 3) score += 15;
    else if (clickRate > 1) score += 10;

    // Social presence scoring
    const totalFollowing = Number.parseInt(formData.totalSocialFollowing) || 0;
    if (totalFollowing > 10000) score += 20;
    else if (totalFollowing > 1000) score += 15;
    else if (totalFollowing > 100) score += 10;

    // Revenue scoring
    const revenue = Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0;
    if (revenue > 5000) score += 25;
    else if (revenue > 1000) score += 15;
    else if (revenue > 0) score += 10;

    return Math.min(score, 100); // Cap at 100
  },

  /**
   * Calculate platform migration likelihood
   */
  calculateMigrationLikelihood(formData) {
    let likelihood = 0;

    // Platform-based scoring
    if (formData.platform === 'mailchimp') likelihood += 30;
    else if (formData.platform === 'other') likelihood += 40;
    else if (formData.platform === 'substack') likelihood += 10;

    // Subscriber count factor
    const subscribers = Number.parseInt(formData.customSubscriberCount || formData.subscriberCount) || 0;
    if (subscribers > 10000) likelihood += 20;
    else if (subscribers > 1000) likelihood += 10;

    // Revenue factor
    const revenue = Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0;
    if (revenue > 1000) likelihood += 30;
    else if (revenue > 0) likelihood += 15;

    // Growth indicators
    if (formData.teamSize && formData.teamSize !== '1') likelihood += 10;
    if (formData.monetizationMethods && formData.monetizationMethods.length > 1) likelihood += 10;

    return Math.min(likelihood, 100); // Cap at 100
  }
};

// Export for browser use
window.CustomerIOUtils = CustomerIOUtils;
