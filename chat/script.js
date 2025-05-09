document.addEventListener('DOMContentLoaded', () => {
  const chatIcon = document.getElementById('chat-icon');
  const chatBox = document.getElementById('chatbox');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const notificationDot = document.getElementById('notification-dot');

  let responses = {};
  const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');


  // ✅ Se è una nuova sessione (nuova scheda), cancella messaggi
  if (!sessionStorage.getItem('chatSessionActive')) {
    localStorage.removeItem('chatMessages');
    sessionStorage.setItem('chatSessionActive', 'true');
  }

  // 🔁 Controllo se è la prima volta che apro la chat in questa sessione
  let firstOpen = sessionStorage.getItem('chatOpened') === null;

  // --- Funzioni ---

  function addMessage(sender, text) {
    const message = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    message.classList.add('message', sender.toLowerCase());
    message.innerHTML = `<strong>${sender}:</strong> ${text} <span class="timestamp">${timestamp}</span>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // ✅ Salva nel localStorage
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    savedMessages.push({ sender, text });
    localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
  }

  function sendMessage() {
    const inputText = userInput.value.trim().toLowerCase();
    if (!inputText) return;

    addMessage('Tu', inputText);
    const reply = getReply(inputText);

    setTimeout(() => addMessage('Assistente', reply), inputText !== responses.messaggio_iniziale ? 1000 : 0);
    userInput.value = '';
  }

  function levenshtein(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  function getReply(input) {
    let bestMatch = { score: Infinity, key: null };

    Object.keys(responses).forEach(key => {
      const distance = levenshtein(input.toLowerCase(), key.toLowerCase());
      if (distance < bestMatch.score) {
        bestMatch.score = distance;
        bestMatch.key = key;
      }
    });

    if (bestMatch.score <= 3) {
      return responses[bestMatch.key];
    }

    return "Non ho capito. Puoi ripetere?";
  }

  function toggleChatBox() {
    chatBox.classList.toggle('hidden');
    chatBox.classList.toggle('show');

    if (!chatBox.classList.contains('hidden')) {
      notificationDot.style.display = 'none';

      if (firstOpen && responses.messaggio_iniziale) {
        addMessage('Assistente', responses.messaggio_iniziale);
        firstOpen = false;
        sessionStorage.setItem('chatOpened', 'true');
      }

      userInput.focus();
    }
  }

  // --- Eventi ---

  chatIcon.addEventListener('click', toggleChatBox);
  sendBtn.addEventListener('click', sendMessage);

  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && !chatBox.classList.contains('hidden')) {
      toggleChatBox();
    }
  });

  document.addEventListener('click', (e) => {
    if (!chatBox.contains(e.target) && !chatIcon.contains(e.target)) {
      if (!chatBox.classList.contains('hidden')) {
        toggleChatBox();
      }
    }
  });

  // --- Carica messaggi salvati (se ancora presenti) ---
  try {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    if (Array.isArray(savedMessages)) {
      savedMessages.forEach(message => {
        addMessage(message.sender, message.text);
      });
    }
  } catch (e) {
    console.error("Errore nel caricamento dei messaggi salvati:", e);
    localStorage.removeItem('chatMessages');
  }

  // --- Carica risposte solo su index ---
  if (isIndexPage) {
    fetch("chat/responses.json")
      .then(response => response.json())
      .then(data => {
        responses = data;

        if (firstOpen && responses.messaggio_iniziale) {
          setTimeout(() => {
            notificationDot.style.display = 'block';
          }, 2000);
        } else {
          notificationDot.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Errore nel caricare le risposte:', error);
        responses = {};
      });
  }
});
