let wanttochangetime = false;
let changingmusic = "";
const music = document.querySelector("#music");
const music__content = document.querySelector("#music__content");

let show = "";
let animating = "";

function ChangeMusic(name) {
  clearInterval(show);
  clearInterval(animating);
  Enable(music);

  music.removeAttribute("data-hide");
  music.removeAttribute("data-appear");
  show = setTimeout(() => {
    music.setAttribute("data-appear", "");
  }, 10);

  music__content.innerText = name;

  animating = setTimeout(() => {
    music.removeAttribute("data-appear");

    animating = setTimeout(() => {
      music.setAttribute("data-hide", "");
      animating = setTimeout(() => {
        Disable(music);
        music.removeAttribute("data-hide");
      }, 1000);
    }, 4000);
  }, 1500);
}
