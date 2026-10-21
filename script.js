/**
 * OS CÓDIGOS HEBRAICOS DA PROSPERIDADE — KIWIFY DIRECT CHECKOUT & UI ENGINE
 * Todos os botões de compra redirecionam diretamente para o checkout da Kiwify
 * preservando automaticamente os parâmetros UTM de anúncios.
 */

const runtimeEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};

const DEFAULT_KIWIFY_URL = 'https://pay.kiwify.com.br/n9xQ1yI';
const KIWIFY_CHECKOUT_URL = (runtimeEnv.KIWIFY_CHECKOUT_URL || DEFAULT_KIWIFY_URL).trim();

/**
 * Constrói a URL final da Kiwify repassando todos os parâmetros de rastreamento
 * (utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, fbclid, gclid)
 */
function buildKiwifyCheckoutUrl(baseUrl) {
  try {
    const targetUrl = new URL(baseUrl);
    const currentParams = new URLSearchParams(window.location.search);

    currentParams.forEach((value, key) => {
      if (!targetUrl.searchParams.has(key)) {
        targetUrl.searchParams.set(key, value);
      }
    });

    return targetUrl.toString();
  } catch (_) {
    return baseUrl;
  }
}

function initKiwifyCheckoutLinks() {
  const finalUrl = buildKiwifyCheckoutUrl(KIWIFY_CHECKOUT_URL);
  const checkoutButtons = document.querySelectorAll('[data-kiwify-checkout]');

  checkoutButtons.forEach((btn) => {
    btn.setAttribute('href', finalUrl);
    btn.addEventListener('click', () => {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          value: 29.90,
          currency: 'BRL'
        });
      }
    });
  });
}

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-trigger');
    if (!button) return;

    button.addEventListener('click', () => {
      const isExpanded = item.getAttribute('aria-expanded') === 'true';
      faqItems.forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
        const otherBtn = other.querySelector('.faq-trigger');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isExpanded) {
        item.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initStickyBar() {
  const stickyBar = document.getElementById('sticky-cta-bar');
  if (!stickyBar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 650) {
      stickyBar.classList.remove('translate-y-full', 'opacity-0');
      stickyBar.classList.add('translate-y-0', 'opacity-100');
    } else {
      stickyBar.classList.add('translate-y-full', 'opacity-0');
      stickyBar.classList.remove('translate-y-0', 'opacity-100');
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initKiwifyCheckoutLinks();
  initFAQAccordion();
  initStickyBar();
});
