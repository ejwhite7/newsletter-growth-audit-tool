// Audit Generator Module
const AuditGenerator = {
    async generateAudit() {
        if (FormValidator.validateCurrentStep()) {
            DataCollector.collectStepData(StepManager.currentStep);
            const formData = DataCollector.getFormData();
            
            // Track audit generation start with Customer.io
            CustomerIOTracker.trackAuditGenerationStart(formData);
            
            // Show loading
            this.showLoading();
            
            try {
                // Generate audit using AI
                const auditContent = await this.generateAIAudit();
                this.hideLoading();
                
                // Track audit completion and create group with Customer.io
                CustomerIOTracker.trackAuditCompletion(formData, auditContent);
                
                // If AI generation failed, auditContent will be null
                // displayAuditReport will handle this and show the fallback template
                this.displayAuditReport(auditContent);
            } catch (error) {
                console.error('Error generating audit:', error);
                this.hideLoading();
                this.displayErrorMessage(error.message);
            }
        }
    },

    async generateAIAudit() {
        const formData = DataCollector.getFormData();
        
        // Try to generate AI audit, but fall back to template if it fails
        try {
            // Test if the API is available first
            const testResponse = await fetch('/api/generate-audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: "Test connection"
                })
            });
            
            if (!testResponse.ok) {
                throw new Error('API server not available');
            }
            
            // Define the sections to generate
            const sections = [
                'welcome',
                'newsletter-overview',
                'segment-analysis',
                'platform-analysis',
                'monetization-analysis',
                'growth-recommendations',
                'tools-optimization',
                'industry-benchmarks',
                'action-plan'
            ];
            
            // Generate each section
            const sectionContents = [];
            
            for (const section of sections) {
                try {
                    const content = await this.generateSection(section, formData);
                    sectionContents.push(content);
                } catch (error) {
                    console.error(`Error generating section ${section}:`, error);
                    // Continue with other sections even if one fails
                }
            }
            
            // If we got some content, combine it
            if (sectionContents.length > 0) {
                const fullAudit = sectionContents.join('\n\n');
                const ctaSection = this.generateCTASection(formData);
                return fullAudit + '\n\n' + ctaSection;
            } else {
                throw new Error('No sections generated successfully');
            }
            
        } catch (error) {
            console.error('AI audit generation failed, using fallback:', error);
            // Return null to trigger fallback template
            return null;
        }
    },

    async generateSection(sectionName, formData) {
        // Load the specific prompt for this section
        const promptTemplate = await this.loadPromptTemplate(`prompts/${sectionName}.md`);
        
        // Replace placeholders with actual data
        const prompt = this.populatePrompt(promptTemplate, formData);
        
        // Call Anthropic API for this section
        const sectionContent = await this.callAnthropicAPI(prompt);
        
        return sectionContent;
    },

    async loadPromptTemplate(promptPath = 'prompts/audit.md') {
        try {
            const response = await fetch(promptPath);
            const template = await response.text();
            return template;
        } catch (error) {
            throw new Error(`Failed to load prompt template: ${promptPath}`);
        }
    },

    populatePrompt(template, formData) {
        let prompt = template;
        
        // Determine actual subscriber count (use custom if provided)
        const actualSubscriberCount = formData.customSubscriberCount || formData.subscriberCount;
        
        // Determine actual monthly revenue (use custom if provided)
        const actualMonthlyRevenue = formData.customMonthlyRevenue || formData.monthlyRevenue;
        
        // Replace all placeholders with actual data
        const replacements = {
            firstName: formData.firstName || 'User',
            lastName: formData.lastName || '',
            email: formData.email || 'Not provided',
            platform: formData.platform || 'Not specified',
            subscriberCount: actualSubscriberCount || 'Not specified',
            openRate: formData.openRate || 'Not provided',
            clickRate: formData.clickRate || 'Not provided',
            archiveLink: formData.archiveLink || 'Not provided',
            twitterHandle: formData.twitterHandle || 'Not provided',
            linkedinHandle: formData.linkedinHandle || 'Not provided',
            instagramHandle: formData.instagramHandle || 'Not provided',
            tiktokHandle: formData.tiktokHandle || 'Not provided',
            teamSize: formData.teamSize || 'Not specified',
            monthlyRevenue: actualMonthlyRevenue || 'Not specified',
            monetizationMethods: Array.isArray(formData.monetizationMethods) 
                ? formData.monetizationMethods.join(', ') 
                : 'Not specified',
            additionalTools: formData.additionalTools || 'Not specified'
        };

        // Replace placeholders in the template
        Object.keys(replacements).forEach(key => {
            const placeholder = `{${key}}`;
            prompt = prompt.replace(new RegExp(placeholder, 'g'), replacements[key]);
        });

        return prompt;
    },

    async callAnthropicAPI(prompt) {
        // Use the proxy server to make API calls
        const response = await fetch('/api/generate-audit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        
        // Clean up the response to remove code blocks and unwanted formatting
        let content = data.content;
        
        // Remove ```html and ``` markers
        content = content.replace(/```html\s*/g, '');
        content = content.replace(/```\s*/g, '');
        
        // Remove any remaining markdown code block indicators
        content = content.replace(/^```.*$/gm, '');
        
        return content;
    },

    generateCTASection(formData) {
        const segment = this.determineSubscriberSegment(formData.subscriberCount || formData.customSubscriberCount);
        const isOnBeehiiv = formData.platform && formData.platform.toLowerCase() === 'beehiiv';
        
        let ctaTitle, ctaMessage, ctaButton;
        
        if (isOnBeehiiv) {
            ctaTitle = "🚀 Maximize Your beehiiv Experience";
            if (segment === 'starter') {
                ctaMessage = "You're on the best platform with huge growth potential ahead. Let beehiiv's team help you unlock advanced growth strategies.";
            } else if (segment === 'growing') {
                ctaMessage = "You've built solid momentum on beehiiv - now let our experts help you scale strategically with advanced features.";
            } else if (segment === 'established') {
                ctaMessage = "Your newsletter is performing well on beehiiv - let our growth experts help you optimize for maximum impact.";
            } else {
                ctaMessage = "You've built an impressive newsletter empire on beehiiv - let our team help you take it to the next level.";
            }
            ctaButton = "Get Started";
        } else {
            ctaTitle = "🚀 Ready to Supercharge Your Growth?";
            ctaMessage = "This audit shows significant opportunities for growth. Join thousands of successful creators who've switched to beehiiv - the platform built specifically for newsletter growth.";
            ctaButton = "Get Started";
        }
        
        return `
            <div class="cta-section">
                <h3>${ctaTitle}</h3>
                <p>${ctaMessage}</p>
                <a href="https://app.beehiiv.com" target="_blank" class="btn">${ctaButton}</a>
            </div>
        `;
    },

    showLoading() {
        const formContainer = document.getElementById('formContainer');
        const progressContainer = document.getElementById('progressComponent');
        
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="card">
                    <div class="card__body">
                        <div class="loading">
                            <div class="loading-spinner"></div>
                        </div>
                        <h2 style="text-align: center; margin-top: 16px;">Generating Your Comprehensive Audit...</h2>
                        <p style="text-align: center; color: var(--color-text-secondary);">Analyzing your newsletter data across 9 key areas and creating personalized AI-powered recommendations. This is audit is 100% unique to you and may take up to 2 minutes to build.</p>
                    </div>
                </div>
            `;
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    },

    hideLoading() {
        const formContainer = document.getElementById('formContainer');
        const auditContainer = document.getElementById('auditContainer');
        
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
        if (auditContainer) {
            auditContainer.classList.remove('hidden');
        }
    },

    displayAuditReport(aiGeneratedContent = null) {
        const formData = DataCollector.getFormData();
        const auditContent = document.getElementById('auditContent');
        const auditDate = document.getElementById('auditDate');
        
        if (auditDate) {
            auditDate.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (auditContent) {
            if (aiGeneratedContent) {
                // Clean up AI-generated content before displaying
                let cleanContent = aiGeneratedContent;
                
                // Remove any remaining code block markers
                cleanContent = cleanContent.replace(/```html\s*/g, '');
                cleanContent = cleanContent.replace(/```\s*/g, '');
                cleanContent = cleanContent.replace(/^```.*$/gm, '');
                
                auditContent.innerHTML = cleanContent;
            } else {
                // Fallback to basic template
                auditContent.innerHTML = this.generateFallbackHTML(formData);
            }
        }
    },

    displayErrorMessage(errorMessage) {
        const formContainer = document.getElementById('formContainer');
        const progressContainer = document.getElementById('progressComponent');
        
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="card">
                    <div class="card__body">
                        <div class="error-message">
                            <h2>⚠️ Audit Generation Failed</h2>
                            <p><strong>Error:</strong> ${errorMessage}</p>
                            <p>Please try again or contact support if the issue persists.</p>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn--secondary" onclick="location.reload()">Try Again</button>
                            <button type="button" class="btn btn--primary" onclick="AuditGenerator.generateFallbackAudit()">Generate Basic Audit</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    },

    async generateFallbackAudit() {
        DataCollector.collectStepData(StepManager.currentStep);
        const formData = DataCollector.getFormData();
        
        // Track audit generation start with Customer.io
        CustomerIOTracker.trackAuditGenerationStart(formData);
        
        this.showLoading();
        
        // Simulate brief processing time for fallback
        setTimeout(() => {
            this.hideLoading();
            
            // Track audit completion and create group with Customer.io
            CustomerIOTracker.trackAuditCompletion(formData, null);
            
            this.displayAuditReport();
        }, 1000);
    },

    generateFallbackHTML(formData) {
        // Enhanced fallback template with more detailed analysis
        const segment = this.determineSubscriberSegment(formData.subscriberCount || formData.customSubscriberCount);
        const hasMonetization = formData.monetizationMethods && 
            formData.monetizationMethods.length > 0 && 
            !formData.monetizationMethods.includes('none');
        
        // Get actual values (custom or selected)
        const actualSubscriberCount = formData.customSubscriberCount || formData.subscriberCount;
        const actualMonthlyRevenue = formData.customMonthlyRevenue || formData.monthlyRevenue;
        
        return `
            <div class="audit-section">
                <h2>👋 Welcome, ${formData.firstName}!</h2>
                <p>Thank you for submitting your newsletter for analysis. Based on your ${actualSubscriberCount} subscribers and current setup, we've created a comprehensive growth audit tailored specifically for your newsletter.</p>
            </div>

            <div class="audit-section">
                <h2>📊 Newsletter Overview</h2>
                <div class="audit-grid">
                    <div class="audit-metric">
                        <h4>Subscriber Count</h4>
                        <p class="metric-value">${actualSubscriberCount}</p>
                    </div>
                    <div class="audit-metric">
                        <h4>Platform</h4>
                        <p class="metric-value">${formData.platform}</p>
                    </div>
                    <div class="audit-metric">
                        <h4>Monthly Revenue</h4>
                        <p class="metric-value">$${actualMonthlyRevenue}</p>
                    </div>
                    <div class="audit-metric">
                        <h4>Team Size</h4>
                        <p class="metric-value">${formData.teamSize}</p>
                    </div>
                </div>
                ${formData.openRate ? `
                <div class="audit-grid">
                    <div class="audit-metric">
                        <h4>Open Rate</h4>
                        <p class="metric-value">${formData.openRate}</p>
                    </div>
                    <div class="audit-metric">
                        <h4>Click Rate</h4>
                        <p class="metric-value">${formData.clickRate}</p>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="audit-section">
                <h2>🎯 Your Newsletter Segment</h2>
                <p>Based on your subscriber count, you're in the <strong>${segment}</strong> category.</p>
                ${this.getSegmentRecommendations(segment)}
            </div>

            <div class="audit-section">
                <h2>💰 Monetization Analysis</h2>
                ${hasMonetization ? 
                    `<p>Current methods: ${formData.monetizationMethods.join(', ')}</p>` :
                    `<p>No monetization methods currently implemented.</p>`
                }
                ${this.getMonetizationRecommendations(segment, hasMonetization)}
            </div>

            <div class="audit-section">
                <h2>📈 Growth Recommendations</h2>
                ${this.getGrowthRecommendations(formData, segment)}
            </div>

            <div class="audit-section">
                <h2>🎯 Next Steps</h2>
                ${this.getActionPlan(segment)}
            </div>

            <div class="cta-section">
                <h3>🚀 Ready to Accelerate Your Growth?</h3>
                <p>This audit provides a foundation for your newsletter growth strategy. For personalized guidance and advanced strategies, consider working with a newsletter growth expert.</p>
                <a href="https://app.beehiiv.com" target="_blank" class="btn">Get Started</a>
            </div>
        `;
    },

    determineSubscriberSegment(subscriberCount) {
        if (!subscriberCount) return 'starter';
        
        // Handle custom numeric input
        if (!isNaN(subscriberCount)) {
            const count = parseInt(subscriberCount);
            if (count < 2500) return 'starter';
            if (count < 10000) return 'growing';
            if (count < 100000) return 'established';
            return 'enterprise';
        }
        
        // Handle range selections
        const count = subscriberCount.toLowerCase();
        if (count.includes('0-100') || count.includes('100-500') || count.includes('500-1000') || count.includes('1000-2500')) {
            return 'starter';
        } else if (count.includes('2500-5000') || count.includes('5000-10000')) {
            return 'growing';
        } else if (count.includes('10000-25000') || count.includes('25000-50000') || count.includes('50000-100000')) {
            return 'established';
        } else {
            return 'enterprise';
        }
    },

    getSegmentRecommendations(segment) {
        const recommendations = {
            starter: `
                <div class="recommendation-card">
                    <h4>Focus Areas for Starters</h4>
                    <ul>
                        <li>Establish consistent publishing schedule</li>
                        <li>Build organic growth through social media</li>
                        <li>Create valuable lead magnets</li>
                        <li>Focus on audience engagement</li>
                    </ul>
                </div>`,
            growing: `
                <div class="recommendation-card">
                    <h4>Growth Stage Priorities</h4>
                    <ul>
                        <li>Implement monetization strategies</li>
                        <li>Scale content production</li>
                        <li>Optimize conversion funnels</li>
                        <li>Explore paid acquisition</li>
                    </ul>
                </div>`,
            established: `
                <div class="recommendation-card">
                    <h4>Established Newsletter Focus</h4>
                    <ul>
                        <li>Optimize revenue per subscriber</li>
                        <li>Build strategic partnerships</li>
                        <li>Develop premium offerings</li>
                        <li>Consider team expansion</li>
                    </ul>
                </div>`,
            enterprise: `
                <div class="recommendation-card">
                    <h4>Enterprise-Level Strategy</h4>
                    <ul>
                        <li>Focus on enterprise sales</li>
                        <li>Build dedicated sales team</li>
                        <li>Explore acquisition opportunities</li>
                        <li>Develop multiple revenue streams</li>
                    </ul>
                </div>`
        };
        
        return recommendations[segment] || recommendations.starter;
    },

    getMonetizationRecommendations(segment, hasMonetization) {
        if (!hasMonetization) {
            return `
                <div class="recommendation-card">
                    <span class="recommendation-priority high">High Priority</span>
                    <h4>Implement Monetization</h4>
                    <p>You're missing significant revenue opportunities. Consider starting with:</p>
                    <ul>
                        <li>Premium subscriptions ($5-15/month)</li>
                        <li>Affiliate marketing</li>
                        <li>Sponsored content</li>
                        <li>Digital product sales</li>
                    </ul>
                </div>`;
        }
        
        return `
            <div class="recommendation-card">
                <h4>Optimize Current Monetization</h4>
                <p>Focus on improving conversion rates and exploring additional revenue streams.</p>
            </div>`;
    },

    getGrowthRecommendations(formData, segment) {
        const hasSocial = formData.twitterHandle || formData.linkedinHandle || 
                         formData.instagramHandle || formData.tiktokHandle;
        
        let recommendations = '';
        
        if (!hasSocial) {
            recommendations += `
                <div class="recommendation-card">
                    <span class="recommendation-priority high">High Priority</span>
                    <h4>Establish Social Media Presence</h4>
                    <p>You're missing major growth opportunities. Start with Twitter and LinkedIn for newsletter promotion.</p>
                </div>`;
        }
        
        recommendations += `
            <div class="recommendation-card">
                <h4>Growth Tactics for Your Stage</h4>
                <ul>
                    <li>Create SEO-optimized landing pages</li>
                    <li>Develop referral programs</li>
                    <li>Guest post on relevant platforms</li>
                    <li>Cross-promote with other newsletters</li>
                </ul>
            </div>`;
        
        return recommendations;
    },

    getActionPlan(segment) {
        return `
            <div class="action-plan">
                <h3>30-Day Action Plan</h3>
                <ol class="action-steps">
                    <li><span class="step-number">1</span>Audit current content performance and identify top-performing topics</li>
                    <li><span class="step-number">2</span>Set up basic analytics and tracking systems</li>
                    <li><span class="step-number">3</span>Create or optimize your newsletter landing page</li>
                    <li><span class="step-number">4</span>Develop a content calendar for the next month</li>
                    <li><span class="step-number">5</span>Implement one new growth tactic from recommendations</li>
                </ol>
            </div>`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditGenerator;
} else {
    window.AuditGenerator = AuditGenerator;
} 