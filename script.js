// --- Time and Date Widget ---
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');

    if (dateElement && timeElement) {
        // Format Date (e.g., "July 20, 2023")
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);

        // Format Time (e.g., "10:30:55 AM")
        const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
        timeElement.textContent = now.toLocaleTimeString(undefined, timeOptions);
    }
}

// Update immediately on load
updateDateTime();
// Update every second
setInterval(updateDateTime, 1000);


// --- Set current year in footer ---
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// --- Optional: Smooth scroll for internal links (like the scroll-down arrow) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Calculate position considering fixed header height
            const headerOffset = document.querySelector('.site-header')?.offsetHeight || 70; // Get header height or fallback
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});


// --- Optional: Simple Fade-in Animation for Sections on Scroll ---
const interestSections = document.querySelectorAll('.interest-section');

const sectionObserverOptions = {
  root: null, // relative to viewport
  rootMargin: '0px 0px -100px 0px', // Trigger a bit before it's fully in view
  threshold: 0.1 // 10% visibility
};

const sectionObserverCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Stop observing once visible
    }
  });
};

const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);

interestSections.forEach(section => {
  // Add a class to initially hide/prepare for animation in CSS
  section.classList.add('reveal-on-scroll');
  sectionObserver.observe(section);
});

// Add corresponding CSS for the reveal animation:
/*
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
}
*/
// You'd add the CSS above to your style.css file
