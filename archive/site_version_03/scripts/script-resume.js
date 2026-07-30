// Email encryption
let encEmail = "d2ViZGV2cmVzQHByb3Rvbm1haWwuY29t";

const form = document.getElementById("email");

form.setAttribute("href", "mailto:".concat(atob(encEmail)));
