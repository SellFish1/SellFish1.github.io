/**
 * script.js — Guia de Montagem de PC
 * Purpose : Interactivity layer for the PC building guide website.
 * Features:
 *   1. Mobile hamburger menu toggle
 *   2. Active nav link highlighting via IntersectionObserver
 *   3. Close mobile menu on nav link click
 *   4. Page-load reveal animation (stagger sections into view)
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
     1. HAMBURGER MENU TOGGLE
     ------------------------------------------------------- */
  const toggle  = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (toggle && mainNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!mainNav.contains(e.target) && !toggle.contains(e.target)) {
        mainNav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------------------------------------
     2. CLOSE MOBILE MENU ON NAV LINK CLICK
     ------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (mainNav) mainNav.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* -------------------------------------------------------
     3. ACTIVE NAV LINK — IntersectionObserver
        Highlights the nav item whose section is currently
        most visible in the viewport.
     ------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && sections.length) {
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '60',
      10
    );

    // Track which sections are currently intersecting
    const visibleSections = new Set();

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });
        updateActiveLink();
      },
      {
        // Trigger when section crosses upper quarter of viewport
        rootMargin: '-' + (navHeight + 8) + 'px 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (s) { observer.observe(s); });

    function updateActiveLink() {
      // Find first section in DOM order that is visible
      let activeId = null;
      sections.forEach(function (s) {
        if (visibleSections.has(s.id) && !activeId) {
          activeId = s.id;
        }
      });

      navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === '#' + activeId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  /* -------------------------------------------------------
     4. PAGE-LOAD STAGGER REVEAL
        Each .doc-article fades and slides up once it enters
        the viewport, staggered by a small delay relative to
        sibling order. Pure CSS animation would work for
        above-the-fold content; JS-triggered class addition
        handles off-screen elements correctly.
     ------------------------------------------------------- */
  const revealStyle = document.createElement('style');
  revealStyle.textContent = [
    '.reveal-target {',
    '  opacity: 0;',
    '  transform: translateY(18px);',
    '  transition: opacity 0.45s ease, transform 0.45s ease;',
    '}',
    '.reveal-target.revealed {',
    '  opacity: 1;',
    '  transform: translateY(0);',
    '}'
  ].join('\n');
  document.head.appendChild(revealStyle);

  const revealItems = document.querySelectorAll('.doc-article, .callout-card, .gargalo-item, .pressure-card');

  if ('IntersectionObserver' in window) {
    // Give items their base class immediately (prevents FOUC on slow connections)
    revealItems.forEach(function (el) {
      el.classList.add('reveal-target');
    });

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Slight stagger based on sibling index among adjacent cards
            const siblings = Array.from(
              entry.target.parentElement ? entry.target.parentElement.children : []
            );
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';

            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    );

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: make everything visible immediately
    revealItems.forEach(function (el) { el.style.opacity = '1'; });
  }

})();
