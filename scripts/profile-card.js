function copyLink() {
  const currentUrl = window.location.href;
  navigator.clipboard
    .writeText(currentUrl)
    .then(function () {
      const btn = document.querySelector(".profileCard-btn");
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      btn.classList.add("copied");

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
        btn.classList.remove("copied");
      }, 2000);
    })
    .catch(function (err) {
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      const btn = document.querySelector(".profileCard-btn");
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      btn.classList.add("copied");

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
        btn.classList.remove("copied");
      }, 2000);
    });
}
