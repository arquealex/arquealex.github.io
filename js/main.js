/* main.js — Interactividad: carga de menú, filtros, carrito, reservas y modo oscuro */
(() => {
  const state = {
    menu: [],
    cart: {},
  };

  // Utilitarios
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // DOM (algunos elementos podrían no existir en la página principal)
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

  // Inicialización
  document.addEventListener('DOMContentLoaded', init);

  function init(){
    qs('#year').textContent = new Date().getFullYear();
    loadTheme();
    bindUI();
    // Cargar menú sólo si existe la sección del menú en la página actual
    if(menuGrid) loadMenu();
    restoreCart();
  }

  function bindUI(){
    // Bind para controles del menú (solo si existen)
    if(menuGrid){
      filters.forEach(btn => btn.addEventListener('click', onFilter));
      if(searchInput) searchInput.addEventListener('input', renderMenu);
    }
    cartBtn.addEventListener('click', () => openCart());
    closeCart.addEventListener('click', () => cartModal.close());
    checkoutBtn.addEventListener('click', onCheckout);
    darkToggle.addEventListener('click', toggleTheme);

    // Reserva
    const reservaForm = qs('#reservaForm');
    reservaForm.addEventListener('submit', onReserve);
  }

  async function loadMenu(){
    try{
      const res = await fetch('assets/menu.json');
      state.menu = await res.json();
      renderMenu();
    }catch(e){
      if(menuGrid) menuGrid.innerHTML = '<p class="muted">No se pudo cargar el menú.</p>';
      console.error(e);
    }
  }

  function renderMenu(){
    const q = searchInput.value.trim().toLowerCase();
    const active = document.querySelector('.filter.active')?.dataset?.cat || 'all';
    const items = state.menu.filter(i => {
      const matchesCat = active === 'all' || i.category === active;
      const matchesQ = !q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });

    if(!items.length){
      if(menuGrid) menuGrid.innerHTML = '<p class="muted">No se encontraron elementos.</p>';
      return;
    }

    if(menuGrid) menuGrid.innerHTML = items.map(i => (`
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

      // bind add buttons
      document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
    }
  }

  function onFilter(e){
    filters.forEach(f => f.classList.remove('active'));
    e.currentTarget.classList.add('active');
    renderMenu();
  }

  function addToCart(id){
    const item = state.menu.find(x => x.id === id);
    if(!item) return;
    state.cart[id] = state.cart[id] || {...item, qty:0};
    state.cart[id].qty += 1;
    saveCart();
    updateCartUI();
  }

  function addLocalButtons(){
    document.querySelectorAll('.add-local').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    }));
  }

  function updateCartUI(){
    const entries = Object.values(state.cart);
    const totalItems = entries.reduce((s,i)=>s+i.qty,0);
    const total = entries.reduce((s,i)=>s + i.qty * i.price,0);
    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    if(entries.length === 0){
      cartItems.innerHTML = '<p class="muted">No hay artículos.</p>';
      return;
    }
    cartItems.innerHTML = entries.map(i => (
      `<div class="cart-item"><div><strong>${i.name}</strong><div class="muted">${i.qty} x $${i.price.toFixed(2)}</div></div><div><button class="btn small" data-id="${i.id}" data-action="dec">−</button><button class="btn small" data-id="${i.id}" data-action="inc">+</button><button class="btn ghost" data-id="${i.id}" data-action="rm">Eliminar</button></div></div>`
    )).join('');

    // bind cart actions
    cartItems.querySelectorAll('button').forEach(b => b.addEventListener('click', onCartAction));
  }

  function onCartAction(e){
    const id = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    if(action === 'inc') state.cart[id].qty += 1;
    if(action === 'dec') state.cart[id].qty = Math.max(0, state.cart[id].qty - 1);
    if(action === 'rm') delete state.cart[id];
    // remove zero qty
    Object.keys(state.cart).forEach(k => { if(state.cart[k].qty <= 0) delete state.cart[k]; });
    saveCart();
    updateCartUI();
  }

  function saveCart(){
    localStorage.setItem('rincón_cart', JSON.stringify(state.cart));
  }

  function restoreCart(){
    const raw = localStorage.getItem('rincón_cart');
    if(!raw) return;
    try{ state.cart = JSON.parse(raw); }catch(e){ state.cart = {}; }
    updateCartUI();
  }

  function openCart(){
    cartModal.showModal();
  }

  function onCheckout(e){
    e.preventDefault?.();
    // placeholder: en sitio real conectar a API de pedidos
    alert('Gracias — en una implementación real aquí se enviaría el pedido al restaurante.');
    state.cart = {};
    saveCart();
    updateCartUI();
    cartModal.close();
  }

  function onReserve(e){
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const obj = Object.fromEntries(data.entries());
    // validación sencilla
    if(!obj.nombre || !obj.telefono || !obj.datetime){
      alert('Por favor completa los campos requeridos.');
      return;
    }
    // en implementación real enviar a backend
    alert(`Reserva recibida. Gracias ${obj.nombre}. Hemos registrado ${obj.personas || 1} personas para ${obj.datetime}`);
    form.reset();
  }

  // Tema
  function loadTheme(){
    const t = localStorage.getItem('rincón_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(t);
  }

  function toggleTheme(){
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(cur);
  }

  function setTheme(t){
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    darkToggle.setAttribute('aria-pressed', t === 'dark');
    localStorage.setItem('rincón_theme', t);
  }

  // Expose some hooks for initial local add buttons
  window.rincon = { addToCart };

  // After DOM changes, bind local adds
  document.addEventListener('DOMContentLoaded', () => setTimeout(addLocalButtons, 200));

})();
