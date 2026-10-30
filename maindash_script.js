
const SK = 'dashcore_session';
const UK = 'dashcore_users';
const TK = 'dashcore_theme';

/* ─── INIT ─── */
window.addEventListener('DOMContentLoaded', () => {
  showApp();
  initTheme();
  initMobile();
  setDate();
  setActiveNav('dashboard');
});
/* ─── AUTH CHECK ─── */
function getSession() {
  const r = localStorage.getItem(SK);
  return r ? JSON.parse(r) : null;
}

function showAuth() {
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('appLayout').style.display = 'none';
}

function showApp() {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('appLayout').style.display = 'grid';
}

/* ─── NAVIGATION ─── */
function navigate(page) {
  // hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  setActiveNav(page);
  // close mobile sidebar
  document.getElementById('aside').classList.remove('open');
  // update profile on settings page
  if (page === 'settings') prefillSettings();
}

function setActiveNav(page) {
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

/* ─── PROFILE INIT ─── */
function initProfile() {
  const session = getSession();
  if (!session) return;
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  const u = users.find(x => x.email === session.email);
  const fn = u ? u.firstName : (session.name || 'Admin');
  const ln = u ? u.lastName  : '';
  const fullName = ln ? `${fn} ${ln}` : fn;
  const initials = (fn[0] + (ln ? ln[0] : '')).toUpperCase();

  setText('userName', fullName);
  setText('userStatus', 'Admin');
  setText('dropName', fullName);
  setText('dropEmail', session.email || '');

  const ac = document.getElementById('avatarCircle');
  const gi = document.getElementById('guestImg');
  if (ac) { ac.textContent = initials; ac.style.display = 'flex'; }
  if (gi)   gi.style.display = 'none';

  setText('dropAuthIcon', 'logout');
  setText('dropAuthText', 'Logout');
  document.getElementById('dropAuthBtn').style.color = 'var(--danger)';

  // sidebar auth link
  const icon = document.getElementById('authNavIcon');
  const txt  = document.getElementById('authNavText');
  const link = document.getElementById('authNavLink');
  if (icon) icon.textContent = 'logout';
  if (txt)  txt.textContent  = 'Logout';
  if (link) link.classList.add('logout-link');
}

function handleAuthNav() {
  const session = getSession();
  if (session) { doLogout(); } else { showAuth(); }
}

function doLogout() {
  localStorage.removeItem(SK);
  showAuth();
  showLoginForm();
}

/* ─── LOGIN / SIGNUP ─── */
function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('authSubtitle').textContent = 'Create a new account';
  clearMsg();
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('authSubtitle').textContent = 'Welcome back! Please login to continue.';
  clearMsg();
}

function showLogin() { showLoginForm(); }

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showMsg('Please fill all fields.','err'); return; }
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  const u = users.find(x => x.email === email && x.password === pass);
  if (!u) { showMsg('Invalid email or password.','err'); return; }
  localStorage.setItem(SK, JSON.stringify({ email, name: u.firstName }));
  showApp();
  initProfile();
  initTheme();
  initMobile();
  setDate();
  setActiveNav('dashboard');
  showToast('Welcome back, ' + u.firstName + '!', 'ok');
}

function doSignup() {
  const fn    = document.getElementById('signFn').value.trim();
  const ln    = document.getElementById('signLn').value.trim();
  const email = document.getElementById('signEmail').value.trim();
  const pass  = document.getElementById('signPass').value;
  if (!fn || !email || !pass) { showMsg('Please fill required fields.','err'); return; }
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  if (users.find(x => x.email === email)) { showMsg('Email already registered.','err'); return; }
  users.push({ firstName:fn, lastName:ln, email, password:pass });
  localStorage.setItem(UK, JSON.stringify(users));
  localStorage.setItem(SK, JSON.stringify({ email, name: fn }));
  showApp();
  initProfile();
  initTheme();
  initMobile();
  setDate();
  setActiveNav('dashboard');
  showToast('Account created! Welcome, ' + fn + '!', 'ok');
}

function showMsg(msg, type) {
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.className = 'auth-msg ' + type;
  el.style.display = 'block';
}
function clearMsg() { document.getElementById('authMsg').style.display = 'none'; }

