(async function loadPosts() {
  const container = document.getElementById('blog-posts');

  try {
    const response = await fetch('/blog/posts.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load blog index.');
    }

    const posts = await response.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<li>No posts yet.</li>';
      return;
    }

    container.innerHTML = posts
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((post) => {
        const safeDate = post.date || '';
        const safeTitle = post.title || 'Untitled post';
        const safeDescription = post.description || '';
        const safeSlug = encodeURIComponent(post.slug || '');

        return `
          <li class="c-post-list__item">
            <h2><a href="/blog/post/?slug=${safeSlug}">${safeTitle}</a></h2>
            <p class="c-post-list__meta">${safeDate}</p>
            <p>${safeDescription}</p>
          </li>
        `;
      })
      .join('');
  } catch (error) {
    container.innerHTML = '<li>Could not load posts right now.</li>';
  }
})();
