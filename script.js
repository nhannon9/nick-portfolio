document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const MUSIC_TRACKS = [
        { name: "J Dilla - Donuts (Outro)", url: "audio/track1.mp3" }, // Replace with actual paths
        { name: "Madlib - Slim's Return", url: "audio/track2.mp3" },
        { name: "PS2 Menu Ambience", url: "audio/track3.mp3" }
    ];
    const SCROLL_REVEAL_OFFSET = "-50px"; 
    const BACK_TO_TOP_THRESHOLD = 400; 

    // --- Element Selectors ---
    const body = document.body;
    const header = document.querySelector('.site-header');
    const customCursor = document.getElementById('custom-cursor');
    const cursorHoverTargets = document.querySelectorAll('[data-cursor="hover"]');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const htmlElement = document.documentElement;
    
    const dateTimeWidget = {
        dateElement: document.getElementById('date'),
        timeElement: document.getElementById('time')
    };
    const yearSpan = document.getElementById('year');
    
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const backToTopButton = document.querySelector('.back-to-top');
    
    const musicToggleButton = document.getElementById('music-toggle-button');
    const backgroundAudio = document.getElementById('background-audio');

    // --- 1. Custom Magnetic Cursor ---
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth follow animation
        function animateCursor() {
            let distX = mouseX - cursorX;
            let distY = mouseY - cursorY;
            cursorX += distX * 0.2; // Interpolation for smoothness
            cursorY += distY * 0.2;
            
            customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover states
        cursorHoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
            target.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
        });
    } else {
        // Disable on touch devices
        if(customCursor) customCursor.style.display = 'none';
    }

    // --- 2. Theme Toggle (Dark/Light) ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggleButton.querySelector('i');
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // --- 3. Time and Date Widget ---
    function updateDateTime() {
        if (!dateTimeWidget.dateElement || !dateTimeWidget.timeElement) return;

        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true }; 

        dateTimeWidget.dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
        dateTimeWidget.timeElement.textContent = now.toLocaleTimeString(undefined, timeOptions);
    }
    updateDateTime();
    setInterval(updateDateTime, 30000); 

    // --- 4. Copyright Year ---
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- 5. Smooth Scrolling & Header Hide ---
    let lastScrollY = window.scrollY;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // --- 6. Scroll Reveal & UI Visibility ---
    function setupScrollReveal() {
        const observerOptions = {
            root: null,
            rootMargin: `0px 0px ${SCROLL_REVEAL_OFFSET} 0px`,
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }
    setupScrollReveal();

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Header hide/show on scroll direction
        if (currentScrollY > header.offsetHeight && currentScrollY > lastScrollY) {
            header.classList.add('scrolled-up');
        } else {
            header.classList.remove('scrolled-up');
        }
        lastScrollY = currentScrollY;

        // Back to top visibility
        if (backToTopButton) {
            if (currentScrollY > BACK_TO_TOP_THRESHOLD) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
    }, { passive: true });

    // --- 7. Music Playback ---
    let currentTrackIndex = 0;
    let isMusicPlaying = false;

    if (musicToggleButton && backgroundAudio && MUSIC_TRACKS.length > 0) {
        backgroundAudio.src = MUSIC_TRACKS[0].url;

        musicToggleButton.addEventListener('click', () => {
            if (isMusicPlaying) {
                backgroundAudio.pause();
            } else {
                if (!backgroundAudio.src || !backgroundAudio.src.includes(MUSIC_TRACKS[currentTrackIndex].url)) {
                    backgroundAudio.src = MUSIC_TRACKS[currentTrackIndex].url;
                }
                backgroundAudio.play().catch(err => {
                    console.error("Playback failed. Interaction required.", err);
                    setMusicState(false);
                });
            }
        });

        backgroundAudio.addEventListener('play', () => setMusicState(true));
        backgroundAudio.addEventListener('pause', () => setMusicState(false));

        backgroundAudio.addEventListener('ended', () => {
            currentTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
            backgroundAudio.src = MUSIC_TRACKS[currentTrackIndex].url;
            backgroundAudio.play();
        });
    }

    function setMusicState(playing) {
        isMusicPlaying = playing;
        const icon = musicToggleButton.querySelector('i');
        if (playing) {
            musicToggleButton.classList.add('playing');
            if (icon) icon.className = 'fas fa-pause';
        } else {
            musicToggleButton.classList.remove('playing');
            if (icon) icon.className = 'fas fa-play';
        }
    }

    // --- 8. Sysadmin Terminal Easter Egg ---
    const easterEggSequence = ['s', 'y', 's', 'f', 'x'];
    let sequencePosition = 0;
    const modal = document.getElementById('sysadmin-modal');
    const terminalOutput = document.getElementById('terminal-output');

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        if (key === easterEggSequence[sequencePosition]) {
            sequencePosition++;
            if (sequencePosition === easterEggSequence.length) {
                triggerEasterEgg();
                sequencePosition = 0; // Reset
            }
        } else {
            sequencePosition = 0; // Reset on wrong key
        }
    });

    function triggerEasterEgg() {
        if(modal.hasAttribute('open')) return;
        
        modal.showModal();
        body.style.overflow = 'hidden'; // Lock background scroll

        // Wait for CSS typing animation to finish (approx 1.5s), then print fetch
        setTimeout(() => {
            const fetchOutput = document.createElement('div');
            fetchOutput.innerHTML = `
<pre style="color: #d4d4d4; margin-top: 20px; font-size: 0.85rem;">
       _,met$$$$$gg.          <span style="color: #60a5fa; font-weight: bold;">admin@sysfx-core</span>
    ,g$$$$$$$$$$$$$$$P.       ----------------
  ,g$$P"     """Y$$.".        <span style="color: #4ade80;">OS</span>: Debian GNU/Linux 12 (bookworm) x86_64
 ,$$P'              \`$$$.     <span style="color: #4ade80;">Host</span>: SysFX Infrastructure Node [Clinton_CT]
',$$P       ,ggs.     \`$$b:   <span style="color: #4ade80;">Kernel</span>: 6.1.0-18-amd64
\`d$$'     ,$P"'   .    $$$    <span style="color: #4ade80;">Uptime</span>: 45 days, 12 hours, 3 mins
 $$P      d$'     ,    $$P    <span style="color: #4ade80;">Packages</span>: 1402 (dpkg)
 $$:      $$.   -    ,d$$'    <span style="color: #4ade80;">Shell</span>: bash 5.2.15
 $$;      Y$b._   _,d$P'      <span style="color: #4ade80;">CPU</span>: Intel Xeon E-2388G (16) @ 5.100GHz
 Y$$.    \`.\`"Y$$$$P"'         <span style="color: #4ade80;">Memory</span>: 16384MiB / 64328MiB
 \`$$b      "-.__              <span style="color: #4ade80;">Docker</span>: 14 containers running
  \`Y$$                        
   \`Y$$.                      <span style="color: #60a5fa;">admin@sysfx-core:~$</span> <span class="blinking-cursor" style="display:inline-block; width: 8px; height: 15px; background: #4ade80; animation: blink 1s step-end infinite; vertical-align: middle;"></span>
</pre>
            `;
            terminalOutput.appendChild(fetchOutput);
            terminalOutput.scrollTop = terminalOutput.scrollHeight; // Scroll to bottom
        }, 1800);
    }

    // Close modal on click outside or Escape key
    modal.addEventListener('click', (e) => {
        const dialogDimensions = modal.getBoundingClientRect()
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            closeModal();
        }
    });

    modal.addEventListener('close', closeModal);

    function closeModal() {
        modal.close();
        body.style.overflow = ''; // Unlock scroll
        
        // Reset terminal contents for next time
        setTimeout(() => {
            terminalOutput.innerHTML = `
            <div class="sys-login">
                <p class="login-time">Last login: Sat May 2 21:30:00 2026</p>
                <p class="ping-status">Establishing secure connection to Clinton_CT node... <span class="success">OK</span></p>
                <br>
                <p class="prompt">admin@sysfx-core:~$ <span class="typing-animation">neofetch</span></p>
            </div>`;
        }, 300); // Wait for modal fade out
    }

}); // End DOMContentLoaded