/**
 * OS CÓDIGOS HEBRAICOS DA PROSPERIDADE — INTERACTIVE CONVERSION & KIWIFY ENGINE
 * Suporta variáveis de ambiente injetadas pelo Cloudflare Worker (window.__ENV__):
 * - KIWIFY_CHECKOUT_URL: Link do checkout da Kiwify (ex: https://pay.kiwify.com.br/xxxxxxx)
 * - META_PIXEL_ID: ID do Pixel da Meta (opcional)
 * - SUPPORT_EMAIL: E-mail de suporte exibido na página (opcional)
 */

const runtimeEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};

const CHECKOUT_CONFIG = {
  baseProduct: {
    id: 'ebook-codigos-hebraicos',
    title: 'E-book Os Códigos Hebraicos da Prosperidade (PDF Alta Definição + Bônus)',
    originalPrice: 97.00,
    price: 29.90
  },
  orderBumps: {
    bump1: {
      id: 'bump1',
      name: 'Áudios de Ativação: Os Decretos da Aliança em MP3',
      checkoutTitle: 'SIM! Quero a Versão em Áudio dos 21 Decretos da Aliança (Ouvir no Trânsito e Rotina)',
      originalPrice: 47.00,
      price: 19.90
    },
    bump2: {
      id: 'bump2',
      name: 'Planilha Bíblica de Finanças: O Método José de Reserva e Gestão',
      checkoutTitle: 'Adicionar a Planilha Prática de Finanças (Método José de Gestão e Reserva)',
      originalPrice: 39.90,
      price: 14.90
    },
    bump3: {
      id: 'bump3',
      name: 'Guia de Blindagem Espiritual da Casa e Rompimento da Escassez Familiar',
      checkoutTitle: 'Levar também o Guia Prático: Blindagem Espiritual da Família e do Lar',
      originalPrice: 47.00,
      price: 19.90
    }
  },
  // Lido automaticamente da variável de ambiente KIWIFY_CHECKOUT_URL no Cloudflare
  externalCheckoutUrl: (runtimeEnv.KIWIFY_CHECKOUT_URL || '').trim()
};

const state = {
  selectedBumps: new Set(),
  paymentMethod: 'pix'
};

function formatBRL(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function calculateTotals() {
  let total = CHECKOUT_CONFIG.baseProduct.price;
  let originalTotal = CHECKOUT_CONFIG.baseProduct.originalPrice;

  state.selectedBumps.forEach((bumpKey) => {
    const bump = CHECKOUT_CONFIG.orderBumps[bumpKey];
    if (bump) {
      total += bump.price;
      originalTotal += bump.originalPrice;
    }
  });

  const savings = originalTotal - total;
  return { total, originalTotal, savings };
}

/**
 * Constrói a URL final da Kiwify repassando todos os parâmetros de rastreamento
 * (utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, fbclid, gclid)
 */
function buildKiwifyCheckoutUrl(baseUrl) {
  try {
    const targetUrl = new URL(baseUrl, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);

    // Repassa UTMs e parâmetros de afiliado/rastreamento para a Kiwify
    currentParams.forEach((value, key) => {
      if (!targetUrl.searchParams.has(key)) {
        targetUrl.searchParams.set(key, value);
      }
    });

    // Repassa indicação dos Order Bumps pré-selecionados na LP
    if (state.selectedBumps.size > 0) {
      targetUrl.searchParams.set('bumps', Array.from(state.selectedBumps).join(','));
    }

    return targetUrl.toString();
  } catch (_) {
    return baseUrl;
  }
}

function updateOrderSummaryUI() {
  const { total, originalTotal, savings } = calculateTotals();

  const totalElements = document.querySelectorAll('[data-checkout-total]');
  totalElements.forEach((el) => {
    el.textContent = formatBRL(total);
  });

  const savingsEl = document.getElementById('checkout-savings-badge');
  if (savingsEl) {
    savingsEl.textContent = `Você economiza ${formatBRL(savings)} hoje`;
  }

  const summaryList = document.getElementById('selected-items-list');
  if (summaryList) {
    let html = `
      <li class="flex items-center justify-between py-2 text-sm border-b border-slate-800/80">
        <span class="text-slate-200 flex items-center gap-2">
          <span class="text-amber-400">✓</span> E-book Os Códigos Hebraicos da Prosperidade + 2 Bônus
        </span>
        <span class="font-semibold text-white">${formatBRL(CHECKOUT_CONFIG.baseProduct.price)}</span>
      </li>
    `;

    state.selectedBumps.forEach((bumpKey) => {
      const bump = CHECKOUT_CONFIG.orderBumps[bumpKey];
      if (bump) {
        html += `
          <li class="flex items-center justify-between py-2 text-sm border-b border-slate-800/80 bg-emerald-950/20 px-2 rounded">
            <span class="text-emerald-300 flex items-center gap-2">
              <span class="text-emerald-400 font-bold">+</span> ${bump.name}
            </span>
            <span class="font-semibold text-emerald-300">${formatBRL(bump.price)}</span>
          </li>
        `;
      }
    });

    summaryList.innerHTML = html;
  }

  const modalItemsList = document.getElementById('modal-selected-items');
  if (modalItemsList && summaryList) {
    modalItemsList.innerHTML = summaryList.innerHTML;
  }
}

function toggleOrderBump(bumpKey) {
  const card = document.querySelector(`[data-bump-card="${bumpKey}"]`);
  const checkbox = document.querySelector(`[data-bump-checkbox="${bumpKey}"]`);

  if (!card || !checkbox) return;

  if (state.selectedBumps.has(bumpKey)) {
    state.selectedBumps.delete(bumpKey);
    card.classList.remove('selected');
    card.setAttribute('aria-checked', 'false');
    checkbox.checked = false;
  } else {
    state.selectedBumps.add(bumpKey);
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
    checkbox.checked = true;
  }

  updateOrderSummaryUI();
}

function initOrderBumps() {
  const bumpCards = document.querySelectorAll('[data-bump-card]');
  bumpCards.forEach((card) => {
    const bumpKey = card.getAttribute('data-bump-card');
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      toggleOrderBump(bumpKey);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleOrderBump(bumpKey);
      }
    });
  });

  const bumpCheckboxes = document.querySelectorAll('[data-bump-checkbox]');
  bumpCheckboxes.forEach((checkbox) => {
    const bumpKey = checkbox.getAttribute('data-bump-checkbox');
    checkbox.addEventListener('change', () => {
      toggleOrderBump(bumpKey);
    });
  });

  updateOrderSummaryUI();
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

