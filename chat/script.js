document.addEventListener('DOMContentLoaded', () => {
  const chatIcon = document.getElementById('chat-icon');
  const chatBox = document.getElementById('chatbox');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const notificationDot = document.getElementById('notification-dot');

  // Mappa dei template di risposta, caricata da JSON
  let responses = {};
  // Lista piatta di tutti i sinonimi per il matching
  let synonymList = [];

  const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

  // Se è una nuova sessione (nuova scheda), cancella messaggi precedenti
  if (!sessionStorage.getItem('chatSessionActive')) {
    localStorage.removeItem('chatMessages');
    sessionStorage.setItem('chatSessionActive', 'true');
  }

  // Controllo prima apertura chat in questa sessione
  let firstOpen = sessionStorage.getItem('chatOpened') === null;

  // Aggiunge un messaggio al DOM e lo salva in localStorage
  function addMessage(sender, text) {
    const message = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    message.classList.add('message', sender.toLowerCase());
    message.innerHTML = `<strong>${sender}:</strong> ${text} <span class="timestamp">${timestamp}</span>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    savedMessages.push({ sender, text });
    localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
  }

  // Invia il messaggio dell'utente e poi aggiunge la risposta
  function sendMessage() {
    const inputText = userInput.value.trim().toLowerCase();
    if (!inputText) return;

    addMessage('Tu', inputText);
    const reply = getReply(inputText);

    // Evita delay per il messaggio iniziale, mantiene 1s altrimenti
    const delay = (reply === responses.messaggio_iniziale.response) ? 0 : 1000;
    setTimeout(() => addMessage('Assistente', reply), delay);

    userInput.value = '';
  }

  // Calcola distanza di Levenshtein
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

  // Nuova versione di getReply che itera su tutti i sinonimi
  function getReply(input) {
    const text = input.toLowerCase();
    let best = { score: Infinity, response: null };

    synonymList.forEach(({ synonym, response }) => {
      const dist = levenshtein(text, synonym);
      if (dist < best.score) {
        best = { score: dist, response };
      }
    });

    // Soglia di tolleranza typo
    if (best.score <= 3) {
      return best.response;
    }
    return "Non ho capito. Puoi ripetere?";
  }

  // Mostra/nasconde la chat e manda il messaggio iniziale se è la prima volta
  function toggleChatBox() {
    chatBox.classList.toggle('hidden');
    chatBox.classList.toggle('show');

    if (!chatBox.classList.contains('hidden')) {
      notificationDot.style.display = 'none';

      if (firstOpen && responses.messaggio_iniziale) {
        addMessage('Assistente', responses.messaggio_iniziale.response);
        firstOpen = false;
        sessionStorage.setItem('chatOpened', 'true');
      }

      userInput.focus();
    }
  }

  // Event listeners
  chatIcon.addEventListener('click', toggleChatBox);
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !chatBox.classList.contains('hidden')) {
      toggleChatBox();
    }
  });
  document.addEventListener('click', e => {
    if (!chatBox.contains(e.target) && !chatIcon.contains(e.target)) {
      if (!chatBox.classList.contains('hidden')) {
        toggleChatBox();
      }
    }
  });

  // Carica messaggi salvati (se presenti) all'apertura
  try {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    if (Array.isArray(savedMessages)) {
      savedMessages.forEach(msg => addMessage(msg.sender, msg.text));
    }
  } catch (e) {
    console.error("Errore nel caricamento dei messaggi salvati:", e);
    localStorage.removeItem('chatMessages');
  }

  // Carica il file responses.json e costruisce synonymList
  if (isIndexPage) {
    fetch("chat/responses.json")
      .then(res => res.json())
      .then(data => {
        // data deve essere in questo formato:
        // {
        //   "chi sei": {
        //     "synonyms": [...],
        //     "response": "..."
        //   },
        //   ...
        // }
        responses = data;

        synonymList = [];
        Object.keys(responses).forEach(key => {
          const { synonyms, response } = responses[key];
          // memorizzo la risposta iniziale
          if (key === 'messaggio_iniziale') {
            responses[key].response = response;
          }
          synonyms.forEach(s => {
            synonymList.push({
              synonym: s.toLowerCase(),
              response
            });
          });
        });

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
