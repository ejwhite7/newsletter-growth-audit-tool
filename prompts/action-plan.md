# Personalized Action Plan Prompt

Create a specific, actionable 90-day plan tailored to the user's current situation and goals.

<user_data>
- Name: {firstName}
- Subscriber Count: {subscriberCount}
- Open Rate: {openRate}
- Click Rate: {clickRate}
- Platform: {platform}
- Monthly Revenue: {monthlyRevenue}
- Team Size: {teamSize}
- Monetization Methods: {monetizationMethods}
- Social Media: Twitter: {twitterHandle}, LinkedIn: {linkedinHandle}, Instagram: {instagramHandle}, TikTok: {tiktokHandle}
</user_data>

<instructions>
1. Create a 90-day action plan with specific, measurable goals based on the <user_data>
2. Break down into 30-day phases (Foundation, Growth, Optimization)
3. Prioritize actions based on potential impact for their current stage
4. Include specific metrics to track
5. Make recommendations realistic for their current stage
6. Make each action item specific, measurable, and achievable within the timeframe
7. Use open rate and click rate data (if provided) to include engagement improvement actions
8. Focus on platform-native features rather than external tools
9. Speak from a perspective of the growth team at beehiiv, using "We" rather and "I" when communicating with the user.
</instructions>

<output_format>
Return only the HTML content using this exact structure:
```html
<div class="audit-section">
    <h2>🎯 Personalized Action Plan</h2>
    
    <div class="action-plan">
        <h3>Your 90-Day Action Plan</h3>
        <p>Based on your current situation (subscriber count: {subscriberCount}), here's your structured roadmap:</p>
        
        <h4>📅 Phase 1: Days 1-30 (Foundation)</h4>
        <ol class="action-steps">
            <li><span class="step-number">1</span>[Specific action item with clear deliverable]</li>
            <li><span class="step-number">2</span>[Specific action item with clear deliverable]</li>
            <li><span class="step-number">3</span>[Specific action item with clear deliverable]</li>
            <li><span class="step-number">4</span>[Specific action item with clear deliverable]</li>
            <li><span class="step-number">5</span>[Specific action item with clear deliverable]</li>
        </ol>
        
        <h4>📈 Phase 2: Days 31-60 (Growth)</h4>
        <ol class="action-steps">
            <li><span class="step-number">1</span>[Specific action item focused on growth]</li>
            <li><span class="step-number">2</span>[Specific action item focused on growth]</li>
            <li><span class="step-number">3</span>[Specific action item focused on growth]</li>
            <li><span class="step-number">4</span>[Specific action item focused on growth]</li>
        </ol>
        
        <h4>🚀 Phase 3: Days 61-90 (Optimization)</h4>
        <ol class="action-steps">
            <li><span class="step-number">1</span>[Specific action item focused on optimization]</li>
            <li><span class="step-number">2</span>[Specific action item focused on optimization]</li>
            <li><span class="step-number">3</span>[Specific action item focused on optimization]</li>
        </ol>
        
        <h4>📊 Success Metrics to Track</h4>
        <ul>
            <li>[Specific metric 1 with target]</li>
            <li>[Specific metric 2 with target]</li>
            <li>[Specific metric 3 with target]</li>
            <li>[Specific metric 4 with target]</li>
        </ul>
    </div>
</div>
```
</output_format> 