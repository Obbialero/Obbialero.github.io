// AOS
AOS.init();

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
    })
    .catch(error => console.error("Errore nel caricamento delle traduzioni:", error));
}

document.getElementById("languageSelect").addEventListener("change", function () {
  const lang = this.value;
  loadTranslations(lang);
});
loadTranslations('it');

// Modale certificati
const modal = document.getElementById('certModal');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const modalDownload = document.getElementById('modalDownload');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.cert-image').forEach(img => {
  img.addEventListener('click', () => {
    modalImage.src = img.src;
    modalDescription.textContent = img.dataset.description;

    // Usa il nome del file PNG per ricavare il path PDF
    modalDownload.href = img.src
    .replace('assets/img/attestati/', 'assets/pdf/')
    .replace('.png', '.pdf')
    .replace(/ /g, '_');

    modal.classList.remove('hidden');
  });
});

modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modal.classList.add('hidden');
  }
});

modal.addEventListener('click', (e) => {
  const modalContent = document.querySelector('.bg-gray-900');
  if (!modalContent.contains(e.target)) {
    modal.classList.add('hidden');
  }
});


document.addEventListener('DOMContentLoaded', () => {
  // Carosello progetti
  const track = document.querySelector('.project-carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = document.getElementById('project-prev');
  const nextBtn = document.getElementById('project-next');
  let currentIdx = 0;

  function getStep() {
    const slide = slides[0];
    return slide.getBoundingClientRect().width;
  }

  function updateCarousel() {
    const step = getStep();
    track.style.transform = `translateX(-${currentIdx * step}px)`;
  }

  prevBtn.addEventListener('click', () => {
    currentIdx = Math.max(0, currentIdx - 1);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIdx = Math.min(slides.length - 1, currentIdx + 1);
    updateCarousel();
  });

  updateCarousel();
  
  // Carosello immagini interne
  document.querySelectorAll('.project-slide').forEach(slide => {
    const wrapper = slide.querySelector('.carousel-wrapper');
    const track = wrapper.querySelector('.carousel-track');
    const items = Array.from(track.children);
    const dotsCon = slide.querySelector('.carousel-dots');
    let current = 0, timer;

    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'w-2 h-2 rounded-full mx-1 bg-gray-400 focus:outline-none';
      dot.addEventListener('click', () => goTo(i));
      dotsCon.append(dot);
    });
    const dots = Array.from(dotsCon.children);

    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('bg-white', i === current);
        d.classList.toggle('bg-gray-400', i !== current);
      });
    }

    function next() {
      current = (current + 1) % items.length;
      update();
    }

    function goTo(i) {
      current = i;
      update();
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 3000);
    }

    update();
    timer = setInterval(next, 3000);
  });
});

// Google Maps
function initMap() {
  const vinovo = { lat: 44.94674, lng: 7.63252 };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: vinovo,
    zoom: 15,
    mapTypeId: 'hybrid'
  });
  new google.maps.Marker({ position: vinovo, map: map, title: "Vinovo (TO)" });
}

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

document.getElementById('menu-toggle').addEventListener('click', () => {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
});