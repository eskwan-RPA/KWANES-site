/* ============================================================
   KWANES-site — vanilla JS
   - mobile nav toggle
   - header shadow + active-section nav highlight on scroll
   - reveal-on-scroll
   - live GitHub repos feed
   ============================================================ */

(() => {
  "use strict";

  const GITHUB_USER = "eskwan-RPA";

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Active section highlight ---------- */
  const navLinks = Array.from(document.querySelectorAll(".nav__menu a"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- GitHub repos feed ---------- */
  const grid = document.getElementById("repos-grid");
  if (!grid) return;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const setStatus = (html) => {
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = `<p class="repos__status">${html}</p>`;
  };

  const showSkeletons = (n = 6) => {
    grid.innerHTML = Array.from({ length: n })
      .map(
        () => `
        <article class="card repo repo--skeleton" aria-hidden="true">
          <div class="skeleton-bar" style="width:55%"></div>
          <div class="skeleton-bar" style="width:90%;margin-top:.9rem"></div>
          <div class="skeleton-bar" style="width:70%;margin-top:.5rem"></div>
          <div class="skeleton-bar" style="width:40%;margin-top:1.2rem"></div>
        </article>`
      )
      .join("");
  };

  const repoCard = (repo) => {
    const name = escapeHtml(repo.name);
    const desc = repo.description
      ? escapeHtml(repo.description)
      : "<em>No description provided.</em>";
    const lang = repo.language
      ? `<span><span class="repo__dot"></span>${escapeHtml(repo.language)}</span>`
      : "";
    const stars =
      repo.stargazers_count > 0
        ? `<span>★ ${repo.stargazers_count}</span>`
        : "";
    return `
      <article class="card repo">
        <div class="repo__head">
          <h3 class="repo__name">${name}</h3>
        </div>
        <p class="repo__desc">${desc}</p>
        <div class="repo__meta">${lang}${stars}</div>
        <a class="card__link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">View repo →</a>
      </article>`;
  };

  showSkeletons();

  const url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`;

  fetch(url, { headers: { Accept: "application/vnd.github+json" } })
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      return res.json();
    })
    .then((repos) => {
      if (!Array.isArray(repos) || repos.length === 0) {
        setStatus("No public repositories to show yet — check back soon.");
        return;
      }
      const visible = repos.filter((r) => !r.fork);
      const list = visible.length ? visible : repos;
      grid.setAttribute("aria-busy", "false");
      grid.innerHTML = list.map(repoCard).join("");
    })
    .catch((err) => {
      console.error("Failed to load repositories:", err);
      setStatus(
        `Couldn't load repositories right now. ` +
          `View them directly on <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub ↗</a>.`
      );
    });
})();
