(async function loadPost() {
  const titleNode = document.getElementById('post-title');
  const dateNode = document.getElementById('post-date');
  const bodyNode = document.getElementById('post-body');

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const isAbsoluteUrl = (value) => /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('#');
  const resolveRelativeUrl = (rawUrl, basePath) => {
    try {
      return new URL(rawUrl, new URL(basePath, window.location.origin)).toString();
    } catch (error) {
      return rawUrl;
    }
  };
  const rewriteRelativeAssetUrls = (html, basePath) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    wrapper.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (!src || isAbsoluteUrl(src)) {
        return;
      }
      img.setAttribute('src', resolveRelativeUrl(src, basePath));
    });

    wrapper.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      if (!href || isAbsoluteUrl(href)) {
        return;
      }
      anchor.setAttribute('href', resolveRelativeUrl(href, basePath));
    });

    return wrapper.innerHTML;
  };

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
    const basePath = post.path;

    if (post.format === 'html') {
      bodyNode.innerHTML = rewriteRelativeAssetUrls(rawContent, basePath);
    } else {
      bodyNode.innerHTML = rewriteRelativeAssetUrls(marked.parse(rawContent), basePath);
    }

    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      await window.MathJax.typesetPromise([bodyNode]);
    }
  } catch (error) {
    titleNode.textContent = 'Post unavailable';
    bodyNode.innerHTML = '<p>Could not load this post right now.</p>';
  }
})();
