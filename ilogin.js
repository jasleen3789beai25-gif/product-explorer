/* ==========================================================
   DashCore — Auth System (Login + Sign Up)
   Stores users in localStorage under key: "dc_users"
   Stores logged-in session under key: "dc_session"
   Redirects to jhomepage.html on successful login / signup
   ========================================================== */

// ── Storage keys ─────────────────────────────────────────────────
const USERS_KEY   = 'dc_users';       // array of { name, email, password }
const SESSION_KEY = 'dc_session';     // { name, email }
const HOME_PAGE   = 'jhomepage.html'; // ← change this if your homepage file is named differently

// ── Utility: get all registered users ────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// ── Utility: save users array ─────────────────────────────────────
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Utility: save session ─────────────────────────────────────────
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}

// ── Auto-redirect REMOVED — login page always shows first ────────

// ── DOM: common helpers ───────────────────────────────────────────
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function setFieldError(inputEl, errEl, msg) {
  if (msg) {
    inputEl.classList.add('is-error');
    errEl.textContent = msg;
  } else {
    inputEl.classList.remove('is-error');
    errEl.textContent = '';
  }
}

function showAlert(alertEl, msg, type) {
  alertEl.textContent = msg;
  alertEl.className = `alert ${type}`;
}

function clearAlert(alertEl) {
  alertEl.className = 'alert';
  alertEl.textContent = '';
}

function setLoading(btn, textEl, spinnerEl, on, label) {
  btn.disabled = on;
  textEl.textContent = on ? label : textEl.dataset.default;
  spinnerEl.classList.toggle('active', on);
}

function shakeCard(cardEl) {
  cardEl.style.animation = 'none';
  cardEl.offsetHeight;
  cardEl.style.animation = 'shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97) both';
  cardEl.addEventListener('animationend', () => { cardEl.style.animation = ''; }, { once: true });
}

function togglePasswordVisibility(inputEl, svgEl) {
  const isPass = inputEl.type === 'password';
  inputEl.type = isPass ? 'text' : 'password';
  svgEl.innerHTML = isPass
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
         a18.45 18.45 0 0 1 5.06-5.94"/>
       <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
         a18.5 18.5 0 0 1-2.16 3.19"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>`;
}

// ─────────────────────────────────────────────────────────────────
//  SWITCH BETWEEN LOGIN ↔ SIGNUP
// ─────────────────────────────────────────────────────────────────
const loginCard  = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');

function showLogin() {
  signupCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  loginCard.style.animation = 'none';
  loginCard.offsetHeight;
  loginCard.style.animation = 'cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both';
  clearAllErrors();
}

function showSignup() {
  loginCard.classList.add('hidden');
  signupCard.classList.remove('hidden');
  signupCard.style.animation = 'none';
  signupCard.offsetHeight;
  signupCard.style.animation = 'cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both';
  clearAllErrors();
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(el => el.classList.remove('is-error'));
  document.querySelectorAll('.alert').forEach(el => { el.className = 'alert'; el.textContent = ''; });
}

document.getElementById('goToSignup').addEventListener('click', e => { e.preventDefault(); showSignup(); });
document.getElementById('goToLogin').addEventListener('click',  e => { e.preventDefault(); showLogin(); });

// ─────────────────────────────────────────────────────────────────
//  LOGIN LOGIC
// ─────────────────────────────────────────────────────────────────
const loginEmailInput = document.getElementById('loginEmail');
const loginPassInput  = document.getElementById('loginPass');
const loginEmailErr   = document.getElementById('loginEmailErr');
const loginPassErr    = document.getElementById('loginPassErr');
const loginAlert      = document.getElementById('loginAlert');
const loginBtn        = document.getElementById('loginBtn');
const loginBtnText    = document.getElementById('loginBtnText');
const loginSpinner    = document.getElementById('loginSpinner');

loginBtnText.dataset.default = 'Login';

// Real-time validation
loginEmailInput.addEventListener('input', () => {
  clearAlert(loginAlert);
  setFieldError(loginEmailInput, loginEmailErr,
    loginEmailInput.value && !isValidEmail(loginEmailInput.value) ? 'Enter a valid email address.' : '');
});
loginPassInput.addEventListener('input', () => {
  clearAlert(loginAlert);
  setFieldError(loginPassInput, loginPassErr,
    loginPassInput.value && loginPassInput.value.length < 6 ? 'Password must be at least 6 characters.' : '');
});

// Password toggle
document.getElementById('toggleLoginPw').addEventListener('click', () => {
  togglePasswordVisibility(loginPassInput, document.getElementById('loginEyeIcon'));
});

// Submit
loginBtn.addEventListener('click', () => {
  clearAlert(loginAlert);
  const email = loginEmailInput.value.trim();
  const pass  = loginPassInput.value;
  let ok = true;

  if (!email) {
    setFieldError(loginEmailInput, loginEmailErr, 'Email is required.'); ok = false;
  } else if (!isValidEmail(email)) {
    setFieldError(loginEmailInput, loginEmailErr, 'Enter a valid email address.'); ok = false;
  } else setFieldError(loginEmailInput, loginEmailErr, '');

  if (!pass) {
    setFieldError(loginPassInput, loginPassErr, 'Password is required.'); ok = false;
  } else if (pass.length < 6) {
    setFieldError(loginPassInput, loginPassErr, 'Password must be at least 6 characters.'); ok = false;
  } else setFieldError(loginPassInput, loginPassErr, '');

  if (!ok) return;

  setLoading(loginBtn, loginBtnText, loginSpinner, true, 'Logging in…');

  setTimeout(() => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (found) {
      saveSession(found);
      showAlert(loginAlert, `Welcome back, ${found.name}! Redirecting…`, 'success');
      setTimeout(() => { window.location.href = HOME_PAGE; }, 1200);
    } else {
      setLoading(loginBtn, loginBtnText, loginSpinner, false, '');
      showAlert(loginAlert, 'Invalid email or password. Please try again.', 'error');
      shakeCard(loginCard);
    }
  }, 900);
});

