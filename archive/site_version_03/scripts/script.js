// Color scheme change
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
  if (document.title === "Dimterion's Profile") {
    if (mode === "light") {
      document.getElementById("theme-style").href =
        "./styles/style-default.css";
    } else {
      document.getElementById("theme-style").href = "./styles/theme-blue.css";
    }

    localStorage.setItem("theme", mode);
  } else {
    if (mode === "light") {
      document.getElementById("theme-style").href =
        "../styles/style-default.css";
    } else {
      document.getElementById("theme-style").href = "../styles/theme-blue.css";
    }

    localStorage.setItem("theme", mode);
  }
}

// Scroll to top button
let button = document.getElementById("top-Btn");

window.onscroll = function () {
  showScrollBtn();
};

function showScrollBtn() {
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    button.style.display = "block";
  } else {
    button.style.display = "none";
  }
}

function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();
