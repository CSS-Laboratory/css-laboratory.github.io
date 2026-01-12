// Data Loader Script for CSS Lab Website
// Loads homepage content from generated JSON files

document.addEventListener('DOMContentLoaded', function() {
  loadAboutContent();
  loadResearchFocusContent();
  loadLatestNewsContent();
});

// Load about section content from JSON
async function loadAboutContent() {
  const aboutSection = document.getElementById('about-content');
  if (!aboutSection) return;

  try {
    const response = await fetch('_generated/homepage.json');
    if (!response.ok) {
      throw new Error(`Failed to load homepage data: ${response.status}`);
    }

    const data = await response.json();
    aboutSection.innerHTML = '';

    if (!data || data.length === 0) {
      aboutSection.innerHTML = '<p>No content available.</p>';
      return;
    }

    // Get the first (about) item
    const about = data[0];

    if (about.title) {
      const heading = document.createElement('h2');
      heading.textContent = about.title;
      aboutSection.appendChild(heading);
    }

    if (about.content) {
      // Split content into paragraphs
      const paragraphs = about.content.split('\n\n');
      paragraphs.forEach(text => {
        if (text.trim()) {
          const paragraph = document.createElement('p');
          paragraph.textContent = text.trim();
          aboutSection.appendChild(paragraph);
        }
      });
    }

  } catch (error) {
    console.error('Error loading about content:', error);
    aboutSection.innerHTML = '<p>Error loading content. Please try again later.</p>';
  }
}

// Load research focus content from JSON
async function loadResearchFocusContent() {
  const researchAreas = document.getElementById('research-areas');
  if (!researchAreas) return;

  try {
    const response = await fetch('_generated/research.json');
    if (!response.ok) {
      throw new Error(`Failed to load research data: ${response.status}`);
    }

    const data = await response.json();
    researchAreas.innerHTML = '';

    if (!data || data.length === 0) {
      researchAreas.innerHTML = '<p>No research areas available.</p>';
      return;
    }

    data.forEach(project => {
      if (!project.title || !project.title.trim()) return;

      const areaDiv = document.createElement('div');
      areaDiv.className = 'research-area';
      areaDiv.style.cursor = 'pointer';

      areaDiv.addEventListener('click', function() {
        window.location.href = 'research.html#' + (project.anchor || '');
      });

      // Icon
      const icon = document.createElement('i');
      icon.className = project.icon || 'fas fa-flask';
      areaDiv.appendChild(icon);

      // Title
      const title = document.createElement('h3');
      title.textContent = project.title;
      areaDiv.appendChild(title);

      // Description
      const description = document.createElement('p');
      description.textContent = project.description || '';
      areaDiv.appendChild(description);

      researchAreas.appendChild(areaDiv);
    });

  } catch (error) {
    console.error('Error loading research focus content:', error);
    researchAreas.innerHTML = '<p>Error loading content. Please try again later.</p>';
  }
}

// Load latest news content from JSON
async function loadLatestNewsContent() {
  const newsItems = document.getElementById('news-items');
  if (!newsItems) return;

  try {
    const response = await fetch('_generated/news.json');
    if (!response.ok) {
      throw new Error(`Failed to load news data: ${response.status}`);
    }

    const data = await response.json();
    newsItems.innerHTML = '';

    if (!data || data.length === 0) {
      newsItems.innerHTML = '<p>No news items available.</p>';
      return;
    }

    data.forEach(item => {
      if (!item.title || !item.title.trim()) return;

      const newsDiv = document.createElement('div');
      newsDiv.className = 'news-item';

      // Date - format nicely
      const dateDiv = document.createElement('div');
      dateDiv.className = 'news-date';
      if (item.date) {
        const dateObj = new Date(item.date);
        dateDiv.textContent = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        dateDiv.textContent = 'No date';
      }
      newsDiv.appendChild(dateDiv);

      // Title
      const title = document.createElement('h3');
      title.textContent = item.title;
      newsDiv.appendChild(title);

      // Description
      const description = document.createElement('p');
      description.textContent = item.description || '';
      newsDiv.appendChild(description);

      // Read more link
      const readMore = document.createElement('a');
      readMore.className = 'read-more';
      readMore.href = item.read_more_link || '#';
      readMore.textContent = 'Read More';
      newsDiv.appendChild(readMore);

      newsItems.appendChild(newsDiv);
    });

  } catch (error) {
    console.error('Error loading news content:', error);
    newsItems.innerHTML = '<p>Error loading content. Please try again later.</p>';
  }
}
