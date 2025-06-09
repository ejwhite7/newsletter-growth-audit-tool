// Main Application Entry Point
// Import all modules (modules will self-register to window object)

// Global function bindings for onclick handlers
window.nextStep = () => StepManager.nextStep();
window.prevStep = () => StepManager.prevStep();
window.generateAudit = () => AuditGenerator.generateAudit();

// Note: Main initialization is handled at the bottom of this file

// Custom input toggle functions
window.toggleCustomSubscriberInput = () => {
  const subscriberSelect = document.getElementById('subscriberCount');
  const customGroup = document.getElementById('customSubscriberGroup');
  const customInput = document.getElementById('customSubscriberCount');

  if (subscriberSelect && subscriberSelect.value === '100000+') {
    if (customGroup) customGroup.style.display = 'block';
    if (customInput) customInput.required = true;
  } else {
    if (customGroup) customGroup.style.display = 'none';
    if (customInput) {
      customInput.required = false;
      customInput.value = '';
    }
  }
};

window.toggleCustomRevenueInput = () => {
  const revenueSelect = document.getElementById('monthlyRevenue');
  const customGroup = document.getElementById('customRevenueGroup');
  const customInput = document.getElementById('customMonthlyRevenue');

  if (revenueSelect && revenueSelect.value === '10000+') {
    if (customGroup) customGroup.style.display = 'block';
    if (customInput) customInput.required = true;
  } else {
    if (customGroup) customGroup.style.display = 'none';
    if (customInput) {
      customInput.required = false;
      customInput.value = '';
    }
  }
};

// Social Media Functions
let socialChannelCounter = 0;

window.addSocialChannel = () => {
  const container = document.getElementById('socialChannelsList');

  socialChannelCounter++;

  // Track social channel addition
  if (window.CustomerIOTracker) {
    window.CustomerIOTracker.trackFieldInteraction(
      'social_channels',
      'add_channel',
      socialChannelCounter,
      3 // Step 3
    );
  }

  const channelItem = document.createElement('div');
  channelItem.className = 'social-channel-item';
  channelItem.id = `social-channel-${socialChannelCounter}`;

  channelItem.innerHTML = `
        <select class="form-control" id="platform-${socialChannelCounter}" onchange="updateSocialFollowingVisibility()">
            <option value="">Select platform</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="none">No Social Presence</option>
        </select>
        <input type="text" class="form-control" id="handle-${socialChannelCounter}" placeholder="@username or profile URL" style="display: none;">
        <button type="button" class="btn btn--remove-social" onclick="removeSocialChannel(${socialChannelCounter})">Remove</button>
    `;

  container.appendChild(channelItem);

  // Add event listener to show/hide input based on selection
  const platformSelect = document.getElementById(`platform-${socialChannelCounter}`);
  const handleInput = document.getElementById(`handle-${socialChannelCounter}`);

  platformSelect.addEventListener('change', function () {
    // Track platform selection
    if (window.CustomerIOTracker) {
      window.CustomerIOTracker.trackFieldInteraction(
        'social_platform_selection',
        'platform_selected',
        this.value,
        3 // Step 3
      );
    }

    if (this.value && this.value !== 'none') {
      handleInput.style.display = 'block';
      handleInput.required = true;

      // Update placeholder based on platform
      const placeholders = {
        twitter: '@username',
        linkedin: 'https://linkedin.com/in/username',
        instagram: '@username',
        tiktok: '@username',
        youtube: 'Channel URL or @handle',
        facebook: 'Page URL or @handle',
      };
      handleInput.placeholder = placeholders[this.value] || '@username or profile URL';
    } else {
      handleInput.style.display = 'none';
      handleInput.required = false;
      handleInput.value = '';
    }
    updateSocialFollowingVisibility();
  });
};

window.removeSocialChannel = id => {
  const channelItem = document.getElementById(`social-channel-${id}`);
  if (channelItem) {
    // Track social channel removal
    if (window.CustomerIOTracker) {
      window.CustomerIOTracker.trackFieldInteraction(
        'social_channels',
        'remove_channel',
        id,
        3 // Step 3
      );
    }

    channelItem.remove();
    updateSocialFollowingVisibility();
  }
};

window.updateSocialFollowingVisibility = () => {
  const channels = document.querySelectorAll('.social-channel-item select');
  const followingGroup = document.getElementById('socialFollowingGroup');

  let hasSocialChannels = false;
  let hasNoSocialPresence = false;

  channels.forEach(select => {
    if (select.value) {
      if (select.value === 'none') {
        hasNoSocialPresence = true;
      } else {
        hasSocialChannels = true;
      }
    }
  });

  // Show following slider only if user has social channels (not "No Social Presence")
  if (hasSocialChannels && !hasNoSocialPresence) {
    followingGroup.style.display = 'block';
  } else {
    followingGroup.style.display = 'none';
  }
};

window.updateFollowingDisplay = value => {
  const valueDisplay = document.getElementById('followingValue');
  if (valueDisplay) {
    const numValue = Number.parseInt(value);
    let displayValue;

    if (numValue === 0) {
      displayValue = '0 followers';
    } else if (numValue < 1000) {
      displayValue = `${numValue} followers`;
    } else if (numValue < 100000) {
      displayValue = `${Math.round(numValue / 1000)}K followers`;
    } else {
      displayValue = '100K+ followers';
    }

    valueDisplay.textContent = displayValue;

    // Track social following slider interaction
    if (window.CustomerIOTracker) {
      window.CustomerIOTracker.trackFieldInteraction(
        'total_social_following',
        'slider_change',
        value,
        3 // Step 3
      );
    }
  }
};

