document.addEventListener('DOMContentLoaded', function() {
    const dataPath = '_generated/blog.json';
    const postsContainer = document.getElementById('blog-posts-container');

    if (!postsContainer) {
        console.error('Blog posts container not found on the page.');
        return;
    }

    async function fetchBlogPosts() {
        try {
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`Failed to load blog data: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            postsContainer.innerHTML = '<p>Could not load blog posts. Please try again later.</p>';
            return null;
        }
    }

    function createPostCard(post) {
        const card = document.createElement('article');
        card.className = 'blog-card';

        // Tags are already an array from JSON
        const tags = post.tags && Array.isArray(post.tags)
            ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        // Format date for display
        const displayDate = post.date ? new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';

        card.innerHTML = `
            <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="card-link">
                <img src="${post.image}" alt="${post.title}" class="card-image">
                <div class="card-content">
                    <p class="card-date">${displayDate}</p>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-description">${post.description}</p>
                </div>
            </a>
            <div class="card-footer">
                <div class="card-tags">${tags}</div>
                <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        return card;
    }

    async function loadBlog() {
        const posts = await fetchBlogPosts();
        if (posts && posts.length > 0) {
            // Posts are already sorted by date (desc) from build script
            posts.forEach(post => {
                const card = createPostCard(post);
                postsContainer.appendChild(card);
            });
        } else if (posts && posts.length === 0) {
            postsContainer.innerHTML = '<p>No blog posts available yet.</p>';
        }
    }

    loadBlog();
});
