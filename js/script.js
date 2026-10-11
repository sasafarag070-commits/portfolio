/**
 * ============================================================================
 * PORTFOLIO CLIENT-SIDE SCRIPT
 * Developer: Samuel Faragallah | Software Developer & Aspiring Junior .NET Developer
 * Architecture: Clean Vanilla JavaScript (ES6+), Modular, Accessible, Zero Dependencies
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DOM SELECTORS
  // --------------------------------------------------------------------------
  const DOM = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('theme-toggle'),
    mobileNavToggle: document.getElementById('mobile-nav-toggle'),
    mobileNavDrawer: document.getElementById('mobile-nav-drawer'),
    navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
    sections: document.querySelectorAll('section[id]'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    projectCards: document.querySelectorAll('.project-card'),
    contactForm: document.getElementById('contact-form'),
    formFeedback: document.getElementById('form-feedback'),
    copyrightYear: document.getElementById('copyright-year'),
    backToTopBtn: document.getElementById('back-to-top'),
    revealElements: document.querySelectorAll('.reveal'),
  };

  // --------------------------------------------------------------------------
  // 2. THEME CONTROLLER (DARK / LIGHT MODE)
  // --------------------------------------------------------------------------
  const ThemeController = {
    STORAGE_KEY: 'samuel_portfolio_theme',

    init() {
      // Determine initial theme: localStorage -> System Preference -> Dark (default)
      const storedTheme = localStorage.getItem(this.STORAGE_KEY);
      const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

      let initialTheme = 'dark';
      if (storedTheme) {
        initialTheme = storedTheme;
      } else if (systemPrefersLight) {
        initialTheme = 'light';
      }

      this.applyTheme(initialTheme);

      if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
      }

      // Listen for system theme preference changes if user hasn't set an explicit preference
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.applyTheme(e.matches ? 'light' : 'dark');
        }
      });
    },

    applyTheme(theme) {
      if (theme === 'light') {
        DOM.html.setAttribute('data-theme', 'light');
        if (DOM.themeToggleBtn) {
          DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
          DOM.themeToggleBtn.setAttribute('title', 'Switch to dark theme');
        }
      } else {
        DOM.html.removeAttribute('data-theme');
        if (DOM.themeToggleBtn) {
          DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
          DOM.themeToggleBtn.setAttribute('title', 'Switch to light theme');
        }
      }
    },

    toggleTheme() {
      const isCurrentlyLight = DOM.html.getAttribute('data-theme') === 'light';
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      this.applyTheme(newTheme);
      localStorage.setItem(this.STORAGE_KEY, newTheme);
    }
  };

  // --------------------------------------------------------------------------
  // 3. NAVIGATION & MOBILE DRAWER CONTROLLER
  // --------------------------------------------------------------------------
  const NavigationController = {
    isOpen: false,

    init() {
      if (DOM.mobileNavToggle && DOM.mobileNavDrawer) {
        DOM.mobileNavToggle.addEventListener('click', () => this.toggleMobileNav());

        // Close mobile drawer when clicking any nav link
        DOM.navLinks.forEach((link) => {
          link.addEventListener('click', () => {
            if (this.isOpen) {
              this.closeMobileNav();
            }
          });
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.closeMobileNav();
            DOM.mobileNavToggle.focus();
          }
        });

        // Close when clicking outside of drawer
        document.addEventListener('click', (e) => {
          if (this.isOpen && !DOM.mobileNavDrawer.contains(e.target) && !DOM.mobileNavToggle.contains(e.target)) {
            this.closeMobileNav();
          }
        });
      }

      // Setup active navigation item highlight via IntersectionObserver
      this.setupActiveSectionObserver();
    },

    toggleMobileNav() {
      this.isOpen ? this.closeMobileNav() : this.openMobileNav();
    },

    openMobileNav() {
      this.isOpen = true;
      DOM.mobileNavToggle.classList.add('open');
      DOM.mobileNavToggle.setAttribute('aria-expanded', 'true');
      DOM.mobileNavDrawer.classList.add('open');
      DOM.mobileNavDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    closeMobileNav() {
      this.isOpen = false;
      DOM.mobileNavToggle.classList.remove('open');
      DOM.mobileNavToggle.setAttribute('aria-expanded', 'false');
      DOM.mobileNavDrawer.classList.remove('open');
      DOM.mobileNavDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    setupActiveSectionObserver() {
      if (!('IntersectionObserver' in window) || DOM.sections.length === 0) return;

      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            this.updateActiveNavLinks(currentId);
          }
        });
      }, observerOptions);

      DOM.sections.forEach((section) => sectionObserver.observe(section));
    },

    updateActiveNavLinks(activeId) {
      DOM.navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${activeId}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
  };

  // --------------------------------------------------------------------------
  // 4. PROJECTS FILTER CONTROLLER
  // --------------------------------------------------------------------------
  const ProjectsFilterController = {
    init() {
      if (!DOM.filterBtns.length || !DOM.projectCards.length) return;

      DOM.filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const filterValue = e.currentTarget.getAttribute('data-filter');

          // Update active button state
          DOM.filterBtns.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          e.currentTarget.classList.add('active');
          e.currentTarget.setAttribute('aria-pressed', 'true');

          // Filter cards with smooth fade/scale
          DOM.projectCards.forEach((card) => {
            const category = card.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
              card.style.display = 'flex';
              // Re-trigger animation frame
              requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              });
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(12px)';
              setTimeout(() => {
                card.style.display = 'none';
              }, 200);
            }
          });
        });
      });
    }
  };

  // --------------------------------------------------------------------------
  // 5. SCROLL REVEAL ANIMATIONS
  // --------------------------------------------------------------------------
  const ScrollRevealController = {
    init() {
      // Respect user's reduced-motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        DOM.revealElements.forEach((el) => el.classList.add('revealed'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              obs.unobserve(entry.target); // Once revealed, stop observing
            }
          });
        },
        {
          root: null,
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      DOM.revealElements.forEach((el) => observer.observe(el));
    }
  };

  // --------------------------------------------------------------------------
  // 6. CONTACT FORM VALIDATION & CLIENT-SIDE HANDLING
  // --------------------------------------------------------------------------
  const ContactFormController = {
    init() {
      if (!DOM.contactForm) return;

      const fields = {
        name: document.getElementById('contact-name'),
        email: document.getElementById('contact-email'),
        subject: document.getElementById('contact-subject'),
        message: document.getElementById('contact-message')
      };

      // Inline clear errors on typing
      Object.values(fields).forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => {
          this.clearFieldError(input);
        });
      });

      DOM.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = this.validateField(
          fields.name,
          fields.name.value.trim().length >= 2,
          'Please enter your name (at least 2 characters).'
        );

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = this.validateField(
          fields.email,
          emailRegex.test(fields.email.value.trim()),
          'Please provide a valid email address.'
        );

        const isSubjectValid = this.validateField(
          fields.subject,
          fields.subject.value.trim().length >= 3,
          'Please provide a subject (at least 3 characters).'
        );

        const isMessageValid = this.validateField(
          fields.message,
          fields.message.value.trim().length >= 10,
          'Please enter a message of at least 10 characters.'
        );

        const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

        if (isFormValid) {
          this.handleFormValidSubmission(fields);
        } else {
          // Focus first invalid field for accessibility
          const firstInvalid = [fields.name, fields.email, fields.subject, fields.message].find(
            (field) => field && field.classList.contains('error')
          );
          if (firstInvalid) {
            firstInvalid.focus();
          }
        }
      });
    },

    validateField(field, condition, errorMessage) {
      if (!field) return false;
      const errorSpan = document.getElementById(`${field.id}-error`);

      if (!condition) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorSpan) {
          errorSpan.textContent = errorMessage;
          errorSpan.classList.add('visible');
        }
        return false;
      } else {
        this.clearFieldError(field);
        return true;
      }
    },

    clearFieldError(field) {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      const errorSpan = document.getElementById(`${field.id}-error`);
      if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
      }
    },

    handleFormValidSubmission(fields) {
      const name = encodeURIComponent(fields.name.value.trim());
      const subject = encodeURIComponent(fields.subject.value.trim());
      const body = encodeURIComponent(
        `Hi Samuel,\n\n${fields.message.value.trim()}\n\nBest regards,\n${fields.name.value.trim()}\n(${fields.email.value.trim()})`
      );

      // Email placeholder as instructed
      const recipientEmail = 'samuel.faragallah@example.com';
      const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

      if (DOM.formFeedback) {
        DOM.formFeedback.className = 'form-feedback-container info visible';
        DOM.formFeedback.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <p><strong>Form validated successfully!</strong></p>
            <p><em>Note: This is a static frontend-only portfolio demonstration; messages are not submitted to a remote database or server.</em></p>
            <p>To deliver your message directly to Samuel, you can open your default email client with your pre-filled message:</p>
            <div style="margin-top:0.25rem;">
              <a href="${mailtoUrl}" class="btn btn-primary btn-sm" id="mailto-launch-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Open Email Client (Mailto)
              </a>
            </div>
          </div>
        `;
        DOM.formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // --------------------------------------------------------------------------
  // 7. UTILITIES (YEAR, BACK TO TOP)
  // --------------------------------------------------------------------------
  const UtilitiesController = {
    init() {
      // Set dynamic year
      if (DOM.copyrightYear) {
        DOM.copyrightYear.textContent = new Date().getFullYear();
      }

      // Back to top smooth scroll
      if (DOM.backToTopBtn) {
        DOM.backToTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    }
  };

  // --------------------------------------------------------------------------
  // 8. APPLICATION INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    ThemeController.init();
    NavigationController.init();
    ProjectsFilterController.init();
    ScrollRevealController.init();
    ContactFormController.init();
    UtilitiesController.init();
  });
})();
