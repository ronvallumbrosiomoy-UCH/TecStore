// script.js — comportamiento mínimo del carrito y del menú de cuenta
// Este script añade capacidad básica para: añadir al carrito (desde botones con data-*),
// abrir/cerrar modal del carrito y mostrar el contador de items. Persiste en localStorage.

const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });

// Elementos DOM
const cartCountEl = document.getElementById('cart-count');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');

// Simple storage key
const STORAGE_KEY = 'tecstore_cart';

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function saveCart(){
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
	renderCart();
}

function renderCart(){
	// contador
	const count = cart.reduce((s,i)=>s+i.qty,0);
	if(cartCountEl) cartCountEl.textContent = count;

	// items
	if(!cartItemsEl) return;
	cartItemsEl.innerHTML = '';
	if(cart.length === 0){ cartItemsEl.innerHTML = '<p>Tu carrito está vacío.</p>'; cartTotalEl.textContent = formatter.format(0); return }
	let total = 0;
	cart.forEach(item=>{
		total += item.price * item.qty;
			const div = document.createElement('div');
			div.className = 'cart-item';
			div.innerHTML = `
				<div class="meta">
					<div><strong>${item.name}</strong></div>
					<div>${formatter.format(item.price)} · x${item.qty}</div>
				</div>
				<div class="controls">
					<button class="dec" data-id="${item.id}">-</button>
					<button class="inc" data-id="${item.id}">+</button>
					<button class="rem" data-id="${item.id}">Eliminar</button>
				</div>
			`;
		cartItemsEl.appendChild(div);
	});
	cartTotalEl.textContent = formatter.format(total);
}

function addToCartFromDataset(ds){
	const id = ds.add || ds.id;
	const name = ds.name || ds.productName || 'Producto';
	const price = Number(ds.price || 0);
	const img = ds.img || '';
	if(!id) return;
	const existing = cart.find(c=>String(c.id)===String(id));
	if(existing) existing.qty += 1;
	else cart.push({id:id,name:name,price:price,img:img,qty:1});
	saveCart();
}

// Attach listeners to buttons data-add
document.addEventListener('click', function(e){
	const addBtn = e.target.closest('[data-add]');
	if(addBtn){
		e.preventDefault();
		addToCartFromDataset(addBtn.dataset);
		return;
	}
	// cart controls
	if(e.target.classList.contains('dec')){ const id = e.target.dataset.id; changeQty(id,-1); return }
	if(e.target.classList.contains('inc')){ const id = e.target.dataset.id; changeQty(id,1); return }
	if(e.target.classList.contains('rem')){ const id = e.target.dataset.id; removeItem(id); return }
});

function changeQty(id,delta){
	const it = cart.find(c=>String(c.id)===String(id)); if(!it) return;
	it.qty += delta; if(it.qty <= 0){ cart = cart.filter(c=>String(c.id)!==String(id)) }
	saveCart();
}
function removeItem(id){ cart = cart.filter(c=>String(c.id)!==String(id)); saveCart(); }

// Modal behavior
if(cartBtn) cartBtn.addEventListener('click', ()=>{ if(cartModal) cartModal.setAttribute('aria-hidden','false'); renderCart(); });
if(closeCartBtn) closeCartBtn.addEventListener('click', ()=>{ if(cartModal) cartModal.setAttribute('aria-hidden','true'); });
if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{ if(cartModal) cartModal.setAttribute('aria-hidden','true'); if(checkoutModal) checkoutModal.setAttribute('aria-hidden','false'); });
if(closeCheckout) closeCheckout.addEventListener('click', ()=>{ if(checkoutModal) checkoutModal.setAttribute('aria-hidden','true'); });

if(checkoutForm){
	checkoutForm.addEventListener('submit', function(e){
		e.preventDefault();
		// simple simulated submit
		alert('Gracias! Tu pedido ha sido recibido.');
		cart = [];
		saveCart();
		if(checkoutModal) checkoutModal.setAttribute('aria-hidden','true');
	});
}

// Account menu simple toggle (menu exists in HTML)
const accountBtn = document.getElementById('account-btn');
const accountMenu = document.getElementById('account-menu');
if(accountBtn && accountMenu){
	accountBtn.addEventListener('click', function(e){
		const hidden = accountMenu.getAttribute('aria-hidden') === 'true';
		accountMenu.setAttribute('aria-hidden', hidden ? 'false' : 'true');
	});
}

// Init render
renderCart();

// --- Autenticación simple (register / login) ---
function getUsers(){
	return JSON.parse(localStorage.getItem('tecstore_users') || '{}');
}
function saveUsers(u){ localStorage.setItem('tecstore_users', JSON.stringify(u)); }

function getLogged(){ return localStorage.getItem('tecstore_logged') || null; }
function setLogged(email){ localStorage.setItem('tecstore_logged', email); updateAuthUI(); }
function clearLogged(){ localStorage.removeItem('tecstore_logged'); updateAuthUI(); }

function registerUser(email, password){
	const users = getUsers();
	const e = String(email).trim().toLowerCase();
	if(users[e]) return { ok:false, message:'Ya existe una cuenta con ese correo.' };
	users[e] = { password: String(password) };
	saveUsers(users);
	setLogged(e);
	return { ok:true };
}

