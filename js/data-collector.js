// Data Collector Module
const DataCollector = {
    formData: {},

    collectStepData(stepNumber) {
        const collectors = {
            1: () => this.collectBasicInfo(),
            2: () => this.collectNewsletterDetails(),
            3: () => this.collectSocialTeam(),
            4: () => this.collectRevenueMonetization(),
            5: () => this.collectToolsUpload()
        };

        const collector = collectors[stepNumber];
        if (collector) {
            const stepData = collector();
            
            // Track step completion with Customer.io
            CustomerIOTracker.trackStepCompletion(stepNumber, stepData);
            
            return stepData;
        }
    },

    collectBasicInfo() {
        const stepData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || ''
        };
        
        // Update form data
        Object.assign(this.formData, stepData);
        
        // Identify user with Customer.io on first step
        CustomerIOTracker.identifyUser(stepData);
        
        return stepData;
    },

    collectNewsletterDetails() {
        const stepData = {
            platform: document.getElementById('platform')?.value || '',
            subscriberCount: document.getElementById('subscriberCount')?.value || '',
            customSubscriberCount: document.getElementById('customSubscriberCount')?.value || '',
            openRate: document.getElementById('openRate')?.value || '',
            clickRate: document.getElementById('clickRate')?.value || '',
            archiveLink: document.getElementById('archiveLink')?.value || ''
        };
        
        Object.assign(this.formData, stepData);
        return stepData;
    },

    collectSocialTeam() {
        const stepData = {
            twitterHandle: document.getElementById('twitterHandle')?.value || '',
            linkedinHandle: document.getElementById('linkedinHandle')?.value || '',
            instagramHandle: document.getElementById('instagramHandle')?.value || '',
            tiktokHandle: document.getElementById('tiktokHandle')?.value || '',
            teamSize: document.getElementById('teamSize')?.value || ''
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
            monetizationMethods: monetizationMethods
        };
        
        Object.assign(this.formData, stepData);
        return stepData;
    },

    collectToolsUpload() {
        const uploadInput = document.getElementById('newsletterUpload');
        const stepData = {
            additionalTools: document.getElementById('additionalTools')?.value || '',
            hasFileUpload: uploadInput && uploadInput.files.length > 0
        };
        
        if (uploadInput && uploadInput.files.length > 0) {
            this.formData.newsletterUpload = uploadInput.files[0];
        }
        
        Object.assign(this.formData, stepData);
        return stepData;
    },

    getFormData() {
        return this.formData;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCollector;
} else {
    window.DataCollector = DataCollector;
} 