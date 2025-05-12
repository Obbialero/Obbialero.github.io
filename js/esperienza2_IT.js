AOS.init();

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !expanded);
});

document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', false);
  });
});

document.querySelectorAll('header nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    const offset = 80; // Altezza della navbar (puoi modificarla)
    const topPosition = target.offsetTop - offset;

    window.scrollTo({
      top: topPosition,
      behavior: 'smooth'
    });
  });
});

// Traduzioni
function loadTranslations(lang) {
  const translationsUrl = lang === 'en' ? 'traduzioni/en.json' : 'traduzioni/it.json';
  fetch(translationsUrl)
    .then(response => response.json())
    .then(translations => {
      document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        if (translations[key]) {
          el.textContent = translations[key];
        }
      });

      // 🔽 Nuovo blocco per tradurre le descrizioni
      document.querySelectorAll("[data-description-key]").forEach(el => {
        const key = el.getAttribute("data-description-key");
        if (translations[key]) {
          el.setAttribute("data-description", translations[key]);
        }
      });
    })
    .catch(error => console.error("Errore nel caricamento delle traduzioni:", error));
}

document.getElementById("languageSelect").addEventListener("change", function () {
  const lang = this.value;
  loadTranslations(lang);
});
loadTranslations('it');