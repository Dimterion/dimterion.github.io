import { projects } from "../assets/projects-data.js";

const projectGrid = document.querySelector(".hud-footer__project-grid");
const modalContainer = document.querySelector("[data-modal-container]");
const animationDuration = 220;

const createProjectButton = (project) => {
  const button = document.createElement("button");

  button.className = "hud-footer__project-button";
  button.dataset.modalTarget = project.id;
  button.type = "button";
  button.textContent = project.buttonLabel;
  button.setAttribute("aria-label", `Open ${project.title} details`);

  return button;
};

const createProjectModal = (project) => {
  const links = project.links ?? [];
  const stack = project.stack ?? [];
  const dialog = document.createElement("dialog");
  const linksMarkup = project.links
    .map(
      (link) => `
        <li class="project-modal__link-item">
          <a class="project-modal__link" href="${link.href}" rel="noopener noreferrer" target="_blank">
            ${link.label}
          </a>
        </li>
      `,
    )
    .join("");

  const stackMarkup = project.stack
    .map((item) => `<li class="project-modal__stack-item">${item}</li>`)
    .join("");

  dialog.className = "project-modal";
  dialog.id = project.id;
  dialog.setAttribute("aria-labelledby", `${project.id}-title`);

  dialog.innerHTML = `
    <article class="project-modal__content">
      <button class="project-modal__close" data-modal-close type="button" aria-label="Close modal">
        X
      </button>
      <p class="project-modal__label">${project.label}</p>
      <h2 class="project-modal__title" id="${project.id}-title">${project.title}</h2>
      <p class="project-modal__text">${project.description}</p>
      <ul class="project-modal__stack" aria-label="Tech stack">
        ${stackMarkup}
      </ul>
      ${linksMarkup ? `<ul class="project-modal__links">${linksMarkup}</ul>` : ""}
    </article>
  `;

  return dialog;
};

const openModal = (modal) => {
  if (!modal || modal.open) {
    return;
  }

  modal.classList.remove("project-modal--closing");
  modal.showModal();

  requestAnimationFrame(() => {
    modal.classList.add("project-modal--visible");
  });
};

const closeModal = (modal) => {
  if (
    !modal ||
    !modal.open ||
    modal.classList.contains("project-modal--closing")
  ) {
    return;
  }

  modal.classList.remove("project-modal--visible");
  modal.classList.add("project-modal--closing");

  window.setTimeout(() => {
    modal.classList.remove("project-modal--closing");
    modal.close();
  }, animationDuration);
};

const bindModalEvents = (modal) => {
  const closeButton = modal.querySelector("[data-modal-close]");
  const content = modal.querySelector(".project-modal__content");

  closeButton.addEventListener("click", () => {
    closeModal(modal);
  });

  modal.addEventListener("click", (event) => {
    if (!content.contains(event.target)) {
      closeModal(modal);
    }
  });

  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal(modal);
  });
};

const renderProjects = () => {
  const buttonsFragment = document.createDocumentFragment();
  const modalsFragment = document.createDocumentFragment();

  projects.forEach((project) => {
    const button = createProjectButton(project);
    const modal = createProjectModal(project);

    button.addEventListener("click", () => {
      openModal(modal);
    });

    bindModalEvents(modal);

    buttonsFragment.append(button);
    modalsFragment.append(modal);
  });

  projectGrid.replaceChildren(buttonsFragment);
  modalContainer.replaceChildren(modalsFragment);
};

const init = () => {
  renderProjects();
};

init();