// PDF Download functionality
window.downloadAudit = () => {
  // Track download with Customer.io
  CustomerIOTracker.trackAuditDownload();

  // Implement PDF download functionality
  const auditContent = document.getElementById('auditContent');
  const formData = DataCollector.getFormData();

  // Track enhanced user behavior
  if (window.CustomerIOTracker) {
    window.CustomerIOTracker.trackFieldInteraction(
      'audit_actions',
      'download_pdf',
      'pdf_download',
      null
    );
  }

  if (!auditContent) {
    alert('No audit content to download');
    return;
  }

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    // For mobile, create a shareable text version
    const auditDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create text version of audit
    const textContent = `
NEWSLETTER GROWTH AUDIT
Generated for: ${formData.firstName} ${formData.lastName}
Date: ${auditDate}

${auditContent.innerText}

---
Generated by beehiiv Newsletter Growth Audit Tool
        `.trim();

    // Try to use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: 'Newsletter Growth Audit',
          text: textContent,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback to copy to clipboard
          copyAuditToClipboard(textContent);
        });
    } else {
      // Fallback to copy to clipboard
      copyAuditToClipboard(textContent);
    }
  } else {
    // Desktop: Use print functionality
    createPrintWindow(formData, auditContent);
  }
};

// Helper function to copy audit to clipboard
function copyAuditToClipboard(textContent) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(textContent)
      .then(() => {
        alert('Audit copied to clipboard! You can now paste it into any document or email.');
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Failed to copy to clipboard:', err);
        showTextModal(textContent);
      });
  } else {
    showTextModal(textContent);
  }
}

// Helper function to show text in a modal for manual copying
function showTextModal(textContent) {
  const modal = document.createElement('div');
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    `;

  const content = document.createElement('div');
  content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        position: relative;
    `;

  content.innerHTML = `
        <h3 style="margin-top: 0;">Your Newsletter Audit</h3>
        <p>Copy the text below and save it to your device:</p>
        <textarea readonly style="width: 100%; height: 300px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">${textContent}</textarea>
        <div style="margin-top: 15px; text-align: right;">
            <button onclick="this.closest('[style*=&quot;position: fixed&quot;]').remove()" style="background: #2F39BA; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
    `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Select all text in textarea
  const textarea = content.querySelector('textarea');
  textarea.focus();
  textarea.select();
}

// Helper function to create print window (desktop)
function createPrintWindow(formData, auditContent) {
  const printWindow = window.open('', '_blank');
  const auditDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Newsletter Growth Audit - ${formData.firstName} ${formData.lastName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1, h2, h3 { color: #2F39BA; }
                .audit-section { margin-bottom: 30px; page-break-inside: avoid; }
                .audit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0; }
                .audit-metric { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #000; }
                .metric-value { font-size: 24px; font-weight: bold; color: #2F39BA; margin: 8px 0 0 0; }
                .recommendation-card { background: #f8f9fa; border: 1px solid #000; border-radius: 8px; padding: 16px; margin: 16px 0; }
                .recommendation-priority { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .recommendation-priority.high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .cta-section { background: linear-gradient(135deg, #2F39BA, #252F95); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0; }
                .action-plan { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #000; }
                .action-steps { list-style: none; padding: 0; }
                .action-steps li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
                .step-number { background: #2F39BA; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
                ul { padding-left: 20px; }
                li { margin-bottom: 8px; }
                @media print { 
                    body { margin: 20px; } 
                    .cta-section { background: #21808d !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <h1>Newsletter Growth Audit</h1>
            <p><strong>Generated for:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Date:</strong> ${auditDate}</p>
            <hr>
            ${auditContent.innerHTML}
        </body>
        </html>
    `);

  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

// Restart audit functionality
window.restartAudit = () => {
  // Track restart action
  if (window.CustomerIOTracker) {
    window.CustomerIOTracker.trackFieldInteraction(
      'audit_actions',
      'restart_audit',
      'restart_clicked',
      null
    );
  }

  location.reload();
};

// Make AuditGenerator available globally for error handling
window.AuditGenerator = AuditGenerator;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  if (window.cioanalytics) {
    // Test basic functionality
    try {
      window.cioanalytics.page();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Customer.io page() call failed:', error);
    }
  }

  // Initialize Customer.io abandonment tracking
  if (window.CustomerIOTracker && typeof window.CustomerIOTracker.initializeAbandonmentTracking === 'function') {
    CustomerIOTracker.initializeAbandonmentTracking();
  }

  // Load all static components
  if (window.ComponentLoader) {
    await ComponentLoader.loadAllComponents();
  }

  // Load the first step
  if (window.StepManager) {
    await StepManager.loadStep(1);
  } else {
    // eslint-disable-next-line no-console
    console.error('StepManager not available');
  }

  // Initialize progress
  if (window.ProgressManager) {
    ProgressManager.updateProgress(1, StepManager.totalSteps);
  }
});
