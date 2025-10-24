/* app.js — carga de menú, filtros y manejo de reservas (sin carrito ni modo oscuro) */
(function(){
  const state = { menu: [] };
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  const menuGrid = qs('#menuGrid');
  const filters = menuGrid ? qsa('.filter') : [];
  const searchInput = qs('#menuSearch');

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    const yearEl = qs('#year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
    bindUI();
    if(menuGrid) loadMenu();
  }

  function bindUI(){
    if(menuGrid){ filters.forEach(btn => btn.addEventListener('click', onFilter)); if(searchInput) searchInput.addEventListener('input', renderMenu); }
    const reservaForm = qs('#reservaForm'); if(reservaForm) reservaForm.addEventListener('submit', onReserve);
  }

  async function loadMenu(){
    try{ const res = await fetch('assets/menu.json'); state.menu = await res.json(); renderMenu(); }
    catch(e){ if(menuGrid) menuGrid.innerHTML = '<p class="muted">No se pudo cargar el menú.</p>'; console.error(e); }
  }

  function renderMenu(){
    if(!menuGrid) return;
    const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
    const activeEl = document.querySelector('.filter.active');
    const active = activeEl ? activeEl.dataset.cat : 'all';
    const items = state.menu.filter(i => (active === 'all' || i.category === active) && (!q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)));
    if(!items.length){ menuGrid.innerHTML = '<p class="muted">No se encontraron elementos.</p>'; return; }

    // Render sin opciones de compra - solo visualización
    menuGrid.innerHTML = items.map(i => (`
      <article class="card" data-id="${i.id}">
        <h4>${i.name}</h4>
        <p class="muted">${i.desc}</p>
        <p class="price">$${i.price.toFixed(2)}</p>
        <div class="muted" style="margin-top:.5rem;font-size:.85rem">${i.category}</div>
      </article>
    `)).join('');
  }

  function onFilter(e){ filters.forEach(f => f.classList.remove('active')); e.currentTarget.classList.add('active'); renderMenu(); }

  function onReserve(e){ if(e && e.preventDefault) e.preventDefault(); const form = e.target; const data = new FormData(form); const obj = Object.fromEntries(data.entries()); if(!obj.nombre || !obj.telefono || !obj.datetime){ alert('Por favor completa los campos requeridos.'); return; } alert(`Reserva recibida. Gracias ${obj.nombre}. Hemos registrado ${obj.personas || 1} personas para ${obj.datetime}`); form.reset(); }

})();
/* app.js — Interactividad: carga de menú, filtros, carrito, reservas y modo oscuro */
(function(){
  const state = { menu: [], cart: {} };
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Elementos (pueden no existir en la página principal)
  const menuGrid = qs('#menuGrid');
  const filters = menuGrid ? qsa('.filter') : [];
  const searchInput = qs('#menuSearch');
  const cartBtn = qs('#cartBtn');
  const cartModal = qs('#cartModal');
  const cartCount = qs('#cartCount');
  const cartItems = qs('#cartItems');
  const cartTotal = qs('#cartTotal');
  const closeCart = qs('#closeCart');
  const checkoutBtn = qs('#checkoutBtn');
  const darkToggle = qs('#darkToggle');

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    const yearEl = qs('#year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
    loadTheme();
    bindUI();
    if(menuGrid) loadMenu();
    restoreCart();
  }

  function bindUI(){
    if(menuGrid){ filters.forEach(btn => btn.addEventListener('click', onFilter)); if(searchInput) searchInput.addEventListener('input', renderMenu); }
    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeCart) closeCart.addEventListener('click', () => cartModal && cartModal.close());
    if(checkoutBtn) checkoutBtn.addEventListener('click', onCheckout);
    if(darkToggle) darkToggle.addEventListener('click', toggleTheme);
    const reservaForm = qs('#reservaForm'); if(reservaForm) reservaForm.addEventListener('submit', onReserve);
  }

  async function loadMenu(){
    try{ const res = await fetch('assets/menu.json'); state.menu = await res.json(); renderMenu(); }
    catch(e){ if(menuGrid) menuGrid.innerHTML = '<p class="muted">No se pudo cargar el menú.</p>'; console.error(e); }
  }

  function renderMenu(){
    const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
    const activeEl = document.querySelector('.filter.active');
    const active = activeEl ? activeEl.dataset.cat : 'all';
    const items = state.menu.filter(i => (active === 'all' || i.category === active) && (!q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)));
    if(!menuGrid) return;
    if(!items.length){ menuGrid.innerHTML = '<p class="muted">No se encontraron elementos.</p>'; return; }
    menuGrid.innerHTML = items.map(i => (`
      <article class="card" data-id="${i.id}">
        <h4>${i.name}</h4>
        <p class="muted">${i.desc}</p>
        <p class="price">$${i.price.toFixed(2)}</p>
        <div style="display:flex;gap:.5rem;align-items:center;margin-top:.5rem">
          <button class="btn small add" data-id="${i.id}">Añadir</button>
          <div class="muted" style="font-size:.85rem">${i.category}</div>
        </div>
      </article>
    `)).join('');
    document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
  }

  function onFilter(e){ filters.forEach(f => f.classList.remove('active')); e.currentTarget.classList.add('active'); renderMenu(); }

  function addToCart(id){ const item = state.menu.find(x => x.id === id); if(!item) return; state.cart[id] = state.cart[id] || {...item, qty:0}; state.cart[id].qty += 1; saveCart(); updateCartUI(); }

  function addLocalButtons(){ document.querySelectorAll('.add-local').forEach(b => b.addEventListener('click', (e) => { const id = e.currentTarget.dataset.id; addToCart(id); })); }

  function updateCartUI(){ const entries = Object.values(state.cart); const totalItems = entries.reduce((s,i)=>s+i.qty,0); const total = entries.reduce((s,i)=>s + i.qty * i.price,0); if(cartCount) cartCount.textContent = totalItems; if(cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`; if(entries.length===0){ if(cartItems) cartItems.innerHTML = '<p class="muted">No hay artículos.</p>'; return; } if(cartItems) cartItems.innerHTML = entries.map(i=>`<div class="cart-item"><div><strong>${i.name}</strong><div class="muted">${i.qty} x $${i.price.toFixed(2)}</div></div><div><button class="btn small" data-id="${i.id}" data-action="dec">−</button><button class="btn small" data-id="${i.id}" data-action="inc">+</button><button class="btn ghost" data-id="${i.id}" data-action="rm">Eliminar</button></div></div>`).join(''); if(cartItems) cartItems.querySelectorAll('button').forEach(b=>b.addEventListener('click', onCartAction)); }

  function onCartAction(e){ const id = e.currentTarget.dataset.id; const action = e.currentTarget.dataset.action; if(action==='inc') state.cart[id].qty += 1; if(action==='dec') state.cart[id].qty = Math.max(0, state.cart[id].qty - 1); if(action==='rm') delete state.cart[id]; Object.keys(state.cart).forEach(k=>{ if(state.cart[k].qty<=0) delete state.cart[k]; }); saveCart(); updateCartUI(); }

  function saveCart(){ localStorage.setItem('rincón_cart', JSON.stringify(state.cart)); }
  function restoreCart(){ const raw = localStorage.getItem('rincón_cart'); if(!raw) return; try{ state.cart = JSON.parse(raw); }catch(e){ state.cart = {}; } updateCartUI(); }
  function openCart(){ if(cartModal && cartModal.showModal) cartModal.showModal(); }

  function onCheckout(e){ if(e && e.preventDefault) e.preventDefault(); alert('Gracias — en una implementación real aquí se enviaría el pedido al restaurante.'); state.cart = {}; saveCart(); updateCartUI(); if(cartModal && cartModal.close) cartModal.close(); }

  function onReserve(e){ if(e && e.preventDefault) e.preventDefault(); const form = e.target; const data = new FormData(form); const obj = Object.fromEntries(data.entries()); if(!obj.nombre || !obj.telefono || !obj.datetime){ alert('Por favor completa los campos requeridos.'); return; } alert(`Reserva recibida. Gracias ${obj.nombre}. Hemos registrado ${obj.personas || 1} personas para ${obj.datetime}`); form.reset(); }

  function loadTheme(){ const t = localStorage.getItem('rincón_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); setTheme(t); }
  function toggleTheme(){ const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; setTheme(cur); }
  function setTheme(t){ document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light'); if(darkToggle) darkToggle.setAttribute('aria-pressed', t === 'dark'); localStorage.setItem('rincón_theme', t); }

  window.rincon = { addToCart };
  document.addEventListener('DOMContentLoaded', () => setTimeout(addLocalButtons, 200));

})();
