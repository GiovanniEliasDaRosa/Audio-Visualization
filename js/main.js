var currentmusic = "";
const loading = document.querySelector("#loading");

var play__button = document.getElementById("play__button");
var myAudio = null;
document.addEventListener("click", clickPage);
var detuneValue = 0;
var volume = 0;
var loadingMusic = false;
let inactive = false;
let lastFileData = null;
const amount = Math.ceil(window.innerWidth / 600) * 100;

let colorRandomness = 20;
let currentTime = 0;

const vizualizer_canvas = document.querySelector("#vizualizer");
const ctx = vizualizer_canvas.getContext("2d");
let width = 0;
let height = 0;

resizeCanvas();

function clickPage(e) {
  if (e.target == play__button || e.target == "clickedItem") {
    loadingMusic = true;
  }

  if (currentmusic != "") {
    Disable(play__button);
    ChangeMusic(currentmusic);
    Enable(loading);
    loading.setAttribute("data-dontanimate", "true");
  }

  document.body.removeAttribute("data-waitclick");
  myAudio = new Muvis(`./uploads/${currentmusic}`, {
    dataMax: amount,
    onLoad: () => {
      loading.removeAttribute("data-dontanimate");

      log("onLoad()");

      play__button.onclick = (e) => {
        if (currentTime != 0 && !e.isTrusted) {
          myAudio.play();
          play__button.className = "stop";
          return;
        }

        log("play__button.onclick", 1);

        if (!myAudio.isPlaying) {
          myAudio.play();
          play__button.className = "stop";
        } else {
          myAudio.stop();
          play__button.className = "";
        }
      };

      if (e.target == play__button) {
        play__button.click();
      }

      if (currentTime != 0 && !e.isTrusted) {
        Disable(loading);
        loading.setAttribute("data-dontanimate", "true");
        Enable(play__button);

        if (e.target == "clickedItem") {
          play__button.click();
        }

        if (inactive) {
          Disable(play__button);
        }
        return;
      }

      setTimeout(() => {
        Disable(loading);
        loading.setAttribute("data-dontanimate", "true");
        Enable(play__button);

        if (e.target == "clickedItem") {
          play__button.click();
        }
        if (inactive) {
          Disable(play__button);
        }
      }, 100);
    },
    onData: (data) => {
      ctx.clearRect(0, 0, width, height);
      let thier_size = width / amount;
      data.forEach(function (h, i) {
        let percent = (h / 255) * (volume + 1);
        let opacity = (percent * 3.5) / 4 + 0.25;

        if (percent < 0.5) {
          color = 140 - percent * colorRandomness;
        } else if (percent < 0.85) {
          color = 50 - (percent - 0.5) * colorRandomness;
        } else {
          color = 0 + (percent - 0.85) * colorRandomness;
        }
        let result_height = percent * height;

        ctx.fillStyle = `hsla(${color}, 100%, 50%, ${opacity})`;
        ctx.fillRect(i * thier_size, height - result_height, thier_size, result_height);
      });
    },
    onError: () => {
      log("onError()");
    },
  });

  document.removeEventListener("click", clickPage);
}

