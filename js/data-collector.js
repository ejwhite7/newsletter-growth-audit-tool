// Data Collector Module
const DataCollector = {
  formData: {},

  collectStepData(stepNumber) {
    const collectors = {
      1: () => this.collectBasicInfo(),
      2: () => this.collectNewsletterDetails(),
      3: () => this.collectSocialTeam(),
      4: () => this.collectRevenueMonetization(),
      5: () => this.collectToolsUpload(),
    };

    const collector = collectors[stepNumber];
    if (collector) {
      const stepData = collector();

      // Track step completion with Customer.io
      if (window.CustomerIOTracker && typeof window.CustomerIOTracker.trackStepCompletion === 'function') {
        CustomerIOTracker.trackStepCompletion(stepNumber, stepData);
      }

      return stepData;
    }
  },

  collectBasicInfo() {
    const stepData = {
      firstName: document.getElementById('firstName')?.value || '',
      lastName: document.getElementById('lastName')?.value || '',
      email: document.getElementById('email')?.value || '',
      newsletterName: document.getElementById('newsletterName')?.value || '',
    };

    // Update form data
    Object.assign(this.formData, stepData);

    // Identify user with Customer.io on first step
    if (window.CustomerIOTracker && typeof window.CustomerIOTracker.identifyUser === 'function') {
      CustomerIOTracker.identifyUser(stepData);
    }

    return stepData;
  },

  collectNewsletterDetails() {
    const stepData = {
      platform: document.getElementById('platform')?.value || '',
      subscriberCount: document.getElementById('subscriberCount')?.value || '',
      customSubscriberCount: document.getElementById('customSubscriberCount')?.value || '',
      openRate: document.getElementById('openRate')?.value || '',
      clickRate: document.getElementById('clickRate')?.value || '',
      archiveLink: document.getElementById('archiveLink')?.value || '',
    };

    Object.assign(this.formData, stepData);
    return stepData;
  },

  collectSocialTeam() {
    // Collect dynamic social media channels
    const socialChannels = [];
    const channelItems = document.querySelectorAll('.social-channel-item');

    channelItems.forEach(item => {
      const platformSelect = item.querySelector('select');
      const handleInput = item.querySelector('input[type="text"]');

      if (platformSelect?.value) {
        socialChannels.push({
          platform: platformSelect.value,
          handle: handleInput ? handleInput.value : '',
        });
      }
    });

    const stepData = {
      socialChannels,
      totalSocialFollowing: document.getElementById('totalSocialFollowing')?.value || '0',
      // Legacy fields for backwards compatibility
      twitterHandle: socialChannels.find(ch => ch.platform === 'twitter')?.handle || '',
      linkedinHandle: socialChannels.find(ch => ch.platform === 'linkedin')?.handle || '',
      instagramHandle: socialChannels.find(ch => ch.platform === 'instagram')?.handle || '',
      tiktokHandle: socialChannels.find(ch => ch.platform === 'tiktok')?.handle || '',
    };

    Object.assign(this.formData, stepData);
    return stepData;
  },

  collectRevenueMonetization() {
    const monetizationMethods = [];
    document.querySelectorAll('input[name="monetization"]:checked').forEach(cb => {
      monetizationMethods.push(cb.value);
    });

    const stepData = {
      monthlyRevenue: document.getElementById('monthlyRevenue')?.value || '',
      customMonthlyRevenue: document.getElementById('customMonthlyRevenue')?.value || '',
      teamSize: document.getElementById('teamSize')?.value || '',
      monetizationMethods,
    };

    Object.assign(this.formData, stepData);
    return stepData;
  },

  collectToolsUpload() {
    const uploadInput = document.getElementById('newsletterUpload');
    const stepData = {
      additionalTools: document.getElementById('additionalTools')?.value || '',
      hasFileUpload: uploadInput && uploadInput.files.length > 0,
    };

    if (uploadInput && uploadInput.files.length > 0) {
      this.formData.newsletterUpload = uploadInput.files[0];
    }

    Object.assign(this.formData, stepData);
    return stepData;
  },

  getFormData() {
    return this.formData;
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataCollector;
} else {
  window.DataCollector = DataCollector;
}
