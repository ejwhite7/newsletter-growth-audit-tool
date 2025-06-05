# Newsletter Segment Analysis Prompt

Analyze the user's newsletter segment and provide targeted recommendations.

<user_data>
- Subscriber Count: {subscriberCount}
- Open Rate: {openRate}
- Click Rate: {clickRate}
- Monthly Revenue: {monthlyRevenue}
- Team Size: {teamSize}
- Platform: {platform}
</user_data>

<segment_categories>
- **Starter** (0-2,500 subscribers): Focus on growth fundamentals
- **Growing** (2,500-10,000 subscribers): Scale and monetize
- **Established** (10,000-100,000 subscribers): Optimize and expand
- **Enterprise** (100,000+ subscribers): Strategic partnerships and enterprise sales
</segment_categories>

<instructions>
1. Determine which segment the user belongs to based on subscriber count from the <segment_categories>
2. Provide specific focus areas for their segment
3. Include next steps tailored to their stage
4. Provide actionable, stage-appropriate recommendations
5. Use open rate and click rate data (if provided) to give engagement-specific advice for their segment
</instructions>

<output_format>
Return only the HTML content using this exact structure:
```html
<div class="audit-section">
    <h2>🎯 Your Newsletter Segment: [Subscriber Range]</h2>
    <p>Based on your subscriber count, you're in the <strong>[segment name]</strong> category. This means your primary focus should be on:</p>
    <div class="recommendation-card">
        <h4>Focus Areas for [Segment]</h4>
        <ul>
            <li>[Focus area 1]</li>
            <li>[Focus area 2]</li>
            <li>[Focus area 3]</li>
            <li>[Focus area 4]</li>
        </ul>
    </div>
    <p><strong>Next Steps:</strong> [Specific next steps for their segment, incorporating engagement data if available]</p>
</div>
```
</output_format> 