document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const DILLA_SOURCES = [
        // Playlists (Add more good ones!) - Use Playlist ID from URL
        { type: 'playlist', id: 'PLSXjN3SAKjAnu53kZKeXvws1gKyJ5fL6P' }, // Example: "J Dilla Instrumentals"
        { type: 'playlist', id: 'PL8dPuuaLjXtP3fzW9AGqnM74aRPm5a7Cv' }, // Example: "J Dilla Beats"
        // You can also add specific Video IDs for very rare/specific tracks
        // { type: 'video', id: 'VIDEO_ID_HERE' },
    ];

    const REAL_RAP_SOURCES = [
        // Specific Albums (as playlists if available, or curated track lists)
        { type: 'playlist', id: 'PLJ25HAl8I0-De7VFRQD7x_x8SmXo7lJ-S', name: "Black Moon - Enta Da Stage" }, // Example Playlist ID
        { type: 'playlist', id: 'PLb41EF0qHy_pGg2tG0sF5f9Z9l5G4jGkD', name: "OGC - Da Storm" }, // Example Playlist ID
        { type: 'playlist', id: 'PLZo0Mh0Z4tUD7DYmBEc7H8pSjMFp_q7sK', name: "Smif-N-Wessun - Dah Shinin'" }, // Example
        { type: 'playlist', id: 'PL1wqUOv5XAFwbB8U50z5rBGuuL-d7LgDW', name: "Heltah Skeltah - Nocturnal" }, // Example
        // Add more album playlists or specific video IDs
         { type: 'video', id: 'h2PQa_OmKdo', name: "Nas - N.Y. State of Mind" },
         { type: 'video', id: 'JxPmzBi3KIk', name: "Mobb Deep - Shook Ones, Pt. II" },
         { type: 'video', id: 'fiGyLsW47_k', name: "Pete Rock & CL Smooth - T.R.O.Y." },

    ];

    // --- Element Selectors ---
    const ipodContainer = document.getElementById('ipod-container');
    const dillaButton = document.getElementById('dilla-button');
    const realRapButton = document.getElementById('real-rap-button');
    const colorSelector = document.getElementById('color-selector');
    const yearSpan = document.getElementById('year'); // For footer
    const audioVideoToggle = document.getElementById('audio-video-toggle');
    const trackTitleElement = document.getElementById('track-title');
    const trackArtistElement = document.getElementById('track-artist');
    const centerButton = document.querySelector('.control-button.center');
    const headerPlayPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const progressBar = document.getElementById('progress-bar-filled');


    // --- YouTube Player State ---
    let player; // YouTube Player object
    let isPlayerReady = false;
    let isVideoVisible = true; // Start in video mode
    let currentTrackInfo = { title: "-- The Next Discussion --", artist: "" };
    let updateInterval; // For progress bar

    // --- 1. YouTube Player API Initialization ---
    // This function is called automatically by the YouTube API script
    window.onYouTubeIframeAPIReady = function() {
        console.log("YouTube API Ready");
        player = new YT.Player('youtube-player', {
            height: '100%', // Fill the container
            width: '100%',
            playerVars: {
                'playsinline': 1, // Important for mobile playback
                'controls': 0,    // Hide default YouTube controls
                'disablekb': 1,   // Disable keyboard controls
                'modestbranding': 1, // Less YouTube branding
                'rel': 0          // Don't show related videos
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }

    function onPlayerReady(event) {
        console.log("Player Ready");
        isPlayerReady = true;
        // Enable buttons that rely on the player
        dillaButton.disabled = false;
        realRapButton.disabled = false;
        centerButton.disabled = false; // Enable center play/pause
        headerPlayPauseButton.disabled = false;
        prevButton.disabled = false;
        nextButton.disabled = false;

        // Update UI elements
        updateTrackDisplay();
        updatePlayPauseButtons(player.getPlayerState());

        // Apply initial color theme (e.g., silver)
        setColorTheme('silver'); // Set a default
        // Set initial audio/video mode
        setAudioVideoMode(isVideoVisible);
    }

    function onPlayerStateChange(event) {
        console.log("Player State Changed:", event.data);
        updatePlayPauseButtons(event.data);
        updateTrackDisplay(); // Update title when song changes

        // Manage Progress Bar
        if (event.data === YT.PlayerState.PLAYING) {
            startProgressBar();
        } else {
            stopProgressBar();
            // Update progress one last time if stopped/paused
             if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                 updateProgressBar();
             }
        }

        // Handle end of video/playlist item - maybe play next random? (Optional)
        // if (event.data === YT.PlayerState.ENDED) {
        //     console.log("Track ended");
        //     // Optionally trigger playing another random track from the *same* category?
        // }
    }

    function onPlayerError(event) {
        console.error("Player Error:", event.data);
        trackTitleElement.textContent = "Playback Error";
        trackArtistElement.textContent = "Could not load video";
        stopProgressBar();
        // Provide more specific feedback based on error code if desired
    }

    // --- 2. Playback Logic ---
    function playRandomSource(sourceArray) {
        if (!isPlayerReady || sourceArray.length === 0) {
             console.warn("Player not ready or source array empty.");
             return;
        }

        const randomIndex = Math.floor(Math.random() * sourceArray.length);
        const source = sourceArray[randomIndex];

        console.log("Loading source:", source);

        if (source.type === 'playlist') {
            player.loadPlaylist({
                list: source.id,
                listType: 'playlist',
                index: 0, // Start from the beginning of the playlist
                // index: Math.floor(Math.random() * 50), // Or start randomly within playlist (approx)
                suggestedQuality: 'small' // Optimize for background/small screen
            });
        } else if (source.type === 'video') {
            player.loadVideoById({
                videoId: source.id,
                suggestedQuality: 'small'
             });
        }
        // Update display immediately (optional, state change will also update)
        trackTitleElement.textContent = source.name || "Loading...";
        trackArtistElement.textContent = source.type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';
    }

    // --- 3. UI Updates ---
    function updateTrackDisplay() {
        if (!isPlayerReady || !player.getVideoData) return;

        const videoData = player.getVideoData();
        if (videoData && videoData.title) {
            currentTrackInfo.title = videoData.title;
            // Basic artist extraction (often tricky with YouTube titles)
            const titleParts = videoData.title.split(/[-–—]/); // Split by hyphens/dashes
            if (titleParts.length > 1) {
                currentTrackInfo.artist = titleParts[0].trim(); // Assume artist is first part
                currentTrackInfo.title = titleParts.slice(1).join('-').trim(); // Join rest as title
            } else {
                currentTrackInfo.artist = videoData.author || ""; // Fallback to channel author
                currentTrackInfo.title = videoData.title;
            }
        } else {
            // Keep previous info or reset if nothing is playing
             if (player.getPlayerState() !== YT.PlayerState.PLAYING && player.getPlayerState() !== YT.PlayerState.PAUSED) {
                 currentTrackInfo.title = "-- The Next Discussion --";
                 currentTrackInfo.artist = "";
             }
        }

        trackTitleElement.textContent = currentTrackInfo.title;
        trackArtistElement.textContent = currentTrackInfo.artist;
    }

     function updatePlayPauseButtons(playerState) {
         const isPlaying = (playerState === YT.PlayerState.PLAYING);
         const playIconClass = 'fa-play';
         const pauseIconClass = 'fa-pause';

         // Center button icon
         const centerIcon = centerButton.querySelector('i');
         if (centerIcon) {
             centerIcon.className = isPlaying ? `fas ${pauseIconClass}` : `fas ${playIconClass}`;
         }
          centerButton.setAttribute('title', isPlaying ? 'Pause' : 'Play');


         // Header button icon
         const headerIcon = headerPlayPauseButton.querySelector('i');
         if (headerIcon) {
             headerIcon.className = isPlaying ? `fas ${pauseIconClass}` : `fas ${playIconClass}`;
         }
         headerPlayPauseButton.setAttribute('title', isPlaying ? 'Pause' : 'Play');
     }

    function togglePlayPause() {
        if (!isPlayerReady) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }

    // --- 4. Progress Bar ---
    function startProgressBar() {
        stopProgressBar(); // Clear any existing interval
        updateProgressBar(); // Update immediately
        updateInterval = setInterval(updateProgressBar, 1000); // Update every second
    }

    function stopProgressBar() {
        clearInterval(updateInterval);
    }

    function updateProgressBar() {
        if (!isPlayerReady || !player.getDuration || !progressBar) return;
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`; // Ensure it doesn't exceed 100%
        } else {
            progressBar.style.width = '0%'; // No duration available
        }
    }


    // --- 5. Color Theme Switching ---
    function setColorTheme(color) {
        if (!ipodContainer) return;
        // Remove existing theme classes
        ipodContainer.classList.remove('ipod-theme-silver', 'ipod-theme-blue', 'ipod-theme-green', 'ipod-theme-pink', 'ipod-theme-black');
        // Add the new theme class
        ipodContainer.classList.add(`ipod-theme-${color}`);

        // Update active state on buttons
        const buttons = colorSelector.querySelectorAll('.color-option');
        buttons.forEach(button => {
            if (button.dataset.color === color) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        console.log(`Set color theme: ${color}`);
    }

    // --- 6. Audio/Video Mode Toggle ---
    function setAudioVideoMode(showVideo) {
        if (!ipodContainer || !audioVideoToggle) return;
        isVideoVisible = showVideo;
        const icon = audioVideoToggle.querySelector('i');

        if (isVideoVisible) {
            ipodContainer.classList.remove('audio-mode');
            audioVideoToggle.setAttribute('title', 'Switch to Audio Only Mode');
            audioVideoToggle.classList.add('active'); // Indicate video is on
            if (icon) icon.className = 'fas fa-tv';
        } else {
            ipodContainer.classList.add('audio-mode');
             audioVideoToggle.setAttribute('title', 'Switch to Video Mode');
             audioVideoToggle.classList.remove('active'); // Indicate video is off (audio only)
             if (icon) icon.className = 'fas fa-headphones';
        }
        console.log(`Audio/Video Mode set to: ${isVideoVisible ? 'Video' : 'Audio'}`);
    }


    // --- 7. Footer Year ---
    function setCopyrightYear() {
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Event Listeners ---
    if (dillaButton) {
        dillaButton.addEventListener('click', () => playRandomSource(DILLA_SOURCES));
        dillaButton.disabled = true; // Disabled until player ready
    }
    if (realRapButton) {
        realRapButton.addEventListener('click', () => playRandomSource(REAL_RAP_SOURCES));
         realRapButton.disabled = true; // Disabled until player ready
    }

    if (colorSelector) {
        colorSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                const color = e.target.dataset.color;
                setColorTheme(color);
            }
        });
    }

    if (audioVideoToggle) {
         audioVideoToggle.addEventListener('click', () => setAudioVideoMode(!isVideoVisible));
    }

    if (centerButton) {
        centerButton.addEventListener('click', togglePlayPause);
        centerButton.disabled = true; // Disabled until player ready
    }
     if (headerPlayPauseButton) {
        headerPlayPauseButton.addEventListener('click', togglePlayPause);
        headerPlayPauseButton.disabled = true; // Disabled until player ready
    }

     if (prevButton) {
         prevButton.addEventListener('click', () => {
             if (isPlayerReady && player.previousVideo) player.previousVideo();
         });
         prevButton.disabled = true;
     }
      if (nextButton) {
         nextButton.addEventListener('click', () => {
             if (isPlayerReady && player.nextVideo) player.nextVideo();
         });
         nextButton.disabled = true;
     }


    // --- Initialization ---
    setCopyrightYear();
    // Player init happens via onYouTubeIframeAPIReady callback

    // Initial setup (will be refined once player is ready)
     setAudioVideoMode(isVideoVisible);
     setColorTheme('silver'); // Start with default silver


}); // End DOMContentLoaded
