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
        { type: 'playlist', id: 'PL2915EAE02B0C2B64', name: "Classic Rap" },
        { type: 'playlist', id: 'PLBTG-Sh12vzumoFYiZ04UvNo8JnCnGAZu', name: "OGDonNinja" },
        // Videos
        { type: 'video', id: 'ImSoA_fAVL4', name: "Nas - Memory Lane (Sittin' in da Park)" },
        { type: 'video', id: '8FGuJdxldkI', name: "MF DOOM X MR. FANTASTIK - UNRELEASED TRACK (PROD. MADLIB)" },
        { type: 'video', id: 'yoW21AZltDo', name: "9th Wonder - You Girl Soul (Instrumental)" },
        { type: 'video', id: 'pkXDZQrebi4', name: "O.G.C. - God Don't Like Ugly (Instrumental)" },
        { type: 'video', id: 'xUDNMmbYtkw', name: "O.G.C. - No Fear" },
        { type: 'video', id: 'm_bOjWb0KeI', name: "Smif-N-Wessun: NPR Music Tiny Desk Concert" },
        { type: 'video', id: 'ubWL8VAPoYw', name: "Snoop Dogg - Riders on the Storm (feat. The Doors)" },
        { type: 'video', id: 'LpsKdWOpc3A', name: "COLASO - MY THOUGHTS ARE EXTRAORDINARY" },
        
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
    const playbackRateSlower = document.getElementById('playback-rate-slower');
    const playbackRateFaster = document.getElementById('playback-rate-faster');
    const rateIndicatorText = document.getElementById('rate-indicator');
    const vizToggle = document.getElementById('viz-toggle');
    const canvas = document.getElementById('visualizer-canvas');
    const ctx = canvas?.getContext('2d');

    // --- YouTube Player State ---
    let player;
    let isPlayerReady = false;
    let isVideoVisible = true;
    let currentTrackInfo = { title: "-- The Next Discussion --", artist: "" };
    let updateInterval;
    const PLAYBACK_RATE_STEP = 0.25;
    const MIN_PLAYBACK_RATE = 0.25;
    const MAX_PLAYBACK_RATE = 2.0;
    let currentPlaybackRate = 1.0;
    let isVizActive = false;
    let animationFrameId = null;
    const vizBars = 50;
    let vizColor = '#f0f0f0';
    // State variable to track the last category chosen for random play
    let lastRandomSourceCategory = DILLA_SOURCES; // Default to Dilla

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
        // Enable buttons that don't depend on content type yet
        dillaButton.disabled = false;
        realRapButton.disabled = false;
        centerButton.disabled = false;
        headerPlayPauseButton.disabled = false;
        if (playbackRateSlower) playbackRateSlower.disabled = false;
        if (playbackRateFaster) playbackRateFaster.disabled = false;
        if (vizToggle) vizToggle.disabled = false;
        // Keep prev/next disabled until a playlist is loaded
        prevButton.disabled = true;
        nextButton.disabled = true;

        // Set initial state
        updateTrackDisplay();
        updatePlayPauseButtons(player.getPlayerState());
        currentPlaybackRate = 1.0;
        if(player.setPlaybackRate) player.setPlaybackRate(currentPlaybackRate); // Set initial rate on player
        updateRateIndicator();
        setColorTheme('silver');
        setAudioVideoMode(isVideoVisible);
        setupVisualizer();
    }

    function onPlayerStateChange(event) {
        console.log("Player State Changed:", event.data);
        updatePlayPauseButtons(event.data);
        updateTrackDisplay();
        if (event.data === YT.PlayerState.PLAYING) startProgressBar();
        else {
            stopProgressBar();
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) updateProgressBar();
        }
    }

    function onPlayerError(event) {
        console.error("Player Error:", event.data);
        trackTitleElement.textContent = "Playback Error";
        trackArtistElement.textContent = `Code: ${event.data}`;
        stopProgressBar();
        updatePlaylistControls(false); // Ensure prev/next are disabled on error
    }

    // --- 2. Playback Logic ---
    function updatePlaylistControls(isPlaylistLoaded) {
        if (prevButton) prevButton.disabled = !isPlaylistLoaded;
        // Keep Next button always enabled, its behavior changes instead
        // if (nextButton) nextButton.disabled = !isPlaylistLoaded;
        if (nextButton) nextButton.disabled = false; // Always enable Next button now
        console.log(`Prev control ${!isPlaylistLoaded ? 'disabled' : 'enabled'}. Next control always enabled.`);
    }

    function playRandomSource(sourceArray) {
        if (!isPlayerReady || sourceArray.length === 0) {
            console.warn("Player not ready or source array empty."); return;
        }
        // Store the category being played
        lastRandomSourceCategory = sourceArray; // Remember which category we picked from

        const randomIndex = Math.floor(Math.random() * sourceArray.length);
        const source = sourceArray[randomIndex];
        console.log("Loading random source:", source);

        // Update display immediately
        trackTitleElement.textContent = source.name || "Loading...";
        trackArtistElement.textContent = source.type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';

        if (source.type === 'playlist') {
            player.loadPlaylist({ list: source.id, listType: 'playlist', index: 0, suggestedQuality: 'small' });
            // Use the shuffle + next method again
            setTimeout(() => {
                if (player && player.setShuffle) { player.setShuffle(true); player.nextVideo(); console.log("Playlist loaded, shuffle enabled, playing next."); }
            }, 500);
            updatePlaylistControls(true); // Enable prev button, next button stays enabled
        } else if (source.type === 'video') {
            if (player && player.setShuffle) { player.setShuffle(false); console.log("Single video loaded, shuffle disabled."); }
            player.loadVideoById({ videoId: source.id, suggestedQuality: 'small' });
            updatePlaylistControls(false); // Disable prev button, next button stays enabled
        }
    }

    function playSpecificSource(type, id, name = "Loading...") {
        if (!isPlayerReady) { console.warn("Player not ready."); return; }
        console.log(`Loading specific source: ${type} - ${id}`);

        trackTitleElement.textContent = name;
        trackArtistElement.textContent = type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';

        // Ensure shuffle is OFF for pinned items
        if (player && player.setShuffle) { player.setShuffle(false); console.log("Loading pinned item, shuffle disabled."); }

        if (type === 'playlist') {
            player.loadPlaylist({ list: id, listType: 'playlist', index: 0, suggestedQuality: 'small' });
            updatePlaylistControls(true); // Enable prev, next stays enabled
        } else if (type === 'video') {
            player.loadVideoById({ videoId: id, suggestedQuality: 'small' });
            updatePlaylistControls(false); // Disable prev, next stays enabled
        }
    }

    // --- 3. UI Updates ---
    function updateTrackDisplay() {
        if (!isPlayerReady || !player.getVideoData) return;
        const videoData = player.getVideoData();
        if (videoData && videoData.title) {
            currentTrackInfo.title = videoData.title;
            const titleParts = videoData.title.split(/[-–—]/);
            currentTrackInfo.artist = titleParts.length > 1 ? titleParts[0].trim() : (videoData.author || "");
            currentTrackInfo.title = titleParts.length > 1 ? titleParts.slice(1).join('-').trim() : videoData.title;
        } else {
            if (player.getPlayerState() !== YT.PlayerState.PLAYING && player.getPlayerState() !== YT.PlayerState.PAUSED) {
                currentTrackInfo.title = "-- The Next Discussion --"; currentTrackInfo.artist = "";
            }
        }
        if (trackTitleElement) trackTitleElement.textContent = currentTrackInfo.title;
        if (trackArtistElement) trackArtistElement.textContent = currentTrackInfo.artist;
    }

     function updatePlayPauseButtons(playerState) {
        const isPlaying = (playerState === YT.PlayerState.PLAYING);
        const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
        const title = isPlaying ? 'Pause' : 'Play';
        centerButton?.querySelector('i')?.setAttribute('class', `fas ${iconClass}`);
        centerButton?.setAttribute('title', title);
        headerPlayPauseButton?.querySelector('i')?.setAttribute('class', `fas ${iconClass}`);
        headerPlayPauseButton?.setAttribute('title', title);
    }

    function togglePlayPause() {
        if (!isPlayerReady) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) player.pauseVideo(); else player.playVideo();
    }

    // --- 4. Progress Bar ---
    function startProgressBar() { stopProgressBar(); updateProgressBar(); updateInterval = setInterval(updateProgressBar, 1000); }
    function stopProgressBar() { clearInterval(updateInterval); }
    function updateProgressBar() {
        if (!isPlayerReady || !player.getDuration || !progressBar) return;
        const duration = player.getDuration(); const currentTime = player.getCurrentTime();
        progressBar.style.width = duration > 0 ? `${Math.min((currentTime / duration) * 100, 100)}%` : '0%';
    }

    // --- 5. Color Theme Switching ---
    function setColorTheme(color) {
        if (!ipodContainer) return;
        ipodContainer.className = ipodContainer.className.replace(/ipod-theme-\w+/g, '');
        ipodContainer.classList.add(`ipod-theme-${color}`);
        colorSelector?.querySelectorAll('.color-option').forEach(button => button.classList.toggle('active', button.dataset.color === color));
        console.log(`Set color theme: ${color}`);
        updateVizColor();
        if(isVizActive) { stopVisualizer(); setTimeout(startVisualizer, 50); }
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
        if (isVizActive) { stopVisualizer(); setTimeout(startVisualizer, 50); }
    }

    // --- 7. Footer Year ---
    function setCopyrightYear() { if (yearSpan) yearSpan.textContent = new Date().getFullYear(); }

    // --- 8. Dark Mode Toggle ---
    function setDarkMode(isDark) {
        const icon = darkModeToggle?.querySelector('i');
        bodyElement.classList.toggle('dark-mode', isDark);
        if (icon) icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'}`;
        darkModeToggle?.setAttribute('title', `Switch to ${isDark ? 'Light' : 'Dark'} Mode`);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateVizColor();
    }

    // --- 9. Play Specific Source (Definition moved up) ---

    // --- 10. Playback Rate Control ---
    function adjustPlaybackRate(direction) {
        if (!isPlayerReady || !player.setPlaybackRate || !player.getPlaybackRate) return;
        let currentRate = player.getPlaybackRate(); let newRate = currentRate;
        if (direction === 'faster') newRate = Math.min(MAX_PLAYBACK_RATE, currentRate + PLAYBACK_RATE_STEP);
        else if (direction === 'slower') newRate = Math.max(MIN_PLAYBACK_RATE, currentRate - PLAYBACK_RATE_STEP);
        if (newRate !== currentRate) { player.setPlaybackRate(newRate); currentPlaybackRate = newRate; console.log(`Set playback rate to: ${newRate}x`); updateRateIndicator(); }
    }
    function updateRateIndicator() { if (rateIndicatorText) rateIndicatorText.textContent = `${parseFloat(currentPlaybackRate.toFixed(2))}x`; }

    // --- 11. Visualizer ---
    function setupVisualizer() { if (!canvas || !ctx) { console.warn("Visualizer canvas not found."); vizToggle?.remove(); return; } resizeCanvas(); }
    function resizeCanvas() { if (!canvas) return; canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; updateVizColor(); }
    function updateVizColor() {
        if (!ipodContainer || !bodyElement) return;
        if (ipodContainer.classList.contains('ipod-theme-black')) vizColor = 'rgba(220, 220, 220, 0.7)';
        else if (bodyElement.classList.contains('dark-mode')) vizColor = 'rgba(150, 150, 150, 0.7)';
        else vizColor = getComputedStyle(ipodContainer).getPropertyValue('--ipod-screen-text') || 'rgba(20, 20, 20, 0.6)';
        if (vizColor.startsWith('rgb(')) vizColor = vizColor.replace('rgb', 'rgba').replace(')', ', 0.6)');
    }
    function drawVisualizer() {
        if (!ctx || !isVizActive || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); const barWidth = canvas.width / vizBars; const maxBarHeight = canvas.height * 0.8; ctx.fillStyle = vizColor;
        for (let i = 0; i < vizBars; i++) { const time = Date.now() / 500 + i * 0.3; let amp = (Math.sin(time) + 1) / 2 * (Math.random() * 0.3 + 0.7); amp = Math.pow(amp, 2); const h = Math.max(1, amp * maxBarHeight); ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 2, h); }
        animationFrameId = requestAnimationFrame(drawVisualizer);
    }
    function startVisualizer() { if (isVizActive && !animationFrameId && ctx) { console.log("Starting visualizer."); resizeCanvas(); animationFrameId = requestAnimationFrame(drawVisualizer); } }
    function stopVisualizer() { if (animationFrameId) { console.log("Stopping visualizer."); cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
    function toggleVisualizer() {
        isVizActive = !isVizActive; ipodContainer?.classList.toggle('viz-active', isVizActive); vizToggle?.classList.toggle('active', isVizActive); vizToggle?.setAttribute('title', isVizActive ? 'Hide Visualizer' : 'Show Visualizer');
        if (isVizActive) startVisualizer(); else stopVisualizer(); console.log(`Visualizer active: ${isVizActive}`);
    }

    // --- Event Listeners ---
    dillaButton?.addEventListener('click', () => playRandomSource(DILLA_SOURCES));
    realRapButton?.addEventListener('click', () => playRandomSource(REAL_RAP_SOURCES));
    colorSelector?.addEventListener('click', (e) => { if (e.target.classList.contains('color-option')) setColorTheme(e.target.dataset.color); });
    audioVideoToggle?.addEventListener('click', () => setAudioVideoMode(!isVideoVisible));
    centerButton?.addEventListener('click', togglePlayPause);
    headerPlayPauseButton?.addEventListener('click', togglePlayPause);

    // Previous Button Listener - only works if playlist is loaded (button state handled by updatePlaylistControls)
    prevButton?.addEventListener('click', () => {
        if (isPlayerReady && player.previousVideo) {
             player.previousVideo();
        }
    });

    // Next Button Listener - Modified Behavior
    nextButton?.addEventListener('click', () => {
        if (!isPlayerReady) return;
        // Check if a playlist is loaded using getPlaylist() - might return empty array or null
        const currentPlaylist = player.getPlaylist ? player.getPlaylist() : null;

        if (currentPlaylist && Array.isArray(currentPlaylist) && currentPlaylist.length > 0 && player.nextVideo) {
            // Playlist is active and player has nextVideo function
            console.log("Playlist active, using player.nextVideo()");
            player.nextVideo();
        } else {
            // No playlist active, or nextVideo not available - play a random source from the last category
            console.log("No playlist active or at end, triggering playRandomSource with last category.");
            playRandomSource(lastRandomSourceCategory); // Use the stored category
        }
    });

    darkModeToggle?.addEventListener('click', () => setDarkMode(!bodyElement.classList.contains('dark-mode')));
    archiveSection?.addEventListener('click', (e) => { if (e.target.classList.contains('archive-button')) { const btn = e.target; playSpecificSource(btn.dataset.type, btn.dataset.id, btn.textContent); } });
    progressBarContainer?.addEventListener('click', (e) => {
        if (!isPlayerReady || !player.getDuration) return; const duration = player.getDuration(); if (duration <= 0) return;
        const rect = progressBarContainer.getBoundingClientRect(); const offsetX = e.clientX - rect.left; const ratio = Math.max(0, Math.min(1, offsetX / progressBarContainer.offsetWidth));
        const time = ratio * duration; console.log(`Seeking to ${time.toFixed(2)}s (${(ratio * 100).toFixed(1)}%)`); player.seekTo(time, true);
        if (progressBar) progressBar.style.width = `${ratio * 100}%`;
    });
    playbackRateSlower?.addEventListener('click', () => adjustPlaybackRate('slower'));
    playbackRateFaster?.addEventListener('click', () => adjustPlaybackRate('faster'));
    vizToggle?.addEventListener('click', toggleVisualizer);
    window.addEventListener('resize', resizeCanvas);

    // --- Initialization ---
    setCopyrightYear();
    const savedTheme = localStorage.getItem('theme'); setDarkMode(savedTheme === 'dark');
    // Player init happens via onYouTubeIframeAPIReady callback

}); // End DOMContentLoaded
