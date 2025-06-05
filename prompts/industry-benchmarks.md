# Industry Benchmarks Prompt

Generate industry benchmark comparisons to help the user understand their performance relative to industry standards.

<user_data>
- Subscriber Count: {subscriberCount}
- Open Rate: {openRate}
- Click Rate: {clickRate}
- Monthly Revenue: {monthlyRevenue}
- Platform: {platform}
</user_data>

<industry_benchmarks>
- **Open Rates**: Overall 42.35%, Excellent 55%+, Good 45%+, Okay 40%+, Poor <30%
- **Click Rates**: Overall 2.00%, Excellent 7-10%, Good 3-4%, Okay 2-3%, Poor 1-2%
- **Unsubscribe Rates**: Good 0.08-0.22%, Industry Average 0.15-0.22%
- **Revenue per Subscriber**: Varies by niche, typically $1-10/month for successful newsletters
</industry_benchmarks>

<instructions>
1. Present key industry benchmarks in a clear table format using the <industry_benchmarks>
2. If user provided open rate and click rate data, compare their performance to benchmarks
3. Help user understand where they should be performing
4. Provide context for what good performance looks like
5. Include actionable insights based on benchmarks
6. Focus on helping them understand what good performance looks like and how to achieve it
7. DO NOT calculate or mention conversion rates or other metrics not provided by the user
8. Only compare metrics that the user has actually provided
</instructions>

<output_format>
Return only the HTML content using this exact structure:
```html
<div class="audit-section">
    <h2>📊 Industry Benchmarks</h2>
    <p>Here's how your newsletter should perform compared to industry standards:</p>
    
    <table class="benchmark-table">
        <thead>
            <tr>
                <th>Metric</th>
                <th>Industry Average</th>
                <th>Good Performance</th>
                <th>Excellent Performance</th>
                [If user provided data, add: <th>Your Performance</th>]
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Open Rate</td>
                <td>42.35%</td>
                <td class="metric-good">45%+</td>
                <td class="metric-good">55%+</td>
                [If user provided open rate: <td class="[metric-good/metric-warning/metric-poor based on performance]">{openRate}</td>]
            </tr>
            <tr>
                <td>Click Rate</td>
                <td>2.00%</td>
                <td class="metric-good">3-4%</td>
                <td class="metric-good">7-10%</td>
                [If user provided click rate: <td class="[metric-good/metric-warning/metric-poor based on performance]">{clickRate}</td>]
            </tr>
            <tr>
                <td>Unsubscribe Rate</td>
                <td>0.15-0.22%</td>
                <td class="metric-good">0.08-0.22%</td>
                <td class="metric-good"><0.08%</td>
                [No user data for this metric]
            </tr>
        </tbody>
    </table>
    
    <p>[Analysis of what these benchmarks mean for their newsletter and specific recommendations for improvement based on their actual performance if provided]</p>
</div>
```
</output_format> 