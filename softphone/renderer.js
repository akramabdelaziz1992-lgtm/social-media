const { ipcRenderer } = require('electron');
const io = require('socket.io-client');

let socket;
let currentCall = null;
let callTimer = null;
let callStartTime = null;
let isMuted = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  loadContacts();
  loadCallHistory();
  setupEventListeners();
  connectToServer();
});

// Navigation
function setupEventListeners() {
  // Navigation buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) {
        switchPage(page);
      }
    });
  });

  // Dialpad
  document.querySelectorAll('.dial-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.dataset.digit;
      addDigit(digit);
    });
  });

  // Call button
  document.getElementById('call-btn').addEventListener('click', makeCall);

  // Call dialog actions
  document.getElementById('mute-btn').addEventListener('click', toggleMute);
  document.getElementById('end-call-btn').addEventListener('click', endCall);
  document.getElementById('keypad-btn').addEventListener('click', toggleKeypad);

  // Settings
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

  // Contacts
  document.getElementById('add-contact-btn').addEventListener('click', addContact);
  document.getElementById('contact-search').addEventListener('input', searchContacts);

  // History
  document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('call-dialog').classList.contains('hidden')) {
        endCall();
      }
    }
  });
}

function switchPage(pageName) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageName) {
      btn.classList.add('active');
    }
  });

  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageName}-page`).classList.add('active');
}

// Dialpad Functions
function addDigit(digit) {
  const input = document.getElementById('phone-number');
  input.value += digit;
}

function makeCall() {
  const phoneNumber = document.getElementById('phone-number').value;
  
  if (!phoneNumber) {
    alert('الرجاء إدخال رقم الهاتف');
    return;
  }

  // Show call dialog
  document.getElementById('call-dialog').classList.remove('hidden');
  document.getElementById('caller-name').textContent = 'اتصال جارٍ...';
  document.getElementById('caller-number').textContent = phoneNumber;
  document.getElementById('call-timer').textContent = '00:00';

  // Simulate call connection
  setTimeout(() => {
    document.getElementById('caller-name').textContent = phoneNumber;
    startCallTimer();
    
    // Add to call history
    addCallToHistory({
      number: phoneNumber,
      type: 'outgoing',
      duration: 0,
      timestamp: new Date().toISOString()
    });

    // Send call event to server
    if (socket && socket.connected) {
      socket.emit('call-started', {
        to: phoneNumber,
        from: 'Softphone',
        timestamp: new Date().toISOString()
      });
    }
  }, 2000);

  currentCall = {
    number: phoneNumber,
    startTime: Date.now()
  };
}

function startCallTimer() {
  callStartTime = Date.now();
  callTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('call-timer').textContent = `${minutes}:${seconds}`;
  }, 1000);
}

async function endCall() {
  if (callTimer) {
    clearInterval(callTimer);
    callTimer = null;
  }

  if (currentCall) {
    const duration = Math.floor((Date.now() - currentCall.startTime) / 1000);
    
    // Update call history with duration
    updateLastCallDuration(duration);

    // Send call ended event to websocket
    if (socket && socket.connected) {
      socket.emit('call-ended', {
        number: currentCall.number,
        callSid: currentCall.callSid,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update call status in backend (if call was successfully created)
    if (currentCall.callSid) {
      try {
        const settings = await ipcRenderer.invoke('get-settings');
        const serverUrl = settings.serverUrl || 'http://localhost:4000';
        
        await fetch(`${serverUrl}/api/calls/webhook/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            CallSid: currentCall.callSid,
            CallStatus: 'completed',
            CallDuration: duration.toString()
          }),
        });
      } catch (error) {
        console.error('❌ خطأ في تحديث حالة المكالمة:', error);
      }
    }
  }

  document.getElementById('call-dialog').classList.add('hidden');
  document.getElementById('phone-number').value = '';
  currentCall = null;
  isMuted = false;
  
  // Reset mute button
  document.getElementById('mute-btn').style.background = '#f1f5f9';
  document.getElementById('mute-btn').style.color = '#64748b';
}

function toggleMute() {
  isMuted = !isMuted;
  const muteBtn = document.getElementById('mute-btn');
  
  if (isMuted) {
    muteBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    muteBtn.style.color = 'white';
  } else {
    muteBtn.style.background = '#f1f5f9';
    muteBtn.style.color = '#64748b';
  }
}

function toggleKeypad() {
  switchPage('dialpad');
}

// Contacts Functions
async function loadContacts() {
  const contacts = await ipcRenderer.invoke('get-contacts');
  renderContacts(contacts);
}