/* ─── THEME ─── */
function initTheme() {
  const isDark = localStorage.getItem(TK) === 'dark';
  document.body.classList.toggle('dark', isDark);
  document.getElementById('lightIcon')?.classList.toggle('active', !isDark);
  document.getElementById('darkIcon')?.classList.toggle('active', isDark);
  const dt = document.getElementById('darkTog');
  if (dt) dt.checked = isDark;
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(TK, isDark ? 'dark' : 'light');
  document.getElementById('lightIcon').classList.toggle('active', !isDark);
  document.getElementById('darkIcon').classList.toggle('active', isDark);
  const dt = document.getElementById('darkTog');
  if (dt) dt.checked = isDark;
}

function toggleThemeFromSettings(cb) {
  const isDark = cb.checked;
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem(TK, isDark ? 'dark' : 'light');
  document.getElementById('lightIcon').classList.toggle('active', !isDark);
  document.getElementById('darkIcon').classList.toggle('active', isDark);
}

/* ─── MOBILE MENU ─── */
function initMobile() {
  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('aside').classList.add('open');
  });
  document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('aside').classList.remove('open');
  });
}

/* ─── DROPDOWN ─── */
function toggleDropdown() {
  document.getElementById('profileDropdown').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-wrapper')) {
    document.getElementById('profileDropdown')?.classList.remove('open');
  }
});

/* ─── DATE ─── */
function setDate() {
  const di = document.getElementById('dateInput');
  if (di) di.value = new Date().toISOString().split('T')[0];
}

/* ─── TOAST ─── */
function showToast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.className = 'toast ' + type;
  t.innerHTML = `<span class="material-symbols-sharp">${type==='ok'?'check_circle':'error'}</span> ${msg}`;
  // remove class then re-add to retrigger
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─── HELPERS ─── */
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

