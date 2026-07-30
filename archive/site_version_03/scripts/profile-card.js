let copyTimeout;
let originalBtnContent;

function copyLink() {
  const copyLinkBtn = document.querySelector(".profileCard-btn");
  const currentUrl = window.location.href;

  if (!copyLinkBtn.classList.contains("copied")) {
    originalBtnContent = copyLinkBtn.innerHTML;
  }

  function updateBtnText() {
    clearTimeout(copyTimeout);

    copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyLinkBtn.classList.add("copied");

    copyTimeout = setTimeout(() => {
      copyLinkBtn.innerHTML = originalBtnContent;
      copyLinkBtn.classList.remove("copied");
    }, 2000);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(currentUrl)
      .then(updateBtnText)
      .catch((err) => console.error("Could not copy page link.", err));
  } else {
    const textArea = document.createElement("textarea");

    textArea.value = currentUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);

    textArea.select();

    try {
      document.execCommand("copy");
      updateBtnText();
    } catch (err) {
      console.error("Could not copy page link.", err);
    }

    document.body.removeChild(textArea);
  }
}