function loginUser(email, password){
	const users = getUsers();
	const e = String(email).trim().toLowerCase();
	if(!users[e]) return { ok:false, message:'No existe cuenta con ese correo.' };
	if(users[e].password !== String(password)) return { ok:false, message:'Contraseña incorrecta.' };
	setLogged(e);
	return { ok:true };
}

// Perfiles de usuario (almacenamiento simple)
function getProfiles(){ return JSON.parse(localStorage.getItem('tecstore_profiles') || '{}'); }
function saveProfiles(p){ localStorage.setItem('tecstore_profiles', JSON.stringify(p)); }
function saveProfile(email, profile){ const p = getProfiles(); p[String(email).trim().toLowerCase()] = profile; saveProfiles(p); }

// Mensajes inline (si el contenedor no existe, cae a alert como respaldo)
function showFeedback(elId, message, type='error'){
	const el = document.getElementById(elId);
	const safe = String(message);
	if(!el){ alert(safe); return }
	el.innerHTML = `<div class="feedback ${type}">${safe}</div>`;
}

// Validación del formulario de registro: comprueba campos obligatorios y patrones básicos
function validateRegistrationForm(fd){
	const fullname = (fd.get('fullname') || '').trim();
	const birthdate = (fd.get('birthdate') || '').trim();
	const postal = (fd.get('postal') || '').trim();
	const address = (fd.get('address') || '').trim();
	const dni = (fd.get('dni') || '').trim();
	const phone = (fd.get('phone') || '').trim();

	if(!fullname) return { ok:false, message:'El nombre completo es obligatorio.' };
	if(!birthdate) return { ok:false, message:'La fecha de nacimiento es obligatoria.' };
	if(!postal) return { ok:false, message:'El código postal es obligatorio.' };
	if(!/^[0-9]{5}$/.test(postal)) return { ok:false, message:'El código postal debe tener 5 dígitos.' };
	if(!address) return { ok:false, message:'La dirección es obligatoria.' };
	if(!dni) return { ok:false, message:'El DNI es obligatorio.' };
	if(!/^[0-9]{8}$/.test(dni)) return { ok:false, message:'El DNI debe tener 8 dígitos.' };
	if(!phone) return { ok:false, message:'El teléfono es obligatorio.' };
	if(!/^(\+51)?\d{9}$/.test(phone)) return { ok:false, message:'El teléfono debe tener 9 dígitos o empezar con +51.' };

	return { ok:true };
}

function updateAuthUI(){
	const display = document.getElementById('user-display');
	const menu = document.getElementById('account-menu');
	const email = getLogged();
	if(email){
		if(display){ display.textContent = email; display.style.display = 'inline-block'; }
		if(menu){
			menu.innerHTML = `
				<a href="profile.html" role="menuitem" class="menu-link">Mi cuenta</a>
				<a href="#" id="logout-link" role="menuitem" class="menu-link">Cerrar sesión</a>
			`;
			const logoutLink = document.getElementById('logout-link');
			if(logoutLink) logoutLink.addEventListener('click', function(e){ e.preventDefault(); clearLogged(); });
		}
	} else {
		if(display){ display.style.display = 'none'; }
		if(menu){
			menu.innerHTML = `
				<a href="login.html" role="menuitem" class="menu-link">Iniciar sesión</a>
				<a href="register.html" role="menuitem" class="menu-link">Crear cuenta</a>
			`;
		}
	}
}

// Auto-detect forms on register/login pages and attach handlers
document.addEventListener('DOMContentLoaded', function(){
	updateAuthUI();
	const reg = document.getElementById('register-form');
	if(reg){
		reg.addEventListener('submit', function(e){
			e.preventDefault();
			const fd = new FormData(reg);
			const email = fd.get('email');
			const pw = fd.get('password');
			const pw2 = fd.get('password2');
			// validar campos personales obligatorios
			const v = validateRegistrationForm(fd);
			if(!v.ok){ showFeedback('register-feedback', v.message, 'error'); return }
			if(pw !== pw2){ showFeedback('register-feedback','Las contraseñas no coinciden.','error'); return }
			const res = registerUser(email,pw);
			if(!res.ok){ showFeedback('register-feedback', res.message, 'error'); return }
			// guardar perfil parcial (si hay campos)
			const profile = {
				fullname: fd.get('fullname') || '',
				birthdate: fd.get('birthdate') || '',
				postal: fd.get('postal') || '',
				address: fd.get('address') || '',
				dni: fd.get('dni') || '',
				phone: fd.get('phone') || ''
			};
			saveProfile(email, profile);
			showFeedback('register-feedback','Cuenta creada. Redirigiendo a completar perfil...','success');
			setTimeout(()=> window.location.href = 'profile.html', 800);
		});
	}

	const login = document.getElementById('login-form');
	if(login){
		login.addEventListener('submit', function(e){
			e.preventDefault();
			const fd = new FormData(login);
			const email = fd.get('email');
			const pw = fd.get('password');
			const res = loginUser(email,pw);
			if(!res.ok){
				showFeedback('login-feedback', `${res.message} <a href="register.html">Crear cuenta</a>`, 'error');
				return;
			}
			window.location.href = 'index.html';
		});
	}
});
