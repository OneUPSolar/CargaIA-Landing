/* ─── Maxia Conversational Form · forms.js ─── */
import './forms.css';

const WORKER_BASE = 'https://cargaia-crm.hi-7e4.workers.dev';
const LS_KEY = 'maxia_session_id';

// ─── DOM refs ───
const messagesEl   = document.getElementById('messages');
const typingWrap   = document.getElementById('typing-wrap');
const inputBar     = document.getElementById('input-bar');
const msgInput     = document.getElementById('msg-input');
const sendBtn      = document.getElementById('send-btn');
const doneScreen   = document.getElementById('done-screen');
const hudStatus    = document.getElementById('hud-status');
const headerSub    = document.getElementById('header-sub');

// ─── Parse URL params ───
const params = new URLSearchParams(window.location.search);
const ref    = params.get('ref')   || '';
const phone  = params.get('phone') || '';

let sessionId = null;
let isSending = false;

// ─── Utilities ───

function setHud(text) {
  if (hudStatus) hudStatus.textContent = `[${text}]`;
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendBubble(text, role) {
  // role: 'bot' | 'user'
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  if (role === 'bot') {
    const avatar = document.createElement('img');
    avatar.src = '/maxia.png';
    avatar.alt = 'Maxia';
    avatar.className = 'bubble-avatar';
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  // Support simple newlines
  bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  scrollBottom();
  return row;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showTyping() {
  typingWrap.style.display = 'flex';
  scrollBottom();
}

function hideTyping() {
  typingWrap.style.display = 'none';
}

function setInputEnabled(enabled) {
  msgInput.disabled  = !enabled;
  sendBtn.disabled   = !enabled;
  if (enabled) msgInput.focus();
}

function showDone() {
  inputBar.style.display = 'none';
  typingWrap.style.display = 'none';
  doneScreen.style.display = 'flex';
  setHud('COMPLETADO');
  headerSub.textContent = '// ¡Listo! Maxia tiene tus datos.';
}

// ─── API calls ───

async function apiStart() {
  const body = {};
  if (ref)   body.ref   = ref;
  if (phone) body.phone = phone;

  const res  = await fetch(`${WORKER_BASE}/api/forms/start`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`start failed: ${res.status}`);
  return res.json(); // {session_id, message}
}

async function apiSend(message) {
  const res = await fetch(`${WORKER_BASE}/api/forms/message`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(`message failed: ${res.status}`);
  return res.json(); // {message, done?}
}

async function apiResumeSession(id) {
  const res = await fetch(`${WORKER_BASE}/api/forms/session/${id}`);
  if (!res.ok) throw new Error(`session not found: ${res.status}`);
  return res.json(); // transcript or similar
}

// ─── Handle Maxia reply ───

function handleReply(data) {
  hideTyping();
  const text = data.message || data.first_message || '';
  if (text) appendBubble(text, 'bot');
  if (data.done) {
    showDone();
  } else {
    setInputEnabled(true);
  }
  setHud('ACTIVO');
}

// ─── Send message ───

async function sendMessage() {
  if (isSending) return;
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = '';
  appendBubble(text, 'user');
  setInputEnabled(false);
  showTyping();
  isSending = true;
  setHud('PROCESANDO');

  try {
    const data = await apiSend(text);
    handleReply(data);
  } catch (err) {
    hideTyping();
    appendBubble('// Ups, tuve un error de red. Intenta de nuevo.', 'bot');
    setInputEnabled(true);
    setHud('ERROR');
    console.error(err);
  } finally {
    isSending = false;
  }
}

// ─── Event listeners ───

sendBtn.addEventListener('click', sendMessage);

msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ─── Init ───

async function init() {
  setHud('INICIANDO');
  setInputEnabled(false);

  // Check for saved session
  const savedId = localStorage.getItem(LS_KEY);
  if (savedId) {
    try {
      setHud('RESUMIENDO');
      const session = await apiResumeSession(savedId);

      // If session is already done
      if (session.done) {
        sessionId = savedId;
        // Replay transcript
        const messages = session.messages || session.transcript || [];
        messages.forEach(m => {
          const role = m.role === 'user' ? 'user' : 'bot';
          appendBubble(m.content || m.message || '', role);
        });
        showDone();
        return;
      }

      // Resume active session — replay messages then wait for user
      sessionId = savedId;
      const messages = session.messages || session.transcript || [];
      if (messages.length > 0) {
        messages.forEach(m => {
          const role = m.role === 'user' ? 'user' : 'bot';
          appendBubble(m.content || m.message || '', role);
        });
        setInputEnabled(true);
        setHud('ACTIVO');
        return;
      }
      // Fall through to start fresh if no messages
    } catch (err) {
      // Session expired or invalid — start fresh
      localStorage.removeItem(LS_KEY);
      console.warn('Session resume failed, starting fresh:', err);
    }
  }

  // Start new session
  try {
    showTyping();
    const data = await apiStart();
    sessionId = data.session_id;
    localStorage.setItem(LS_KEY, sessionId);
    hideTyping();
    handleReply(data);
  } catch (err) {
    hideTyping();
    appendBubble(
      '// Maxia no está disponible ahorita. Intenta recargando la página, o escríbenos directo a cargaia.com ⚡',
      'bot'
    );
    setHud('ERROR');
    console.error(err);
  }
}

init();
