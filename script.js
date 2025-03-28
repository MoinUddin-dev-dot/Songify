let currentSong = new Audio();
// let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function fetchSongs(folder) {
  currfolder = folder;
  // console.log(folder)
  let files = await fetch(`http://127.0.0.1:3000${folder}`);
  // console.log(`http://127.0.0.1:3000${folder}`)
  let textFiles = await files.text();
  let div = document.createElement("div");
  div.innerHTML = textFiles;

  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    if (as[index].href.includes(".mp3")) {
      songs.push(as[index].href.split(`${folder}`)[1].replaceAll("%20", " "));
    }
  }

  currentSong.src = `${currfolder}` + songs[0];
  document.querySelector(".song-info").innerText = songs[0];
  document.querySelector(".song-time").innerText = "00:00 / 00:00";
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                    <img class="invert" src="images/music.svg" alt="">
                    <div class="info">
                        <div>${song}</div>
                        <div>Harry </div>
                    </div>
                    <div class="playNow">
                        <span>Play Now </span>
                        <img class="invert" src="images/play.svg" alt="">
                    </div>
                </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", (e) => {
      currentSongDOM =
        element.querySelector(".info").firstElementChild.innerText;
      // console.log(currentSongDOM)
      playMusic(currentSongDOM);
    });
  });

  return songs;
}

const playMusic = (track) => {
  currentSong.src = `${currfolder}` + track;
  // console.log(`/${currfolder}/` + track);
  play.src = "images/pause.svg";
  currentSong.play();
  document.querySelector(".song-info").innerText = track;
  // document.querySelector(".song-time").innerText = "00:00 / 00:00"
};

async function displayAlbums() {
  let albums = await fetch("http://127.0.0.1:3000/songs/");
  let textAlbums = await albums.text();
  let div = document.createElement("div");
  div.innerHTML = textAlbums;
  let anchors = Array.from(div.getElementsByTagName("a"));

  for (let index = 0; index < anchors.length; index++) {
    const e = anchors[index];

    if (e.href.includes("/songs/") && !e.href.includes(".DS_Store")) {
      // console.log(e.href);
      let folder = e.href.split("/").slice(-2)[0];
      // console.log(folder);
      let infos = await fetch(
        `http://127.0.0.1:3000/songs/${folder}/info.json`
      );
      let textInfos = await infos.json();
      // console.log(textInfos);
      let cardContainer = document.getElementsByClassName("card-container")[0];
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 20V4L19 12L5 20Z"
                  stroke="#141B34"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                  fill="#000"
                />
              </svg>
            </div>
            <img
              src="/songs/${folder}/cover.jpg"
              alt=""
            />
            <h2>${textInfos.title}</h2>
            <p>
              ${textInfos.description}
            </p>
          </div>`;
    }
  }

  // load the playlist when card was clicked

  Array.from(document.getElementsByClassName("card")).forEach((element) => {
    element.addEventListener("click", async (e) => {
      // console.log(`/songs/${e.currentTarget.dataset.folder}`)
      songs = await fetchSongs(`/songs/${e.currentTarget.dataset.folder}/`);
      // console.log(songs)
      playMusic(songs[0]);
    });
  });
}

async function main() {
  let songs = await fetchSongs("/songs/ncs/");
  // console.log(songs)

  // display all the albums on the page

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      play.src = "images/pause.svg";
      currentSong.play();
    } else {
      currentSong.play();
      play.src = "images/play.svg";
      currentSong.pause();
    }
  });

  // listen for time update

  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;

    // console.log(currentTime, duration)
    document.querySelector(".song-time").innerText = `${secondsToMinutesSeconds(
      currentTime
    )} / ${secondsToMinutesSeconds(duration)}`;
    document.querySelector(".circle").style.left =
      (currentTime / duration) * 100 + "%";
    if (currentTime == duration) {
      play.src = "images/play.svg";
      document.querySelector(".circle").style.left = 0 + "%";
      document.querySelector(".song-time").innerText = "00:00 / 00:00";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (event) => {
    let seekbarRect = event.target.getBoundingClientRect(); // Get seekbar dimensions
    let clickX = event.clientX - seekbarRect.left; // Clicked position in seekbar
    let seekbarWidth = seekbarRect.width; // Total seekbar width

    let percentage = (clickX / seekbarWidth) * 100; // Convert to percentage
    document.querySelector(".circle").style.left = percentage + "%"; // Move circle

    // Jump song to clicked position
    let newTime = (percentage / 100) * currentSong.duration;
    currentSong.currentTime = newTime;
  });

  // add hamburger functionality

  document
    .querySelector(".hamburgerContainer")
    .addEventListener("click", () => {
      document.querySelector(".left").style.left = 0;
    });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add next previous functionality

  previous.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`${currfolder}`)[1].replaceAll("%20", " ")
    );
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`${currfolder}`)[1].replaceAll("%20", " ")
    );
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log("hello")
      // console.log(e)
      currentSong.volume = parseFloat(e.target.value) / 100;

      if (currentSong.volume != 0){
        document.querySelector(".volume > img").src = "images/volume.svg"
      }
    });

    // add event listner to mute button

    document.querySelector(".volume > img").addEventListener("click", (e) => {
      let imgSrc = e.target.src;
      if (imgSrc.includes("images/volume.svg")) {
      e.target.src = "images/mute.svg"
      currentSong.volume = 0.0;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = "images/volume.svg"
        currentSong.volume = 0.1
        document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 10;
      }
    })
}

main();
