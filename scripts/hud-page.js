import { projects } from "../assets/projects-data.js";
import { mainScreens } from "../assets/main-screen-data.js";

const screenContainer = document.querySelector("[data-screen-container]");
const projectGrid = document.querySelector(".hud-footer__project-grid");
const screenNavigationButtons = document.querySelectorAll(
  "[data-screen-direction]",
);
const modalContainer = document.querySelector("[data-modal-container]");

const animationDuration = 220;
const screenAnimationDuration = 280;
const mobileBreakpoint = 900;

const isMobileLayout = () => window.innerWidth <= mobileBreakpoint;

let activeScreenIndex = 0;
let isScreenAnimating = false;
let lastTriggerButton = null;

const createScreenMarkup = (screen) => {
  const itemsMarkup = screen.items
    .map(
      (item) => `
        <li class="hud-screen__list-item">
          <p class="hud-screen__meta">${item}</p>
        </li>
      `,
    )
    .join("");

  return `
    <div class="hud-screen__panel">
      <p class="hud-screen__label">${screen.label}</p>
      <h2 class="hud-screen__heading">${screen.title}</h2>
      <p class="hud-screen__text">${screen.text}</p>
    </div>
    <div class="hud-screen__panel">
      <p class="hud-screen__label">Scan data</p>
      <ul class="hud-screen__list">
        ${itemsMarkup}
      </ul>
    </div>
  `;
};

const renderInitialScreen = () => {
  screenContainer.innerHTML = createScreenMarkup(
    mainScreens[activeScreenIndex],
  );
};

const goToScreen = (direction) => {
  if (isScreenAnimating) {
    return;
  }

  const nextIndex =
    direction === "right"
      ? (activeScreenIndex + 1) % mainScreens.length
      : (activeScreenIndex - 1 + mainScreens.length) % mainScreens.length;

  if (isMobileLayout()) {
    screenContainer.innerHTML = createScreenMarkup(mainScreens[nextIndex]);
    activeScreenIndex = nextIndex;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    return;
  }

  isScreenAnimating = true;

  const currentScreen = screenContainer;
  const nextScreen = document.createElement("section");

  nextScreen.className = "hud-screen";
  nextScreen.setAttribute("aria-live", "polite");
  nextScreen.innerHTML = createScreenMarkup(mainScreens[nextIndex]);

  if (direction === "right") {
    nextScreen.classList.add("hud-screen--enter-from-right");
    currentScreen.classList.add("hud-screen--exit-to-left");
  } else {
    nextScreen.classList.add("hud-screen--enter-from-left");
    currentScreen.classList.add("hud-screen--exit-to-right");
  }

  currentScreen.parentElement.append(nextScreen);

  window.setTimeout(() => {
    currentScreen.className = "hud-screen";
    currentScreen.innerHTML = nextScreen.innerHTML;

    nextScreen.remove();

    activeScreenIndex = nextIndex;
    isScreenAnimating = false;
  }, screenAnimationDuration);
};

const bindKeyboardControls = () => {
  window.addEventListener("keydown", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (event.repeat) {
      return;
    }

    if (target.closest("dialog[open]")) {
      return;
    }

    if (target.matches("input, textarea, select") || target.isContentEditable) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToScreen("left");
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToScreen("right");
      return;
    }

    const projectIndex = Number.parseInt(event.key, 10) - 1;

    if (Number.isNaN(projectIndex) || projectIndex < 0) {
      return;
    }

    const projectButtons = document.querySelectorAll(
      ".hud-footer__project-button",
    );
    const targetButton = projectButtons[projectIndex];

    if (!targetButton) {
      return;
    }

    event.preventDefault();
    targetButton.click();
  });
};

const bindScreenNavigationButtons = () => {
  screenNavigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToScreen(button.dataset.screenDirection);
    });
  });
};

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

  const linksMarkup = links
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

  const stackMarkup = stack
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

const openModal = (modal, triggerButton) => {
  if (!modal || modal.open) {
    return;
  }

  lastTriggerButton = triggerButton;
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
    lastTriggerButton?.focus();
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
      openModal(modal, button);
    });

    bindModalEvents(modal);

    buttonsFragment.append(button);
    modalsFragment.append(modal);
  });

  projectGrid.replaceChildren(buttonsFragment);
  modalContainer.replaceChildren(modalsFragment);
};

const init = () => {
  renderInitialScreen();
  bindKeyboardControls();
  bindScreenNavigationButtons();
  renderProjects();
};

init();
