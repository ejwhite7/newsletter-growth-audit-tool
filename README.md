# Newsletter Growth Audit Tool - Refactored Version

## Overview
This is a refactored version of the Newsletter Growth Audit Tool that breaks down the monolithic index.html file into modular, reusable components.

## Project Structure

```
growth-audit/
├── index.html         # New modular version
├── app.js            # Refactored modular JavaScript
├── style.css                    # Shared styles
├── components/                  # Component directory
│   ├── header.html             # Header component
│   ├── progress-bar.html       # Progress bar component
│   ├── step1-basic-info.html   # Step 1: Basic information form
│   ├── step2-newsletter-platform.html  # Step 2: Newsletter & platform details
│   ├── step3-social-team.html  # Step 3: Social media & team info
│   ├── step4-revenue-monetization.html # Step 4: Revenue & monetization
│   ├── step5-tools-upload.html # Step 5: Tools & file upload
│   └── audit-report.html       # Audit report display component
└── README.md                   # This file
```

## Key Improvements

### 1. Component-Based Architecture
- Each step of the form is now a separate HTML component
- Components are loaded dynamically as needed
- Easier to maintain and modify individual steps

### 2. Modular JavaScript
The JavaScript has been refactored into distinct modules:

- **ComponentLoader**: Handles loading HTML components dynamically
- **StepManager**: Manages form step navigation and loading
- **ProgressManager**: Updates progress bar and step indicators
- **FormValidator**: Handles form validation logic
- **DataCollector**: Collects and manages form data
- **AuditGenerator**: Generates the audit report

### 3. Benefits of Refactoring

1. **Maintainability**: Each component can be edited independently
2. **Reusability**: Components can be reused in other projects
3. **Scalability**: Easy to add new steps or modify existing ones
4. **Testing**: Individual modules can be tested in isolation
5. **Performance**: Components are loaded on-demand
6. **Organization**: Clear separation of concerns

## Setup

### Prerequisites
- Node.js (v14 or higher)
- Anthropic API key

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Create a .env file and add your API key
   echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
   ```

3. Configure Customer.io tracking (optional):
   - Get your write key from [Customer.io Settings](https://fly.customer.io/settings/api_credentials)
   - Replace `YOUR_CUSTOMERIO_WRITE_KEY_HERE` in `index.html` with your actual write key
   - If you don't have Customer.io, the app will work normally but tracking will be disabled

4. Start the server:
   ```bash
   npm start
   ```

## Usage

### Running the Application
1. Start the Node.js proxy server: `npm start`
2. Open `http://localhost:3001` in a web browser
3. The application will automatically load components as needed
4. Navigate through the form steps to generate an AI-powered audit

### AI-Powered Audit Generation
- The application uses Anthropic's Claude API to generate comprehensive, personalized newsletter growth audits
- If the API is unavailable, it falls back to a detailed template-based audit
- All prompts are stored in the `prompts/` directory for easy customization

### Adding a New Step
1. Create a new component file in the `components/` directory
2. Add the component path to `StepManager.stepComponents` in `app.js`
3. Update `StepManager.totalSteps`
4. Add a data collector method in `DataCollector`
5. Update the progress bar component if needed

### Modifying a Step
Simply edit the corresponding component file in the `components/` directory.

## Component Structure

Each step component follows this structure:
```html
<!-- Step X: Component Name -->
<div class="form-step" id="stepX">
    <div class="card">
        <div class="card__body">
            <h2>Step Title</h2>
            <p>Step description</p>
            
            <!-- Form fields -->
            
            <div class="form-actions">
                <!-- Navigation buttons -->
            </div>
        </div>
    </div>
</div>
```

## Notes

- The refactored version requires a web server to load components due to CORS restrictions
- Use a local development server (e.g., `python -m http.server` or Live Server in VS Code)
- All styling remains in the shared `style.css` file
- The original files are preserved for reference 