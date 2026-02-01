(function() {
  'use strict';

  const state = {
    navOpen: false,
    formSubmitting: false
  };

  const DOM = {
    navToggle: null,
    navCollapse: null,
    navLinks: [],
    forms: [],
    filterButtons: [],
    portfolioItems: [],
    scrollToTopButton: null,
    modals: []
  };

  function init() {
    cacheDOMElements();
    bindEvents();
    initScrollSpy();
    initCountUp();
  }

  function cacheDOMElements() {
    DOM.navToggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    DOM.navCollapse = document.querySelector('.navbar-collapse, .c-nav__list');
    DOM.navLinks = Array.from(document.querySelectorAll('.c-nav__link, .nav-link'));
    DOM.forms = Array.from(document.querySelectorAll('.c-form'));
    DOM.filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    DOM.portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    DOM.scrollToTopButton = document.querySelector('[data-scroll-top]');
    DOM.modals = Array.from(document.querySelectorAll('.modal'));
  }

  function bindEvents() {
    if (DOM.navToggle && DOM.navCollapse) {
      DOM.navToggle.addEventListener('click', toggleMobileMenu);
    }

    DOM.navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });

    DOM.forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    DOM.filterButtons.forEach(button => {
      button.addEventListener('click', handleFilterClick);
    });

    if (DOM.scrollToTopButton) {
      DOM.scrollToTopButton.addEventListener('click', scrollToTop);
    }

    window.addEventListener('scroll', handleScroll);

    document.addEventListener('click', handleDocumentClick);
  }

  function toggleMobileMenu(e) {
    e.preventDefault();
    state.navOpen = !state.navOpen;

    if (DOM.navCollapse) {
      if (state.navOpen) {
        DOM.navCollapse.classList.add('show');
        DOM.navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('u-no-scroll');
      } else {
        DOM.navCollapse.classList.remove('show');
        DOM.navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
      }
    }
  }

  function handleNavLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        if (state.navOpen && DOM.navCollapse) {
          state.navOpen = false;
          DOM.navCollapse.classList.remove('show');
          DOM.navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('u-no-scroll');
        }
      }
    }

    if (window.innerWidth < 1024 && state.navOpen) {
      setTimeout(() => {
        state.navOpen = false;
        if (DOM.navCollapse) {
          DOM.navCollapse.classList.remove('show');
          DOM.navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('u-no-scroll');
        }
      }, 300);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    if (state.formSubmitting) return;

    const form = e.target;
    const formId = form.getAttribute('id');
    
    clearFormErrors(form);

    const isValid = validateForm(form);

    if (!isValid) {
      return;
    }

    state.formSubmitting = true;
    const submitButton = form.querySelector('.c-form__submit, [type="submit"]');
    
    if (submitButton) {
      submitButton.classList.add('is-loading');
      submitButton.setAttribute('disabled', 'disabled');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Odosiela sa...';
      
      setTimeout(() => {
        window.location.href = 'thank_you.html';
      }, 800);
    }
  }

  function validateForm(form) {
    let isValid = true;

    const nameField = form.querySelector('#contactName, [name="name"]');
    const emailField = form.querySelector('#contactEmail, [name="email"]');
    const phoneField = form.querySelector('#contactPhone, [name="phone"]');
    const subjectField = form.querySelector('#contactSubject, [name="subject"]');
    const messageField = form.querySelector('#contactMessage, [name="message"]');
    const consentField = form.querySelector('#contactConsent, [name="consent"]');

    if (nameField && nameField.hasAttribute('required')) {
      const value = nameField.value.trim();
      if (value.length === 0) {
        showError(nameField, 'Meno je povinné');
        isValid = false;
      } else if (value.length < 2) {
        showError(nameField, 'Meno musí mať aspoň 2 znaky');
        isValid = false;
      }
    }

    if (emailField && emailField.hasAttribute('required')) {
      const value = emailField.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length === 0) {
        showError(emailField, 'E-mail je povinný');
        isValid = false;
      } else if (!emailPattern.test(value)) {
        showError(emailField, 'Neplatný formát e-mailu');
        isValid = false;
      }
    }

    if (phoneField && phoneField.value.trim().length > 0) {
      const value = phoneField.value.trim();
      const phonePattern = /^[\+\d\s\(\)\-]{7,20}$/;
      if (!phonePattern.test(value)) {
        showError(phoneField, 'Neplatný formát telefónneho čísla');
        isValid = false;
      }
    }

    if (subjectField && subjectField.hasAttribute('required')) {
      const value = subjectField.value.trim();
      if (value.length === 0) {
        showError(subjectField, 'Predmet je povinný');
        isValid = false;
      }
    }

    if (messageField && messageField.hasAttribute('required')) {
      const value = messageField.value.trim();
      if (value.length === 0) {
        showError(messageField, 'Správa je povinná');
        isValid = false;
      } else if (value.length < 10) {
        showError(messageField, 'Správa musí mať aspoň 10 znakov');
        isValid = false;
      }
    }

    if (consentField && consentField.hasAttribute('required')) {
      if (!consentField.checked) {
        showError(consentField, 'Musíte súhlasiť so spracovaním osobných údajov');
        isValid = false;
      }
    }

    return isValid;
  }

  function showError(field, message) {
    const group = field.closest('.c-form__group');
    if (group) {
      group.classList.add('has-error');
      const errorElement = group.querySelector('.c-form__error');
      if (errorElement) {
        errorElement.textContent = message;
      }
    }
    field.classList.add('is-error');
  }

  function clearFormErrors(form) {
    const errorGroups = form.querySelectorAll('.c-form__group.has-error');
    errorGroups.forEach(group => {
      group.classList.remove('has-error');
    });

    const errorFields = form.querySelectorAll('.is-error');
    errorFields.forEach(field => {
      field.classList.remove('is-error');
    });
  }

  function handleFilterClick(e) {
    const button = e.currentTarget;
    const filter = button.getAttribute('data-filter');

    DOM.filterButtons.forEach(btn => {
      btn.classList.remove('is-active');
      btn.classList.remove('c-button--primary');
      btn.classList.add('c-button--secondary');
    });

    button.classList.add('is-active');
    button.classList.add('c-button--primary');
    button.classList.remove('c-button--secondary');

    DOM.portfolioItems.forEach(item => {
      const categories = item.getAttribute('data-category') || '';
      
      if (filter === 'all') {
        item.style.display = '';
      } else {
        if (categories.includes(filter)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }

  function initScrollSpy() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    
    if (sections.length === 0) return;

    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          DOM.navLinks.forEach(link => {
            link.classList.remove('active', 'is-active');
            
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active', 'is-active');
            }
          });
        }
      });
    });
  }

  function initCountUp() {
    const statNumbers = Array.from(document.querySelectorAll('.c-stat__number[data-count]'));
    
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
  }

  function animateCount(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleScroll() {
    if (DOM.scrollToTopButton) {
      if (window.scrollY > 300) {
        DOM.scrollToTopButton.classList.add('is-visible');
      } else {
        DOM.scrollToTopButton.classList.remove('is-visible');
      }
    }
  }

  function handleDocumentClick(e) {
    if (state.navOpen && DOM.navCollapse && DOM.navToggle) {
      if (!DOM.navCollapse.contains(e.target) && !DOM.navToggle.contains(e.target)) {
        state.navOpen = false;
        DOM.navCollapse.classList.remove('show');
        DOM.navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-no-scroll');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
