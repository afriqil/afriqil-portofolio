/* =========================
   GLOBAL HELPERS
========================= */

const html = document.documentElement;

function getElement(selector) {
    return document.querySelector(selector);
}

function getElements(selector) {
    return document.querySelectorAll(selector);
}


/* =========================
   THEME TOGGLE
========================= */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const savedTheme = localStorage.getItem("theme") || "dark";

html.setAttribute("data-theme", savedTheme);

if (themeIcon) {
    themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = html.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        html.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);

        if (themeIcon) {
            themeIcon.textContent = nextTheme === "dark" ? "🌙" : "☀️";
        }
    });
}


/* =========================
   MOBILE NAVBAR
========================= */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = getElements(".nav-link");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (navMenu) {
            navMenu.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.classList.remove("active");
        }
    });
});


/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const revealElements = getElements(".reveal");

function activateInitialReveal() {
    revealElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add("active");
        }, index * 90);
    });
}

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px",
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("active");
    });
}

window.addEventListener("load", () => {
    activateInitialReveal();
});


/* =========================
   ANIMATED COUNTERS
========================= */

const counters = getElements(".counter");
let counterStarted = false;

function formatCounterValue(value, target) {
    if (target % 1 !== 0) {
        return value.toFixed(1);
    }

    return Math.floor(value).toString();
}

function animateCounters() {
    counters.forEach((counter) => {
        const target = parseFloat(counter.dataset.target);

        if (Number.isNaN(target)) return;

        const duration = 1400;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const value = target * easedProgress;

            counter.textContent = formatCounterValue(value, target);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target % 1 !== 0 ? target.toFixed(1) : target.toString();
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

const metricSection = getElement(".hero-metrics");

if (metricSection && counters.length > 0) {
    if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !counterStarted) {
                        counterStarted = true;
                        animateCounters();
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.25,
            }
        );

        counterObserver.observe(metricSection);
    } else {
        counterStarted = true;
        animateCounters();
    }
}


/* =========================
   ACTIVE NAV LINK ON SCROLL
========================= */

const sections = getElements("section[id]");

function setActiveNavLink() {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        const linkHref = link.getAttribute("href");

        link.classList.remove("active");

        if (linkHref === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", setActiveNavLink);
window.addEventListener("load", setActiveNavLink);


/* =========================
   DASHBOARD CAROUSEL
   Used in project detail pages
========================= */

const carouselTrack = getElement(".carousel-track");
const carouselSlides = getElements(".carousel-slide");
const prevButton = getElement(".carousel-btn.prev");
const nextButton = getElement(".carousel-btn.next");
const carouselDots = getElements(".carousel-dot");

let currentSlide = 0;
let carouselInterval = null;

function updateCarousel(index) {
    if (!carouselTrack || carouselSlides.length === 0) return;

    currentSlide = index;

    if (currentSlide < 0) {
        currentSlide = carouselSlides.length - 1;
    }

    if (currentSlide >= carouselSlides.length) {
        currentSlide = 0;
    }

    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    carouselDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentSlide);
    });
}

function startCarouselAutoPlay() {
    if (!carouselTrack || carouselSlides.length <= 1) return;

    stopCarouselAutoPlay();

    carouselInterval = setInterval(() => {
        updateCarousel(currentSlide + 1);
    }, 5000);
}

function stopCarouselAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

if (prevButton) {
    prevButton.addEventListener("click", () => {
        updateCarousel(currentSlide - 1);
        startCarouselAutoPlay();
    });
}

if (nextButton) {
    nextButton.addEventListener("click", () => {
        updateCarousel(currentSlide + 1);
        startCarouselAutoPlay();
    });
}

carouselDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        updateCarousel(index);
        startCarouselAutoPlay();
    });
});

if (carouselTrack) {
    carouselTrack.addEventListener("mouseenter", stopCarouselAutoPlay);
    carouselTrack.addEventListener("mouseleave", startCarouselAutoPlay);

    updateCarousel(0);
    startCarouselAutoPlay();
}


/* =========================
   IMAGE MODAL PREVIEW
========================= */

const modal = getElement(".image-modal");
const modalImage = getElement(".modal-image");
const modalClose = getElement(".modal-close");
const previewImages = getElements("[data-preview]");

function openImageModal(imageSource) {
    if (!modal || !modalImage || !imageSource) return;

    modalImage.src = imageSource;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeImageModal() {
    if (!modal || !modalImage) return;

    modal.classList.remove("active");
    modalImage.src = "";
    document.body.style.overflow = "";
}

previewImages.forEach((image) => {
    image.addEventListener("click", () => {
        const imageSource = image.dataset.preview || image.src;
        openImageModal(imageSource);
    });
});

if (modalClose) {
    modalClose.addEventListener("click", closeImageModal);
}

if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeImageModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeImageModal();
    }
});


/* =========================
   BUTTON / CARD MICRO INTERACTIONS
========================= */

const interactiveCards = getElements(
    ".project-card, .technical-card, .about-card, .metric-card, .metadata-card, .insight-card, .recommendation-card, .technical-highlight-card"
);

interactiveCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });
});


/* =========================
   SAFETY: SHOW CONTENT IF JS LOADS LATE
========================= */

setTimeout(() => {
    revealElements.forEach((element) => {
        element.classList.add("active");
    });
}, 1200);