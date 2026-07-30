// Navigation bar scrolling
let bar = document.querySelector(".bar");

document.onscroll = () => {
  let y = Math.floor(
    (window.pageYOffset / document.documentElement.scrollHeight) * 100
  );

  bar.style.height = y * 1.08 + "%";

  let remainder = Math.floor(y / 25) + 1;
  let activeLink = document.getElementById("link-" + remainder);

  activateLink(activeLink);
};

let previous = document.getElementById("link-1");

function activateLink(link) {
  let current = link;
  previous.classList.remove("active");
  current.classList.add("active");
  previous = current;
}

// Color scheme changing
const colorScheme = document.getElementsByName("color-scheme")[0];
const colorSchemeBtn = document.getElementById("colorScheme-btn");

function changeColorScheme() {
  if (colorScheme.getAttribute("content") === "dark") {
    colorScheme.setAttribute("content", "light");
  } else {
    colorScheme.setAttribute("content", "dark");
  }
}
