/* ---------------------------------------
   MOBILE NAVIGATION TOGGLE 
---------------------------------------- */

// Select hamburger button + mobile nav
const hamburger = document.getElementById("hamburgerBtn");
const mobileNav = document.getElementById("mobileNav");

// When hamburger is clicked, toggle sliding menu
hamburger.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

// When click outside hamburger, close the menu
document.addEventListener("click", (e) => {
  const clickedInside = mobileNav.contains(e.target) || hamburger.contains(e.target);

  if (!clickedInside) {
    mobileNav.classList.remove("open");
  }
});

const closeBtn = document.getElementById("closeNavBtn");

closeBtn.addEventListener("click", () => {
  mobileNav.classList.remove("open");
});


/* ---------------------------------------
   HERO SLIDER
   Wrapped in DOM ready
---------------------------------------- */

/* ---------------------------------------
   HERO SLIDER + PAGE INIT
---------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const heroSlider = document.getElementById("heroSlider");
  const heroSlides = [...document.querySelectorAll(".hero-slide")];
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroDotsContainer = document.getElementById("heroDots");
  const popup = document.getElementById("holiday-popup");
  const close = document.getElementById("popup-close");

  let heroCurrentIndex = 0;
  let heroDots = [];

  if (heroSlider && heroSlides.length > 0 && heroDotsContainer) {
    // Create dots
    heroSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("hero-dot");
      if (index === 0) dot.classList.add("is-active");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => heroGoToSlide(index));
      heroDotsContainer.appendChild(dot);
    });

    heroDots = [...document.querySelectorAll(".hero-dot")];

    function heroGoToSlide(index) {
      if (index < 0) index = heroSlides.length - 1;
      if (index >= heroSlides.length) index = 0;

      heroCurrentIndex = index;

      // activate the slide
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });

      // activate the correct dot / progress bar
      heroDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    // 🔁 AUTO-ADVANCE: now everything is defined
    setInterval(() => {
      heroGoToSlide(heroCurrentIndex + 1);
    }, 5000);

    // Arrows
    if (heroPrev && heroNext) {
      heroPrev.addEventListener("click", () =>
        heroGoToSlide(heroCurrentIndex - 1)
      );
      heroNext.addEventListener("click", () =>
        heroGoToSlide(heroCurrentIndex + 1)
      );

    // Show popup every time page loads
    popup.classList.add("show");

     close.addEventListener("click", () => {
     popup.classList.remove("show");
     localStorage.setItem("holiday-popup-seen", "true");
  });
    }

    // Swipe
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    heroSlider.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });

    heroSlider.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;

      if (deltaX < -swipeThreshold) heroGoToSlide(heroCurrentIndex + 1);
      if (deltaX > swipeThreshold) heroGoToSlide(heroCurrentIndex - 1);
    });
  }

  // Scroll to Collections (works only after DOM load)
  const promoButton = document.querySelector(".shop-promo-button");
  if (promoButton) {
    promoButton.addEventListener("click", () => {
      document.querySelector("#collections").scrollIntoView({
        behavior: "smooth"
      });
    });
  }

  /* ---------------------------------------
     SMOOTH SCROLL FOR NAV + MOBILE MENU
  ---------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth" });

      if (mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
      }
    });
  });
}); // END of DOMContentLoaded


/* ---------------------------------------
   SCROLL REVEAL (OUTSIDE DOM LOADED)
   - this fixes the underline animation!
---------------------------------------- */
const revealElements = document.querySelectorAll(".reveal-on-scroll");

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach(el => revealObserver.observe(el));

/* =====================================
   SMART NAVBAR BEHAVIOR
   - navbar stays under the header
   - hides when scrolling down
   - shows when scrolling up
===================================== */

const header = document.querySelector(".top-header");
const nav = document.querySelector(".nav-bar");

window.addEventListener("load", () => {
  positionNavBar();
  adjustHeroOffset();
});

function positionNavBar() {
  const headerHeight = header.offsetHeight;

  // Move the navbar below the header
  nav.style.top = headerHeight + "px";
}
positionNavBar();
window.addEventListener("resize", positionNavBar);

/* =====================================
   SMART NAVBAR BEHAVIOR
   - navbar stays under the header
   - hides when scrolling down
   - shows when scrolling up
   - background shifts now handled by section colors
===================================== */
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;

  // Hide navbar when scrolling down, show when scrolling up
  if (currentY > lastScrollY) {
    nav.classList.add("hide");
  } else {
    nav.classList.remove("hide");
  }

  lastScrollY = currentY;
});

function adjustHeroOffset() {
  const offset = header.offsetHeight + nav.offsetHeight;
  document.documentElement.style.setProperty("--hero-offset", offset + "px");
}
adjustHeroOffset();
window.addEventListener("resize", adjustHeroOffset);

/* -------------------------------------------------
   PARALLAX LIGHT MOTION ON SCROLL
-------------------------------------------------- */
window.addEventListener("scroll", () => {
  const y = window.scrollY;

  document.body.style.backgroundPositionY = -(y * 0.07) + "px";

  document.querySelectorAll(".light-streak").forEach((el, i) => {
    el.style.transform = `translateX(${y * (0.05 + i*0.03)}px) rotate(15deg)`;
  });
});