function triggerCheckout() {
  const { total } = calculateTotals();

  // Dispara evento InitiateCheckout no Meta Pixel se configurado
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'BRL'
    });
  }

  // Se KIWIFY_CHECKOUT_URL estiver configurado no Cloudflare env, redireciona direto para a Kiwify
  if (CHECKOUT_CONFIG.externalCheckoutUrl) {
    window.location.href = buildKiwifyCheckoutUrl(CHECKOUT_CONFIG.externalCheckoutUrl);
    return;
  }

  // Fallback caso a variável ainda esteja vazia
  updateOrderSummaryUI();
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input[type="text"], input[type="email"]');
    if (firstInput) firstInput.focus();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function initCheckoutActions() {
  const openBtns = document.querySelectorAll('[data-open-checkout]');
  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerCheckout();
    });
  });

  const closeBtns = document.querySelectorAll('[data-close-checkout]');
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', closeCheckoutModal);
  });

  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCheckoutModal();
    });
  }

  const methodBtns = document.querySelectorAll('[data-payment-method]');
  const pixPanel = document.getElementById('payment-panel-pix');
  const cardPanel = document.getElementById('payment-panel-card');

  methodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const method = btn.getAttribute('data-payment-method');
      state.paymentMethod = method;

      methodBtns.forEach((b) => {
        const active = b.getAttribute('data-payment-method') === method;
        b.classList.toggle('border-amber-500', active);
        b.classList.toggle('bg-amber-500/10', active);
        b.classList.toggle('text-amber-300', active);
        b.classList.toggle('border-slate-700', !active);
        b.classList.toggle('text-slate-400', !active);
      });

      if (pixPanel && cardPanel) {
        pixPanel.classList.toggle('hidden', method !== 'pix');
        cardPanel.classList.toggle('hidden', method !== 'card');
      }
    });
  });

  const checkoutForm = document.getElementById('checkout-modal-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (CHECKOUT_CONFIG.externalCheckoutUrl) {
        window.location.href = buildKiwifyCheckoutUrl(CHECKOUT_CONFIG.externalCheckoutUrl);
        return;
      }
      const feedback = document.getElementById('checkout-submit-feedback');
      const submitBtn = document.getElementById('checkout-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processando Ambiente Seguro...';
      }
      setTimeout(() => {
        if (feedback) {
          feedback.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'PEDIDO REGISTRADO COM SUCESSO ✓';
        }
      }, 900);
    });
  }
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
  initOrderBumps();
  initFAQAccordion();
  initCheckoutActions();
  initStickyBar();
});
