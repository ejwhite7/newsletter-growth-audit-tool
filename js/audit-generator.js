// Audit Generator Module
/* eslint-disable no-console */
const AuditGenerator = {
  async generateAudit() {
    if (FormValidator.validateCurrentStep()) {
      const step5Data = DataCollector.collectStepData(StepManager.currentStep);
      const now = new Date();
      cioanalytics.track('Audit Step 5 Completed', step5Data, { timestamp: now });

      const formData = DataCollector.getFormData();
      cioanalytics.track('Audit Generation Started', formData, { timestamp: now });

      // Check if user has 100,000+ subscribers - show Chilipiper instead
      const actualSubscriberCount = formData.customSubscriberCount || formData.subscriberCount;
      if (this.shouldShowChilipiper(actualSubscriberCount)) {
        this.showChilipiperScheduling(formData);
        return;
      }

      // Show loading
      this.showLoading();

      try {
        // Generate audit using AI
        const auditContent = await this.generateAIAudit();
        this.hideLoading();

        cioanalytics.track(
          'Audit Generation Completed',
          {
            success: true,
            chili_piper_shown: this.shouldShowChilipiper(actualSubscriberCount),
          },
          { timestamp: new Date() }
        );

        // If AI generation failed, auditContent will be null
        // displayAuditReport will handle this and show the fallback template
        this.displayAuditReport(auditContent);
      } catch (error) {
        console.error('Error generating audit:', error);
        this.hideLoading();
        cioanalytics.track(
          'Audit Generation Completed',
          {
            success: false,
            error: error.message,
          },
          { timestamp: new Date() }
        );
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test connection',
        }),
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
        'action-plan',
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
        return `${fullAudit}\n\n${ctaSection}`;
      }
      throw new Error('No sections generated successfully');
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
    } catch (_error) {
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
      additionalTools: formData.additionalTools || 'Not specified',
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
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
    const segment = this.determineSubscriberSegment(
      formData.subscriberCount || formData.customSubscriberCount
    );
    const isOnBeehiiv = formData.platform && formData.platform.toLowerCase() === 'beehiiv';

    let ctaTitle;
    let ctaMessage;
    let ctaButton;

    if (isOnBeehiiv) {
      ctaTitle = '🚀 Maximize Your beehiiv Experience';
      if (segment === 'starter') {
        ctaMessage =
          "You're on the best platform with huge growth potential ahead. Let beehiiv's team help you unlock advanced growth strategies."; // eslint-disable-line quotes
      } else if (segment === 'growing') {
        ctaMessage =
          "You've built solid momentum on beehiiv - now let our experts help you scale strategically with advanced features."; // eslint-disable-line quotes
      } else if (segment === 'established') {
        ctaMessage =
          'Your newsletter is performing well on beehiiv - let our growth experts help you optimize for maximum impact.';
      } else {
        ctaMessage =
          "You've built an impressive newsletter empire on beehiiv - let our team help you take it to the next level."; // eslint-disable-line quotes
      }
      ctaButton = 'Get Started';
    } else {
      ctaTitle = '🚀 Ready to Supercharge Your Growth?';
      ctaMessage =
        "This audit shows significant opportunities for growth. Join thousands of successful creators who've switched to beehiiv - the platform built specifically for newsletter growth."; // eslint-disable-line quotes
      ctaButton = 'Get Started';
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
    // const _updateInterval = 100; // Update every 100ms for smooth animation

    const startTime = Date.now();
    let currentStep = 0;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const percentage = Math.floor(progress * 100);

      // Update circular progress
      const offset = circumference - progress * circumference;
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
    const auditComponent = document.getElementById('auditComponent');
    const auditContainer = document.getElementById('auditContainer');

    if (formContainer) {
      formContainer.classList.add('hidden');
    }

    // Show the audit component container
    if (auditComponent) {
      auditComponent.style.display = 'block';
    }

    // Show the audit container within the component
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
        day: 'numeric',
      });
    }

    if (auditContent) {
      let finalContent = '';

      if (aiGeneratedContent) {
        // Clean up AI-generated content before displaying
        let cleanContent = aiGeneratedContent;

        // Remove any remaining code block markers
        cleanContent = cleanContent.replace(/```html\s*/g, '');
        cleanContent = cleanContent.replace(/```\s*/g, '');
        cleanContent = cleanContent.replace(/^```.*$/gm, '');

        finalContent = cleanContent;
      } else {
        // Fallback to basic template
        finalContent = this.generateFallbackHTML(formData);
      }

      // Add table of contents and then the content
      auditContent.innerHTML = this.generateTableOfContents() + finalContent;

      // Add anchor IDs to section headers after content is loaded
      this.addAnchorIds();

      // Add tracking for beehiiv CTA
      const beehiivLink = auditContent.querySelector('a[href="https://app.beehiiv.com"]');
      if (beehiivLink) {
        beehiivLink.addEventListener('click', () => {
          cioanalytics.track('Clicked to beehiiv from Audit', {}, { timestamp: new Date() });
        });
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
    this.showLoading();

    // Simulate brief processing time for fallback
    setTimeout(() => {
      this.hideLoading();
      this.displayAuditReport();
    }, 1000);
  },

  generateFallbackHTML(formData) {
    // Enhanced fallback template with more detailed analysis
    const segment = this.determineSubscriberSegment(
      formData.subscriberCount || formData.customSubscriberCount
    );
    const hasMonetization =
      formData.monetizationMethods &&
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
                ${
                  formData.openRate && formData.openRate !== ''
                    ? `
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
                `
                    : ''
                }
            </div>

            <div class="audit-section">
                <h2>🎯 Your Newsletter Segment</h2>
                <p>Based on your subscriber count, you're in the <strong>${segment}</strong> category.</p>
                ${this.getSegmentRecommendations(segment)}
            </div>

            <div class="audit-section">
                <h2>💰 Monetization Analysis</h2>
                ${
                  hasMonetization
                    ? `<p>Current methods: ${formData.monetizationMethods.join(', ')}</p>`
                    : '<p>No monetization methods currently implemented.</p>'
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
    if (!Number.isNaN(subscriberCount)) {
      const count = Number.parseInt(subscriberCount);
      if (count < 2500) return 'starter';
      if (count < 10000) return 'growing';
      if (count < 100000) return 'established';
      return 'enterprise';
    }

    // Handle range selections
    const count = subscriberCount.toLowerCase();
    if (
      count.includes('0-100') ||
      count.includes('100-500') ||
      count.includes('500-1000') ||
      count.includes('1000-2500')
    ) {
      return 'starter';
    }
    if (count.includes('2500-5000') || count.includes('5000-10000')) {
      return 'growing';
    }
    if (
      count.includes('10000-25000') ||
      count.includes('25000-50000') ||
      count.includes('50000-60000') ||
      count.includes('60000-70000') ||
      count.includes('70000-80000') ||
      count.includes('80000-90000') ||
      count.includes('90000-100000')
    ) {
      return 'established';
    }
    return 'enterprise';
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
                </div>`,
    };

    return recommendations[segment] || recommendations.starter;
  },

  getMonetizationRecommendations(_segment, hasMonetization) {
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

  getGrowthRecommendations(formData, _segment) {
    const hasSocial =
      formData.twitterHandle ||
      formData.linkedinHandle ||
      formData.instagramHandle ||
      formData.tiktokHandle;

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

  getActionPlan(_segment) {
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
    if (!Number.isNaN(subscriberCount)) {
      const count = Number.parseInt(subscriberCount);
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
                <div class="card chilipiper-card">
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
  },

  loadChilipiperWidget(formData) {
    const container = document.getElementById('chilipiper-container');
    if (container) {
      // Helper function to escape HTML attributes
      const escapeHtml = text => {
        if (!text) return '';
        return text
          .toString()
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      // Create the Chilipiper container with hidden form and widget area
      container.innerHTML = `
                <!-- Hidden form for ChiliPiper to read from -->
                <form id="chilipiper-form" style="display: none;">
                    <input type="text" name="firstName" value="${escapeHtml(formData.firstName)}" />
                    <input type="text" name="lastName" value="${escapeHtml(formData.lastName)}" />
                    <input type="email" name="email" value="${escapeHtml(formData.email)}" />
                    <input type="text" name="subscribers" value="${escapeHtml(formData.customSubscriberCount || formData.subscriberCount)}" />
                    <input type="text" name="platform" value="${escapeHtml(formData.platform)}" />
                    <input type="text" name="name" value="${escapeHtml(formData.newsletterName)}" />
                    <input type="text" name="website" value="${escapeHtml(formData.archiveLink)}" />
                    <input type="text" name="source" value="newsletter_audit_tool_enterprise" />
                    <input type="text" name="monthlyRevenue" value="${escapeHtml(formData.customMonthlyRevenue || formData.monthlyRevenue)}" />
                    <input type="text" name="teamSize" value="${escapeHtml(formData.teamSize)}" />
                    <input type="text" name="openRate" value="${escapeHtml(formData.openRate)}" />
                    <input type="text" name="clickRate" value="${escapeHtml(formData.clickRate)}" />
                </form>
                
                <div id="chilipiper-booking-widget" style="
                    height: 650px; 
                    width: 100%; 
                    max-width: none;
                    border-radius: var(--radius-lg); 
                    background: var(--color-surface); 
                    border: 1px solid var(--color-border); 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: auto;
                    z-index: 1;
                ">
                    <div class="loading-chilipiper" style="text-align: center; padding: var(--space-32);">
                        <div class="loading-spinner" style="margin: 0 auto var(--space-16); width: 40px; height: 40px; border: 3px solid var(--color-secondary); border-top: 3px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="color: var(--color-text-secondary);">Loading scheduling widget...</p>
                    </div>
                </div>
            `;

      // Load and execute the Chilipiper script properly
      this.loadAndExecuteChilipiperScript(formData);
    }
  },

  loadAndExecuteChilipiperScript(formData) {
    // Check if script already exists to avoid duplicates
    const existingScript = document.getElementById('chilipiper-concierge');
    if (existingScript) {
      existingScript.remove();
    }

    // Remove previous style override if it exists
    const existingOverride = document.getElementById('chilipiper-style-override');
    if (existingOverride) {
      existingOverride.remove();
    }

    // Add a style override to fix the max-width issue from the global stylesheet
    const styleOverride = document.createElement('style');
    styleOverride.id = 'chilipiper-style-override';
    // This targets the iframe ChiliPiper creates to undo the aggressive max-width rule.
    styleOverride.innerHTML = `
      #chilipiper-booking-widget iframe {
        max-width: none !important;
      }
    `;
    document.head.appendChild(styleOverride);

    // Create script element
    const script = document.createElement('script');
    script.id = 'chilipiper-concierge';
    script.src = 'https://beehiiv.chilipiper.com/concierge-js/cjs/concierge.js';
    script.crossOrigin = 'anonymous';
    script.type = 'text/javascript';

    script.onload = () => {
      // Wait a bit for ChiliPiper to fully initialize
      setTimeout(() => {
        try {
          // Hide loading indicator
          const loadingElement = document.querySelector('.loading-chilipiper');
          if (loadingElement) {
            loadingElement.style.display = 'none';
          }

          // Deploy ChiliPiper with proper configuration
          if (window.ChiliPiper?.deploy) {
            window.ChiliPiper.deploy('beehiiv', 'inbound-router', {
              formType: 'HTML',
              formSelector: '#chilipiper-form',
              containerSelector: '#chilipiper-booking-widget',
            });
          } else {
            this.showChilipiperFallback(formData);
          }
        } catch (error) {
          console.error('Error deploying ChiliPiper:', error);
          this.showChilipiperFallback(formData);
        }
      }, 1000); // Wait 1 second for ChiliPiper to fully initialize
    };

    script.onerror = error => {
      console.error('Failed to load ChiliPiper script:', error);
      this.showChilipiperFallback(formData);
    };

    // Add script to head
    document.head.appendChild(script);
  },

  showChilipiperFallback(formData) {
    const container = document.getElementById('chilipiper-booking-widget');
    if (container) {
      container.innerHTML = `
                <div style="text-align: center; padding: var(--space-24);">
                    <h4 style="color: var(--color-primary); margin-bottom: var(--space-16);">📅 Schedule Your Strategy Session</h4>
                    <p style="margin-bottom: var(--space-16); color: var(--color-text-secondary);">
                        Click the button below to schedule your custom growth strategy session.
                    </p>
                    <div style="background: var(--color-secondary); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-16);">
                        <p style="margin: 0; font-weight: var(--font-weight-medium);">
                            User: ${formData.firstName} ${formData.lastName}<br>
                            Email: ${formData.email}<br>
                            Newsletter: ${formData.newsletterName}<br>
                            Subscribers: ${formData.customSubscriberCount || formData.subscriberCount}
                        </p>
                    </div>
                    <button id="chilipiper-submit-btn" class="btn btn--primary" style="margin-bottom: var(--space-12);">
                        Schedule Strategy Session
                    </button>
                    <br>
                    <a href="mailto:growth@beehiiv.com?subject=Enterprise%20Growth%20Strategy%20Session&body=Hi%20team,%0A%0AI%27d%20like%20to%20schedule%20a%20strategy%20session.%0A%0AName:%20${formData.firstName}%20${formData.lastName}%0AEmail:%20${formData.email}%0ANewsletter:%20${formData.newsletterName}%0ASubscribers:%20${formData.customSubscriberCount || formData.subscriberCount}%0APlatform:%20${formData.platform}%0A%0AThanks!" 
                       class="btn btn--secondary" style="font-size: var(--font-size-sm);">
                        Or Email Our Team
                    </a>
                </div>
            `;

      // Set up the submit button functionality
      this.setupChilipiperSubmitButton(formData);
    }
  },

  setupChilipiperSubmitButton(formData) {
    const submitBtn = document.getElementById('chilipiper-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        try {
          if (window.ChiliPiper?.submit) {
            window.ChiliPiper.submit('beehiiv', 'inbound-router', {
              trigger: 'ThirdPartyForm',
              lead: {
                firstname: formData.firstName || '',
                lastname: formData.lastName || '',
                subscribers: formData.customSubscriberCount || formData.subscriberCount || '',
                platform: formData.platform || '',
                name: formData.newsletterName || '',
                website: formData.archiveLink || '',
              },
            });
          } else {
            // If ChiliPiper is not available, fallback to email
            window.location.href = `mailto:growth@beehiiv.com?subject=Enterprise%20Growth%20Strategy%20Session&body=Hi%20team,%0A%0AI%27d%20like%20to%20schedule%20a%20strategy%20session.%0A%0AName:%20${formData.firstName}%20${formData.lastName}%0AEmail:%20${formData.email}%0ANewsletter:%20${formData.newsletterName}%0ASubscribers:%20${formData.customSubscriberCount || formData.subscriberCount}%0APlatform:%20${formData.platform}%0A%0AThanks!`;
          }
        } catch (error) {
          console.error('Error submitting to ChiliPiper:', error);
          // Fallback to email if ChiliPiper fails
          window.location.href = `mailto:growth@beehiiv.com?subject=Enterprise%20Growth%20Strategy%20Session&body=Hi%20team,%0A%0AI%27d%20like%20to%20schedule%20a%20strategy%20session.%0A%0AName:%20${formData.firstName}%20${formData.lastName}%0AEmail:%20${formData.email}%0ANewsletter:%20${formData.newsletterName}%0ASubscribers:%20${formData.customSubscriberCount || formData.subscriberCount}%0APlatform:%20${formData.platform}%0A%0AThanks!`;
        }
      });
    }
  },

  generateTableOfContents() {
    return `
            <div class="audit-section table-of-contents">
                <h2>📋 Table of Contents</h2>
                <div class="toc-list">
                    <ol class="toc-items">
                        <li><a href="#newsletter-overview" class="toc-link">📊 Newsletter Overview</a></li>
                        <li><a href="#newsletter-segment" class="toc-link">🎯 Your Newsletter Segment</a></li>
                        <li><a href="#platform-analysis" class="toc-link">🚀 Platform Analysis</a></li>
                        <li><a href="#monetization-analysis" class="toc-link">💰 Monetization Analysis</a></li>
                        <li><a href="#growth-recommendations" class="toc-link">📈 Growth Recommendations</a></li>
                        <li><a href="#tools-optimization" class="toc-link">🛠️ Tools & Optimization</a></li>
                        <li><a href="#industry-benchmarks" class="toc-link">📊 Industry Benchmarks</a></li>
                        <li><a href="#action-plan" class="toc-link">🎯 Action Plan</a></li>
                    </ol>
                </div>
                <p class="toc-note">Click any section to jump directly to that part of your audit.</p>
            </div>
        `;
  },

  addAnchorIds() {
    // Wait for content to be rendered, then add IDs to section headers
    setTimeout(() => {
      const auditSections = document.querySelectorAll('.audit-section h2');

      auditSections.forEach(header => {
        const text = header.textContent.toLowerCase();
        let anchorId = '';

        if (text.includes('newsletter overview')) {
          anchorId = 'newsletter-overview';
        } else if (
          text.includes('newsletter segment') ||
          text.includes('your newsletter segment')
        ) {
          anchorId = 'newsletter-segment';
        } else if (text.includes('platform analysis')) {
          anchorId = 'platform-analysis';
        } else if (text.includes('monetization analysis')) {
          anchorId = 'monetization-analysis';
        } else if (text.includes('growth recommendations')) {
          anchorId = 'growth-recommendations';
        } else if (text.includes('tools') && text.includes('optimization')) {
          anchorId = 'tools-optimization';
        } else if (text.includes('industry benchmarks')) {
          anchorId = 'industry-benchmarks';
        } else if (text.includes('action plan') || text.includes('next steps')) {
          anchorId = 'action-plan';
        }

        if (anchorId) {
          header.parentElement.id = anchorId;
        }
      });

      // Add smooth scrolling behavior
      document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        });
      });
    }, 100);
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditGenerator;
} else {
  window.AuditGenerator = AuditGenerator;
}