function renderContacts(contacts) {
  const contactsList = document.getElementById('contacts-list');
  
  if (contacts.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM8.715 8c1.151 0 2 .849 2 2s-.849 2-2 2-2-.849-2-2 .848-2 2-2zm3.715 8H5v-.465c0-1.373 1.676-2.785 3.715-2.785s3.715 1.412 3.715 2.785V16zM19 15h-4v-2h4v2zm0-4h-5V9h5v2z"/>
        </svg>
        <p>لا توجد جهات اتصال</p>
        <button class="add-first-btn" onclick="addContact()">إضافة جهة اتصال</button>
      </div>
    `;
    return;
  }

  contactsList.innerHTML = contacts.map(contact => `
    <div class="contact-item">
      <div class="contact-avatar">${contact.name[0].toUpperCase()}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-phone">${contact.phone}</div>
      </div>
      <div class="contact-actions">
        <button class="action-btn call" onclick="callContact('${contact.phone}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
            <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443c-.16-.139-.36-.22-.573-.22h-.002a.849.849 0 0 0-.588.227l-1.818 1.658c-3.41-1.294-5.294-3.23-6.295-6.295l1.658-1.818c.155-.155.234-.361.227-.588a.85.85 0 0 0-.22-.573L6.777 3.8a.85.85 0 0 0-.573-.22c-.228 0-.429.083-.588.227L3.9 5.523c-.39.39-.608.919-.608 1.489 0 .12.008.241.025.363C3.836 9.704 5.226 13.696 8.273 16.743c3.047 3.047 7.039 4.437 9.368 4.956.122.017.243.025.363.025.57 0 1.099-.218 1.489-.608l1.716-1.716a.846.846 0 0 0 .227-.588c0-.228-.083-.429-.227-.573l-2.034-2.034z"/>
          </svg>
        </button>
        <button class="action-btn" onclick="editContact('${contact.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.414.586L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6z"/>
          </svg>
        </button>
        <button class="action-btn" onclick="deleteContact('${contact.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 7H5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7H6zm4 12H8v-9h2v9zm6 0h-2v-9h2v9zm.618-15L15 2H9L7.382 4H3v2h18V4z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function addContact() {
  const name = prompt('اسم جهة الاتصال:');
  if (!name) return;
  
  const phone = prompt('رقم الهاتف:');
  if (!phone) return;

  const contact = {
    id: Date.now().toString(),
    name: name,
    phone: phone
  };

  ipcRenderer.invoke('get-contacts').then(contacts => {
    contacts.push(contact);
    ipcRenderer.invoke('save-contacts', contacts).then(() => {
      loadContacts();
    });
  });
}

function callContact(phone) {
  document.getElementById('phone-number').value = phone;
  switchPage('dialpad');
  setTimeout(() => makeCall(), 500);
}

function editContact(id) {
  // TODO: Implement edit contact
  alert('قريباً: تحرير جهة الاتصال');
}

function deleteContact(id) {
  if (confirm('هل تريد حذف جهة الاتصال؟')) {
    ipcRenderer.invoke('get-contacts').then(contacts => {
      const filtered = contacts.filter(c => c.id !== id);
      ipcRenderer.invoke('save-contacts', filtered).then(() => {
        loadContacts();
      });
    });
  }
}

function searchContacts(e) {
  const query = e.target.value.toLowerCase();
  ipcRenderer.invoke('get-contacts').then(contacts => {
    const filtered = contacts.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
    renderContacts(filtered);
  });
}

// Call History Functions
async function loadCallHistory() {
  const history = await ipcRenderer.invoke('get-call-history');
  renderCallHistory(history);
}

function renderCallHistory(history) {
  const historyList = document.getElementById('history-list');
  
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
          <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
        </svg>
        <p>لا يوجد سجل مكالمات</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = history.map(call => {
    const duration = formatDuration(call.duration);
    const time = formatTime(call.timestamp);
    const iconClass = call.type === 'incoming' ? 'incoming' : call.type === 'outgoing' ? 'outgoing' : 'missed';
    
    return `
      <div class="history-item">
        <div class="history-icon ${iconClass}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
            <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443c-.16-.139-.36-.22-.573-.22h-.002a.849.849 0 0 0-.588.227l-1.818 1.658c-3.41-1.294-5.294-3.23-6.295-6.295l1.658-1.818c.155-.155.234-.361.227-.588a.85.85 0 0 0-.22-.573L6.777 3.8a.85.85 0 0 0-.573-.22c-.228 0-.429.083-.588.227L3.9 5.523c-.39.39-.608.919-.608 1.489 0 .12.008.241.025.363C3.836 9.704 5.226 13.696 8.273 16.743c3.047 3.047 7.039 4.437 9.368 4.956.122.017.243.025.363.025.57 0 1.099-.218 1.489-.608l1.716-1.716a.846.846 0 0 0 .227-.588c0-.228-.083-.429-.227-.573l-2.034-2.034z"/>
          </svg>
        </div>
        <div class="history-info">
          <div class="history-number">${call.number}</div>
          <div class="history-time">${time} • ${duration}</div>
        </div>
        <div class="history-actions">
          <button class="action-btn call" onclick="callContact('${call.number}')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
              <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443c-.16-.139-.36-.22-.573-.22h-.002a.849.849 0 0 0-.588.227l-1.818 1.658c-3.41-1.294-5.294-3.23-6.295-6.295l1.658-1.818c.155-.155.234-.361.227-.588a.85.85 0 0 0-.22-.573L6.777 3.8a.85.85 0 0 0-.573-.22c-.228 0-.429.083-.588.227L3.9 5.523c-.39.39-.608.919-.608 1.489 0 .12.008.241.025.363C3.836 9.704 5.226 13.696 8.273 16.743c3.047 3.047 7.039 4.437 9.368 4.956.122.017.243.025.363.025.57 0 1.099-.218 1.489-.608l1.716-1.716a.846.846 0 0 0 .227-.588c0-.228-.083-.429-.227-.573l-2.034-2.034z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addCallToHistory(call) {
  ipcRenderer.invoke('get-call-history').then(history => {
    history.unshift(call);
    // Keep only last 100 calls
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    ipcRenderer.invoke('save-call-history', history);
  });
}

function updateLastCallDuration(duration) {
  ipcRenderer.invoke('get-call-history').then(history => {
    if (history.length > 0) {
      history[0].duration = duration;
      ipcRenderer.invoke('save-call-history', history).then(() => {
        loadCallHistory();
      });
    }
  });
}

function clearHistory() {
  if (confirm('هل تريد حذف سجل المكالمات؟')) {
    ipcRenderer.invoke('save-call-history', []).then(() => {
      loadCallHistory();
    });
  }
}

function formatDuration(seconds) {
  if (seconds === 0) return 'لم يتم الرد';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'أمس';
  } else if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  } else {
    return date.toLocaleDateString('ar-EG');
  }
}

// Settings Functions
async function loadSettings() {
  const settings = await ipcRenderer.invoke('get-settings');
  document.getElementById('server-url').value = settings.serverUrl;
  document.getElementById('auto-connect').checked = settings.autoConnect;
  document.getElementById('notifications').checked = settings.notifications;
}

async function saveSettings() {
  const settings = {
    serverUrl: document.getElementById('server-url').value,
    autoConnect: document.getElementById('auto-connect').checked,
    notifications: document.getElementById('notifications').checked
  };

  await ipcRenderer.invoke('save-settings', settings);
  alert('تم حفظ الإعدادات بنجاح');
  
  // Reconnect to server with new URL
  if (socket) {
    socket.disconnect();
  }
  connectToServer();
}

// Server Connection
async function connectToServer() {
  const settings = await ipcRenderer.invoke('get-settings');
  
  if (!settings.autoConnect) return;

  try {
    socket = io(settings.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ متصل بالخادم');
      updateConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ انقطع الاتصال بالخادم');
      updateConnectionStatus('disconnected');
    });

    socket.on('incoming-call', (data) => {
      if (settings.notifications) {
        new Notification('مكالمة واردة', {
          body: `مكالمة من ${data.from}`,
          icon: 'assets/icon.png'
        });
      }
      
      // Add to call history
      addCallToHistory({
        number: data.from,
        type: 'incoming',
        duration: 0,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('فشل الاتصال بالخادم:', error);
    updateConnectionStatus('disconnected');
  }
}

function updateConnectionStatus(status) {
  const statusBadge = document.querySelector('.status-badge');
  const statusIndicators = document.querySelectorAll('.status-indicator, .status-dot');
  
  if (status === 'connected') {
    if (statusBadge) {
      statusBadge.textContent = 'متصل';
      statusBadge.className = 'status-badge connected';
    }
    statusIndicators.forEach(indicator => {
      indicator.classList.remove('offline');
      indicator.classList.add('online');
    });
  } else {
    if (statusBadge) {
      statusBadge.textContent = 'غير متصل';
      statusBadge.className = 'status-badge disconnected';
    }
    statusIndicators.forEach(indicator => {
      indicator.classList.remove('online');
      indicator.classList.add('offline');
    });
  }
}

// Make functions globally accessible
window.addContact = addContact;
window.callContact = callContact;
window.editContact = editContact;
window.deleteContact = deleteContact;
