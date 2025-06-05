// Customer.io Tracking Module
const CustomerIOTracker = {
    // Generate a unique audit ID for grouping
    auditId: null,
    userId: null,

    // Initialize tracking with user identification
    identifyUser(userData) {
        if (window.cioAnalyticsUnavailable) {
            this.userId = userData.email; // Still set userId for internal tracking
            return;
        }
        
        if (!window.cioanalytics || Array.isArray(window.cioanalytics)) {
            this.userId = userData.email; // Still set userId for internal tracking
            return;
        }

        // Set userId as the user's email
        this.userId = userData.email;
        
        try {
            // Identify user with PII using correct syntax
            window.cioanalytics.identify(this.userId, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                createdAt: new Date().toISOString(),
                source: 'newsletter_audit_tool'
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
        if (window.cioAnalyticsUnavailable) {
            return;
        }
        
        if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
            return;
        }

        const eventName = `audit_step_${stepNumber}_completed`;
        const stepNames = {
            1: 'basic_info',
            2: 'newsletter_platform',
            3: 'social_team',
            4: 'revenue_monetization',
            5: 'tools_upload'
        };

        const trackData = {
            userId: this.userId,
            stepNumber: stepNumber,
            stepName: stepNames[stepNumber],
            completedAt: new Date().toISOString(),
            ...stepData
        };
        
        try {
            window.cioanalytics.track(eventName, trackData);
        } catch (error) {
            console.error('Customer.io track call failed:', error);
        }
    },

    // Track audit generation start
    trackAuditGenerationStart(formData) {
        if (window.cioAnalyticsUnavailable) {
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
                formData: this.sanitizeFormData(formData)
            });
        } catch (error) {
            console.error('Customer.io audit generation start tracking failed:', error);
        }
    },

    // Track audit completion and create group
    trackAuditCompletion(formData, auditContent) {
        if (window.cioAnalyticsUnavailable) {
            return;
        }
        
        if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId || !this.auditId) {
            return;
        }

        try {
            // Track completion event
            const completionData = {
                userId: this.userId,
                auditId: this.auditId,
                completedAt: new Date().toISOString(),
                success: true,
                formData: this.sanitizeFormData(formData)
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
                group_type: "134178211",
                
                // User information
                user_first_name: formData.firstName,
                user_last_name: formData.lastName,
                user_email: formData.email,
                
                // Newsletter data
                platform: formData.platform,
                subscriber_count: formData.customSubscriberCount || formData.subscriberCount,
                open_rate: formData.openRate,
                click_rate: formData.clickRate,
                monthly_revenue: formData.customMonthlyRevenue || formData.monthlyRevenue,
                monetization_methods: Array.isArray(formData.monetizationMethods) ? formData.monetizationMethods.join(', ') : '',
                
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
                audit_generation_type: auditContent ? 'ai_generated' : 'fallback_template'
            };

            window.cioanalytics.group(groupId, groupData);
        } catch (error) {
            console.error('Customer.io audit completion tracking failed:', error);
        }
    },

    // Track audit download
    trackAuditDownload() {
        if (window.cioAnalyticsUnavailable) {
            return;
        }
        
        if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId || !this.auditId) {
            return;
        }

        try {
            window.cioanalytics.track('audit_downloaded', {
                userId: this.userId,
                auditId: this.auditId,
                downloadedAt: new Date().toISOString(),
                downloadType: 'pdf'
            });
        } catch (error) {
            console.error('Customer.io audit download tracking failed:', error);
        }
    },

    // Track form abandonment
    trackFormAbandonment(currentStep, formData) {
        if (window.cioAnalyticsUnavailable) {
            return;
        }
        
        if (!window.cioanalytics || Array.isArray(window.cioanalytics) || !this.userId) {
            return;
        }

        try {
            window.cioanalytics.track('audit_form_abandoned', {
                userId: this.userId,
                abandonedAt: new Date().toISOString(),
                currentStep: currentStep,
                totalSteps: 5,
                completionPercentage: (currentStep / 5) * 100,
                partialData: this.sanitizeFormData(formData)
            });
        } catch (error) {
            console.error('Customer.io form abandonment tracking failed:', error);
        }
    },

    // Sanitize form data for tracking (remove sensitive info if needed)
    sanitizeFormData(formData) {
        const sanitized = { ...formData };
        
        // Remove file uploads and other sensitive data
        delete sanitized.newsletterUpload;
        
        return sanitized;
    },

    // Track page visibility changes for abandonment detection
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
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerIOTracker;
} else {
    window.CustomerIOTracker = CustomerIOTracker;
} 