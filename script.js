let currentSong = new Audio();
let songs = [];
let currfolder;

async function getSongs(folder) {
    currfolder = folder;

    let a = await fetch(`/${folder}/info.json`);
    
    let response = await a.json(); 

    if (response.songs) {
        songs = response.songs;
    } else {
        console.error("No songs array found in info.json");
        return [];
    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ''; 

    for (const song of songs) {
        songUl.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Song artist</div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </div>
            </li>`;
    }

    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(liElement => {
        liElement.addEventListener("click", event => {
            // Access the correct 'li' element that was clicked
            const songInfo = liElement.querySelector(".info");
            
            if (songInfo) {
                // Access the first child of '.info' and get its innerHTML
                const songTitle = songInfo.firstElementChild.innerHTML.trim();
                console.log(songTitle);  // Log the song title
                playMusic(songTitle);    // Call your playMusic function with the song title
            }
        });
    });
    
    return songs;
    
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    currentSong.play();

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
            <circle fill="green" />
            <path
              d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
              stroke="black" stroke-width="1.5" stroke-linejoin="round" transform="translate(2, 2)" />
          </svg>
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
      </div>`;
        }
    }
}

async function fetchSongs() {
    try {
        const response = await fetch('info.json'); 
        if (!response.ok) {
            throw new Error('Failed to fetch info.json');
        }

        const data = await response.json();
        const songs = data.songs;

        console.log(songs);  
        return songs; 
    } catch (error) {
        console.error('Error fetching or processing the JSON file:', error);
    }
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    let previous = document.getElementById('previous');
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    let next = document.getElementById('next');
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0], true);
        }
    });

    function convertSecondsToMinutes(seconds) {
        let minutes = seconds / 60;
        return minutes.toFixed(2);
    }
    const seconds = 120;
    const minutes = convertSecondsToMinutes(seconds);
    console.log(`${seconds} seconds is equal to ${minutes} minutes.`);

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)}/ ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Event to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Load playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

main();
