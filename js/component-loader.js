// Component Loader Module
const ComponentLoader = {
  async loadComponent(componentPath, targetElementId) {
    try {
      const response = await fetch(componentPath);
      const html = await response.text();
      const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.innerHTML = html;
      }
      return true;
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
      return false;
    }
  },

  async loadAllComponents() {
    const components = [
      { path: 'components/header.html', target: 'headerComponent' },
      { path: 'components/progress-bar.html', target: 'progressComponent' },
      { path: 'components/audit-report.html', target: 'auditComponent' },
    ];

    const loadPromises = components.map(comp => this.loadComponent(comp.path, comp.target));

    await Promise.all(loadPromises);
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
} else {
  window.ComponentLoader = ComponentLoader;
}
