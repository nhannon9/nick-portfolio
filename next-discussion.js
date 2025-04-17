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
    // Placeholder video ID for initial load
    const PLACEHOLDER_VIDEO_ID = 'M7lc1UVf-VE'; // Example: Short Google clip

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
    // ** REMOVED **: let lastRandomSourceCategory = DILLA_SOURCES; // No longer needed for next button

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

        // ** CUE Placeholder video to prevent initial error **
        player.cueVideoById(PLACEHOLDER_VIDEO_ID);
        console.log("Cued placeholder video:", PLACEHOLDER_VIDEO_ID);

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
        nextButton.disabled = true; // Keep next disabled initially too

        // Set initial state
        updateTrackDisplay(); // Will show placeholder initially or default text
        updatePlayPauseButtons(player.getPlayerState()); // Should be CUED state
        currentPlaybackRate = 1.0;
        if(player.setPlaybackRate) player.setPlaybackRate(currentPlaybackRate);
        updateRateIndicator();
        setColorTheme('silver');
        setAudioVideoMode(isVideoVisible);
        setupVisualizer();
    }

    function onPlayerStateChange(event) {
        console.log("Player State Changed:", event.data, YT.PlayerState);
        updatePlayPauseButtons(event.data);
        updateTrackDisplay();

        if (event.data === YT.PlayerState.PLAYING) {
            startProgressBar();
        } else {
            stopProgressBar();
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                updateProgressBar();
            }
        }

        // ** Handle ENDED state for continuous play **
        if (event.data === YT.PlayerState.ENDED) {
            console.log("Track ended. Playing next random source.");
            playNextRandomSource(); // Call the new function
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
        // Enable Next button regardless, as it now handles both cases
        if (nextButton) nextButton.disabled = false;
        console.log(`Prev control ${!isPlaylistLoaded ? 'disabled' : 'enabled'}. Next control always enabled.`);
    }

    // ** NEW Function to handle playing the next random item **
    function playNextRandomSource() {
        const nextCategory = Math.random() < 0.5 ? DILLA_SOURCES : REAL_RAP_SOURCES;
        playRandomSource(nextCategory); // Call the main random function with a randomly chosen category
    }

    function playRandomSource(sourceArray) {
        if (!isPlayerReady || sourceArray.length === 0) {
            console.warn("Player not ready or source array empty."); return;
        }
        // ** REMOVED **: lastRandomSourceCategory = sourceArray; // No longer needed

        const randomIndex = Math.floor(Math.random() * sourceArray.length);
        const source = sourceArray[randomIndex];
        console.log("Loading random source:", source);

        trackTitleElement.textContent = source.name || "Loading...";
        trackArtistElement.textContent = source.type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';

        if (source.type === 'playlist') {
            player.loadPlaylist({ list: source.id, listType: 'playlist', index: 0, suggestedQuality: 'small' });
            setTimeout(() => {
                if (player && player.setShuffle) { player.setShuffle(true); player.nextVideo(); console.log("Playlist loaded, shuffle enabled, playing next."); }
            }, 500);
            updatePlaylistControls(true);
        } else if (source.type === 'video') {
            if (player && player.setShuffle) { player.setShuffle(false); console.log("Single video loaded, shuffle disabled."); }
            player.loadVideoById({ videoId: source.id, suggestedQuality: 'small' });
            updatePlaylistControls(false); // Disable prev, next stays enabled
        }
    }

    function playSpecificSource(type, id, name = "Loading...") {
        if (!isPlayerReady) { console.warn("Player not ready."); return; }
        console.log(`Loading specific source: ${type} - ${id}`);
        trackTitleElement.textContent = name;
        trackArtistElement.textContent = type === 'playlist' ? "Playlist" : "Track";
        progressBar.style.width = '0%';
        if (player && player.setShuffle) { player.setShuffle(false); console.log("Loading pinned item, shuffle disabled."); }
        if (type === 'playlist') {
            player.loadPlaylist({ list: id, listType: 'playlist', index: 0, suggestedQuality: 'small' });
            updatePlaylistControls(true);
        } else if (type === 'video') {
            player.loadVideoById({ videoId: id, suggestedQuality: 'small' });
            updatePlaylistControls(false);
        }
    }

    // --- 3. UI Updates ---
    function updateTrackDisplay() {
        if (!isPlayerReady || !player.getVideoData) return;
        const videoData = player.getVideoData();
        // Avoid updating display if it's the placeholder video
        if (videoData && videoData.video_id === PLACEHOLDER_VIDEO_ID) {
             // Keep default text if placeholder is cued but not played
             if (player.getPlayerState() === YT.PlayerState.CUED || player.getPlayerState() === YT.PlayerState.UNSTARTED){
                 currentTrackInfo.title = "-- The Next Discussion --"; currentTrackInfo.artist = "";
             }
             // Don't update further if it's the placeholder
        } else if (videoData && videoData.title) {
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

     function updatePlayPauseButtons(playerState) { /* ... same ... */ }
     function togglePlayPause() { /* ... same ... */ }

    // --- 4. Progress Bar ---
    function startProgressBar() { /* ... same ... */ }
    function stopProgressBar() { /* ... same ... */ }
    function updateProgressBar() { /* ... same ... */ }

    // --- 5. Color Theme Switching ---
    function setColorTheme(color) { /* ... same ... */ }

    // --- 6. Audio/Video Mode Toggle ---
    function setAudioVideoMode(showVideo) { /* ... same ... */ }

    // --- 7. Footer Year ---
    function setCopyrightYear() { /* ... same ... */ }

    // --- 8. Dark Mode Toggle ---
    function setDarkMode(isDark) { /* ... same ... */ }

    // --- 9. Play Specific Source (Definition moved up) ---

    // --- 10. Playback Rate Control ---
    function adjustPlaybackRate(direction) { /* ... same ... */ }
    function updateRateIndicator() { /* ... same ... */ }

    // --- 11. Visualizer ---
    function setupVisualizer() { /* ... same ... */ }
    function resizeCanvas() { /* ... same ... */ }
    function updateVizColor() { /* ... same ... */ }
    function drawVisualizer() { /* ... same ... */ }
    function startVisualizer() { /* ... same ... */ }
    function stopVisualizer() { /* ... same ... */ }
    function toggleVisualizer() { /* ... same ... */ }

    // --- Event Listeners ---
    dillaButton?.addEventListener('click', () => playRandomSource(DILLA_SOURCES));
    realRapButton?.addEventListener('click', () => playRandomSource(REAL_RAP_SOURCES));
    colorSelector?.addEventListener('click', (e) => { /* ... */ });
    audioVideoToggle?.addEventListener('click', () => setAudioVideoMode(!isVideoVisible));
    centerButton?.addEventListener('click', togglePlayPause);
    headerPlayPauseButton?.addEventListener('click', togglePlayPause);

    prevButton?.addEventListener('click', () => { if (isPlayerReady && player.previousVideo) player.previousVideo(); });

    // ** Next Button Listener - Modified Behavior (Always enabled, chooses random category if no playlist) **
    nextButton?.addEventListener('click', () => {
        if (!isPlayerReady) return;
        const currentPlaylist = player.getPlaylist ? player.getPlaylist() : null;

        if (currentPlaylist && Array.isArray(currentPlaylist) && currentPlaylist.length > 0 && player.nextVideo) {
            console.log("Playlist active, using player.nextVideo()");
            player.nextVideo();
        } else {
            console.log("No playlist active or at end, triggering playNextRandomSource.");
            playNextRandomSource(); // Call the function that picks a random category AND item
        }
    });

    darkModeToggle?.addEventListener('click', () => setDarkMode(!bodyElement.classList.contains('dark-mode')));
    archiveSection?.addEventListener('click', (e) => { /* ... */ });
    progressBarContainer?.addEventListener('click', (e) => { /* ... */ });
    playbackRateSlower?.addEventListener('click', () => adjustPlaybackRate('slower'));
    playbackRateFaster?.addEventListener('click', () => adjustPlaybackRate('faster'));
    vizToggle?.addEventListener('click', toggleVisualizer);
    window.addEventListener('resize', resizeCanvas);

    // --- Initialization ---
    setCopyrightYear();
    const savedTheme = localStorage.getItem('theme'); setDarkMode(savedTheme === 'dark');
    // Player init happens via onYouTubeIframeAPIReady callback

}); // End DOMContentLoaded