/* ─── CUSTOMERS ─── */
function filterCustomers() {
  const q = document.getElementById('custSearch').value.toLowerCase();
  document.querySelectorAll('#custTable tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function deleteRow(btn) {
  if (confirm('Delete this customer?')) {
    btn.closest('tr').remove();
    showToast('Customer deleted.', 'ok');
  }
}

function openAddCustomer() { document.getElementById('addCustModal').classList.add('open'); }

function saveCustomer() {
  const name  = document.getElementById('newCustName').value.trim();
  const email = document.getElementById('newCustEmail').value.trim();
  const phone = document.getElementById('newCustPhone').value.trim();
  if (!name || !email) { showToast('Name and email required.','er'); return; }
  const colors = ['#7380ec','#41f1b6','#ff7782','#ffbb55'];
  const col = colors[Math.floor(Math.random()*colors.length)];
  const row = document.createElement('tr');
  row.innerHTML = `<td><span class="av" style="background:${col};${col==='#41f1b6'||col==='#ffbb55'?'color:#363949;':''}">${name[0].toUpperCase()}</span>${name}</td><td>${email}</td><td>${phone||'—'}</td><td>0</td><td><span class="badge b-ok">Active</span></td><td><div class="actions"><button class="btn btn-ghost btn-sm" onclick="showToast('Edit coming soon','ok')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button></div></td>`;
  document.getElementById('custTable').appendChild(row);
  closeModal('addCustModal');
  showToast('Customer added!','ok');
  document.getElementById('newCustName').value = '';
  document.getElementById('newCustEmail').value = '';
  document.getElementById('newCustPhone').value = '';
}

/* ─── MESSAGES ─── */
function openChat(name, email, color, initial) {
  document.getElementById('chatName').textContent = name;
  document.getElementById('chatEmail').textContent = email;
  const av = document.getElementById('chatAv');
  av.textContent = initial;
  av.style.background = color;
  document.querySelectorAll('.msg-item').forEach(i => i.classList.remove('active'));
  event.currentTarget.classList.add('active');
  // remove unread badge
  const dot = event.currentTarget.querySelector('.unread-dot');
  if (dot) dot.remove();
}

function sendMsg() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text) return;
  const msgs = document.getElementById('chatMsgs');
  const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  const b = document.createElement('div');
  b.className = 'bubble sent';
  b.innerHTML = `${text}<div class="t">${now}</div>`;
  msgs.appendChild(b);
  inp.value = '';
  msgs.scrollTop = msgs.scrollHeight;
  // simulate reply
  setTimeout(() => {
    const r = document.createElement('div');
    r.className = 'bubble recv';
    r.innerHTML = `Got it! We'll look into it right away. 👍<div class="t">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;
    msgs.appendChild(r);
    msgs.scrollTop = msgs.scrollHeight;
  }, 1200);
}

/* ─── SETTINGS ─── */
function prefillSettings() {
  const session = getSession();
  if (!session) return;
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  const u = users.find(x => x.email === session.email);
  if (u) {
    const fn = document.getElementById('sfFn');
    const ln = document.getElementById('sfLn');
    const em = document.getElementById('sfEmail');
    if (fn) fn.value = u.firstName || '';
    if (ln) ln.value = u.lastName  || '';
    if (em) em.value = u.email     || '';
  }
}

function saveProfile() {
  const session = getSession();
  if (!session) return;
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  const idx = users.findIndex(x => x.email === session.email);
  if (idx === -1) return;
  users[idx].firstName = document.getElementById('sfFn').value.trim() || users[idx].firstName;
  users[idx].lastName  = document.getElementById('sfLn').value.trim() || users[idx].lastName;
  localStorage.setItem(UK, JSON.stringify(users));
  initProfile();
  showToast('Profile updated!','ok');
}

function changePassword() {
  const cp = document.getElementById('cpwd').value;
  const np = document.getElementById('npwd').value;
  const cn = document.getElementById('cnpwd').value;
  if (!cp || !np) { showToast('Fill all password fields.','er'); return; }
  if (np !== cn) { showToast('Passwords do not match.','er'); return; }
  if (np.length < 6) { showToast('Password must be 6+ chars.','er'); return; }
  const session = getSession();
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  const idx = users.findIndex(x => x.email === session.email);
  if (idx === -1) return;
  if (users[idx].password !== cp) { showToast('Current password wrong.','er'); return; }
  users[idx].password = np;
  localStorage.setItem(UK, JSON.stringify(users));
  document.getElementById('cpwd').value = '';
  document.getElementById('npwd').value = '';
  document.getElementById('cnpwd').value = '';
  showToast('Password updated!','ok');
}

/* ─── ADD PRODUCT ─── */
function addProduct() {
  const name  = document.getElementById('pName').value.trim();
  const cat   = document.getElementById('pCat').value;
  const price = document.getElementById('pPrice').value;
  const stock = document.getElementById('pStock').value;
  if (!name || !cat || !price || !stock) { showToast('Fill all required fields.','er'); return; }
  // add card to products grid
  const grid = document.getElementById('page-products').querySelector('.products-grid');
  const addCard = grid.lastElementChild; // the "+ add" placeholder
  const icons = ['devices','inventory','category','sell','local_offer'];
  const ic = icons[Math.floor(Math.random()*icons.length)];
  const card = document.createElement('div');
  card.className = 'prod-card';
  card.innerHTML = `<div class="prod-img"><span class="material-symbols-sharp">${ic}</span></div><div class="prod-body"><h3>${name}</h3><p>Category: ${cat} · Stock: ${stock}</p><div class="prod-foot"><span class="prod-price">₹${parseFloat(price).toFixed(2)}</span><span class="badge ${parseInt(stock)>20?'b-ok':parseInt(stock)>0?'b-war':'b-err'}">${parseInt(stock)>20?'In Stock':parseInt(stock)>0?'Low Stock':'Out of Stock'}</span></div></div>`;
  grid.insertBefore(card, addCard);
  // clear form
  ['pName','pPrice','pStock','pDesc','pSku'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pCat').value = '';
  document.getElementById('pStatus').value = 'In Stock';
  showToast(`"${name}" added!`,'ok');
  navigate('products');
}

/* ─── MODAL ─── */
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if(e.target === o) o.classList.remove('open'); });
});
