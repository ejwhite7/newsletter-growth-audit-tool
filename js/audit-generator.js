// Audit Generator Module
const AuditGenerator = {
    async generateAudit() {
        if (FormValidator.validateCurrentStep()) {
            DataCollector.collectStepData(StepManager.currentStep);
            const formData = DataCollector.getFormData();
            
            // Check if user has 100,000+ subscribers - show Chilipiper instead
            const actualSubscriberCount = formData.customSubscriberCount || formData.subscriberCount;
            if (this.shouldShowChilipiper(actualSubscriberCount)) {
                this.showChilipiperScheduling(formData);
                return;
            }
            
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
                        <div class="audit-loading-container">
                            <div class="audit-progress-ring">
                                <svg class="progress-ring" width="120" height="120">
                                    <circle class="progress-ring-circle" 
                                            stroke="var(--color-primary)" 
                                            stroke-width="4" 
                                            fill="transparent" 
                                            r="52" 
                                            cx="60" 
                                            cy="60"
                                            stroke-dasharray="326.7256637168141"
                                            stroke-dashoffset="326.7256637168141"/>
                                </svg>
                                <div class="progress-percentage">0%</div>
                            </div>
                        </div>
                        <h2 style="text-align: center; margin-top: 24px;">Generating Your Comprehensive Audit...</h2>
                        <div class="loading-steps">
                            <div class="loading-step active" data-step="1">
                                <span class="step-icon">📊</span>
                                <span class="step-text">Analyzing newsletter metrics</span>
                            </div>
                            <div class="loading-step" data-step="2">
                                <span class="step-icon">🎯</span>
                                <span class="step-text">Identifying growth opportunities</span>
                            </div>
                            <div class="loading-step" data-step="3">
                                <span class="step-icon">💡</span>
                                <span class="step-text">Generating AI recommendations</span>
                            </div>
                            <div class="loading-step" data-step="4">
                                <span class="step-icon">📈</span>
                                <span class="step-text">Creating action plan</span>
                            </div>
                            <div class="loading-step" data-step="5">
                                <span class="step-icon">✨</span>
                                <span class="step-text">Finalizing your report</span>
                            </div>
                        </div>
                        <p style="text-align: center; color: var(--color-text-secondary); margin-top: 16px;">
                            Analyzing your newsletter data across 9 key areas and creating personalized recommendations.
                        </p>
                    </div>
                </div>
            `;
            
            // Start the loading animation
            this.startLoadingAnimation();
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    },

    startLoadingAnimation() {
        const circle = document.querySelector('.progress-ring-circle');
        const percentageEl = document.querySelector('.progress-percentage');
        const steps = document.querySelectorAll('.loading-step');
        
        if (!circle || !percentageEl) return;
        
        const circumference = 2 * Math.PI * 52; // radius = 52
        const duration = 120000; // 2 minutes in milliseconds
        const stepDuration = duration / 5; // Duration per step
        const updateInterval = 100; // Update every 100ms for smooth animation
        
        let startTime = Date.now();
        let currentStep = 0;
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const percentage = Math.floor(progress * 100);
            
            // Update circular progress
            const offset = circumference - (progress * circumference);
            circle.style.strokeDashoffset = offset;
            percentageEl.textContent = `${percentage}%`;
            
            // Update steps
            const newStep = Math.floor(elapsed / stepDuration);
            if (newStep !== currentStep && newStep < steps.length) {
                // Remove active from previous step
                if (steps[currentStep]) {
                    steps[currentStep].classList.remove('active');
                    steps[currentStep].classList.add('completed');
                }
                
                // Add active to current step
                if (steps[newStep]) {
                    steps[newStep].classList.add('active');
                }
                
                currentStep = newStep;
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                // Mark all steps as completed
                steps.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
            }
        };
        
        updateProgress();
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
                ${formData.openRate && formData.openRate !== '' ? `
                <div class="audit-grid">
                    <div class="audit-metric">
                        <h4>Open Rate</h4>
                        <p class="metric-value">${formData.openRate}</p>
                    </div>
                    <div class="audit-metric">
                        <h4>Click Rate</h4>
                        <p class="metric-value">${formData.clickRate || 'Not provided'}</p>
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
        } else if (count.includes('10000-25000') || count.includes('25000-50000') || count.includes('50000-60000') || count.includes('60000-70000') || count.includes('70000-80000') || count.includes('80000-90000') || count.includes('90000-100000')) {
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
    },

    shouldShowChilipiper(subscriberCount) {
        // Check if subscriber count indicates 100,000+ subscribers
        if (!subscriberCount) return false;
        
        // Handle custom numeric input
        if (!isNaN(subscriberCount)) {
            const count = parseInt(subscriberCount);
            return count >= 100000;
        }
        
        // Handle range selections
        const count = subscriberCount.toLowerCase();
        return count.includes('100000+');
    },

    showChilipiperScheduling(formData) {
        const formContainer = document.getElementById('formContainer');
        const progressContainer = document.getElementById('progressComponent');
        
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="card">
                    <div class="card__body" style="text-align: center; padding: var(--space-32);">
                        <h2>🚀 Premium Growth Strategy Session</h2>
                        <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--space-24);">
                            With 100,000+ subscribers, you've built something incredible! Our team will manually compile a custom growth strategy and review the results with you personally.
                        </p>
                        
                        <div style="background: var(--color-secondary); padding: var(--space-24); border-radius: var(--radius-lg); margin-bottom: var(--space-24);">
                            <h3 style="margin-bottom: var(--space-16);">What You'll Get:</h3>
                            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                                <li>Custom growth strategy analysis</li>
                                <li>Personalized optimization recommendations</li>
                                <li>Direct consultation with a growth expert</li>
                                <li>Advanced monetization strategies</li>
                                <li>Enterprise-level growth tactics</li>
                            </ul>
                        </div>
                        
                        <div id="chilipiper-container">
                            <!-- Chilipiper widget will be loaded here -->
                        </div>
                        
                        <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                            Book a time to review your custom growth strategy with one of our experts.
                        </p>
                    </div>
                </div>
            `;
            
            // Load Chilipiper widget
            this.loadChilipiperWidget(formData);
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        // Track enterprise user with Customer.io
        CustomerIOTracker.trackEnterpriseUser(formData);
    },

    loadChilipiperWidget(formData) {
        // For now, show a placeholder for the Chilipiper widget
        // In production, you would integrate with actual Chilipiper code
        const container = document.getElementById('chilipiper-container');
        if (container) {
            container.innerHTML = `
                <div style="border: 2px dashed var(--color-primary); padding: var(--space-24); border-radius: var(--radius-lg); background: rgba(var(--color-primary-rgb), 0.05);">
                    <h4 style="color: var(--color-primary); margin-bottom: var(--space-12);">📅 Schedule Your Strategy Session</h4>
                    <p style="margin-bottom: var(--space-16); color: var(--color-text-secondary);">
                        Chilipiper scheduling widget would be embedded here.<br>
                        User: ${formData.firstName} ${formData.lastName} (${formData.email})
                    </p>
                    <a href="https://calendly.com/your-booking-link" target="_blank" class="btn btn--primary">
                        Schedule Strategy Session
                    </a>
                </div>
            `;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditGenerator;
} else {
    window.AuditGenerator = AuditGenerator;
} 