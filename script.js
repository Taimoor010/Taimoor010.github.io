const yearNode = document.querySelector("#year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

function projectCard(project) {
  const isLive = project.status === "Live";
  const liveButton = project.liveUrl
    ? `<a class="button primary compact" href="${project.liveUrl}" data-track="project_live_tool" data-project="${project.slug}">Try Live Tool</a>`
    : "";
  const githubButton = project.githubUrl
    ? `<a class="button secondary compact" href="${project.githubUrl}" target="_blank" rel="noreferrer" data-track="project_github" data-project="${project.slug}">GitHub</a>`
    : "";
  const statusClass = isLive ? "live" : "soon";

  return `
    <article class="project-card" data-filters="${project.filters.join("|")}">
      <div class="project-content">
        <div class="project-meta">
          <span>${project.category}</span>
          <span class="status-label ${statusClass}">${project.status}</span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <p class="project-outcome">${project.outcome}</p>
        <div class="project-links">
          ${liveButton}
          <a class="button secondary compact" href="${project.summaryUrl}" data-track="project_summary" data-project="${project.slug}">View Summary</a>
          ${githubButton}
          ${!isLive ? '<span class="button ghost compact">Case Study Coming Soon</span>' : ""}
        </div>
      </div>
    </article>
  `;
}

function renderProjects(container, projects) {
  container.innerHTML = projects.map(projectCard).join("");
}

document.addEventListener("click", (event) => {
  const tracked = event.target.closest("[data-track]");
  if (tracked && typeof window.trackPortfolioEvent === "function") {
    window.trackPortfolioEvent(tracked.dataset.track, {
      link_text: tracked.textContent.trim(),
      link_url: tracked.getAttribute("href") || "",
      project: tracked.dataset.project || "",
    });
    return;
  }

  const link = event.target.closest("a");
  if (!link || typeof window.trackPortfolioEvent !== "function") return;
  if (link.closest("nav") || link.classList.contains("button")) {
    window.trackPortfolioEvent("navigation_click", {
      link_text: link.textContent.trim(),
      link_url: link.getAttribute("href") || "",
    });
  }
});

const featured = document.querySelector("#featuredProjects");
if (featured && window.PORTFOLIO) {
  renderProjects(featured, window.PORTFOLIO.projects.filter((project) => project.featured));
}

const gallery = document.querySelector("#projectGallery");
if (gallery && window.PORTFOLIO) {
  renderProjects(gallery, window.PORTFOLIO.projects);

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      if (typeof window.trackPortfolioEvent === "function") {
        window.trackPortfolioEvent("project_filter", { filter });
      }
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const visibleProjects = filter === "All"
        ? window.PORTFOLIO.projects
        : window.PORTFOLIO.projects.filter((project) => project.filters.includes(filter));
      renderProjects(gallery, visibleProjects);
    });
  });
}
