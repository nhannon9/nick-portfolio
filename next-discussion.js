document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const DILLA_SOURCES = [
        // Playlists
        { type: 'playlist', id: 'PLySydR2Lc6tWHLTPdBVZEA0aECGokHiZC' },
        { type: 'playlist', id: 'PL5uJoXmE7hgvhWREHqbcZbjvn_L031BdU' },
        { type: 'playlist', id: 'PLpDXhkESrNJs-0RpiBhhPVrgTxGHikr4l' },
        // Videos
        { type: 'video', id: 'FhwLNERl1AY', name: "J Dilla - Kamaal (Instrumental) (Extended)" },
        { type: 'video', id: 'vO2nWXCVt6o', name: "J Dilla - In Space (15 Minute Vinyl Version)" },
        { type: 'video', id: 'q8WMhklSumg', name: "J Dilla's Colors of You | Park Nights" },
        { type: 'video', id: 'w72Dkdcn45o', name: "J Dilla - Get Dis Money (Instrumental) (Extended)" },
        { type: 'video', id: 'R6UucC-r7wA', name: "Arlekin Ulmikundura, Quasimoto/Madlib, J Dilla - Walking with Lord Quas part.1" },
        { type: 'video', id: '7ZS91gws7oQ', name: "Quasimoto n’ friends but its chill af | Lofi Mix | CHILLAF | " },
    ];
    const REAL_RAP_SOURCES = [
        // Playlists
        { type: 'playlist', id: 'PLrbFUdbfepXXqaWS722iHEtKjbjib6aex', name: "Black Moon - Enta Da Stage" },
        { type: 'playlist', id: 'PLrbFUdbfepXULZMri62heffZj_QoXYkeT', name: "O.G.C. - Da Storm" },
        { type: 'playlist', id: 'PLrbFUdbfepXW6-xY2YMKOaGpyJIW3V0Hl', name: "Smif-N-Wessun - Dah Shinin'" },
        { type: 'playlist', id: 'PLrbFUdbfepXU-5WU0HeCe_d56loyH9OdP', name: "Heltah Skeltah - Nocturnal" },
        // Videos
        { type: 'video', id: 'ImSoA_fAVL4', name: "Nas - Memory Lane (Sittin' in da Park)" },
        { type: 'video', id: '8FGuJdxldkI', name: "MF DOOM X MR. FANTASTIK - UNRELEASED TRACK (PROD. MADLIB)" },
        { type: 'video', id: 'yoW21AZltDo', name: "9th Wonder - You Girl Soul (Instrumental)" },
        { type: 'video', id: 'pkXDZQrebi4', name: "O.G.C. - God Don't Like Ugly (Instrumental)" },
        { type: 'video', id: 'xUDNMmbYtkw', name: "O.G.C. - No Fear" },
        { type: 'video', id: 'm_bOjWb0KeI', name: "Smif-N-Wessun: NPR Music Tiny Desk Concert" },
        { type: 'video', id: 'ubWL8VAPoYw', name: "Snoop Dogg - Riders on the Storm (feat. The Doors)" },
    ];

    // --- Element Selectors ---
    const ipodContainer = document.getElementById('ipod-container');
    const dillaButton = document.getElementById('dilla-button');
    const realRapButton = document.getElementById('real-rap-button');
    const colorSelector = document.getElementById('color-selector');
    const yearSpan = document.getElementById('year');
    const audioVideoToggle = document.getElementById('audio-video-toggle');
    const trackTitleElement = document.getElementById('track-title');
    const trackArtistElement = document.getElementById('track-artist');
    const centerButton = document.querySelector('.control-button.center');
    const headerPlayPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const progressBar = document.getElementById('progress-bar-filled');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const bodyElement = document.body;
    const archiveSection = document.getElementById('archive-section');
    const progressBarContainer = document.querySelector('.progress-bar-visual');
    // Correct selectors for slower/faster speed controls
    const playbackRateSlower = document.getElementById('playback-rate-slower');
    const playbackRateFaster = document.getElementById('playback-rate-faster');
    const rateIndicatorText = document.getElementById('rate-indicator');
    // Visualizer selectors
    const vizToggle = document.getElementById('viz-toggle');
    const canvas = document.getElementById('visualizer-canvas');
    const ctx = canvas?.getContext('2d');

    // --- YouTube Player State ---
    let player;
    let isPlayerReady = false;
    let isVideoVisible = true;
    let currentTrackInfo = { title: "-- The Next Discussion --", artist: "" };
    let updateInterval;
    // Correct state vars for slower/faster speed controls
    const PLAYBACK_RATE_STEP = 0.25;
    const MIN_PLAYBACK_RATE = 0.25;
    const MAX_PLAYBACK_RATE = 2.0;
    let currentPlaybackRate = 1.0;
    // Visualizer state
    let isVizActive = false;
    let animationFrameId = null;
    const vizBars = 50;
    const barAmplitudes = new Array(vizBars).fill(0);
    let vizColor = '#f0f0f0';

    // --- 1. YouTube Player API Initialization ---
    window.onYouTubeIframeAPIReady = function() {
        console.log("YouTube API Ready");
        player = new YT.Player('youtube-player', {
            height: '100%', width: '100%',
            playerVars: { 'playsinline': 1, 'controls': 0, 'disablekb': 1, 'modestbranding': 1, 'rel': 0 },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange, 'onError': onPlayerError }
        });
    }

    function onPlayerReady(event) {
        console.log("Player Ready");
        isPlayerReady = true;
        // Enable buttons
        dillaButton.disabled = false;
        realRapButton.disabled = false;
        centerButton.disabled = false;
        headerPlayPauseButton.disabled = false;
        // Keep prev/next disabled until a playlist is loaded
        prevButton.disabled = true;
        nextButton.disabled = true;
        // Enable speed controls
        if (playbackRateSlower) playbackRateSlower.disabled = false;
        if (playbackRateFaster) playbackRateFaster.disabled = false;
        if (vizToggle) vizToggle.disabled = false; // Enable viz toggle


        // Set initial state
        updateTrackDisplay();
        updatePlayPauseButtons(player.getPlayerState());
        currentPlaybackRate = 1.0; // Ensure it starts at 1
        player.setPlaybackRate(currentPlaybackRate);
        updateRateIndicator();
        setColorTheme('silver');
        setAudioVideoMode(isVideoVisible);
        setupVisualizer(); // Setup viz after player is ready
    }

    function onPlayerStateChange(event) {
        console.log("Player State Changed:", event.data);
        updatePlayPauseButtons(event.data);
        updateTrackDisplay();

        // Manage Progress Bar
        if (event.data === YT.PlayerState.PLAYING) {
            startProgressBar();
        } else {
            stopProgressBar();
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                updateProgressBar();
            }
        }
    }

    function onPlayerError(event) {
        console.error("Player Error:", event.data);
        trackTitleElement.textContent = "Playback Error";
        trackArtistElement.textContent = `Code: ${event.data}`;
        stopProgressBar();
        updatePlaylistControls(false); // Disable prev/next on error
    }

    // --- 2. Playback Logic ---

    // NEW Function to control prev/next button state
    function updatePlaylistControls(isPlaylistLoaded) {
        if (prevButton) prevButton.disabled = !isPlaylistLoaded;
        if (nextButton) nextButton.disabled = !isPlaylistLoaded;
        console.log(`Playlist controls ${isPlaylistLoaded ? 'enabled' : 'disabled'}`);
    }

    function playRandomSource(sourceArray) {
        if (!isPlayerReady || sourceArray.length === 0) {
            console.warn("Player not ready or source array empty."); return;
        }
        const randomIndex = Math.floor(Math.random() * sourceArray.length);
        const source = sourceArray[randomIndex];
        console.log("Loading random source:", source);

        // Update display immediately
        trackTitleElement.textContent = source.name || "Loading...";
        trackArtistElement.textContent = source.type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';

        // Ensure shuffle is OFF initially
        if (player.setShuffle) player.setShuffle(false);

        if (source.type === 'playlist') {
            const randomTrackIndex = Math.floor(Math.random() * 50);
            console.log(`Attempting to start playlist at index: ${randomTrackIndex}`);
            player.loadPlaylist({ list: source.id, listType: 'playlist', index: randomTrackIndex, suggestedQuality: 'small' });
            updatePlaylistControls(true); // Enable prev/next
        } else if (source.type === 'video') {
            player.loadVideoById({ videoId: source.id, suggestedQuality: 'small' });
            updatePlaylistControls(false); // Disable prev/next
        }
    }

    function playSpecificSource(type, id, name = "Loading...") {
        if (!isPlayerReady) { console.warn("Player not ready."); return; }
        console.log(`Loading specific source: ${type} - ${id}`);

        trackTitleElement.textContent = name;
        trackArtistElement.textContent = type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';

        // Ensure shuffle is OFF for pinned items
        if (player.setShuffle) player.setShuffle(false);

        if (type === 'playlist') {
            player.loadPlaylist({ list: id, listType: 'playlist', index: 0, suggestedQuality: 'small' });
            updatePlaylistControls(true); // Enable prev/next
        } else if (type === 'video') {
            player.loadVideoById({ videoId: id, suggestedQuality: 'small' });
            updatePlaylistControls(false); // Disable prev/next
        }
    }

    // --- 3. UI Updates ---
    function updateTrackDisplay() {
        if (!isPlayerReady || !player.getVideoData) return;
        const videoData = player.getVideoData();
        if (videoData && videoData.title) {
            currentTrackInfo.title = videoData.title;
            const titleParts = videoData.title.split(/[-–—]/);
            if (titleParts.length > 1) {
                currentTrackInfo.artist = titleParts[0].trim();
                currentTrackInfo.title = titleParts.slice(1).join('-').trim();
            } else {
                currentTrackInfo.artist = videoData.author || "";
                currentTrackInfo.title = videoData.title;
            }
        } else {
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
        const centerIcon = centerButton?.querySelector('i');
        const headerIcon = headerPlayPauseButton?.querySelector('i');

        if (centerIcon) centerIcon.className = `fas ${isPlaying ? pauseIconClass : playIconClass}`;
        if (centerButton) centerButton.setAttribute('title', isPlaying ? 'Pause' : 'Play');
        if (headerIcon) headerIcon.className = `fas ${isPlaying ? pauseIconClass : playIconClass}`;
        if (headerPlayPauseButton) headerPlayPauseButton.setAttribute('title', isPlaying ? 'Pause' : 'Play');
    }

    function togglePlayPause() {
        if (!isPlayerReady) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) player.pauseVideo();
        else player.playVideo();
    }

    // --- 4. Progress Bar ---
    function startProgressBar() {
        stopProgressBar(); updateProgressBar();
        updateInterval = setInterval(updateProgressBar, 1000);
    }
    function stopProgressBar() { clearInterval(updateInterval); }
    function updateProgressBar() {
        if (!isPlayerReady || !player.getDuration || !progressBar) return;
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        } else { progressBar.style.width = '0%'; }
    }

    // --- 5. Color Theme Switching ---
    function setColorTheme(color) {
        if (!ipodContainer) return;
        ipodContainer.className = ipodContainer.className.replace(/ipod-theme-\w+/g, ''); // Remove old themes
        ipodContainer.classList.add(`ipod-theme-${color}`);
        colorSelector?.querySelectorAll('.color-option').forEach(button => {
            button.classList.toggle('active', button.dataset.color === color);
        });
        console.log(`Set color theme: ${color}`);
        updateVizColor(); // Update viz color when theme changes
        if(isVizActive) { stopVisualizer(); setTimeout(startVisualizer, 50); } // Restart viz
    }

    // --- 6. Audio/Video Mode Toggle ---
    function setAudioVideoMode(showVideo) {
        if (!ipodContainer || !audioVideoToggle) return;
        isVideoVisible = showVideo;
        const icon = audioVideoToggle.querySelector('i');
        const title = isVideoVisible ? 'Switch to Audio Only Mode' : 'Switch to Video Mode';
        const iconClass = isVideoVisible ? 'fa-tv' : 'fa-headphones';

        ipodContainer.classList.toggle('audio-mode', !isVideoVisible);
        audioVideoToggle.setAttribute('title', title);
        audioVideoToggle.classList.toggle('active', isVideoVisible);
        if (icon) icon.className = `fas ${iconClass}`;
        console.log(`Audio/Video Mode set to: ${isVideoVisible ? 'Video' : 'Audio'}`);
        if (isVizActive) { stopVisualizer(); setTimeout(startVisualizer, 50); } // Restart viz
    }

    // --- 7. Footer Year ---
    function setCopyrightYear() { if (yearSpan) yearSpan.textContent = new Date().getFullYear(); }

    // --- 8. Dark Mode Toggle ---
    function setDarkMode(isDark) {
        const icon = darkModeToggle?.querySelector('i');
        bodyElement.classList.toggle('dark-mode', isDark);
        if (icon) icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
        if (darkModeToggle) darkModeToggle.setAttribute('title', `Switch to ${isDark ? 'Light' : 'Dark'} Mode`);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateVizColor(); // Update viz color on dark mode change
    }

    // --- 9. Play Specific Source (Definition moved up) ---

    // --- 10. Playback Rate Control ---
    function adjustPlaybackRate(direction) {
        if (!isPlayerReady || !player.setPlaybackRate || !player.getPlaybackRate) return;
        let currentRate = player.getPlaybackRate();
        let newRate = currentRate; // Initialize with current
        if (direction === 'faster') newRate = Math.min(MAX_PLAYBACK_RATE, currentRate + PLAYBACK_RATE_STEP);
        else if (direction === 'slower') newRate = Math.max(MIN_PLAYBACK_RATE, currentRate - PLAYBACK_RATE_STEP);

        if (newRate !== currentRate) {
            player.setPlaybackRate(newRate);
            currentPlaybackRate = newRate; // Store the rate
            console.log(`Set playback rate to: ${newRate}x`);
            updateRateIndicator();
        }
    }
    function updateRateIndicator() {
        if (rateIndicatorText) {
            rateIndicatorText.textContent = `${parseFloat(currentPlaybackRate.toFixed(2))}x`;
        }
    }

    // --- 11. Visualizer ---
    function setupVisualizer() {
        if (!canvas || !ctx) {
            console.warn("Visualizer canvas not found.");
            if(vizToggle) vizToggle.style.display = 'none';
            return;
        }
        resizeCanvas(); // Size it initially
    }
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
        updateVizColor();
    }
    function updateVizColor() {
        if (!ipodContainer || !bodyElement) return; // Ensure elements exist
         if (ipodContainer.classList.contains('ipod-theme-black')) vizColor = 'rgba(220, 220, 220, 0.7)';
         else if (bodyElement.classList.contains('dark-mode')) vizColor = 'rgba(150, 150, 150, 0.7)';
         else vizColor = getComputedStyle(ipodContainer).getPropertyValue('--ipod-screen-text') || 'rgba(20, 20, 20, 0.6)';
         // Add alpha if needed (basic example, might need refinement based on CSS var format)
         if (vizColor.startsWith('rgb(')) vizColor = vizColor.replace('rgb', 'rgba').replace(')', ', 0.6)');
    }
    function drawVisualizer() {
        if (!ctx || !isVizActive || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / vizBars; const maxBarHeight = canvas.height * 0.8;
        ctx.fillStyle = vizColor;
        for (let i = 0; i < vizBars; i++) {
            const timeFactor = Date.now() / 500; const sineValue = Math.sin(timeFactor + i * 0.3);
            const randomFactor = Math.random() * 0.3 + 0.7; let amplitude = ((sineValue + 1) / 2) * randomFactor;
            amplitude = Math.pow(amplitude, 2); const barHeight = Math.max(1, amplitude * maxBarHeight);
            const x = i * barWidth; const y = canvas.height - barHeight;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        animationFrameId = requestAnimationFrame(drawVisualizer);
    }
    function startVisualizer() {
        if (isVizActive && !animationFrameId && ctx) {
            console.log("Starting visualizer animation."); resizeCanvas();
            animationFrameId = requestAnimationFrame(drawVisualizer);
        }
    }
    function stopVisualizer() {
        if (animationFrameId) {
            console.log("Stopping visualizer animation."); cancelAnimationFrame(animationFrameId); animationFrameId = null;
        }
    }
    function toggleVisualizer() {
        isVizActive = !isVizActive;
        ipodContainer?.classList.toggle('viz-active', isVizActive);
        vizToggle?.classList.toggle('active', isVizActive);
        vizToggle?.setAttribute('title', isVizActive ? 'Hide Visualizer' : 'Show Visualizer');
        if (isVizActive) startVisualizer(); else stopVisualizer();
        console.log(`Visualizer active: ${isVizActive}`);
    }

    // --- Event Listeners ---
    dillaButton?.addEventListener('click', () => playRandomSource(DILLA_SOURCES));
    realRapButton?.addEventListener('click', () => playRandomSource(REAL_RAP_SOURCES));
    colorSelector?.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-option')) {
            setColorTheme(e.target.dataset.color);
        }
    });
    audioVideoToggle?.addEventListener('click', () => setAudioVideoMode(!isVideoVisible));
    centerButton?.addEventListener('click', togglePlayPause);
    headerPlayPauseButton?.addEventListener('click', togglePlayPause);
    prevButton?.addEventListener('click', () => { if (isPlayerReady && player.previousVideo) player.previousVideo(); });
    nextButton?.addEventListener('click', () => { if (isPlayerReady && player.nextVideo) player.nextVideo(); });
    darkModeToggle?.addEventListener('click', () => setDarkMode(!bodyElement.classList.contains('dark-mode')));
    archiveSection?.addEventListener('click', (e) => {
        if (e.target.classList.contains('archive-button')) {
            const btn = e.target; playSpecificSource(btn.dataset.type, btn.dataset.id, btn.textContent);
        }
    });
    progressBarContainer?.addEventListener('click', (e) => {
        if (!isPlayerReady || !player.getDuration) return; const duration = player.getDuration(); if (duration <= 0) return;
        const rect = progressBarContainer.getBoundingClientRect(); const offsetX = e.clientX - rect.left;
        const clickedRatio = Math.max(0, Math.min(1, offsetX / progressBarContainer.offsetWidth));
        const targetTime = clickedRatio * duration;
        console.log(`Seeking to ${targetTime.toFixed(2)}s (${(clickedRatio * 100).toFixed(1)}%)`);
        player.seekTo(targetTime, true);
        if (progressBar) progressBar.style.width = `${clickedRatio * 100}%`; // Update visual immediately
    });
    playbackRateSlower?.addEventListener('click', () => adjustPlaybackRate('slower'));
    playbackRateFaster?.addEventListener('click', () => adjustPlaybackRate('faster'));
    vizToggle?.addEventListener('click', toggleVisualizer);
    window.addEventListener('resize', resizeCanvas); // Resize visualizer canvas on window resize

    // --- Initialization ---
    setCopyrightYear();
    const savedTheme = localStorage.getItem('theme'); setDarkMode(savedTheme === 'dark');
    // Player init happens via onYouTubeIframeAPIReady callback
    // Initial setup happens inside onPlayerReady

}); // End DOMContentLoaded
