// Audit-specific tracking functionality
/**
 * Audit-specific tracking functionality
 */
class AuditTracker {
  constructor(core, utils) {
    this.core = core;
    this.utils = utils;
  }

  /**
   * Track audit generation start
   */
  trackAuditGenerationStart(formData) {
    if (!this.core.userId) return false;

    // Generate unique audit ID
    this.core.generateAuditId();

    const trackData = {
      auditId: this.core.auditId,
      startedAt: new Date().toISOString(),
      totalSteps: 5,
      formData: this.utils.sanitizeFormData(formData),
    };

    return this.core.track('audit_generation_started', trackData);
  }

  /**
   * Track audit completion and create group
   */
  trackAuditCompletion(formData, auditContent) {
    if (!this.core.userId || !this.core.auditId) return false;

    // Track completion event
    const completionData = {
      auditId: this.core.auditId,
      completedAt: new Date().toISOString(),
      success: true,
      formData: this.utils.sanitizeFormData(formData),
    };

    const tracked = this.core.track('audit_generation_completed', completionData);

    // Create group for the audit
    if (tracked) {
      this.createAuditGroup(formData, auditContent);
    }

    return tracked;
  }

  /**
   * Create Customer.io group for audit
   */
  createAuditGroup(formData, auditContent) {
    const groupId = this.utils.createGroupId(formData.firstName, formData.lastName);

    const groupData = {
      name: `Newsletter Audit - ${formData.firstName} ${formData.lastName}`,
      audit_type: 'newsletter_audit',
      created_at: new Date().toISOString(),
      user_id: this.core.userId,
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

    return this.core.group(groupId, groupData);
  }

  /**
   * Track audit download
   */
  trackAuditDownload() {
    if (!this.core.userId || !this.core.auditId) return false;

    const trackData = {
      auditId: this.core.auditId,
      downloadedAt: new Date().toISOString(),
      downloadType: 'pdf',
    };

    return this.core.track('audit_downloaded', trackData);
  }
}

// Export for browser use
window.AuditTracker = AuditTracker;
