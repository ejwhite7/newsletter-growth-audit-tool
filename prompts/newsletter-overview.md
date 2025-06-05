# Newsletter Overview Section Prompt

Generate the newsletter overview metrics section with key performance indicators.

<user_data>
- Subscriber Count: {subscriberCount}
- Platform: {platform}
- Open Rate: {openRate}
- Click Rate: {clickRate}
- Monthly Revenue: {monthlyRevenue}
- Team Size: {teamSize}
</user_data>

<instructions>
Create a metrics overview section that displays the key stats in a grid format. Include analysis of what these numbers mean for their newsletter stage.

Focus on providing context for what these numbers mean in the newsletter industry.

IMPORTANT: Only use the actual data provided. DO NOT calculate or mention conversion rates, subscriber-to-paid ratios, or any other metrics not explicitly provided in the user data.
</instructions>

<output_format>
Return only the HTML content using this exact structure:
```html
<div class="audit-section">
    <h2>📊 Newsletter Overview</h2>
    <div class="audit-grid">
        <div class="audit-metric">
            <h4>Subscriber Count</h4>
            <p class="metric-value">{subscriberCount}</p>
        </div>
        <div class="audit-metric">
            <h4>Platform</h4>
            <p class="metric-value">{platform}</p>
        </div>
        <div class="audit-metric">
            <h4>Monthly Revenue</h4>
            <p class="metric-value">${monthlyRevenue}</p>
        </div>
        <div class="audit-metric">
            <h4>Team Size</h4>
            <p class="metric-value">{teamSize}</p>
        </div>
    </div>
    [If open rate and click rate are provided, add this grid:]
    <div class="audit-grid">
        <div class="audit-metric">
            <h4>Open Rate</h4>
            <p class="metric-value">{openRate}</p>
        </div>
        <div class="audit-metric">
            <h4>Click Rate</h4>
            <p class="metric-value">{clickRate}</p>
        </div>
    </div>
    <p>[Brief analysis of what these metrics indicate about their newsletter's current state and potential - use only the provided data, do not calculate additional metrics]</p>
</div>
```
</output_format> 