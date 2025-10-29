document.addEventListener("DOMContentLoaded", () => {

  // ----------------- LOGIN & SIGNUP -----------------
  async function signupUser(username, password) {
    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error during signup");
    }
  }

  async function loginUser(username, password) {
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify({ username: data.username }));
        alert(`Welcome ${data.username}!`);
        window.location.href = "index.html";
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  }

  // Attach signup/login form listeners
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("signupUsername").value;
      const password = document.getElementById("signupPassword").value;
      signupUser(username, password);
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      loginUser(username, password);
    });
  }

  // ----------------- LOGIN CHECK -----------------
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (window.location.pathname.includes("index.html") && !currentUser) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  // ----------------- MUSIC DATA -----------------
  const albums = {
    "Happy hist": [
      { title: "Cheri Cheri Lady", file: "music-backend/Allsongs/c1.mp3" },
      { title: "why mona-Wannabe", file: "music-backend/Allsongs/why mona - Wannabe (Lyrics).mp3" },
      { title: "Diljit Dosanjh_ Born To Shine", file: "music-backend/Allsongs/Diljit Dosanjh_ Born To Shine (Official Music Video) G.O.A.T.mp3" }
    ],
    "Sad vibes": [
      { title: "Hanuman chalisa", file: "music-backend/Allsongs/shri-hanuman-chalisa.mp3" },
      { title: "Ram Na Milenge Hanuman Ke Bina", file: "music-backend/Allsongs/हनमन ज क भजन, सकट हरन वल क हनमन I Ram Na Milenge Hanuman Ke Bina, LAKHBIR SINGH LAKKHA.mp3" },
      { title: "Ram Ram Kiye Jaa", file: "music-backend/Allsongs/Khush Honge Hanuman Ram Ram Kiye Jaa I LAKHBIR SINGH LAKKHA I HD Video.mp3" }
    ],
  };

  const artists = {
    "Taylor Swift": [
      { title: "Bad Blood", file: "music-backend/Allsongs/Taylor Swift - Bad Blood ft. Kendrick Lamar.mp3" },
      { title: "Taylor Swift-Lover", file: "music-backend/Allsongs/Taylor Swift - Lover (Official Music Video).mp3" }
    ],
  };

  // ----------------- MUSIC PLAYER -----------------
  const musicNoteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`;

  const audioPlayer = document.getElementById("player-audio") || document.getElementById("audio-player");
  const audioSource = document.getElementById("audio-source");
  const songListElement = document.getElementById("songlist");
  const playlistElement = document.getElementById("savedSongsList");

  // Professional Player Bar Elements
  const playerImg = document.getElementById("player-img");
  const playerTitle = document.getElementById("player-title");
  const playerArtist = document.getElementById("player-artist");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  const likeBtn = document.getElementById("like-btn");
  const volumeControl = document.getElementById("volume-control");
  const progressBar = document.getElementById("progress-bar");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const progressBarHandle = document.getElementById("progress-bar-handle");
  const timeCurrent = document.getElementById("time-current");
  const timeTotal = document.getElementById("time-total");

  let currentSongIndex = 0;
  let currentPlaylist = [];
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = 0;

  function convertSecondsToMinuteSecond(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  // ----------------- PROFESSIONAL PLAYER CONTROLS -----------------
  
  // Play/Pause
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (audioPlayer) {
        if (isPlaying) {
          audioPlayer.pause();
        } else {
          audioPlayer.play();
        }
      }
    });
  }

  if (audioPlayer) {
    audioPlayer.addEventListener("play", () => {
      isPlaying = true;
      if (playIcon) playIcon.style.display = "none";
      if (pauseIcon) pauseIcon.style.display = "block";
    });

    audioPlayer.addEventListener("pause", () => {
      isPlaying = false;
      if (playIcon) playIcon.style.display = "block";
      if (pauseIcon) pauseIcon.style.display = "none";
    });

    // Time formatting and progress
    audioPlayer.addEventListener("timeupdate", () => {
      const current = audioPlayer.currentTime;
      const duration = audioPlayer.duration;
      
      if (duration) {
        const percent = (current / duration) * 100;
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
        if (progressBarHandle) progressBarHandle.style.left = `${percent}%`;
        if (timeCurrent) timeCurrent.textContent = convertSecondsToMinuteSecond(current);
      }
    });

    audioPlayer.addEventListener("loadedmetadata", () => {
      if (timeTotal) timeTotal.textContent = convertSecondsToMinuteSecond(audioPlayer.duration);
    });

    audioPlayer.addEventListener("ended", () => {
      if (repeatMode === 2) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      } else if (repeatMode === 1 || currentSongIndex < currentPlaylist.length - 1) {
        nextSong();
      }
    });
  }

  // Progress bar click
  if (progressBar) {
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      if (audioPlayer) audioPlayer.currentTime = percent * audioPlayer.duration;
    });
  }

  // Progress bar drag
  let isDragging = false;
  if (progressBarHandle) {
    progressBarHandle.addEventListener("mousedown", () => {
      isDragging = true;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && progressBar && audioPlayer) {
        const rect = progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        audioPlayer.currentTime = percent * audioPlayer.duration;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }

  // Volume control
  if (volumeControl && audioPlayer) {
    volumeControl.addEventListener("input", (e) => {
      audioPlayer.volume = e.target.value / 100;
    });
    audioPlayer.volume = 0.8;
  }

  // Shuffle toggle
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle("active");
      showToast(isShuffle ? "Shuffle enabled" : "Shuffle disabled");
    });
  }

  // Repeat toggle
  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      repeatMode = (repeatMode + 1) % 3;
      if (repeatMode === 0) {
        repeatBtn.classList.remove("active");
        showToast("Repeat off");
      } else if (repeatMode === 1) {
        repeatBtn.classList.add("active");
        showToast("Repeat all");
      } else {
        repeatBtn.classList.add("active");
        showToast("Repeat one");
      }
    });
  }

  // Like button
  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      likeBtn.classList.toggle("active");
      if (likeBtn.classList.contains("active")) {
        showToast("Added to liked songs ❤️");
      } else {
        showToast("Removed from liked songs");
      }
    });
  }

  // Previous/Next buttons
  if (prevBtn) {
    prevBtn.addEventListener("click", () => previousSong());
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => nextSong());
  }

  function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentSongIndex);
  }

  function nextSong() {
    if (isShuffle) {
      currentSongIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    }
    playSong(currentSongIndex);
  }

  // Toast notification
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    }
  }

  // ----------------- LOAD ALBUM / ARTIST WITH SAVE BUTTON -----------------
  function loadAlbum(name, type = "album") {
    const data = type === "album" ? albums : artists;
    const songs = data[name];
    if (!songs) return alert(`No songs found for ${type}: ${name}`);

    currentPlaylist = songs;
    currentSongIndex = 0;
    if (songListElement) {
      songListElement.innerHTML = "";

      songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="icon">${musicNoteIcon}</span>
          <span class="title">${song.title}</span>
          <button class="save-btn" style="background: transparent; border: none; cursor: pointer; font-size: 18px; padding: 5px 10px;">❤️</button>
        `;
        
        // Click song to play
        li.addEventListener("click", (e) => {
          if (!e.target.classList.contains("save-btn")) {
            playSong(index);
          }
        });

        // Save button functionality
        const saveBtn = li.querySelector(".save-btn");
        saveBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          saveSong(song);
        });

        songListElement.appendChild(li);
      });
    }
  }

  // ----------------- SAVE SONG -----------------
  async function saveSong(song) {
    if (!currentUser) return alert("Please login to save songs!");
    try {
      const res = await fetch("http://localhost:3000/api/save-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: currentUser.username, 
          song: {
            title: song.title,
            artist: song.artist || "",
            album: song.album || "",
            url: song.url || song.file,
            coverUrl: song.coverUrl || song.thumbnail || "",
            file: song.file
          }
        }),
      });
      const data = await res.json();
      showToast(data.message);
      loadMySongs();
    } catch (err) {
      console.error(err);
      showToast("Failed to save song");
    }
  }

  // ----------------- LOAD SAVED SONGS WITH DELETE BUTTON -----------------
  async function loadMySongs() {
    if (!currentUser || !playlistElement) return;
    try {
      const res = await fetch(`http://localhost:3000/api/saved-songs/${currentUser.username}`);
      const data = await res.json();
      if (!data.success) return;

      playlistElement.innerHTML = "";
      data.songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.id = song.title;
        li.innerHTML = `
          <span class="icon">${musicNoteIcon}</span>
          <span class="title">${song.title}</span>
          <button class="delete-btn" style="background: #ff4d4d; border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 14px;">🗑️</button>
        `;
        
        // Click song to play
        li.style.cursor = "pointer";
        li.addEventListener("click", (e) => {
          if (!e.target.classList.contains("delete-btn")) {
            currentPlaylist = data.songs;
            currentSongIndex = index;
            playSong(index);
          }
        });

        // Delete button functionality
        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm(`Delete "${song.title}" from your playlist?`)) return;
          try {
            const delRes = await fetch(`http://localhost:3000/api/delete-song/${currentUser.username}/${encodeURIComponent(song.title)}`, {
              method: "DELETE"
            });
            const delData = await delRes.json();
            if (delData.success) {
              showToast("Song deleted successfully");
              li.remove();
            } else {
              showToast(delData.message);
            }
          } catch (err) {
            console.error(err);
            showToast("Failed to delete song");
          }
        });

        playlistElement.appendChild(li);
      });
    } catch (err) {
      console.error("Error loading saved songs:", err);
    }
  }

  if (window.location.pathname.includes("index.html") && currentUser) {
    loadMySongs();
  }

  // ----------------- LOAD COMMUNITY UPLOADS -----------------
  async function loadCommunityUploads() {
    const communityContainer = document.getElementById("community-uploads");
    if (!communityContainer) return;

    try {
      const res = await fetch("http://localhost:3000/get-all-uploads");
      const uploads = await res.json();

      communityContainer.innerHTML = "";

      if (uploads.length === 0) {
        communityContainer.innerHTML = "<p>No community uploads yet. Be the first to upload!</p>";
        return;
      }

      uploads.forEach((upload) => {
        const songCard = document.createElement("div");
        songCard.className = "community-song-card";
        songCard.innerHTML = `
          <img src="${upload.coverUrl}" alt="${upload.title}" class="song-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
          <div class="song-info">
            <h3>${upload.title}</h3>
            <p class="artist">${upload.artist}</p>
            <p class="uploader">Uploaded by: ${upload.uploadedBy}</p>
            <p class="date">${new Date(upload.uploadedAt).toLocaleDateString()}</p>
          </div>
          <button class="play-btn" data-url="${upload.url}">▶️ Play</button>
          <button class="save-btn" data-song='${JSON.stringify(upload)}'>💾 Save</button>
        `;

        songCard.querySelector(".play-btn").addEventListener("click", () => {
          currentPlaylist = [upload];
          currentSongIndex = 0;
          playSong(0);
        });

        songCard.querySelector(".save-btn").addEventListener("click", () => {
          saveSong({
            title: upload.title,
            artist: upload.artist,
            album: upload.album,
            url: upload.url,
            coverUrl: upload.coverUrl
          });
        });

        communityContainer.appendChild(songCard);
      });
    } catch (err) {
      console.error("Error loading community uploads:", err);
      if (communityContainer) {
        communityContainer.innerHTML = "<p>Failed to load community uploads.</p>";
      }
    }
  }

  if (window.location.pathname.includes("profile.html")) {
    loadCommunityUploads();
  }

  // ----------------- PLAY SONG -----------------
  function playSong(index) {
    const song = currentPlaylist[index];
    if (!song) return;
    currentSongIndex = index;

    let songUrl = "";
    if (song.url) {
      songUrl = song.url.startsWith('/') ? song.url : song.url;
    } else if (song.file) {
      if (song.file.startsWith("music-backend/Allsongs/")) {
        songUrl = `/Allsongs/${encodeURIComponent(song.file.split('/Allsongs/')[1])}`;
      } else {
        songUrl = song.file;
      }
    }

    // Update player bar
    if (playerTitle) playerTitle.textContent = song.title || "Unknown";
    if (playerArtist) playerArtist.textContent = song.artist || "Unknown Artist";
    if (playerImg) {
      playerImg.src = song.coverUrl || song.thumbnail || song.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%23333' width='56' height='56'/%3E%3C/svg%3E";
    }

    if (audioPlayer) {
      audioPlayer.src = songUrl;
      audioPlayer.play().catch(err => console.warn("Playback failed:", err));
    }

    // Highlight active song in sidebar
    if (songListElement) {
      const items = songListElement.querySelectorAll("li");
      items.forEach((li, i) => {
        if (i === index) {
          li.classList.add("active");
        } else {
          li.classList.remove("active");
        }
      });
    }

    // Highlight active song in saved playlist
    if (playlistElement) {
      const items = playlistElement.querySelectorAll("li");
      items.forEach((li, i) => {
        if (i === index) {
          li.classList.add("active");
        } else {
          li.classList.remove("active");
        }
      });
    }
  }

  // ----------------- ALBUM/ARTIST CARD CLICKS -----------------
  document.querySelectorAll(".album-card").forEach(card => {
    card.addEventListener("click", () => loadAlbum(card.getAttribute("data-playlist"), "album"));
  });
  
  document.querySelectorAll(".profile-card").forEach(card => {
    card.addEventListener("click", () => loadAlbum(card.getAttribute("data-playlist"), "artist"));
  });

  // ----------------- THEME TOGGLE -----------------
  const hamburger = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".close");
  const leftPanel = document.querySelector(".left");

  if (hamburger && leftPanel) {
    hamburger.addEventListener("click", () => {
      leftPanel.classList.add("active");
    });
  }
  
  if (closeBtn && leftPanel) {
    closeBtn.addEventListener("click", () => {
      leftPanel.classList.remove("active");
    });
  }

  const toggleBtn = document.getElementById("toggle-btn");
  const body = document.body;
  const savedTheme = localStorage.getItem("theme");

  if (toggleBtn) {
    // Set initial theme
    if (savedTheme === "light") {
      body.classList.add("light");
      toggleBtn.textContent = "🌙 Dark Mode";
    } else {
      body.classList.remove("light");
      toggleBtn.textContent = "☀️ Light Mode";
    }

    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("light");
      if (body.classList.contains("light")) {
        toggleBtn.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
      } else {
        toggleBtn.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // Profile button
  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      window.location.href = "/profile";
    });
  }
});
