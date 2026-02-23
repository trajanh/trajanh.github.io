(async function loadPost() {
  const titleNode = document.getElementById('post-title');
  const dateNode = document.getElementById('post-date');
  const bodyNode = document.getElementById('post-body');

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    titleNode.textContent = 'Post not found';
    bodyNode.innerHTML = '<p>Missing post slug.</p>';
    return;
  }

  try {
    const indexResponse = await fetch('/blog/posts.json', { cache: 'no-store' });
    if (!indexResponse.ok) {
      throw new Error('Could not load posts index.');
    }

    const posts = await indexResponse.json();
    const post = posts.find((item) => item.slug === slug);

    if (!post) {
      titleNode.textContent = 'Post not found';
      bodyNode.innerHTML = '<p>No post matches this URL.</p>';
      return;
    }

    titleNode.textContent = post.title || 'Untitled post';
    dateNode.textContent = post.date || '';
    document.title = `Trajan Hammonds — ${post.title || 'Blog Post'}`;

    const postResponse = await fetch(post.path, { cache: 'no-store' });
    if (!postResponse.ok) {
      throw new Error('Could not load post content.');
    }

    const rawContent = await postResponse.text();

    if (post.format === 'html') {
      bodyNode.innerHTML = rawContent;
    } else {
      bodyNode.innerHTML = marked.parse(rawContent);
    }

    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      await window.MathJax.typesetPromise([bodyNode]);
    }
  } catch (error) {
    titleNode.textContent = 'Post unavailable';
    bodyNode.innerHTML = '<p>Could not load this post right now.</p>';
  }
})();
