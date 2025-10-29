document.addEventListener("DOMContentLoaded", () => {
  
  // --- Data ---
  const albums = {
    "Happy hist": [
      {
        title: "Cheri Cheri Lady ",
      file: "music-backend/Allsongs/Modern Talking - Cheri Cheri Lady (Lyrics).mp3"

      },
      {
        title: "why mona-Wannabe",
        file: "music-backend/Allsongs/why mona - Wannabe (Lyrics).mp3"
      },
      {
        title: "Diljit Dosanjh_ Born To Shine",
        file: "music-backend/Allsongs/Diljit Dosanjh_ Born To Shine (Official Music Video) G.O.A.T.mp3"
      }
    ],
    "Sad vibes": [
      {
        title: "Hanuman chalisa",
        file: "music-backend/Allsongs/shri-hanuman-chalisa.mp3"
      },
      {
        title: "Ram Na Milenge Hanuman Ke Bina",
        file: "music-backend/Allsongs/हनमन ज क भजन, सकट हरन वल क हनमन I Ram Na Milenge Hanuman Ke Bina, LAKHBIR SINGH LAKKHA.mp3"
      },
      {
        title: "Ram Ram Kiye Jaa",
        file: "music-backend/Allsongs/Khush Honge Hanuman Ram Ram Kiye Jaa I LAKHBIR SINGH LAKKHA I HD Video.mp3"
      }
    ],
    "Chillout": [
      {
        title: "Faded",
        file: "music-backend/Allsongs/Alan Walker - Faded (Lyrics).mp3"
      },
      {
        title: "Alan Walker Alone",
        file: "music-backend/Allsongs/Alan Walker - Alone (Lyrics).mp3"
      },
      {
        title: "Ava Max-Alone pt-II",
        file: "music-backend/Allsongs/Alan Walker & Ava Max - Alone, Pt. II (Lyrics).mp3"
      }
    ],
    "Workout": [
      {
        title: "Deerane",
        file: "music-backend/Allsongs/Deerane.mp3"
      },
      {
        title: "Jal Rahin Hain",
        file: "music-backend/Allsongs/Jal Rahin Hain - Full Video  Baahubali - The  Beginning  Maahishmati Anthem  Kailash , MM Kreem.mp3"
      },
      {
        title: "Jay-Jaykara",
        file: "music-backend/Allsongs/Jay-Jaykara  Baahubali 2 The Conclusion  Anushka Shetty & Prabhas  Kailash K  M.M.Kreem  Manoj.mp3"
      }
    ],
    "Party": [
      {
        title: "Pushpa-Oo Bolega",
        file: "music-backend/Allsongs/Oo Bolega ya Oo Oo Bolega Ft Samantha ( Full Video) Pushpa  Allu A, RashmikaKanika K, DSP, Sukumar.mp3"
      },
      {
        title: "Pushpa-Jeeva-Nadhi ",
        file: "music-backend/Allsongs/Jeeva-Nadhi.mp3"
      },
      {
        title: "Puspa-Angaaron",
        file: "music-backend/Allsongs/Angaaron (The Couple Song) Full Video Pushpa 2 The Rule Allu Arjun Rashmika Sukumar DSP, Shreya.mp3"
      }
    ],
    "Focus": [
      { title: "Focus Song 1", file: "focus1.mp3" },
      { title: "Focus Song 2", file: "focus2.mp3" },
      { title: "Focus Song 3", file: "focus3.mp3" }
    ]
  };

  const artists = {
    "Taylor Swift": [
      {
        title: "Bad Blood",
        file: "music-backend/Allsongs/Taylor Swift - Bad Blood ft. Kendrick Lamar.mp3"
      },
      {
        title: "Taylor Swift-Lover",
        file: "music-backend/Allsongs/Taylor Swift - Lover (Official Music Video).mp3"
      },
      { title: "Artist1 Song 3", file: "a1_song3.mp3" }
    ],
    "Guru Randhawa": [
      {
        title: "High-Rated Gabru",
        file: "music-backend/Allsongs/Guru Randhawa_ High Rated Gabru Official Song  DirectorGifty  Bhushan Kumar  T-Series.mp3"
      },
      {
        title: "Guru Randhawa-Lahore",
        file: "music-backend/Allsongs/Guru Randhawa_ Lahore (Official Video) Bhushan Kumar  Vee  DirectorGifty  T-Series.mp3"
      },
      {
        title: "Downtown",
        file: "music-backend/Allsongs/Guru Randhawa_ Downtown (Official Video)  Bhushan Kumar  DirectorGifty  Vee  Delbar Arya.mp3"
      }
    ],
    "Shreya Ghoshal": [
      {
        title: "Deewani Mastani",
        file: "music-backend/Allsongs/Deewani Mastani Full Video Song  Bajirao Mastani  Deepika Padukone.mp3"
      },
      {
        title: "Bas Ek Dhadak-Dhadak 2",
        file: "music-backend/Allsongs/Bas Ek Dhadak  Dhadak 2  Siddhant C, Triptii D  Shreya G, Jubin N, Javed-Mohsin, Rashmi V.mp3"
      },
      {
        title: "Leja-Leja Ra",
        file: "music-backend/Allsongs/Leja Leja Re (Full Video Song) Ustad Sultan Khan & Shreya Ghoshal  Ustad & The Divas.mp3"
      }
    ]
  };

  // --- SVG Icons ---
  const playIcon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="25" height="25"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="25" height="25"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;
  const musicNoteIcon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`;

  // --- Player Elements ---
  const audioPlayer = document.getElementById('audio-player');
  const audioSource = document.getElementById('audio-source');
  const songListElement = document.getElementById('songlist');
  const playButton = document.getElementById('play');
  const circle = document.querySelector('.circle');
  const songTime = document.querySelectorAll('.songtime');

  let currentSongIndex = 0;
  let currentPlaylist = [];

  playButton.innerHTML = playIcon;

  function convertSecondsToMinuteSecond(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  function loadAlbum(name, type = "album") {
    const data = type === "album" ? albums : artists;
    const songs = data[name];
    if (!songs) {
      alert(`No songs found for ${type}: ${name}`);
      return;
    }
    currentPlaylist = songs;
    currentSongIndex = 0;
    songListElement.innerHTML = "";
    songs.forEach((song, index) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="music-icon">${musicNoteIcon}</span> 
         <span class="title">${song.title}</span> 
         <span class="icon">${playIcon}</span>`;
      li.addEventListener("click", () => playSong(index));
      songListElement.appendChild(li);
    });
  }

  function playSong(index) {
    const song = currentPlaylist[index];
    if (!song) return;
    currentSongIndex = index;
    audioSource.src = song.file;
    audioPlayer.pause();
    audioPlayer.load();
    audioPlayer.oncanplay = () => {
      audioPlayer.play().catch(err => console.warn("Playback failed:", err));
      document.querySelectorAll(".songlist .icon").forEach(icon => {
        icon.innerHTML = playIcon;
      });
      const currentLi = document.querySelectorAll(".songlist li")[index];
      const currentIcon = currentLi.querySelector(".icon");
      if (currentIcon) currentIcon.innerHTML = pauseIcon;
      document.querySelectorAll(".songinfo").forEach(el => el.textContent = song.title);
    };
  }

  // --- Event Listeners ---
  document.querySelectorAll(".album-card").forEach(card => {
    card.addEventListener("click", () => {
      const albumName = card.getAttribute("data-playlist");
      loadAlbum(albumName, "album");
    });
  });

  document.querySelectorAll(".profile-card").forEach(card => {
    const artistKey = card.getAttribute("data-playlist");
    card.addEventListener("click", () => {
      loadAlbum(artistKey, "artist");
    });
  });

  document.getElementById('previous').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentSongIndex);
  });

  document.getElementById('next').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    playSong(currentSongIndex);
  });

  playButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playButton.innerHTML = pauseIcon;
    } else {
      audioPlayer.pause();
      playButton.innerHTML = playIcon;
    }
  });

  audioPlayer.addEventListener("ended", () => {
    playButton.innerHTML = playIcon;
  });

  audioPlayer.addEventListener("timeupdate", () => {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration || 1;
    const percent = (current / duration) * 100;
    circle.style.left = `${percent}%`;
    songTime.forEach(el => {
      el.textContent = `${convertSecondsToMinuteSecond(current)} / ${convertSecondsToMinuteSecond(duration)}`;
    });
  });

  document.getElementById("songList").addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const iconSpan = li.querySelector(".icon");
    const isPlaying = iconSpan.classList.contains("playing");
    document.querySelectorAll(".songlist .icon").forEach(icon => {
      icon.innerHTML = playIcon;
      icon.classList.remove("playing");
    });
    if (!isPlaying) {
      iconSpan.innerHTML = pauseIcon;
      iconSpan.classList.add("playing");
    } else {
      iconSpan.innerHTML = playIcon;
      iconSpan.classList.remove("playing");
    }
  });
});


// -----------------------------               hamburger-----------------------
document.querySelector(".hamburger").addEventListener("click",()=>{
  document.querySelector(".left").style.left="0px"
  console.log("click")
})
document.querySelector(".close").addEventListener("click",()=>{
  document.querySelector(".left").style.left="-100%"
  console.log("click")
})
// /----------------------------------------------------------------------
const toggleBtn = document.getElementById("toggle-btn");
const body = document.body;

// Check if a theme was saved before
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  body.classList.add("dark");
  toggleBtn.textContent = "☀️ Light Mode";
} else {
  // Default is light mode
  body.classList.remove("dark");
  toggleBtn.textContent = "🌙 Dark Mode";
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    toggleBtn.textContent = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    toggleBtn.textContent = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  }
});
