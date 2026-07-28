import { siteText } from "../assets/site-text.js";

const supportedLocales = ["en", "fr"];
const localeStorageKey = "hud-language";

const animationDuration = 220;
const screenAnimationDuration = 280;
const mobileBreakpoint = 768;

const metaDescription = document.querySelector('meta[name="description"]');

const pageTitle = document.querySelector("[data-page-title]");
const pageSubtitle = document.querySelector("[data-page-subtitle]");
const screenContainer = document.querySelector("[data-screen-container]");
const scrollArea = document.querySelector(".hud__scroll-area");

const footerGithubValue = document.querySelector("[data-footer-github-value]");
const footerGithubLabel = document.querySelector("[data-footer-github-label]");
const footerMediumValue = document.querySelector("[data-footer-medium-value]");
const footerMediumLabel = document.querySelector("[data-footer-medium-label]");

const languageButtons = document.querySelectorAll("[data-language-button]");
const previousScreenButton = document.querySelector(
  "[data-screen-previous-button]",
);
const nextScreenButton = document.querySelector("[data-screen-next-button]");
const screenNavigationButtons = document.querySelectorAll(
  "[data-screen-direction]",
);
const portraitImage = document.querySelector("[data-portrait-image]");

const projectGrid = document.querySelector("[data-project-grid]");
const footerProjectsLabel = document.querySelector(
  "[data-footer-projects-label]",
);
const footerExperienceList = document.querySelector(
  "[data-footer-experience-list]",
);
const footerExperienceLabel = document.querySelector(
  "[data-footer-experience-label]",
);

const modalContainer = document.querySelector("[data-modal-container]");

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
const getText = () => siteText[currentLocale];
const isMobileLayout = () => window.innerWidth <= mobileBreakpoint;

let currentLocale = getInitialLocale();
let activeScreenIndex = 0;
let isScreenAnimating = false;
let lastTriggerButton = null;

const saveLocalePreference = (locale) => {
  try {
    window.localStorage.setItem(localeStorageKey, normalizeLocale(locale));
  } catch {
    return;
  }
};

const updateLanguageButtons = () => {
  const text = getText();
  const { languageSwitcher } = text.footer;

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

const createScreenMarkup = (screen) => {
  const text = getText();
  const links = screen.links ?? [];

  const itemsMarkup = screen.items
    .map(
      (item) => `
        <li class="hud-screen__list-item">
          <p class="hud-screen__meta">${item}</p>
        </li>
      `,
    )
    .join("");

  const linksMarkup = links
    .map(
      (link) => `
        <li class="hud-screen__link-item">
          <a class="hud-screen__link" href="${link.href}" rel="noopener noreferrer" target="_blank">
            ${link.label}
          </a>
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
      ${linksMarkup ? `<ul class="hud-screen__links">${linksMarkup}</ul>` : ""}
    </div>
  `;
};

const renderScreen = (screenIndex) => {
  const text = getText();
  screenContainer.innerHTML = createScreenMarkup(
    text.screens.items[screenIndex],
  );
};

const renderCurrentScreen = () => {
  renderScreen(activeScreenIndex);
};

const applyStaticText = () => {
  const text = getText();

  document.documentElement.lang = text.html.lang;
  document.title = text.html.title;

  if (metaDescription) {
    metaDescription.setAttribute("content", text.html.description);
  }

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
    activeScreenIndex = nextIndex;
    renderCurrentScreen();

    scrollArea?.scrollTo({
      behavior: "smooth",
      left: 0,
      top: 0,
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
    currentScreen.classList.add("hud-screen--exit-to-left");
    nextScreen.classList.add("hud-screen--enter-from-right");
  } else {
    currentScreen.classList.add("hud-screen--exit-to-right");
    nextScreen.classList.add("hud-screen--enter-from-left");
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
  const dialog = document.createElement("dialog");

  const links = project.links ?? [];
  const stack = project.stack ?? [];

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
      <div class="project-modal__body">
        <h2 class="project-modal__title" id="${project.id}-title">${project.title}</h2>
        <p class="project-modal__label">${project.label}</p>
        ${
          project.image
            ? `<img
                class="project-modal__image"
                src="${project.image.link}"
                alt="${project.image.description || ""}"
                width="1000"
                height="400"
                loading="lazy"
                decoding="async"
              >`
            : ""
        }
        <p class="project-modal__text">${project.description}</p>
        ${
          stackMarkup
            ? `<ul class="project-modal__stack" aria-label="${text.projects.stackLabel}">
                ${stackMarkup}
              </ul>`
            : ""
        }
        ${linksMarkup ? `<ul class="project-modal__links">${linksMarkup}</ul>` : ""}
      </div>
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

const bindLanguageButtons = () => {
  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });
};

const bindScreenNavigationButtons = () => {
  screenNavigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToScreen(button.dataset.screenDirection);
    });
  });
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

const init = () => {
  applyStaticText();
  renderCurrentScreen();
  renderProjects();

  bindLanguageButtons();
  bindScreenNavigationButtons();
  bindKeyboardControls();
};

init();

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.body.classList.remove("hud-page--intro");
  }, 900);
});
