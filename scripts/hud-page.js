import { siteText } from "../assets/site-text.js";

const supportedLocales = ["en", "fr"];
const localeStorageKey = "hud-language";

const normalizeLocale = (locale) => {
  if (typeof locale !== "string") {
    return "en";
  }

  const baseLocale = locale.toLowerCase().split("-")[0];
  return supportedLocales.includes(baseLocale) ? baseLocale : "en";
};

const getSavedLocale = () => {
  try {
    const savedLocale = window.localStorage.getItem(localeStorageKey);
    return savedLocale ? normalizeLocale(savedLocale) : null;
  } catch {
    return null;
  }
};

const getBrowserLocale = () => {
  const browserLocales =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const locale of browserLocales) {
    const normalizedLocale = normalizeLocale(locale);

    if (normalizedLocale === "fr") {
      return "fr";
    }

    if (normalizedLocale === "en") {
      return "en";
    }
  }

  return "en";
};

const getInitialLocale = () => getSavedLocale() ?? getBrowserLocale();

let currentLocale = getInitialLocale();

const getText = () => siteText[currentLocale];

const saveLocalePreference = (locale) => {
  try {
    window.localStorage.setItem(localeStorageKey, normalizeLocale(locale));
  } catch {
    return;
  }
};

const screenContainer = document.querySelector("[data-screen-container]");
const projectGrid = document.querySelector("[data-project-grid]");
const screenNavigationButtons = document.querySelectorAll(
  "[data-screen-direction]",
);
const modalContainer = document.querySelector("[data-modal-container]");

const pageTitle = document.querySelector("[data-page-title]");
const pageSubtitle = document.querySelector("[data-page-subtitle]");
const footerGithubValue = document.querySelector("[data-footer-github-value]");
const footerGithubLabel = document.querySelector("[data-footer-github-label]");
const footerMediumValue = document.querySelector("[data-footer-medium-value]");
const footerMediumLabel = document.querySelector("[data-footer-medium-label]");
const footerProjectsLabel = document.querySelector(
  "[data-footer-projects-label]",
);
const footerExperienceLabel = document.querySelector(
  "[data-footer-experience-label]",
);
const footerExperienceList = document.querySelector(
  "[data-footer-experience-list]",
);
const languageButtons = document.querySelectorAll("[data-language-button]");
const previousScreenButton = document.querySelector(
  "[data-screen-previous-button]",
);
const nextScreenButton = document.querySelector("[data-screen-next-button]");
const portraitImage = document.querySelector("[data-portrait-image]");

const animationDuration = 220;
const screenAnimationDuration = 280;
const mobileBreakpoint = 900;

const isMobileLayout = () => window.innerWidth <= mobileBreakpoint;

let activeScreenIndex = 0;
let isScreenAnimating = false;
let lastTriggerButton = null;

const updateLanguageButtons = () => {
  const text = getText();
  const languageSwitcher = text.footer.languageSwitcher;

  languageButtons.forEach((button) => {
    const buttonLocale = button.dataset.language;
    const isActive = buttonLocale === currentLocale;
    const languageName = languageSwitcher.languages[buttonLocale];

    button.textContent = languageSwitcher.buttons[buttonLocale];
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute(
      "aria-label",
      (isActive
        ? languageSwitcher.aria.current
        : languageSwitcher.aria.switchTo
      ).replace("{{language}}", languageName),
    );
  });
};

const setLanguage = (locale) => {
  const normalizedLocale = normalizeLocale(locale);

  if (normalizedLocale === currentLocale) {
    return;
  }

  currentLocale = normalizedLocale;
  saveLocalePreference(currentLocale);
  applyStaticText();
  renderCurrentScreen();
  renderProjects();
};

const bindLanguageButtons = () => {
  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });
};

const renderCurrentScreen = () => {
  const text = getText();

  screenContainer.innerHTML = createScreenMarkup(
    text.screens.items[activeScreenIndex],
  );
};

const applyStaticText = () => {
  const text = getText();

  document.documentElement.lang = text.html.lang;
  document.title = text.html.title;

  pageTitle.textContent = text.page.title;
  pageSubtitle.textContent = text.page.subtitle;

  footerGithubValue.textContent = text.footer.links.github.value;
  footerGithubLabel.textContent = text.footer.links.github.label;
  footerMediumValue.textContent = text.footer.links.medium.value;
  footerMediumLabel.textContent = text.footer.links.medium.label;
  footerProjectsLabel.textContent = text.footer.projects.label;
  footerExperienceLabel.textContent = text.footer.links.linkedin.label;

  previousScreenButton.setAttribute(
    "aria-label",
    text.footer.screenNavigation.previous,
  );
  nextScreenButton.setAttribute(
    "aria-label",
    text.footer.screenNavigation.next,
  );
  portraitImage.alt = text.footer.portrait.alt;

  footerExperienceList.innerHTML = text.footer.experience
    .map(
      (item) => `
        <li class="hud-footer__experience-item">
          <span class="hud-footer__experience-label">${item.label}:</span>
          <span>${item.value}</span>
        </li>
      `,
    )
    .join("");

  updateLanguageButtons();
};

const createScreenMarkup = (screen) => {
  const text = getText();

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
      <p class="hud-screen__label">${text.screens.scanDataLabel}</p>
      <ul class="hud-screen__list">
        ${itemsMarkup}
      </ul>
    </div>
  `;
};

const goToScreen = (direction) => {
  const text = getText();

  if (isScreenAnimating) {
    return;
  }

  const nextIndex =
    direction === "right"
      ? (activeScreenIndex + 1) % text.screens.items.length
      : (activeScreenIndex - 1 + text.screens.items.length) %
        text.screens.items.length;

  if (isMobileLayout()) {
    screenContainer.innerHTML = createScreenMarkup(
      text.screens.items[nextIndex],
    );
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
  nextScreen.innerHTML = createScreenMarkup(text.screens.items[nextIndex]);

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
  const text = getText();
  const button = document.createElement("button");

  button.className = "hud-footer__project-button";
  button.dataset.modalTarget = project.id;
  button.type = "button";
  button.textContent = project.buttonLabel;
  button.setAttribute(
    "aria-label",
    text.projects.aria.openDetails.replace("{{title}}", project.title),
  );

  return button;
};

const createProjectModal = (project) => {
  const text = getText();
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
      <button class="project-modal__close" data-modal-close type="button" aria-label="${text.projects.aria.closeModal}">
        X
      </button>
      <p class="project-modal__label">${project.label}</p>
      <h2 class="project-modal__title" id="${project.id}-title">${project.title}</h2>
      <p class="project-modal__text">${project.description}</p>
      <ul class="project-modal__stack" aria-label="${text.projects.stackLabel}">
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
  const text = getText();
  const buttonsFragment = document.createDocumentFragment();
  const modalsFragment = document.createDocumentFragment();

  text.projects.items.forEach((project) => {
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
  applyStaticText();
  renderCurrentScreen();
  bindKeyboardControls();
  bindScreenNavigationButtons();
  bindLanguageButtons();
  renderProjects();
};

init();
