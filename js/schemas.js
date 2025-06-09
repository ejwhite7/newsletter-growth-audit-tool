// Zod schemas for newsletter audit form validation
// Note: This assumes Zod is loaded via CDN in the HTML

// Check if Zod is available
if (typeof z === 'undefined') {
  console.error('Zod is not loaded. Please include Zod via CDN or script tag.');
  // Fallback to basic validation if Zod is not available
}

const ZodValidation = {
  // Initialize schemas when Zod is available
  init() {
    if (typeof z === 'undefined') {
      console.warn('Zod not available, using basic validation');
      return false;
    }

    // Schema for basic information (Step 1)
    this.BasicInfoSchema = z.object({
      firstName: z.string().min(1, 'First name is required').max(50),
      lastName: z.string().min(1, 'Last name is required').max(50),
      email: z.string().email('Please enter a valid email address'),
      newsletterName: z.string().min(1, 'Newsletter name is required').max(100),
    });

    // Schema for newsletter platform and metrics (Step 2)
    this.NewsletterPlatformSchema = z.object({
      platform: z.enum(['beehiiv', 'mailchimp', 'substack', 'convertkit', 'ghost', 'other'], {
        errorMap: () => ({ message: 'Please select a newsletter platform' }),
      }),
      subscriberCount: z.string().min(1, 'Subscriber count is required'),
      customSubscriberCount: z.string().optional(),
      openRate: z.string().optional(),
      clickRate: z.string().optional(),
      archiveLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    });

    // Schema for social media channels
    this.SocialChannelSchema = z.object({
      platform: z.enum([
        'twitter',
        'linkedin',
        'instagram',
        'tiktok',
        'youtube',
        'facebook',
        'none',
      ]),
      handle: z.string().optional(),
    });

    // Schema for social media and team (Step 3)
    this.SocialTeamSchema = z.object({
      socialChannels: z.array(this.SocialChannelSchema).optional(),
      totalSocialFollowing: z.string().optional(),
      twitterHandle: z.string().optional(),
      linkedinHandle: z.string().optional(),
      instagramHandle: z.string().optional(),
      tiktokHandle: z.string().optional(),
      teamSize: z.enum(['1', '2-3', '4-10', '11-25', '26-50', '51+'], {
        errorMap: () => ({ message: 'Please select team size' }),
      }),
    });

    // Schema for revenue and monetization (Step 4)
    this.RevenueMonetizationSchema = z.object({
      monthlyRevenue: z.string().min(1, 'Monthly revenue is required'),
      customMonthlyRevenue: z.string().optional(),
      monetizationMethods: z.array(z.string()).optional(),
    });

    // Schema for tools and upload (Step 5)
    this.ToolsUploadSchema = z.object({
      additionalTools: z.string().optional(),
      hasFileUpload: z.boolean().optional(),
    });

    // Complete form data schema
    this.CompleteFormDataSchema = this.BasicInfoSchema.merge(this.NewsletterPlatformSchema)
      .merge(this.SocialTeamSchema)
      .merge(this.RevenueMonetizationSchema)
      .merge(this.ToolsUploadSchema);

    // API request/response schemas
    this.AuditRequestSchema = z.object({
      prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
    });

    this.AuditResponseSchema = z.object({
      content: z.string(),
    });

    this.ErrorResponseSchema = z.object({
      error: z.string(),
      details: z.string().optional(),
    });

    return true;
  },

  // Validation helper function
  validateWithSchema(schema, data) {
    if (!schema) {
      return { success: false, errors: [{ field: 'general', message: 'Schema not available' }] };
    }

    try {
      schema.parse(data);
      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
  },

  // Step-specific validation methods
  validateStep1(data) {
    return this.validateWithSchema(this.BasicInfoSchema, data);
  },

  validateStep2(data) {
    return this.validateWithSchema(this.NewsletterPlatformSchema, data);
  },

  validateStep3(data) {
    return this.validateWithSchema(this.SocialTeamSchema, data);
  },

  validateStep4(data) {
    return this.validateWithSchema(this.RevenueMonetizationSchema, data);
  },

  validateStep5(data) {
    return this.validateWithSchema(this.ToolsUploadSchema, data);
  },

  validateCompleteForm(data) {
    return this.validateWithSchema(this.CompleteFormDataSchema, data);
  },

  validateAuditRequest(data) {
    return this.validateWithSchema(this.AuditRequestSchema, data);
  },

  validateAuditResponse(data) {
    return this.validateWithSchema(this.AuditResponseSchema, data);
  },

  // Safe parsing utilities
  safeParseFormData(data) {
    if (!this.CompleteFormDataSchema) {
      return { success: false, errors: [{ field: 'general', message: 'Schema not available' }] };
    }

    const result = this.CompleteFormDataSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  },

  safeParseBasicInfo(data) {
    if (!this.BasicInfoSchema) {
      return { success: false, errors: [{ field: 'general', message: 'Schema not available' }] };
    }

    const result = this.BasicInfoSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  },

  // Basic validation fallbacks (when Zod is not available)
  basicEmailValidation(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  basicUrlValidation(url) {
    if (!url) return true; // Optional field
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Fallback validation when Zod is not available
  basicValidateStep1(data) {
    const errors = [];

    if (!data.firstName || data.firstName.length === 0) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!data.lastName || data.lastName.length === 0) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (!data.email || !this.basicEmailValidation(data.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    if (!data.newsletterName || data.newsletterName.length === 0) {
      errors.push({ field: 'newsletterName', message: 'Newsletter name is required' });
    }

    return { success: errors.length === 0, errors };
  },

  basicValidateStep2(data) {
    const errors = [];

    if (!data.platform) {
      errors.push({ field: 'platform', message: 'Please select a newsletter platform' });
    }
    if (!data.subscriberCount) {
      errors.push({ field: 'subscriberCount', message: 'Subscriber count is required' });
    }
    if (data.archiveLink && !this.basicUrlValidation(data.archiveLink)) {
      errors.push({ field: 'archiveLink', message: 'Please enter a valid URL' });
    }

    return { success: errors.length === 0, errors };
  },
};

// Initialize when DOM is ready or immediately if already ready
function initializeZodValidation() {
  const success = ZodValidation.init();
  if (success) {
    console.log('Zod validation initialized successfully');
  } else {
    console.warn('Using basic validation fallbacks');
  }
}

// Try to initialize immediately
function tryInitialize() {
  if (typeof z !== 'undefined') {
    initializeZodValidation();
  } else {
    console.warn('Zod not available, using basic validation fallbacks');
    // Still initialize with basic validation
    ZodValidation.init();
  }
}

// Try multiple times to initialize
tryInitialize();
document.addEventListener('DOMContentLoaded', tryInitialize);

// Also try after a delay in case Zod loads async
setTimeout(tryInitialize, 1000);

// Make available globally
window.ZodValidation = ZodValidation;

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZodValidation;
}
