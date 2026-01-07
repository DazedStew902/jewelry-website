/* =====================================================================
   MOBILE NAV — Luxury Drawer Controller (Safari/Chrome Optimized)
   Fixes:
   - Close button no longer triggers any smooth scrolling
   - Nav link scrolling is consistent (especially #home)
   - No “jolt up then scroll down” effect (restore is instant, then smooth)
   - Uses header/nav offset so sections don’t hide behind fixed header
===================================================================== */
(() => {
  "use strict";

  const hamburger = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  const closeBtn = document.getElementById("closeNavBtn");
  const backdrop = document.getElementById("mobileNavBackdrop");

  if (!hamburger || !mobileNav) return;

  let isOpen = false;
  let scrollY = 0;

  function getFixedOffset() {
    const header = document.querySelector(".top-header");
    const nav = document.querySelector(".nav-bar");

    const headerH = header ? header.offsetHeight : 0;

    // nav-bar is display:none on <=850px, so this becomes 0 on mobile (good)
    const navH =
      nav && getComputedStyle(nav).display !== "none" ? nav.offsetHeight : 0;

    return headerH + navH + 12; // small breathing room
  }

function lockScroll() {
  scrollY = window.scrollY || 0;

  // Force instant scroll behavior while locked (prevents “smooth restore” bugs on iOS)
  document.documentElement.classList.add("nav-lock");

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockScroll() {
  // Remove fixed positioning first
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  // Restore scroll position instantly (no animation)
  const scroller = document.scrollingElement || document.documentElement;
  scroller.scrollTop = scrollY;

  // Let the browser “settle” one frame, then re-enable smooth scrolling
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("nav-lock");
  });
}

  function openMenu() {
    if (isOpen) return;
    isOpen = true;

    mobileNav.classList.add("open");

    if (backdrop) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("is-open"));
    }

    hamburger.setAttribute("aria-expanded", "true");
    lockScroll();
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    mobileNav.classList.remove("open");

    if (backdrop) {
      backdrop.classList.remove("is-open");
      window.setTimeout(() => {
        if (!isOpen) backdrop.hidden = true;
      }, 240);
    }

    hamburger.setAttribute("aria-expanded", "false");
    unlockScroll();
  }

  function toggleMenu() {
    if (isOpen) closeMenu();
    else openMenu();
  }

  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // extra safety
      closeMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => closeMenu());
  }

