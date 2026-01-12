// Research Loader Script for CSS Lab Website
// Loads research projects and publications from generated JSON

// --- Lightbox Functions ---
function openLightbox(imageSrc, imageAlt) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  if (lightbox && lightboxImage) {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt || "Enlarged research image";
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadResearchProjects();
  loadPublications();

  // Lightbox setup
  const lightbox = document.getElementById('lightbox');
  const lightboxCloseButton = document.querySelector('.lightbox-close');

  if (lightbox && lightboxCloseButton) {
    lightboxCloseButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Handle hash navigation
  setTimeout(function() {
    if (window.location.hash) {
      const targetElement = document.getElementById(window.location.hash.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetElement.classList.add('highlight-project');
        setTimeout(() => targetElement.classList.remove('highlight-project'), 2000);
      }
    }
  }, 1000);
});

// Load research projects from JSON
async function loadResearchProjects() {
  const projectsContainer = document.getElementById('research-projects-container');
  if (!projectsContainer) {
    console.warn("Element with ID 'research-projects-container' not found.");
    return;
  }

  try {
    const response = await fetch('_generated/research.json');
    if (!response.ok) {
      throw new Error(`Failed to load research data: ${response.status}`);
    }

    const projects = await response.json();
    projectsContainer.innerHTML = '';

    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML = '<p>No research projects available.</p>';
      return;
    }

    projects.forEach((project, index) => {
      if (!project.title || !project.title.trim()) return;

      const projectDiv = document.createElement('div');
      projectDiv.className = 'research-project';
      projectDiv.id = project.anchor || 'project-' + index;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'project-content';

      const textDiv = document.createElement('div');
      textDiv.className = 'project-text';

      // Title with icon
      const titleDiv = document.createElement('h3');
      titleDiv.className = 'project-title';
      if (project.icon) {
        const icon = document.createElement('i');
        icon.className = project.icon;
        icon.style.marginRight = '10px';
        titleDiv.appendChild(icon);
      }
      titleDiv.appendChild(document.createTextNode(project.title));
      textDiv.appendChild(titleDiv);

      // Description - use content (body) if available, otherwise use description
      const descriptionText = project.content || project.detailed_description || project.description || '';
      if (descriptionText) {
        const descriptionElement = document.createElement('div');
        descriptionElement.innerHTML = descriptionText;
        textDiv.appendChild(descriptionElement);
      }

      // Team members - already an array
      if (project.team_members && project.team_members.length > 0) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team-members';
        project.team_members.forEach(member => {
          if (member) {
            const span = document.createElement('span');
            span.textContent = member;
            teamDiv.appendChild(span);
          }
        });
        textDiv.appendChild(teamDiv);
      }

      // Tags - already an array
      if (project.tags && project.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'project-tags';
        project.tags.forEach(tag => {
          if (tag) {
            const span = document.createElement('span');
            span.textContent = tag;
            tagsDiv.appendChild(span);
          }
        });
        textDiv.appendChild(tagsDiv);
      }

      // Read more link
      if (project.read_more_link && project.read_more_link.trim() !== '#') {
        const readMoreLink = document.createElement('a');
        readMoreLink.className = 'read-paper-btn';
        readMoreLink.href = project.read_more_link;
        readMoreLink.target = '_blank';
        readMoreLink.innerHTML = 'Learn More <i class="fas fa-arrow-right"></i>';
        textDiv.appendChild(readMoreLink);
      }

      contentDiv.appendChild(textDiv);

      // Project image
      if (project.image && project.image.trim() !== '') {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'project-image';

        const imgElement = document.createElement('img');
        let imageSrc = project.image.trim();

        if (imageSrc.match(/^(https?:\/\/|\/|\.\/)/)) {
          imgElement.src = imageSrc;
        } else if (imageSrc.startsWith('images/')) {
          imgElement.src = imageSrc;
        } else {
          imgElement.src = 'images/' + imageSrc;
        }
        imgElement.alt = project.title + ' Visualization';

        imgElement.addEventListener('click', function() {
          openLightbox(this.src, this.alt);
        });

        imageDiv.appendChild(imgElement);
        contentDiv.appendChild(imageDiv);
      }

      projectDiv.appendChild(contentDiv);
      projectsContainer.appendChild(projectDiv);
    });

  } catch (error) {
    console.error('Error loading research projects:', error);
    projectsContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
  }
}

// Load publications from JSON
async function loadPublications() {
  const publicationList = document.querySelector('.publication-list');
  if (!publicationList) {
    console.warn("Element with class '.publication-list' not found.");
    return;
  }

  try {
    const response = await fetch('_generated/publications.json');
    if (!response.ok) {
      throw new Error(`Failed to load publications: ${response.status}`);
    }

    const publications = await response.json();
    publicationList.innerHTML = '';

    if (!publications || publications.length === 0) {
      publicationList.innerHTML = '<p>No publications available.</p>';
      return;
    }

    publications.forEach(pub => {
      if (!pub.title || !pub.title.trim()) return;

      const publicationDiv = document.createElement('div');
      publicationDiv.className = 'publication-item';

      if (pub.research_area) {
        publicationDiv.setAttribute('data-research-area', pub.research_area);
      }

      // Title
      const titleElement = document.createElement('h3');
      titleElement.className = 'publication-title';

      if (pub.link && pub.link.trim() !== '#') {
        const titleLink = document.createElement('a');
        titleLink.href = pub.link;
        titleLink.target = '_blank';
        titleLink.textContent = pub.title;
        titleElement.appendChild(titleLink);
      } else {
        titleElement.textContent = pub.title;
      }
      publicationDiv.appendChild(titleElement);

      // Authors - format as string if array
      const authorsText = Array.isArray(pub.authors) ? pub.authors.join(', ') : (pub.authors || '');
      if (authorsText) {
        const authorsElement = document.createElement('div');
        authorsElement.className = 'publication-authors';
        authorsElement.textContent = authorsText;
        publicationDiv.appendChild(authorsElement);
      }

      // Journal and year
      const journalElement = document.createElement('div');
      journalElement.className = 'publication-journal';
      journalElement.textContent = pub.journal || '';

      if (pub.year) {
        const yearSpan = document.createElement('span');
        yearSpan.className = 'publication-year';
        yearSpan.textContent = " (" + pub.year + ")";
        journalElement.appendChild(yearSpan);
      }
      publicationDiv.appendChild(journalElement);

      publicationList.appendChild(publicationDiv);
    });

  } catch (error) {
    console.error('Error loading publications:', error);
    publicationList.innerHTML = '<p>Error loading publications. Please try again later.</p>';
  }
}
