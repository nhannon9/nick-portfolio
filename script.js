document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const MUSIC_TRACKS = [
        { name: "PS2 Ambience", url: "" }, // <-- REPLACE "" with actual URL
        { name: "DS Menu Loop", url: "" }, // <-- REPLACE "" with actual URL
        { name: "Halo 3 Main Theme", url: "" }, // <-- REPLACE "" with actual URL
        { name: "Assassin's Creed Ezio's Family", url: "" }, // <-- REPLACE "" with actual URL
        // Add more tracks as needed { name: "...", url: "..." }
    ];
    const SCROLL_REVEAL_OFFSET = "-100px"; // How far from bottom edge before revealing
    const BACK_TO_TOP_THRESHOLD = 300; // Pixels scrolled before button appears

    // --- Element Selectors ---
    const dateTimeWidget = {
        dateElement: document.getElementById('date'),
        timeElement: document.getElementById('time')
    };
    const yearSpan = document.getElementById('year');
    const header = document.querySelector('.site-header');
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const backToTopButton = document.querySelector('.back-to-top');
    const musicToggleButton = document.getElementById('music-toggle-button');
    const backgroundAudio = document.getElementById('background-audio');

    let currentTrackIndex = 0;
    let isMusicPlaying = false;

    // --- 1. Time and Date Widget ---
    function updateDateTime() {
        if (!dateTimeWidget.dateElement || !dateTimeWidget.timeElement) return;

        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', /* second: '2-digit', */ hour12: true }; // Seconds removed for less jitter

        dateTimeWidget.dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
        dateTimeWidget.timeElement.textContent = now.toLocaleTimeString(undefined, timeOptions);
    }

    // --- 2. Copyright Year ---
    function setCopyrightYear() {
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- 3. Smooth Scrolling ---
    function smoothScrollHandler(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        // Special case for back-to-top button or links to "#"
        if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = header ? header.offsetHeight : 0;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        } else {
            console.warn(`Smooth scroll target not found: ${targetId}`);
        }
    }

    // --- 4. Scroll Reveal Animation ---
    function setupScrollReveal() {
        if (!('IntersectionObserver' in window)) {
            console.warn("IntersectionObserver not supported, scroll animations disabled.");
            revealElements.forEach(el => el.classList.add('is-visible')); // Show elements immediately
            return;
        }

        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: `0px 0px ${SCROLL_REVEAL_OFFSET} 0px`,
            threshold: 0.1 // Trigger when 10% is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        revealElements.forEach(el => observer.observe(el));
    }

    // --- 5. Back to Top Button Visibility & Click ---
    function handleScroll() {
        // Back to Top Button Visibility
        if (backToTopButton) {
            if (window.pageYOffset > BACK_TO_TOP_THRESHOLD) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }

        // Add other scroll-based effects here if needed (e.g., header shrinking)
    }

    // --- 6. Music Playback ---
    function setupMusicPlayer() {
        if (!musicToggleButton || !backgroundAudio || MUSIC_TRACKS.length === 0) {
            console.warn("Music player elements not found or no tracks defined.");
            if(musicToggleButton) musicToggleButton.style.display = 'none'; // Hide button if unusable
            return;
        }

        // Ensure URLs are valid before proceeding
        const validTracks = MUSIC_TRACKS.filter(track => track.url && typeof track.url === 'string' && track.url.trim() !== '');
        if (validTracks.length === 0) {
            console.error("No valid music track URLs provided.");
             if(musicToggleButton) musicToggleButton.style.display = 'none';
            return;
        }

        // Load the first valid track initially (but don't play)
        backgroundAudio.src = validTracks[currentTrackIndex].url;

        musicToggleButton.addEventListener('click', () => {
            if (isMusicPlaying) {
                backgroundAudio.pause();
            } else {
                // Ensure src is set before playing, especially if cycling
                 if (!backgroundAudio.src || backgroundAudio.src !== validTracks[currentTrackIndex].url) {
                    backgroundAudio.src = validTracks[currentTrackIndex].url;
                 }
                // Play returns a Promise, handle potential errors (like browser restrictions)
                backgroundAudio.play().catch(error => {
                    console.error("Audio playback failed:", error);
                    // Optionally provide user feedback here
                    alert("Browser prevented audio playback. You may need to interact with the page first.");
                    // Reset state if playback fails immediately
                    setMusicState(false);
                });
            }
        });

        // Update button state when audio actually plays or pauses
        backgroundAudio.addEventListener('play', () => setMusicState(true));
        backgroundAudio.addEventListener('pause', () => setMusicState(false));

        // Handle cycling to the next track when one ends (if loop is not set on audio element)
        // If 'loop' attribute IS set on <audio>, this 'ended' event might not be needed
        // unless you want to explicitly cycle tracks instead of looping the same one.
        backgroundAudio.addEventListener('ended', () => {
            currentTrackIndex = (currentTrackIndex + 1) % validTracks.length;
            backgroundAudio.src = validTracks[currentTrackIndex].url;
            backgroundAudio.play().catch(error => console.error("Audio playback failed on track end:", error));
             console.log(`Playing next track: ${validTracks[currentTrackIndex].name}`);
        });
    }

    function setMusicState(playing) {
        isMusicPlaying = playing;
        if (musicToggleButton) {
            const icon = musicToggleButton.querySelector('i');
            if (playing) {
                musicToggleButton.classList.add('playing');
                musicToggleButton.setAttribute('aria-label', 'Pause Background Music');
                musicToggleButton.setAttribute('title', 'Pause Background Music');
                if (icon) icon.className = 'fas fa-pause';
            } else {
                musicToggleButton.classList.remove('playing');
                musicToggleButton.setAttribute('aria-label', 'Play Background Music');
                 musicToggleButton.setAttribute('title', 'Play Background Music');
                if (icon) icon.className = 'fas fa-play';
            }
        }
    }


    // --- Initialization ---
    updateDateTime(); // Initial call
    setInterval(updateDateTime, 30000); // Update time every 30 seconds (less frequent than 1s)

    setCopyrightYear();

    scrollLinks.forEach(link => link.addEventListener('click', smoothScrollHandler));

    setupScrollReveal();

    window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener for performance
    handleScroll(); // Initial check in case page loads already scrolled

    // Back to top click listener (already covered by smoothScrollHandler if href="#")
    // If it has a different href, add a specific listener:
    // if(backToTopButton && backToTopButton.getAttribute('href') !== '#') {
    //    backToTopButton.addEventListener('click', (e) => { /* specific logic */ });
    // }

    setupMusicPlayer();

}); // End DOMContentLoaded
