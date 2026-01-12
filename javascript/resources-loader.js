// Resources Loader Script for CSS Lab Website
// Loads datasets and tools from generated JSON

document.addEventListener('DOMContentLoaded', function() {
    const datasetsContainer = document.getElementById('datasets-container');
    const toolsContainer = document.getElementById('tools-container');

    if (!datasetsContainer || !toolsContainer) {
        console.error('Resource containers not found on the page.');
        return;
    }

    function createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = 'resource-card';

        const imageHtml = resource.image
            ? `<img src="${resource.image}" alt="${resource.name}" class="resource-icon">`
            : '<div class="resource-icon-placeholder"></div>';

        let detailsHtml = '<ul class="details-list">';

        // Details are already an array of {key, value} objects from JSON
        if (resource.details && Array.isArray(resource.details)) {
            resource.details.forEach(detail => {
                if (detail.key && detail.value) {
                    detailsHtml += `<li><strong>${detail.key}:</strong> ${detail.value}</li>`;
                }
            });
        }

        // Add source if it exists
        if (resource.source && resource.source.trim() !== '') {
            detailsHtml += `<li><strong>Source:</strong> ${resource.source}</li>`;
        }
        detailsHtml += '</ul>';

        card.innerHTML = `
            <div class="card-header">
                ${imageHtml}
                <h3>${resource.name}</h3>
            </div>
            <div class="card-body">
                ${detailsHtml}
            </div>
            <div class="card-footer">
                <a href="${resource.link || '#'}" class="btn-details" target="_blank" rel="noopener noreferrer">Access This Resource/Contact Us</a>
            </div>
        `;
        return card;
    }

    async function loadResources() {
        try {
            const response = await fetch('_generated/resources.json');
            if (!response.ok) {
                throw new Error(`Failed to load resources: ${response.status}`);
            }

            const resources = await response.json();

            // Resources are already grouped by type: { dataset: [...], tool: [...] }
            if (resources.dataset && Array.isArray(resources.dataset)) {
                resources.dataset.forEach(resource => {
                    const cardElement = createResourceCard(resource);
                    datasetsContainer.appendChild(cardElement);
                });
            }

            if (resources.tool && Array.isArray(resources.tool)) {
                resources.tool.forEach(resource => {
                    const cardElement = createResourceCard(resource);
                    toolsContainer.appendChild(cardElement);
                });
            }

            // Handle empty states
            if (!resources.dataset || resources.dataset.length === 0) {
                datasetsContainer.innerHTML = '<p>No datasets available yet.</p>';
            }
            if (!resources.tool || resources.tool.length === 0) {
                toolsContainer.innerHTML = '<p>No tools available yet.</p>';
            }

        } catch (error) {
            console.error('Error loading resources:', error);
            datasetsContainer.innerHTML = '<p>Could not load resource information. Please try again later.</p>';
            toolsContainer.innerHTML = '<p>Could not load resource information. Please try again later.</p>';
        }
    }

    loadResources();
});