mobileNav.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const hash = (link.getAttribute("href") || "").trim();
  if (!hash) return;

  e.preventDefault();

  const isHome = hash === "#home" || hash === "#top" || hash === "#";

  // Close first (restores scroll INSTANTLY)
  closeMenu();

  // Double-tick: iOS sometimes needs an extra frame after unlocking fixed-body scroll
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scroller = document.scrollingElement || document.documentElement;

      if (isHome) {
        // Smooth to top using the scrolling element (more reliable on iOS)
        scroller.scrollTo({ top: 0, left: 0, behavior: "smooth" });

        // Failsafe: ensure we actually end at top (prevents “stuck slightly down” cases)
        window.setTimeout(() => {
          scroller.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }, 350);

        return;
      }

      const target = document.querySelector(hash);
      if (!target) return;

      const header = document.querySelector(".top-header");
      const nav = document.querySelector(".nav-bar");

      const headerH = header ? header.offsetHeight : 0;
      const navH =
        nav && getComputedStyle(nav).display !== "none" ? nav.offsetHeight : 0;

      const offset = headerH + navH + 12;

      const y =
        target.getBoundingClientRect().top + window.pageYOffset - offset;

      scroller.scrollTo({ top: Math.max(0, Math.round(y)), left: 0, behavior: "smooth" });
    });
  });
});
})();

  /* ==========================
     HERO SLIDER (Optimized)
     Goals:
     - Keep visuals + features identical
     - Prevent “black flash” / late-loading backgrounds
     - Use drift-free RAF timer (smoother than setInterval)
     - Avoid unnecessary DOM queries in loops
  =========================== */
  (() => {
    const heroSlider = document.getElementById("heroSlider");
    const heroDotsContainer = document.getElementById("heroDots");
    const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
    const heroPrev = document.getElementById("heroPrev");
    const heroNext = document.getElementById("heroNext");

    if (!heroSlider || !heroDotsContainer || heroSlides.length === 0) return;

    // Extract CSS background-image URLs so we can preload them
    const slideUrls = heroSlides
      .map((slide) => {
        const bg = getComputedStyle(slide).backgroundImage; // url("...")
        const match = bg && bg !== "none" ? bg.match(/url\(["']?(.*?)["']?\)/i) : null;
        return match?.[1] ?? null;
      })
      .filter(Boolean);

    let currentIndex = heroSlides.findIndex((s) => s.classList.contains("is-active"));
    if (currentIndex < 0) currentIndex = 0;

    // ----- Dots (created once) -----
    const dots = heroSlides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => {
        go(index);
        restartClock();
      });
      heroDotsContainer.appendChild(dot);
      return dot;
    });

    // Ensure initial dot state matches initial active slide
    dots.forEach((d, i) => d.classList.toggle("is-active", i === currentIndex));

    // ----- State -----
    const SLIDE_INTERVAL_MS = 5000;
    let paused = false;
    let rafId = 0;
    let lastTick = 0;

    // ----- Helpers -----
    function clampIndex(i) {
      if (i < 0) return heroSlides.length - 1;
      if (i >= heroSlides.length) return 0;
      return i;
    }

    function go(nextIndex) {
      const index = clampIndex(nextIndex);
      if (index === currentIndex) return;

      currentIndex = index;

      // Toggle classes only (no layout reads)
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }

    // Drift-free clock using RAF + performance.now()
    function tick(now) {
      if (!paused) {
        if (!lastTick) lastTick = now;

        const elapsed = now - lastTick;
        if (elapsed >= SLIDE_INTERVAL_MS) {
          // Advance exactly one slide and carry remainder time forward
          lastTick = now - (elapsed % SLIDE_INTERVAL_MS);
          go(currentIndex + 1);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function startClock() {
      stopClock();
      lastTick = performance.now();
      rafId = window.requestAnimationFrame(tick);
    }

    function stopClock() {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function restartClock() {
      lastTick = performance.now();
    }

    // ----- Controls (Arrows) -----
    if (heroPrev) {
      heroPrev.addEventListener("click", () => {
        go(currentIndex - 1);
        restartClock();
      });
    }

    if (heroNext) {
      heroNext.addEventListener("click", () => {
        go(currentIndex + 1);
        restartClock();
      });
    }

    // ----- Swipe (touch) -----
    let x0 = 0;

    heroSlider.addEventListener(
      "touchstart",
      (e) => {
        x0 = e.touches?.[0]?.clientX ?? 0;
      },
      { passive: true }
    );

    heroSlider.addEventListener(
      "touchend",
      (e) => {
        const x1 = e.changedTouches?.[0]?.clientX ?? 0;
        const dx = x1 - x0;

        if (dx > 60) {
          go(currentIndex - 1);
          restartClock();
        } else if (dx < -60) {
          go(currentIndex + 1);
          restartClock();
        }
      },
      { passive: true }
    );

    // ----- Hover Pause (desktop) -----
    heroSlider.addEventListener("mouseenter", () => {
      paused = true;
    });

    heroSlider.addEventListener("mouseleave", () => {
      paused = false;
      restartClock();
    });

    // ----- Page visibility pause (prevents timer “catch-up” lag) -----
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused) restartClock();
    });

    // ----- Preload images then start clock -----
    // Background images don't reliably preload; we ensure at least the first slide is ready.
    function preload(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }

    (async () => {
      // Preload the first image (highest impact) and kick off others in the background
      if (slideUrls.length > 0) {
        await preload(slideUrls[0]);
        // Fire-and-forget the rest
        slideUrls.slice(1).forEach((u) => preload(u));
      }

      // Ensure correct initial state (no flash)
      go(currentIndex);
      startClock();
    })();
  })();

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
