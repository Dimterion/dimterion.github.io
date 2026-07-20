const modalButtons = document.querySelectorAll("[data-modal-target]");
const modals = document.querySelectorAll(".project-modal");
const animationDuration = 220;

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

modalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.dataset.modalTarget;
    const modal = document.getElementById(modalId);

    openModal(modal);
  });
});

modals.forEach((modal) => {
  const closeButton = modal.querySelector("[data-modal-close]");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeModal(modal);
    });
  }

  modal.addEventListener("click", (event) => {
    const content = modal.querySelector(".project-modal__content");

    if (!content.contains(event.target)) {
      closeModal(modal);
    }
  });

  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal(modal);
  });
});
