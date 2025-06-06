# 🚀 Newsletter Growth Audit Tool

## Overview
A comprehensive, AI-powered newsletter growth audit tool that analyzes newsletters across 9 key areas and provides personalized recommendations. Built with a modular component architecture and enterprise-grade features including Customer.io tracking, ChiliPiper integration, and intelligent lead qualification.

## 🌐 Live Deployments
- **Primary**: [https://newsletter-growth-audit-tool.vercel.app/](https://newsletter-growth-audit-tool.vercel.app/)
- **GitHub Pages**: [https://ejwhite7.github.io/newsletter-growth-audit-tool/](https://ejwhite7.github.io/newsletter-growth-audit-tool/)

## ✨ Key Features

### 🎯 Intelligent Lead Qualification
- **Enterprise Detection**: Automatically identifies newsletters with 100,000+ subscribers
- **ChiliPiper Integration**: Shows booking widget for high-value prospects
- **Customer.io Tracking**: Comprehensive user behavior and engagement analytics

### 📊 Comprehensive Analysis
- **9 Audit Areas**: Platform analysis, metrics evaluation, social strategy, monetization assessment
- **AI-Powered Insights**: Claude API integration with fallback to template-based reports
- **Personalized Recommendations**: Tailored growth strategies based on subscriber tier

### 🎨 Modern User Experience
- **5-Step Progressive Form**: Optimized user journey with step timing tracking
- **Responsive Design**: Mobile-first approach with beautiful, accessible UI
- **Real-time Validation**: Smart form validation with field interaction tracking
- **Progress Visualization**: Clear progress indicators and completion tracking

### 📈 Advanced Analytics
- **Social Media Analysis**: Platform-specific insights and following categorization
- **Engagement Scoring**: 100-point engagement assessment system
- **Migration Likelihood**: Platform switching probability analysis
- **Behavioral Tracking**: Field interactions, step timing, and user patterns

## 🏗️ Project Structure

```
growth-audit/
├── app.js                      # Main application logic
├── style.css                   # Comprehensive styling system
├── embed.html                  # Embed code generator
├── api/
│   └── generate-audit.js       # Anthropic API proxy
├── components/                 # Modular UI components
│   ├── header.html            # Main header
│   ├── progress-bar.html      # Progress visualization
│   ├── step1-basic-info.html  # Basic information collection
│   ├── step2-newsletter-platform.html  # Platform & metrics
│   ├── step3-social-team.html # Social media & team size
│   ├── step4-revenue-monetization.html # Revenue & monetization
│   ├── step5-tools-upload.html # Tools & additional info
│   └── audit-report.html      # Audit results display
├── js/                        # Modular JavaScript architecture
│   ├── component-loader.js    # Dynamic component loading
│   ├── step-manager.js        # Form navigation & timing
│   ├── progress-manager.js    # Progress tracking
│   ├── form-validator.js      # Form validation
│   ├── data-collector.js      # Data management
│   ├── customer-io-tracker.js # Analytics & tracking
│   └── audit-generator.js     # AI audit generation
└── prompts/                   # AI prompt templates
    ├── welcome.md
    ├── newsletter-overview.md
    ├── segment-analysis.md
    └── [additional prompts...]
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Anthropic API key (optional - falls back to template)
- Customer.io account (optional - tracking works without it)

### Installation
1. **Clone and install**:
   ```bash
   git clone https://github.com/ejwhite7/newsletter-growth-audit-tool.git
   cd newsletter-growth-audit-tool
   npm install
   ```

2. **Environment setup**:
   ```bash
   # Create .env file
   echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
   ```

3. **Start development**:
   ```bash
   npm start
   # Opens at http://localhost:3001
   ```

### Quick Deploy to Vercel
```bash
vercel --prod
```

## 🎛️ Configuration

### Customer.io Integration
Replace the tracking ID in your HTML:
```html
<script type="text/javascript">
    var _cio = _cio || [];
    (function() {
        var a,b,c;
        // ... existing code ...
        a.setAttribute('data-site-id', 'YOUR_SITE_ID_HERE');
        // ... existing code ...
    })();
</script>
```

### ChiliPiper Configuration
Update the ChiliPiper settings in `js/audit-generator.js`:
```javascript
// ChiliPiper configuration
const CHILIPIPER_CONFIG = {
    account: 'your-account',
    router: 'your-router'
};
```

### Platform Customization
Add new newsletter platforms in `components/step2-newsletter-platform.html`:
```html
<option value="YourPlatform">Your Platform</option>
```

## 📊 Analytics & Tracking

### Customer.io Events Tracked
- **User Journey**: Page views, step completion, form abandonment
- **Social Media**: Platform selections, following ranges, channel management
- **Engagement**: Field interactions, time spent, completion rates
- **Business Intelligence**: Subscriber tiers, revenue ranges, migration likelihood

### Event Categories
- `audit_step_completed` - Form step progression
- `social_media_analysis` - Social platform insights
- `engagement_pattern` - User behavior scoring
- `platform_migration_analysis` - Switching probability
- `field_interaction` - Detailed form interactions
- `chilipiper_interaction` - Enterprise booking tracking

## 🎨 Embedding

Use the built-in embed generator at `/embed.html` or use these quick options:

### Basic Iframe
```html
<iframe 
    src="https://newsletter-growth-audit-tool.vercel.app/" 
    style="width: 100%; height: 800px; border: none; border-radius: 8px;"
    title="Newsletter Growth Audit Tool">
</iframe>
```

### With Tracking Parameters
```html
<iframe 
    src="https://newsletter-growth-audit-tool.vercel.app/?utm_source=website&utm_campaign=audit" 
    style="width: 100%; height: 800px; border: none; border-radius: 8px;"
    title="Newsletter Growth Audit Tool">
</iframe>
```

## 🔧 Development

### Adding a New Step
1. Create component: `components/step6-new-feature.html`
2. Update step manager: Add to `StepManager.stepComponents`
3. Add data collection: Update `DataCollector.collectStepData`
4. Update total steps: Modify `StepManager.totalSteps`

### Customizing AI Prompts
Edit files in `/prompts/` directory:
```markdown
# prompts/custom-section.md
Analyze the newsletter for {specific_criteria} considering:
- Subscriber count: {subscriberCount}
- Platform: {platform}
- [additional context...]
```

### Adding Tracking Events
```javascript
// In customer-io-tracker.js
trackCustomEvent(data) {
    if (window.cioanalytics) {
        window.cioanalytics.track('custom_event', {
            userId: this.userId,
            ...data
        });
    }
}
```

## 📈 Performance & SEO

- **Loading Strategy**: Components loaded on-demand
- **Caching**: Static assets cached with appropriate headers
- **Analytics**: Non-blocking tracking implementation
- **Accessibility**: WCAG 2.1 compliant form structure
- **Mobile Optimization**: Touch-friendly interfaces

## 🛠️ API Integration

### Anthropic Claude API
- **Endpoint**: `/api/generate-audit`
- **Fallback**: Template-based generation
- **Timeout**: 120 seconds
- **Error Handling**: Graceful degradation

### Customer.io Analytics
- **Site ID**: Configurable in HTML
- **Events**: 15+ tracked user actions
- **Privacy**: GDPR compliant implementation

## 🚀 Deployment

### Vercel (Recommended)
```json
{
  "functions": {
    "api/generate-audit.js": {
      "maxDuration": 120
    }
  }
}
```

### Other Platforms
- **Netlify**: Deploy with `/api` functions
- **GitHub Pages**: Static version (no AI generation)
- **Custom Server**: Node.js with Express

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Contact**: support@beehiiv.com for enterprise inquiries

---

**Built with ❤️ for the newsletter community** 