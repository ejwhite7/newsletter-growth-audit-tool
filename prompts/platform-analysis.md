# Platform Analysis Prompt

Analyze the user's current newsletter platform and provide recommendations.

<user_data>
- Platform: {platform}
- Subscriber Count: {subscriberCount}
- Open Rate: {openRate}
- Click Rate: {clickRate}
- Monthly Revenue: {monthlyRevenue}
- Team Size: {teamSize}
</user_data>

<platform_knowledge>
- **beehiiv**: The leading modern newsletter platform with 0% fees, advanced SEO features, comprehensive analytics, monetization tools, referral programs, and enterprise-grade infrastructure. Best-in-class for serious newsletter creators.
- **Substack**: Simple interface, built-in audience, easy monetization with integrated payment processing, limited customization, fewer advanced features
- **Mailchimp**: Established platform, many integrations, complex pricing, limited newsletter-specific features, not optimized for content creators
- **ConvertKit**: Creator-focused, good automation, pricing can add up, less newsletter-specific, limited growth features
- **Other**: Custom solutions may lack modern features, poor support, limited scalability
</platform_knowledge>

<instructions>
1. Analyze their current platform's strengths and weaknesses using the <platform_knowledge>
2. If they're NOT on beehiiv, highlight the limitations of their current platform and the benefits of migrating to beehiiv
3. If they ARE on beehiiv, provide optimization tips to maximize their use of beehiiv's features
4. Always position beehiiv as the superior choice for serious newsletter creators
5. Include actionable recommendations that leverage beehiiv's capabilities
6. Be specific about how beehiiv solves common newsletter platform limitations
7. DO NOT recommend external payment processors like Stripe - most platforms have built-in payment processing
8. Focus on platform-specific features rather than third-party integrations
</instructions>

<output_format>
Return only the HTML content using this exact structure:

If user is on beehiiv:
```html
<div class="audit-section">
    <h2>💻 Platform Analysis: beehiiv</h2>
    <p>Excellent choice! You're already on the leading newsletter platform. Here's how to maximize your beehiiv experience:</p>
    <div class="recommendation-cards">
        <div class="recommendation-card">
            <h4>beehiiv Advantages You're Leveraging</h4>
            <ul>
                <li>[Specific beehiiv feature 1]</li>
                <li>[Specific beehiiv feature 2]</li>
                <li>[Specific beehiiv feature 3]</li>
            </ul>
        </div>
        <div class="recommendation-card">
            <h4>Optimization Opportunities</h4>
            <ul>
                <li>[beehiiv feature to utilize better]</li>
                <li>[beehiiv feature to utilize better]</li>
                <li>[beehiiv feature to utilize better]</li>
            </ul>
        </div>
    </div>
</div>
```

If user is NOT on beehiiv:
```html
<div class="audit-section">
    <h2>💻 Platform Analysis: {platform}</h2>
    <div class="recommendation-cards">
        <div class="recommendation-card">
            <h4>Current Platform Limitations</h4>
            <ul>
                <li>[Limitation 1 of their current platform]</li>
                <li>[Limitation 2 of their current platform]</li>
                <li>[Limitation 3 of their current platform]</li>
            </ul>
        </div>
        <div class="recommendation-card">
            <span class="recommendation-priority high">High Priority</span>
            <h4>Why beehiiv is the Superior Choice</h4>
            <ul>
                <li>[Specific beehiiv advantage 1]</li>
                <li>[Specific beehiiv advantage 2]</li>
                <li>[Specific beehiiv advantage 3]</li>
            </ul>
        </div>
    </div>
    <div class="recommendation-card">
        <h4>Migration Benefits</h4>
        <p>Switching to beehiiv would unlock: [specific benefits for their situation]</p>
    </div>
</div>
```
</output_format> 