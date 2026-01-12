// Member Loader Script for CSS Lab Website
// This script loads team member information from generated JSON

document.addEventListener('DOMContentLoaded', function() {
  loadMembers();
  setupCategoryFilters();
});

// Category display names
const CATEGORY_TITLES = {
  faculty: 'Faculty',
  postdocs: 'Postdoctoral Researchers',
  graduate: 'Graduate Students',
  undergraduate: 'Undergraduate Students',
  collaborators: 'Collaborators',
  others: 'Other Members'
};

// Category order for display
const CATEGORY_ORDER = ['faculty', 'postdocs', 'graduate', 'undergraduate', 'collaborators', 'others'];

// Function to set up category filters
function setupCategoryFilters() {
  const categoryButtons = document.querySelectorAll('.category-button');

  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const category = this.getAttribute('data-category');
      const teamSections = document.querySelectorAll('.team-section-container');

      teamSections.forEach(section => {
        if (category === 'all' || section.getAttribute('data-category') === category) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}

// Function to load all members from JSON
async function loadMembers() {
  const container = document.querySelector('.team-section .container');
  if (!container) {
    console.warn('Team section container not found');
    return;
  }

  try {
    const response = await fetch('_generated/members.json');
    if (!response.ok) {
      throw new Error(`Failed to load members: ${response.status}`);
    }

    const membersData = await response.json();

    // Process each category in order
    CATEGORY_ORDER.forEach(category => {
      const members = membersData[category];
      if (members && members.length > 0) {
        renderMemberCategory(container, category, CATEGORY_TITLES[category] || category, members);
      }
    });

    // Handle any categories not in the predefined order
    Object.keys(membersData).forEach(category => {
      if (!CATEGORY_ORDER.includes(category)) {
        const members = membersData[category];
        if (members && members.length > 0) {
          renderMemberCategory(container, category, CATEGORY_TITLES[category] || category, members);
        }
      }
    });

  } catch (error) {
    console.error('Error loading members:', error);
    container.innerHTML = '<p>Error loading team members. Please try again later.</p>';
  }
}

// Function to render a category of members
function renderMemberCategory(container, category, titleText, members) {
  const sectionContainer = document.createElement('div');
  sectionContainer.className = 'team-section-container';
  sectionContainer.setAttribute('data-category', category);

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'team-section-title';
  sectionTitle.textContent = titleText;
  sectionContainer.appendChild(sectionTitle);

  const teamGrid = document.createElement('div');
  teamGrid.className = 'team-grid';
  teamGrid.id = `${category}-grid`;
  sectionContainer.appendChild(teamGrid);

  members.forEach(member => {
    if (!member.name || !member.name.trim()) return;

    const memberCard = createMemberCard(member, category);
    teamGrid.appendChild(memberCard);
  });

  container.appendChild(sectionContainer);
}

// Function to create a member card
function createMemberCard(member, category) {
  const memberCard = document.createElement('div');
  memberCard.className = 'team-member';
  memberCard.setAttribute('data-category', category);

  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'member-image';

  const image = document.createElement('img');
  if (member.image && member.image.trim() !== '') {
    if (member.image.match(/^(https?:\/\/|\/|\.\/)/)) {
      image.src = member.image;
    } else {
      image.src = 'images/' + member.image;
    }
    image.onerror = function() {
      this.src = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(member.name);
      this.alt = 'Placeholder for ' + member.name;
    };
  } else {
    image.src = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(member.name);
  }
  image.alt = member.name;
  imageContainer.appendChild(image);
  memberCard.appendChild(imageContainer);

  // Member info container
  const infoContainer = document.createElement('div');
  infoContainer.className = 'member-info';

  const nameElement = document.createElement('h3');
  nameElement.textContent = member.name;
  infoContainer.appendChild(nameElement);

  if (member.role) {
    const roleElement = document.createElement('p');
    roleElement.className = 'member-role';
    roleElement.textContent = member.role;
    infoContainer.appendChild(roleElement);
  }

  if (member.bio) {
    const bioElement = document.createElement('p');
    bioElement.className = 'member-bio';
    bioElement.innerHTML = member.bio;
    infoContainer.appendChild(bioElement);
  }

  // Social links
  const socialLinks = [];
  if (member.email) socialLinks.push({ href: member.email.includes('@') ? `mailto:${member.email}` : member.email, icon: 'fas fa-envelope', title: 'Email' });
  if (member.website) socialLinks.push({ href: member.website, icon: 'fas fa-globe', title: 'Website' });
  if (member.twitter) socialLinks.push({ href: member.twitter, icon: 'fab fa-twitter', title: 'Twitter' });
  if (member.linkedin) socialLinks.push({ href: member.linkedin, icon: 'fab fa-linkedin', title: 'LinkedIn' });
  if (member.github) socialLinks.push({ href: member.github, icon: 'fab fa-github', title: 'GitHub' });
  if (member.google_scholar) socialLinks.push({ href: member.google_scholar, icon: 'fab fa-google', title: 'Google Scholar' });

  if (socialLinks.length > 0) {
    const linksContainer = document.createElement('div');
    linksContainer.className = 'member-links';

    socialLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      if (!link.href.startsWith('mailto:')) {
        a.target = '_blank';
      }
      a.innerHTML = `<i class="${link.icon}"></i>`;
      a.title = link.title;
      linksContainer.appendChild(a);
    });

    infoContainer.appendChild(linksContainer);
  }

  memberCard.appendChild(infoContainer);
  return memberCard;
}