function Muvis(path, options = null) {
  log(`Muvis(${path})`);
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var options = options || {};
  var dataMax = options.dataMax || 10;
  var bufferSource, analyzer, frequency, fileData, gainNode;
  var self = this;
  var duration = 0;

  function loadFile() {
    log("loadFile()", 1);

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        lastFileData = response;
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        log("then((arrayBuffer) => { [...] })", 2);
        // When file is loaded save to variable
        fileData = arrayBuffer;
        // If we have a function to call
        if (options.onLoad) {
          // Then call it
          options.onLoad(fileData);
        }
      })
      .catch((error) => {
        log("ERROR", 2, 100);
        // If we have a function to call when getting an error
        if (options.onError) {
          // Then call it
          options.onError("Unable to load file.");
        }
        lastFileData = null;
        console.error(error);
      });
  }

  self.play = () => {
    loadingMusic = false;
    ctx.clearRect(0, 0, width, height);
    log("play()", 1);
    log(self.isPlaying, 1);
    if (self.isPlaying) {
      if (fileData.byteLength == 0) {
        self.isPlaying = false;
        bufferSource.stop();
        loadFile();
        return;
      }

      context.decodeAudioData(fileData, onAudioDecode, onAudioDecodeError);
      return;
    }

    self.isPlaying = true;
    if (currentTime == 0) {
      context.decodeAudioData(fileData, onAudioDecode, onAudioDecodeError);
      return;
    }

    loadFile();

    // // let arrayBuffer = lastFileData.arrayBuffer();
    // const buffer = new ArrayBuffer(8);
    // var view = new Int32Array(buffer);
    // view = lastFileData.arrayBuffer();
    // return;

    // // When file is loaded save to variable
    // fileData = arrayBuffer;
    // // If we have a function to call
    // if (options.onLoad) {
    //   // Then call it
    //   options.onLoad(fileData);
    // }

    // if (currentTime != 0) {
    //   if (lastFileData.byteLength != 0) {
    //     return;
    //   }
    // }
  };

  function onAudioDecode(buffer) {
    log("onAudioDecode()", 1);
    bufferSource = context.createBufferSource();
    analyzer = context.createAnalyser();
    frequency = new Uint8Array(analyzer.frequencyBinCount);
    bufferSource.buffer = buffer;
    bufferSource.connect(context.destination);
    bufferSource.connect(analyzer);

    gainNode = context.createGain();
    gainNode.connect(context.destination);
    bufferSource.connect(gainNode);
    duration = bufferSource.buffer.duration;

    bufferSource.onended = () => {
      log("bufferSource.onended = () => { [...] }", 2);
      self.stop();
      // // If we have a function to call when ending or stopping the audio
      // if (options.onEnded) {
      //   // Then call it
      //   options.onEnded(context.currentTime);
      // }
      onEnded();
    };

    bufferSource.start(0, currentTime);
    self.volume();

    // setInterval(() => {
    //   detuneValue += 10;
    //   bufferSource.detune.value = detuneValue;
    //   gainNode.gain.value = volume;
    // }, 1000);

    // If we have a function to call when starting the audio
    if (options.onReady) {
      // Then call it
      options.onReady(self);

      setTimeout(() => {
        loading.setAttribute("data-dontanimate", "true");
        Disable(loading);
        if (!inactive) {
          Enable(play__button);
        }
      }, 1000);
    }

    render();
  }

  function onEnded() {
    if (Math.ceil(duration) == Math.ceil(context.currentTime)) {
      setTimeout(() => {
        currentsmuics.querySelector(".currentsMuics__card:has(input:checked) + div>input");
        currentsmuics.querySelector(".currentsMuics__card:has(input:checked) + div>input").click();
      }, 500);
    }
  }

  self.volume = () => {
    gainNode.gain.value = volume;
  };

  function onAudioDecodeError() {
    log("onAudioDecodeError()", 1, 100);

    // If we have a function to call when gettting an error on decoding
    if (options.onError) {
      // Then call it
      options.onError("Unable to decode audio.");
    }
  }

  function render() {
    // log("render()", 1);
    if (self.isPlaying) {
      requestAnimationFrame(render);
      analyzer.getByteFrequencyData(frequency);
      // If we have a function to call when rendering the data,
      if (options.onData) {
        // Then call it
        options.onData(frequency.slice(0, dataMax));
      }
    }
  }

  self.stop = () => {
    log("stop()", 1);
    currentTime = context.currentTime;
    self.isPlaying = false;
    bufferSource.stop();
    play__button.className = "";

    ctx.clearRect(0, 0, width, height);

    // let divs = tiles.querySelectorAll("div");
    // divs.forEach((element) => {
    //   element.style.transform = `scaleY(0)`;
    //   element.style.opacity = 0;
    //   element.style.background = `hsl(140, 100%, 50%)`;
    //   element.style.transition = "1000ms transform, 500ms background 250ms, 500ms opacity 500ms";
    // });

    if (currentTime > duration) {
      currentTime = 0;
    }
  };

  loadFile();
}

function log(text, indent = 0, red = 0) {
  console.log(
    `%c${text}`,
    `padding: 0.5em; border-radius: 0.5em; border: 0.1em solid hsla(0, 0%, 100%, 0.5); background: hsla(0, ${red}%,${
      red - 50
    }%, ${0.2 + red / 1000}); margin-left: ${indent / 0.5}em`
  );
}

function makeDistortionCurve(amount) {
  let k = typeof amount === "number" ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

let mouseTimer = "";
let submouseTimer = "";
let subsubmouseTimer = "";
window.onmousemove = () => {
  clearTimeout(mouseTimer);
  document.body.removeAttribute("data-inactive");

  if (inactive) {
    clearTimeout(subsubmouseTimer);
    clearTimeout(submouseTimer);
    inactive = false;
    PrepareToActivate(hud);
    if (menuOpen) {
      PrepareToActivate(currentsMuics);
    } else {
      PrepareToActivate(uploadedMusic__open);
    }
  }

  mouseTimer = setTimeout(() => {
    inactive = true;
    document.body.setAttribute("data-inactive", "true");
    PrepareToInactivate(hud);
    if (menuOpen) {
      PrepareToInactivate(currentsMuics);
    } else {
      PrepareToInactivate(uploadedMusic__open);
    }
    submouseTimer = setTimeout(() => {
      Disable(hud);
      if (menuOpen) {
        Disable(currentsMuics);
      } else {
        Disable(uploadedMusic__open);
      }
    }, 1000);
  }, 2000);
};

window.onresize = () => {
  resizeCanvas();
};

function PrepareToActivate(element) {
  element.style.transition = "";
  element.style.opacity = "0";
  Enable(element);
  submouseTimer = setTimeout(() => {
    element.style.transition = "1s";
    element.style.opacity = "1";
    subsubmouseTimer = setTimeout(() => {
      element.style.transition = "";
      element.style.opacity = "";
    }, 500);
  }, 10);
}

function PrepareToInactivate(element) {
  element.style.opacity = "1";
  element.style.transition = "1s";
  submouseTimer = setTimeout(() => {
    element.style.opacity = "0";
  }, 10);
}
