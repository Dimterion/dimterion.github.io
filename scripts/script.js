let theme = localStorage.getItem("theme");

if (theme === null) {
  setTheme("light");
} else {
  setTheme(theme);
}

let themeDots = document.getElementsByClassName("theme-dot");

for (let i = 0; themeDots.length > i; i++) {
  themeDots[i].addEventListener("click", function () {
    let mode = this.dataset.mode;
    setTheme(mode);
  });
}

function setTheme(mode) {
  if (mode === "light") {
    document.getElementById("theme-style").href = "./styles/style-default.css";
  } else {
    document.getElementById("theme-style").href = "./styles/theme-blue.css";
  }

  localStorage.setItem("theme", mode);
}
