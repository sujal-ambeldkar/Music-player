const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { LoginUser, User, Upload } = require("./music-backend/mongodb"); // UPDATED: Added Upload
const fetch = require("node-fetch");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

// ----------------- ENSURE UPLOAD FOLDERS EXIST -----------------
const uploadFolders = ["uploads/songs", "uploads/covers"];
uploadFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Created folder: ${folderPath}`);
  }
});

// ----------------- MIDDLEWARE -----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Serve static songs and thumbnails
app.use('/Allsongs', express.static(path.join(__dirname, 'music-backend/Allsongs')));
app.use('/Thumbnails', express.static(path.join(__dirname, 'music-backend/Thumbnails')));

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------- GET ROUTES -----------------
app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.resolve(__dirname, "public", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.resolve(__dirname, "public", "signup.html")));
app.get("/profile", (req, res) => res.sendFile(path.resolve(__dirname, "public", "profile.html")));
app.get("/upload", (req, res) => res.sendFile(path.resolve(__dirname, "public", "upload.html")));

// ----------------- AUTH ROUTES -----------------
app.post("/signup", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password)
      return res.json({ success: false, message: "Missing username or password" });

    username = username.trim().toLowerCase();
    const existing = await LoginUser.findOne({ username });
    if (existing)
      return res.json({ success: false, message: "Username already exists" });

    const newLogin = new LoginUser({ username, password });
    const newUser = new User({ username, password, savedSongs: [] });
    await newLogin.save();
    await newUser.save();

    res.json({ success: true, message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.json({ success: false, message: "Error during signup" });
  }
});

app.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password)
      return res.json({ success: false, message: "Missing username or password" });

    username = username.trim().toLowerCase();
    const user = await LoginUser.findOne({ username });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    if (user.password !== password)
      return res.json({ success: false, message: "Wrong password" });

    res.json({ success: true, message: "Login successful", username });
  } catch (err) {
    console.error("Login error:", err);
    res.json({ success: false, message: "Something went wrong" });
  }
});

// ----------------- SONG ROUTES -----------------
app.post("/api/save-song", async (req, res) => {
  try {
    let { username, song } = req.body;
    if (!username || !song || !song.title)
      return res.json({ success: false, message: "Missing username or song data" });

    username = username.trim().toLowerCase();
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const exists = user.savedSongs.some(s => s.title === song.title);
    if (!exists) {
      user.savedSongs.push({
        title: song.title,
        artist: song.artist || "",
        movie: song.movie || "",
        album: song.album || "",
        url: song.url || `/Allsongs/${song.file?.split('/').pop() || ''}`,
        thumbnail: song.thumbnail || song.coverUrl || `/Thumbnails/${encodeURIComponent(song.file?.split('/').pop()?.replace('.mp3', '.jpg') || '')}`,
        coverUrl: song.coverUrl || song.thumbnail || "",
        addedAt: new Date()
      });
      await user.save();
    }

    res.json({ success: true, message: "Song saved successfully" });
  } catch (err) {
    console.error("Save song error:", err);
    res.json({ success: false, message: "Error saving song" });
  }
}); 

app.get("/api/saved-songs/:username", async (req, res) => {
  try {
    let username = req.params.username.trim().toLowerCase();
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    res.json({ success: true, songs: user.savedSongs });
  } catch (err) {
    console.error("Fetch songs error:", err);
    res.json({ success: false, message: "Error fetching songs" });
  }
});

app.delete("/api/delete-song/:username/:title", async (req, res) => {
  try {
    let username = req.params.username.trim().toLowerCase();
    const title = req.params.title;

    const user = await User.findOne({ username });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const initialCount = user.savedSongs.length;
    user.savedSongs = user.savedSongs.filter(song => song.title !== title);

    if (user.savedSongs.length === initialCount)
      return res.json({ success: false, message: "Song not found in saved songs" });

    await user.save();
    res.json({ success: true, message: "Song deleted successfully" });
  } catch (err) {
    console.error("Delete song error:", err);
    res.json({ success: false, message: "Error deleting song" });
  }
});

// ----------------- TRENDING -----------------



app.get("/api/trending", async (req, res) => {
  try {
    const response = await fetch("https://api.deezer.com/chart");
    const data = await response.json();

    // Try 'tracks' first
    let songs = [];
    if (data.tracks && Array.isArray(data.tracks.data) && data.tracks.data.length > 0) {
      songs = data.tracks.data.map(track => ({
        title: track.title,
        artist: track.artist && track.artist.name,
        image: track.album && track.album.cover_medium,
        url: track.preview
      }));
    }

    // If 'tracks' is empty, try extracting from playlists
    if (songs.length === 0 && data.playlists && Array.isArray(data.playlists.data)) {
      // For demo, only scan up to 5 playlists
      for (let playlist of data.playlists.data.slice(0, 5)) {
        try {
          const trackRes = await fetch(playlist.tracklist);
          const trackData = await trackRes.json();
          const playable = trackData.data && trackData.data.find(track => track.preview);
          if (playable) {
            songs.push({
              title: playable.title,
              artist: playable.artist && playable.artist.name,
              image: playable.album && playable.album.cover_medium || playlist.picture_medium,
              url: playable.preview
            });
          }
        } catch (e) {/* Skip failed playlists */}
      }
    }

    // Fallback demo if nothing found
    if (songs.length === 0) {
      songs = [
        {
          title: "Shape of You",
          artist: "Ed Sheeran",
          image: "https://i.scdn.co/image/ab67616d0000b2735d2cfa845b12163a47e43b76",
          url: "https://p.scdn.co/mp3-preview/29b0d72c320a.mp3?cid=774b29d4f13844c495f206cafdad9c86"
        }
      ];
    }

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});



// ----------------- SONG UPLOADS (IMPROVED) -----------------

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (file.fieldname === 'songFile') {
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 and WAV audio files are allowed'), false);
    }
  } else if (file.fieldname === 'albumImage') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Storage configuration with secure random filenames
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath =
      file.fieldname === "songFile"
        ? path.join(__dirname, "uploads/songs")
        : path.join(__dirname, "uploads/covers");

    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, folderPath);
    });
  },
  filename: (req, file, cb) => {
    // Generate secure random filename
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      const uniqueName = buf.toString('hex') + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});

const upload = multer({ 
  storage: songStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// --- Upload route ---
app.post("/upload-song", upload.fields([
  { name: "songFile", maxCount: 1 },
  { name: "albumImage", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("📁 FILES:", req.files);
    console.log("📝 BODY:", req.body);

    if (!req.files || !req.files.songFile || !req.files.albumImage) {
      return res.status(400).json({ success: false, message: "Missing files" });
    }

    const { title, artist, album, username } = req.body;
    
    if (!title || !username) {
      return res.status(400).json({ success: false, message: "Missing title or username" });
    }

    const songUrl = `/uploads/songs/${req.files.songFile[0].filename}`;
    const coverUrl = `/uploads/covers/${req.files.albumImage[0].filename}`;

    // Save to global Upload collection (visible to all users)
    const newUpload = new Upload({ 
      title, 
      artist: artist || 'Unknown',
      album: album || 'Unknown',
      url: songUrl, 
      coverUrl, 
      uploadedBy: username 
    });
    await newUpload.save();

    // Also add to user's saved songs
    const user = await User.findOne({ username });
    if (user) {
      user.savedSongs.push({ 
        title, 
        url: songUrl, 
        thumbnail: coverUrl,
        coverUrl: coverUrl,
        artist: artist || 'Unknown', 
        album: album || 'Unknown',
        movie: "",
        addedAt: new Date() 
      });
      await user.save();
    }

    console.log("✅ Upload successful!");
    res.json({ success: true, message: "Upload successful!", uploadId: newUpload._id });
  } catch (err) {
    console.error("❌ Upload error:", err);
    
    // Clean up uploaded files if database save fails
    if (req.files) {
      if (req.files.songFile) {
        fs.unlink(req.files.songFile[0].path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting song file:", unlinkErr);
        });
      }
      if (req.files.albumImage) {
        fs.unlink(req.files.albumImage[0].path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting image file:", unlinkErr);
        });
      }
    }
    
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `Upload error: ${err.message}` 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  next();
});

// --- Get all uploads for displaying to all users ---
app.get("/get-all-uploads", async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ uploadedAt: -1 }).limit(50);
    res.json(uploads);
  } catch (err) {
    console.error("Fetch uploads error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch uploads" });
  }
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
