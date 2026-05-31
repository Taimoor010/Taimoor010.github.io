const yearNode = document.querySelector("#year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

function projectCard(project) {
  const isLive = project.status === "Live";
  const liveButton = project.liveUrl
    ? `<a class="button primary compact" href="${project.liveUrl}">Try Live Tool</a>`
    : "";
  const githubButton = project.githubUrl
    ? `<a class="button secondary compact" href="${project.githubUrl}" target="_blank" rel="noreferrer">GitHub</a>`
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
          <a class="button secondary compact" href="${project.summaryUrl}">View Summary</a>
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
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const visibleProjects = filter === "All"
        ? window.PORTFOLIO.projects
        : window.PORTFOLIO.projects.filter((project) => project.filters.includes(filter));
      renderProjects(gallery, visibleProjects);
    });
  });
}
