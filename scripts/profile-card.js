function copyLink() {
  const copyLinkBtn = document.querySelector(".profileCard-btn");
  const currentUrl = window.location.href;
  const originalBtnContent = copyLinkBtn.innerHTML;

  function updateBtnText() {
    copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyLinkBtn.classList.add("copied");

    setTimeout(() => {
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
