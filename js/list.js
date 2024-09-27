const currentsmuics = document.querySelector("#currentsMuics");
const currentsMuics__div = document.querySelector("#currentsMuics__div");
const template__currentsMuics__card = document.querySelector("#template__currentsMuics__card");
const uploadedMusic__file = document.querySelector("#uploadedMusic__file");
const uploadedMusic__save = document.querySelector("#uploadedMusic__save");
const uploadedMusic__text = document.querySelector("#uploadedMusic__text");
const uploadedMusic__error = document.querySelector("#uploadedMusic__error");

let animatingMenu = "";
let menuOpen = true;

const uploadedMusic__open = document.querySelector("#uploadedMusic__open");
const uploadedMusic__close = document.querySelector("#uploadedMusic__close");

let selectingByKeyboard = "";
let goodTextTimeout = "";
Disable(uploadedMusic__save, false);
Disable(uploadedMusic__text);
Disable(uploadedMusic__open);

function ListMusics(data) {
  currentsMuics__div.innerHTML = "";
  if (data.status) {
    let results = data.results;

    if (results.length == 0) {
      let addAMusic = document.createElement("p");
      addAMusic.innerText =
        "You don't have any musics, click on Upload and then on save to save your music";
      currentsMuics__div.appendChild(addAMusic);
      return;
    }

    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      let card = template__currentsMuics__card.content
        .querySelector(".currentsMuics__card")
        .cloneNode(true);
      card__input = card.querySelector("input");
      card__input.id = element;
      card__label = card.querySelector("label");
      card__label.setAttribute("for", element);

      // if (element.search(".wav") != -1) {
      //   card__input.setAttribute("disabled", "");
      //   card__input.setAttribute("aria-disabled", "true");
      // }

      card__label.textContent = element;

      card.addEventListener("click", (e) => {
        if (loadingMusic) return;

        card.querySelector("input").checked = true;
        clearTimeout(selectingByKeyboard);
        currentmusic = element.replaceAll("#", "%23");
        if (myAudio.isPlaying) {
          myAudio.stop();
          play__button.className = "";
        }

        currentTime = 0;
        if (currentTime != 0 && !e.isTrusted) {
          clickPage({ target: "clickedItem" });
          return;
        }

        if (e.isTrusted) {
          clickPage({ target: "clickedItem" });
        } else {
          selectingByKeyboard = setTimeout(() => {
            clickPage({ target: "clickedItem" });
          }, 1000);
        }
      });

      currentsMuics__div.appendChild(card);
    }
  }
}

fetch("fetchable/list.php", {
  method: "post",
  body: new URLSearchParams({}),
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})
  .then((response) => response.json())
  .then((data) => {
    ListMusics(data);
  });

uploadedMusic__save.onclick = () => {
  if (uploadedMusic__file.files.length == 0) {
    Disable(uploadedMusic__save, false);
  }
  Disable(uploadedMusic__error);
  Disable(uploadedMusic__text);

  let file = uploadedMusic__file.files[0];
  fileHandler(file, file.name, file.type);
};

let path = window.location.origin + "ClothesDB/tables/clothes/imgs/";

const fileHandler = (file, name, type, onlyviewname = false) => {
  uploadedMusic__text.innerText = "Loading...";
  clearTimeout(goodTextTimeout);
  Disable(uploadedMusic__text);

  if (type.split("/")[0] !== "audio") {
    Enable(uploadedMusic__error);
    // File is not an image
    uploadedMusic__error.innerText = "Select a music file";
    return;
  }
  if (type.split("/")[1] == "wav") {
    Enable(uploadedMusic__error);
    // File is wav
    uploadedMusic__error.innerText = "wav files doesn't work";
    return;
  }
  Disable(uploadedMusic__error);
  Enable(uploadedMusic__text);

  uploadedMusic__error.innerText = "";
  let reader = new FileReader();
  reader.readAsDataURL(file);
  let musicType = type.split("/")[1];

  if (onlyviewname) {
    Disable(uploadedMusic__error);
    uploadedMusic__text.innerHTML = "Click <strong>Save</strong> to save the music";
    return;
  }

  reader.onloadend = () => {
    fetch("fetchable/saveAudio.php", {
      method: "POST",
      body: new URLSearchParams({
        file: reader.result,
        name: name,
        type: musicType,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        Disable(uploadedMusic__error);
        let result = `${name}.${musicType}`;
        uploadedMusic__text.innerText = "";

        let speed = 1000 / result.length;
        let pos = 0;
        let textLenght = result.length - 1;
        let typewrite = setInterval(() => {
          if (pos == textLenght) {
            clearInterval(typewrite);
          }
          uploadedMusic__text.innerText += result[pos];
          pos++;
        }, speed);
        Enable(uploadedMusic__text);

        clearTimeout(goodTextTimeout);
        goodTextTimeout = setTimeout(() => {
          Disable(uploadedMusic__text);
        }, 5000);
        ListMusics(data);
      })
      .catch((error) => {
        Disable(uploadedMusic__text);
        Enable(uploadedMusic__error);
        uploadedMusic__error.innerText = "Error";
        console.error(error);
      });
  };
};

uploadedMusic__file.onchange = () => {
  Enable(uploadedMusic__save);

  let file = uploadedMusic__file.files[0];
  fileHandler(file, file.name, file.type, true);
};

uploadedMusic__open.onclick = () => {
  menuOpen = true;
  Disable(uploadedMusic__open);
  clearTimeout(animatingMenu);
  Enable(currentsmuics);
  currentsmuics.setAttribute("data-hidden", "");
  currentsmuics.setAttribute("data-animating", "");

  animatingMenu = setTimeout(() => {
    currentsmuics.removeAttribute("data-hidden");

    animatingMenu = setTimeout(() => {
      currentsmuics.removeAttribute("data-animating");
    }, 500);
  }, 100);
};

uploadedMusic__close.onclick = () => {
  menuOpen = false;
  clearTimeout(animatingMenu);
  currentsmuics.setAttribute("data-animating", "");

  animatingMenu = setTimeout(() => {
    currentsmuics.setAttribute("data-hidden", "");

    animatingMenu = setTimeout(() => {
      Disable(currentsmuics);
      currentsmuics.removeAttribute("data-hidden");
      currentsmuics.removeAttribute("data-animating");
      Enable(uploadedMusic__open);
    }, 500);
  }, 100);
};
