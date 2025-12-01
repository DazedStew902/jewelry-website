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

document.addEventListener("DOMContentLoaded", () => {

  const heroSlider = document.getElementById("heroSlider");
  const heroSlides = [...document.querySelectorAll(".hero-slide")];
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroDotsContainer = document.getElementById("heroDots");

  let heroCurrentIndex = 0;

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

    const heroDots = [...document.querySelectorAll(".hero-dot")];

    function heroGoToSlide(index) {
      if (index < 0) index = heroSlides.length - 1;
      if (index >= heroSlides.length) index = 0;

      heroCurrentIndex = index;

      heroSlides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });

      heroDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    // Arrows
    if (heroPrev && heroNext) {
      heroPrev.addEventListener("click", () => heroGoToSlide(heroCurrentIndex - 1));
      heroNext.addEventListener("click", () => heroGoToSlide(heroCurrentIndex + 1));
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

