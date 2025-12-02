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

/* ---------------------------------------
   HERO SLIDER + POPUP + SMOOTH SCROLL
---------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================
     POPUP + SNOW FIRST
  =========================== */
  const popup = document.getElementById("holiday-popup");
  const close = document.getElementById("popup-close");
  const snow = document.getElementById("snowflakes");

  if (popup && close) {
    popup.classList.add("show");
    if (snow) snow.classList.add("show");

    close.addEventListener("click", () => {
      popup.classList.remove("show");
      if (snow) snow.classList.remove("show");
    });
  }

  /* ==========================
     HERO SLIDER
  =========================== */
  const heroSlider = document.getElementById("heroSlider");
  const heroSlides = [...document.querySelectorAll(".hero-slide")];
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroDotsContainer = document.getElementById("heroDots");

  let heroCurrentIndex = 0;
  let heroTimer;
  let heroDots = [];

  if (heroSlider && heroSlides.length > 0) {

    // Create dots
    heroSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("hero-dot");
      if (index === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => {
        go(index);
        restart();
      });
      heroDotsContainer.appendChild(dot);
    });

    heroDots = [...document.querySelectorAll(".hero-dot")];

    function go(index) {
      if (index < 0) index = heroSlides.length - 1;
      if (index >= heroSlides.length) index = 0;

      heroCurrentIndex = index;

      heroSlides.forEach((s, i) =>
        s.classList.toggle("is-active", i === index)
      );

      heroDots.forEach((d, i) =>
        d.classList.toggle("is-active", i === index)
      );
    }

    function start() {
      heroTimer = setInterval(() => {
        go(heroCurrentIndex + 1);
      }, 5000);
    }

    function restart() {
      clearInterval(heroTimer);
      start();
    }

    start();

    /* Arrows */
    if (heroPrev && heroNext) {
      heroPrev.addEventListener("click", () => {
        go(heroCurrentIndex - 1);
        restart();
      });

      heroNext.addEventListener("click", () => {
        go(heroCurrentIndex + 1);
        restart();
      });
    }

    /* Swipe */
    let x0 = 0;
    heroSlider.addEventListener("touchstart", e => x0 = e.touches[0].clientX);

    heroSlider.addEventListener("touchend", e => {
      const x1 = e.changedTouches[0].clientX;
      const dx = x1 - x0;

      if (dx > 60) { go(heroCurrentIndex - 1); restart(); }
      if (dx < -60) { go(heroCurrentIndex + 1); restart(); }
    });

    /* Hover Pause */
    heroSlider.addEventListener("mouseenter", () => clearInterval(heroTimer));
    heroSlider.addEventListener("mouseleave", start);
  }

  /* ==========================
     Smooth scroll to collections
  =========================== */
  const promoButton = document.querySelector(".shop-promo-button");
  if (promoButton) {
    promoButton.addEventListener("click", () => {
      document.querySelector("#collections")?.scrollIntoView({
        behavior: "smooth"
      });
    });
  }

  /* ==========================
     NAV SMOOTH SCROLL
  =========================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(link.getAttribute("href"))?.scrollIntoView({
        behavior: "smooth"
      });
      mobileNav.classList.remove("open");
    });
  });

}); // END DOMContentLoaded



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

const streaks = document.querySelectorAll(".light-streak");
let ticking = false;

function handleScroll() {
  const y = window.scrollY;

  document.body.style.backgroundPositionY = -(y * 0.07) + "px";

  streaks.forEach((el, i) => {
    el.style.transform = `translateX(${y * (0.05 + i*0.03)}px) rotate(15deg)`;
  });

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(handleScroll);
    ticking = true;
  }
});
