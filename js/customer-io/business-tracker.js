// Business intelligence and analytics tracking
/**
 * Business intelligence and analytics tracking
 */
class BusinessTracker {
  constructor(core, utils) {
    this.core = core;
    this.utils = utils;
  }

  /**
   * Track enterprise user indicators
   */
  trackEnterpriseUser(formData) {
    const subscriberCount = Number.parseInt(formData.customSubscriberCount || formData.subscriberCount) || 0;
    const revenue = Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0;

    const trackData = {
      subscriber_count: subscriberCount,
      subscriber_tier: this.utils.determineSubscriberTier(subscriberCount),
      monthly_revenue: revenue,
      revenue_tier: this.utils.determineRevenueTier(revenue),
      team_size: formData.teamSize,
      platform: formData.platform,
      is_enterprise_candidate: subscriberCount >= 50000 || revenue >= 5000,
    };

    return this.core.track('enterprise_user_identified', trackData);
  }

  /**
   * Track social media analysis
   */
  trackSocialMediaAnalysis(formData) {
    const totalFollowing = Number.parseInt(formData.totalSocialFollowing) || 0;

    const trackData = {
      total_social_following: totalFollowing,
      social_following_category: this.utils.categorizeSocialFollowing(totalFollowing),
      has_twitter: !!(formData.twitterHandle),
      has_linkedin: !!(formData.linkedinHandle),
      has_instagram: !!(formData.instagramHandle),
      has_tiktok: !!(formData.tiktokHandle),
      social_channel_count: [
        formData.twitterHandle,
        formData.linkedinHandle,
        formData.instagramHandle,
        formData.tiktokHandle
      ].filter(Boolean).length,
    };

    return this.core.track('social_media_analysis', trackData);
  }

  /**
   * Track engagement patterns
   */
  trackEngagementPattern(formData) {
    const engagementScore = this.utils.calculateEngagementScore(formData);

    const trackData = {
      engagement_score: engagementScore,
      engagement_tier: engagementScore >= 70 ? 'high' : engagementScore >= 40 ? 'medium' : 'low',
      open_rate: Number.parseFloat(formData.openRate) || 0,
      click_rate: Number.parseFloat(formData.clickRate) || 0,
      subscriber_count: Number.parseInt(formData.customSubscriberCount || formData.subscriberCount) || 0,
      monthly_revenue: Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0,
    };

    return this.core.track('engagement_pattern_analysis', trackData);
  }

  /**
   * Track platform migration potential
   */
  trackPlatformMigrationPotential(formData) {
    const migrationLikelihood = this.utils.calculateMigrationLikelihood(formData);

    const trackData = {
      current_platform: formData.platform,
      migration_likelihood: migrationLikelihood,
      migration_tier: migrationLikelihood >= 70 ? 'high' : migrationLikelihood >= 40 ? 'medium' : 'low',
      subscriber_count: Number.parseInt(formData.customSubscriberCount || formData.subscriberCount) || 0,
      monthly_revenue: Number.parseInt(formData.customMonthlyRevenue || formData.monthlyRevenue) || 0,
      team_size: formData.teamSize,
    };

    return this.core.track('platform_migration_analysis', trackData);
  }
}

// Export for browser use
window.BusinessTracker = BusinessTracker;
