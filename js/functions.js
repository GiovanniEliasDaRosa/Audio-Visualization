/* Enable & Disable elements */
function Enable(element) {
  element.removeAttribute("aria-disabled");
  element.removeAttribute("disabled");
  element.style.display = "";
}

function Disable(element, hide = true) {
  element.setAttribute("aria-disabled", "true");
  element.setAttribute("disabled", "");
  if (hide) {
    element.style.display = "none";
  }
}