// Enter key
[loginEmailInput, loginPassInput].forEach(inp => {
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
});

// Forgot password
document.getElementById('forgotLink').addEventListener('click', e => {
  e.preventDefault();
  const email = prompt('Enter your registered email address:');
  if (!email) return;
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    alert(`Your password is: ${found.password}\n\n(In a real app, a reset link would be emailed to you.)`);
  } else {
    alert('No account found with that email address.');
  }
});

// ─────────────────────────────────────────────────────────────────
//  SIGN UP LOGIC
// ─────────────────────────────────────────────────────────────────
const signupNameInput    = document.getElementById('signupName');
const signupEmailInput   = document.getElementById('signupEmail');
const signupPassInput    = document.getElementById('signupPass');
const signupConfirmInput = document.getElementById('signupConfirm');
const signupNameErr      = document.getElementById('signupNameErr');
const signupEmailErr     = document.getElementById('signupEmailErr');
const signupPassErr      = document.getElementById('signupPassErr');
const signupConfirmErr   = document.getElementById('signupConfirmErr');
const signupAlert        = document.getElementById('signupAlert');
const signupBtn          = document.getElementById('signupBtn');
const signupBtnText      = document.getElementById('signupBtnText');
const signupSpinner      = document.getElementById('signupSpinner');

signupBtnText.dataset.default = 'Create Account';

// Real-time validation
signupNameInput.addEventListener('input', () => {
  setFieldError(signupNameInput, signupNameErr,
    signupNameInput.value.trim().length < 2 && signupNameInput.value ? 'Name is too short.' : '');
});
signupEmailInput.addEventListener('input', () => {
  clearAlert(signupAlert);
  setFieldError(signupEmailInput, signupEmailErr,
    signupEmailInput.value && !isValidEmail(signupEmailInput.value) ? 'Enter a valid email address.' : '');
});
signupPassInput.addEventListener('input', () => {
  setFieldError(signupPassInput, signupPassErr,
    signupPassInput.value && signupPassInput.value.length < 6 ? 'Password must be at least 6 characters.' : '');
  if (signupConfirmInput.value) {
    setFieldError(signupConfirmInput, signupConfirmErr,
      signupConfirmInput.value !== signupPassInput.value ? 'Passwords do not match.' : '');
  }
});
signupConfirmInput.addEventListener('input', () => {
  setFieldError(signupConfirmInput, signupConfirmErr,
    signupConfirmInput.value && signupConfirmInput.value !== signupPassInput.value ? 'Passwords do not match.' : '');
});

// Password toggles
document.getElementById('toggleSignupPw').addEventListener('click', () => {
  togglePasswordVisibility(signupPassInput, document.getElementById('signupEyeIcon'));
});
document.getElementById('toggleConfirmPw').addEventListener('click', () => {
  togglePasswordVisibility(signupConfirmInput, document.getElementById('confirmEyeIcon'));
});

// Submit
signupBtn.addEventListener('click', () => {
  clearAlert(signupAlert);
  const name    = signupNameInput.value.trim();
  const email   = signupEmailInput.value.trim();
  const pass    = signupPassInput.value;
  const confirm = signupConfirmInput.value;
  let ok = true;

  if (!name || name.length < 2) {
    setFieldError(signupNameInput, signupNameErr, 'Please enter your full name.'); ok = false;
  } else setFieldError(signupNameInput, signupNameErr, '');

  if (!email) {
    setFieldError(signupEmailInput, signupEmailErr, 'Email is required.'); ok = false;
  } else if (!isValidEmail(email)) {
    setFieldError(signupEmailInput, signupEmailErr, 'Enter a valid email address.'); ok = false;
  } else setFieldError(signupEmailInput, signupEmailErr, '');

  if (!pass) {
    setFieldError(signupPassInput, signupPassErr, 'Password is required.'); ok = false;
  } else if (pass.length < 6) {
    setFieldError(signupPassInput, signupPassErr, 'Password must be at least 6 characters.'); ok = false;
  } else setFieldError(signupPassInput, signupPassErr, '');

  if (!confirm) {
    setFieldError(signupConfirmInput, signupConfirmErr, 'Please confirm your password.'); ok = false;
  } else if (confirm !== pass) {
    setFieldError(signupConfirmInput, signupConfirmErr, 'Passwords do not match.'); ok = false;
  } else setFieldError(signupConfirmInput, signupConfirmErr, '');

  if (!ok) return;

  setLoading(signupBtn, signupBtnText, signupSpinner, true, 'Creating account…');

  setTimeout(() => {
    const users = getUsers();

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setLoading(signupBtn, signupBtnText, signupSpinner, false, '');
      showAlert(signupAlert, 'An account with this email already exists. Please log in.', 'error');
      shakeCard(signupCard);
      return;
    }

    const newUser = { name, email, password: pass };
    users.push(newUser);
    saveUsers(users);

    saveSession(newUser);
    showAlert(signupAlert, `Account created! Welcome, ${name}! Redirecting…`, 'success');
    setTimeout(() => { window.location.href = HOME_PAGE; }, 1200);
  }, 900);
});

// Enter key
[signupNameInput, signupEmailInput, signupPassInput, signupConfirmInput].forEach(inp => {
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') signupBtn.click(); });
});