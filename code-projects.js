(async function loadProjects() {
  const container = document.getElementById('project-grid');
  const username = 'trajanh';

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!response.ok) {
      throw new Error('Unable to load projects.');
    }

    const repos = await response.json();
    const visibleRepos = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .slice(0, 12);

    if (visibleRepos.length === 0) {
      container.innerHTML = '<p>No public repositories found yet.</p>';
      return;
    }

    container.innerHTML = visibleRepos
      .map((repo) => {
        const description = repo.description || 'No description provided.';
        const language = repo.language || 'Unknown';
        const stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;

        return `
          <article class="c-project-card">
            <h2><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h2>
            <p>${description}</p>
            <p class="c-project-card__meta">${language} • ${stars} stars</p>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    container.innerHTML = '<p>Could not load GitHub projects right now.</p>';
  }
})();
