# Os Códigos Hebraicos da Prosperidade — Landing Page de Vendas

🔗 **URL em Produção (Cloudflare Workers):** [https://os-codigos-hebraicos-da-prosperidade.joaodbv.workers.dev](https://os-codigos-hebraicos-da-prosperidade.joaodbv.workers.dev)

Landing Page de alta conversão desenvolvida para o livro digital **Os Códigos Hebraicos da Prosperidade**, fundamentada nas Escrituras Sagradas e nas raízes originais do hebraico bíblico (*B’rakhah*, *Tsedaká*, *Shalom* e o *Princípio de José*).

## ✨ Recursos e Arquitetura

- **Design System Reverente & Autoritativo (`ui-ux-designer` + `tailwind-design-system`)**: Paleta Obsidiana & Ouro Sagrado, tipografia clássica (`Cinzel`, `Cormorant Garamond` e `Plus Jakarta Sans`) e contraste acessível WCAG 2.1 AA.
- **Mockup 3D Interativo da Capa Oficial**: Renderização 3D em CSS com acabamento em couro, folha de ouro e pergaminho hebraico complementar.
- **Simulador de Checkout & 3 Order Bumps Selecionáveis (`sales-automator`)**:
  1. **Order Bump 1 (R$ 19,90)**: *Áudios de Ativação: Os Decretos da Aliança em MP3*
  2. **Order Bump 2 (R$ 14,90)**: *Planilha Bíblica de Finanças: O Método José de Reserva e Gestão*
  3. **Order Bump 3 (R$ 19,90)**: *Guia de Blindagem Espiritual da Casa e Rompimento da Escassez Familiar*
- **SEO & Dados Estruturados (`seo-meta-optimizer`)**: Meta tags otimizadas, Open Graph, Twitter Card e JSON-LD (`Product` + `FAQPage`).
- **Deploy Edge via Cloudflare Workers**: Servido globalmente com baixíssima latência através do `worker.js`.

## 🚀 Estrutura de Arquivos

- `index.html` — Estrutura semântica completa da página de vendas
- `styles.css` — Tokens visuais, animações, mockup 3D e estilos responsivos
- `script.js` — Motor interativo de Order Bumps, cálculo de pedido em tempo real, FAQ Accordion e Modal de Checkout
- `assets/capa-bg.jpg` — Arte oficial da capa otimizada para web
- `worker.js` & `wrangler.toml` — Script de distribuição Edge no Cloudflare Workers
- `copy_da_landing_page_os_c_digos_hebraicos_da_prosperidade.md` — Copy original do projeto

## ⚙️ Como Configurar Link de Checkout Externo (Kiwify / Hotmart / Kirvano / Stripe)

No arquivo [`script.js`](./script.js), edite a propriedade `externalCheckoutUrl` dentro de `CHECKOUT_CONFIG`:

```js
const CHECKOUT_CONFIG = {
  // ...
  externalCheckoutUrl: 'https://pay.kiwify.com.br/SEU_LINK_AQUI'
};
```
