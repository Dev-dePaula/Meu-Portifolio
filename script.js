/* ============================================================
   ANDERSON DE PAULA — PORTFOLIO — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initLedger();
  initContactForm();
  initYear();
});

/* ---------- Menu mobile ---------- */
function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => io.observe(el));
}

/* ---------- Ano no rodapé ---------- */
function initYear(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   LEDGER — feed de transações Pix simulado (elemento de assinatura)
   ============================================================ */
function initLedger(){
  const body = document.getElementById('ledgerBody');
  if(!body) return;

  const names = [
    'Camila R.', 'João P.', 'Voltz • Loja 04', 'Marcos T.',
    'Zait • Assinatura', 'Fernanda A.', 'Rafael S.', 'Beatriz L.',
    'Voltz • Split', 'Eduardo M.', 'Larissa C.', 'Pedro H.'
  ];
  const maxRows = 6;
  let clockMinutes = 14 * 60 + 32; // 14:32 fictício, avança a cada nova transação

  function initials(name){
    return name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  }

  function formatBRL(value){
    return value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  }

  function tick(){
    clockMinutes = (clockMinutes + (1 + Math.floor(Math.random()*4))) % (24*60);
    const h = String(Math.floor(clockMinutes/60)).padStart(2,'0');
    const m = String(clockMinutes%60).padStart(2,'0');
    return `${h}:${m}`;
  }

  function randomRow(){
    const name = names[Math.floor(Math.random()*names.length)];
    const isIn = Math.random() > 0.42;
    const value = (Math.random() * 890 + 12).toFixed(2);
    const row = document.createElement('div');
    row.className = 'ledger-row';
    row.innerHTML = `
      <div class="who">
        <div class="avatar">${initials(name)}</div>
        <div class="meta">
          <div class="name">${name}</div>
          <div class="sub">PIX &middot; ${tick()}</div>
        </div>
      </div>
      <div class="amt">
        <div class="value ${isIn ? 'in' : 'out'}">${isIn ? '+' : '−'} ${formatBRL(value)}</div>
        <div class="status">CONFIRMADO</div>
      </div>
    `;
    return row;
  }

  function pushRow(){
    const row = randomRow();
    body.prepend(row);
    const rows = body.querySelectorAll('.ledger-row');
    if(rows.length > maxRows){
      rows[rows.length - 1].remove();
    }
  }

  // popula linhas iniciais
  for(let i=0; i<maxRows; i++){ pushRow(); }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!prefersReducedMotion){
    setInterval(pushRow, 2600);
  }
}

/* ============================================================
   FORMULÁRIO DE CONTATO — abre o cliente de e-mail (mailto)
   Sem backend: este site é 100% estático, então o envio real
   acontece pelo próprio app de e-mail do visitante.
   ============================================================ */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;

  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if(!name || !email || !message){
      showStatus('Preencha nome, e-mail e mensagem antes de enviar.', false);
      return;
    }

    const subject = encodeURIComponent(`Contato via portfólio — ${name}`);
    const body = encodeURIComponent(
      `${message}\n\n---\nNome: ${name}\nE-mail: ${email}`
    );
    const mailto = `mailto:andersondepaula2304@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    showStatus('Abrindo seu aplicativo de e-mail com a mensagem pronta…', true);
  });

  function showStatus(text, ok){
    status.textContent = text;
    status.style.color = ok ? 'var(--ok)' : '#d98f8f';
    status.classList.add('is-visible');
  }
}
