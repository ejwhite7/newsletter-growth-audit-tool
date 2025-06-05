// Main Application Entry Point
// Import all modules (modules will self-register to window object)

// Global function bindings for onclick handlers
window.nextStep = () => StepManager.nextStep();
window.prevStep = () => StepManager.prevStep();
window.generateAudit = () => AuditGenerator.generateAudit();

// Custom input toggle functions
window.toggleCustomSubscriberInput = () => {
    const subscriberSelect = document.getElementById('subscriberCount');
    const customGroup = document.getElementById('customSubscriberGroup');
    const customInput = document.getElementById('customSubscriberCount');
    
    if (subscriberSelect && subscriberSelect.value === '100000+') {
        if (customGroup) customGroup.style.display = 'block';
        if (customInput) customInput.required = true;
    } else {
        if (customGroup) customGroup.style.display = 'none';
        if (customInput) {
            customInput.required = false;
            customInput.value = '';
        }
    }
};

window.toggleCustomRevenueInput = () => {
    const revenueSelect = document.getElementById('monthlyRevenue');
    const customGroup = document.getElementById('customRevenueGroup');
    const customInput = document.getElementById('customMonthlyRevenue');
    
    if (revenueSelect && revenueSelect.value === '10000+') {
        if (customGroup) customGroup.style.display = 'block';
        if (customInput) customInput.required = true;
    } else {
        if (customGroup) customGroup.style.display = 'none';
        if (customInput) {
            customInput.required = false;
            customInput.value = '';
        }
    }
};

// PDF Download functionality
window.downloadAudit = () => {
    // Track download with Customer.io
    CustomerIOTracker.trackAuditDownload();
    
    // Implement PDF download functionality
    const auditContent = document.getElementById('auditContent');
    const formData = DataCollector.getFormData();
    
    if (!auditContent) {
        alert('No audit content to download');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const auditDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Newsletter Growth Audit - ${formData.firstName} ${formData.lastName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1, h2, h3 { color: #2F39BA; }
                .audit-section { margin-bottom: 30px; page-break-inside: avoid; }
                .audit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0; }
                .audit-metric { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #000; }
                .metric-value { font-size: 24px; font-weight: bold; color: #2F39BA; margin: 8px 0 0 0; }
                .recommendation-card { background: #f8f9fa; border: 1px solid #000; border-radius: 8px; padding: 16px; margin: 16px 0; }
                .recommendation-priority { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .recommendation-priority.high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .cta-section { background: linear-gradient(135deg, #2F39BA, #252F95); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0; }
                .action-plan { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #000; }
                .action-steps { list-style: none; padding: 0; }
                .action-steps li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
                .step-number { background: #2F39BA; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
                ul { padding-left: 20px; }
                li { margin-bottom: 8px; }
                @media print { 
                    body { margin: 20px; } 
                    .cta-section { background: #21808d !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <h1>Newsletter Growth Audit</h1>
            <p><strong>Generated for:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Date:</strong> ${auditDate}</p>
            <hr>
            ${auditContent.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

// Restart audit functionality
window.restartAudit = () => {
    location.reload();
};

// Make AuditGenerator available globally for error handling
window.AuditGenerator = AuditGenerator;

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    if (window.cioanalytics) {
        // Test basic functionality
        try {
            window.cioanalytics.page();
        } catch (error) {
            console.error('Customer.io page() call failed:', error);
        }
    }
    
    // Initialize Customer.io abandonment tracking
    CustomerIOTracker.initializeAbandonmentTracking();
    
    // Load all static components
    await ComponentLoader.loadAllComponents();
    
    // Load the first step
    await StepManager.loadStep(1);
    
    // Initialize progress
    ProgressManager.updateProgress(1, StepManager.totalSteps);
}); 