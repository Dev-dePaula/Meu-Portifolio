/* ============================================================
   ANDERSON DE PAULA — PORTFOLIO — dashboard.js
   Dashboard de projetos conectado à API pública do GitHub
   ============================================================ */

const GITHUB_USER = 'Dev-dePaula';

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('repoList');
  const detailEl = document.getElementById('repoDetail');
  const countEl = document.getElementById('repoCount');
  if (!listEl || !detailEl) return;

  init();

  async function init() {
    try {
      const repos = await fetchRepos();
      renderList(repos);
      if (repos.length) selectRepo(repos[0], listEl.querySelectorAll('.dash-repo-btn')[0]);
    } catch (err) {
      listEl.innerHTML = `<div class="dash-empty">Não foi possível carregar os repositórios agora.<br>${escapeHtml(err.message)}</div>`;
    }
  }

  async function fetchRepos() {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100&type=owner`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Limite de requisições da API pública do GitHub atingido. Tente novamente em alguns minutos.');
      if (res.status === 404) throw new Error(`Usuário "${GITHUB_USER}" não encontrado no GitHub.`);
      throw new Error(`O GitHub respondeu com o status ${res.status}.`);
    }
    const data = await res.json();
    return data.filter(r => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  }

  function renderList(repos) {
    if (countEl) countEl.textContent = repos.length;

    if (!repos.length) {
      listEl.innerHTML = '<div class="dash-empty">Nenhum repositório público encontrado.</div>';
      return;
    }

    listEl.innerHTML = '';
    repos.forEach(repo => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dash-repo-btn';
      btn.innerHTML = `
        <span class="dash-repo-name">${escapeHtml(repo.name)}</span>
        <span class="dash-repo-lang">${escapeHtml(repo.language || '—')}</span>
      `;
      btn.addEventListener('click', () => selectRepo(repo, btn));
      listEl.appendChild(btn);
    });
  }

  function selectRepo(repo, btnEl) {
    listEl.querySelectorAll('.dash-repo-btn').forEach(b => b.classList.remove('is-active'));
    if (btnEl) btnEl.classList.add('is-active');

    detailEl.innerHTML = renderDetailShell(repo);
    loadReadme(repo);
  }

  function renderDetailShell(repo) {
    const updated = repo.pushed_at
      ? new Date(repo.pushed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
    const topics = (repo.topics || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const homepage = repo.homepage && /^https?:\/\//.test(repo.homepage) ? repo.homepage : null;

    return `
      <div class="dash-detail-head">
        <div>
          <h2>${escapeHtml(repo.name)}</h2>
          <p class="dash-detail-desc">${escapeHtml(repo.description || 'Sem descrição no repositório.')}</p>
        </div>
        <div class="dash-detail-links">
          <a href="${escapeAttr(repo.html_url)}" target="_blank" rel="noopener" class="btn btn-ghost">Ver no GitHub</a>
          ${homepage ? `<a href="${escapeAttr(homepage)}" target="_blank" rel="noopener" class="btn btn-primary">Ver projeto ao vivo</a>` : ''}
        </div>
      </div>

      <div class="dash-stats">
        <div><b>${repo.stargazers_count}</b><span>STARS</span></div>
        <div><b>${repo.forks_count}</b><span>FORKS</span></div>
        <div><b>${escapeHtml(repo.language || '—')}</b><span>LINGUAGEM</span></div>
        <div><b>${updated}</b><span>ÚLTIMO PUSH</span></div>
      </div>

      ${topics ? `<div class="project-tags dash-topics">${topics}</div>` : ''}

      ${homepage ? `
      <div class="dash-preview">
        <div class="dash-preview-label">Preview ao vivo</div>
        <div class="dash-iframe-wrap">
          <iframe src="${escapeAttr(homepage)}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        </div>
        <div class="dash-preview-note">Se a prévia não carregar, o site provavelmente bloqueia incorporação em iframe — use “Ver projeto ao vivo”.</div>
      </div>` : ''}

      <div class="dash-readme">
        <div class="dash-preview-label">README</div>
        <div class="dash-readme-body" id="readmeBody">Carregando README…</div>
      </div>
    `;
  }

  async function loadReadme(repo) {
    const el = document.getElementById('readmeBody');
    if (!el) return;
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/readme`, {
        headers: { Accept: 'application/vnd.github.html+json' }
      });
      if (!res.ok) {
        el.textContent = 'Este repositório não tem README.';
        return;
      }
      el.innerHTML = await res.text();
    } catch {
      el.textContent = 'Não foi possível carregar o README agora.';
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
});
