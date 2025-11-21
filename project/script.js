// Navigation and scroll functionality
let activeSection = 'tentang';

// table
const getItemsPerPage = () =>
  window.matchMedia('(max-width: 640px)').matches ? 5 : 8;

let currentPage = 1;
let participants = []; // awalnya kosong, nanti diisi dari JSON


// ====== (legacy) gallery images untuk mode lama (grid sederhana)
const galleryImages = [
  { src: 'images/imgprestasi/prestasi-1.png', alt: 'Prestasi 1', title: 'Gambar 1' },
  { src: 'images/imgprestasi/prestasi-2.png', alt: 'Prestasi 2', title: 'Gambar ' },
  { src: 'images/imgprestasi/prestasi-3.png', alt: 'Prestasi 3', title: 'Gambar 3' },
  { src: 'images/imgprestasi/prestasi-1.png', alt: 'Prestasi 4', title: 'Gambar 4' },
  { src: 'images/imgprestasi/prestasi-2.png', alt: 'Prestasi 5', title: 'Gambar 5' },
  { src: 'images/imgprestasi/prestasi-3.png', alt: 'Prestasi 6', title: 'Gambar 6' }
];


// ====== Carousel functionality
let currentSlide = 0;
let isAutoPlay = true;
let autoPlayInterval;

function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const autoplayBtn = document.getElementById('autoplay-btn');
  const pauseIcon = document.getElementById('pause-icon');
  const playIcon = document.getElementById('play-icon');

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  function startAutoPlay() {
    if (isAutoPlay) {
      autoPlayInterval = setInterval(nextSlide, 4000);
    }
  }

  // === THUMBNAIL SUPPORT ===
  const thumbnails = document.querySelectorAll('.thumbnail');

  function updateThumbnailHighlight(index) {
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('border-white', i === index);
      thumb.classList.toggle('opacity-100', i === index);
      thumb.classList.toggle('opacity-50', i !== index);
    });
  }

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      stopAutoPlay();
      currentSlide = index;
      showSlide(currentSlide);
      updateThumbnailHighlight(currentSlide);
      if (isAutoPlay) startAutoPlay();
    });
  });

  const originalShowSlide = showSlide;
  showSlide = function (index) {
    originalShowSlide(index);
    updateThumbnailHighlight(index);
  };

  updateThumbnailHighlight(currentSlide);

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  function toggleAutoPlay() {
    isAutoPlay = !isAutoPlay;
    if (isAutoPlay) {
      pauseIcon.classList.remove('hidden');
      playIcon.classList.add('hidden');
      startAutoPlay();
    } else {
      pauseIcon.classList.add('hidden');
      playIcon.classList.remove('hidden');
      stopAutoPlay();
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      if (isAutoPlay) startAutoPlay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      if (isAutoPlay) startAutoPlay();
    });
  }
  if (autoplayBtn) autoplayBtn.addEventListener('click', toggleAutoPlay);
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoPlay();
      currentSlide = index;
      showSlide(currentSlide);
      if (isAutoPlay) startAutoPlay();
    });
  });

  startAutoPlay();
}


// ====== Participant table functionality
function getPrestasiClass(prestasi) {
  if (prestasi == "1" || prestasi.toLowerCase().includes("juara 1")) {
    return { text: "Gold Medal", style: "background-color:#FAA41A; color:white;" };
  }
  if (prestasi == "2" || prestasi.toLowerCase().includes("juara 2")) {
    return { text: "Silver Medal", style: "background-color:#688FB6; color:white;" };
  }
  if (prestasi == "3" || prestasi.toLowerCase().includes("juara 3")) {
    return { text: "Bronze Medal", style: "background-color:#A0821E; color:white;" };
  }
  return { text: prestasi, style: "background-color:#E5E7EB; color:#374151;" };
}

function renderParticipants(filteredParticipants) {
  const tableBody = document.getElementById('participants-table');
  const noResults = document.getElementById('no-results');
  const paginationContainer = document.getElementById('pagination');

  if (!tableBody || !paginationContainer) return;

  if (filteredParticipants.length === 0) {
  tableBody.innerHTML = '';
  paginationContainer.innerHTML = '';
  const countEl = document.getElementById('table-count');
  if (countEl) countEl.textContent = 'Menampilkan 0 data dari 0 data';
  if (noResults) noResults.classList.remove('hidden');
  return;
  }
  if (noResults) noResults.classList.add('hidden');

  const perPage   = getItemsPerPage();

  const totalPages = Math.ceil(filteredParticipants.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex   = startIndex + perPage;
  const pageItems  = filteredParticipants.slice(startIndex, endIndex);


  // Update "Menampilkan X data dari Y data"
  const countEl = document.getElementById('table-count');
  if (countEl) {
    const shown = pageItems.length;
    const totalFiltered = filteredParticipants.length;
    countEl.textContent = `Menampilkan ${shown} data dari ${totalFiltered} data`;
  }


  tableBody.innerHTML = pageItems.map(participant => {
    const medal = getPrestasiClass(participant.juara);
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${participant.nomor}</td>
        <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${participant.nama}</td>
        <td class="px-4 py-4 text-sm text-gray-900">${participant.kategori}</td>
        <td class="px-4 py-4 text-sm text-gray-900">${participant.tim}</td>
        <td class="px-4 py-4 whitespace-nowrap">
          <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full" style="${medal.style}">
            ${medal.text}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  paginationContainer.innerHTML = "";


  function makeBtn({ html, onClick, isActive = false, isDisabled = false }) {
    const btn = document.createElement("button");
    const base = "w-9 h-9 px-3 rounded-xl text-sm flex items-center justify-center";
    btn.className = [
      base,
      "bg-gray-200 text-gray-700 hover:bg-gray-300",
      isActive ? "active font-semibold" : "",
      isDisabled ? "opacity-50 cursor-not-allowed hover:bg-gray-200" : ""
    ].join(" ").trim();

    btn.innerHTML = html;
    if (!isDisabled) btn.addEventListener("click", onClick);
    paginationContainer.appendChild(btn);
  }

  makeBtn({
    html: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`,
    onClick: () => { currentPage = Math.max(1, currentPage - 1); renderParticipants(filteredParticipants); },
    isDisabled: currentPage === 1
  });

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

  for (let p = startPage; p <= endPage; p++) {
    makeBtn({
      html: `${p}`,
      onClick: () => { currentPage = p; renderParticipants(filteredParticipants); },
      isActive: p === currentPage
    });
  }

  makeBtn({
    html: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`,
    onClick: () => { currentPage = Math.min(totalPages, currentPage + 1); renderParticipants(filteredParticipants); },
    isDisabled: currentPage === totalPages
  });
}

function initParticipantTable() {
  const searchInput = document.getElementById('search-input');
  const clubFilter = document.getElementById('club-filter');
  const categoryFilter = document.getElementById('category-filter');
  if (!searchInput || !clubFilter) return;

  const uniqueClubs = [...new Set(participants.map(p => p.tim).filter(Boolean))].sort();
  clubFilter.innerHTML = `<option value="">Semua Club</option>` +
    uniqueClubs.map(club => `<option value="${club}">${club}</option>`).join("");

  // Kategori
  if (categoryFilter) {
    const uniqueCats = [...new Set(participants.map(p => p.kategori).filter(Boolean))].sort();
    categoryFilter.innerHTML = `<option value="">Pilih Kategori</option>` +
      uniqueCats.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }

  function filterParticipants() {
    const searchTerm = (searchInput.value || "").toLowerCase();
    const selectedClub = clubFilter.value;
    const selectedCat  = categoryFilter ? categoryFilter.value : "";

    const filtered = participants.filter(participant => {
      const matchesSearch = participant.nama.toLowerCase().includes(searchTerm);
      const matchesClub = selectedClub === '' || participant.tim === selectedClub;
      const matchesCat  = selectedCat === '' || participant.kategori === selectedCat;
      return matchesSearch && matchesClub && matchesCat;
    });

    currentPage = 1;
    renderParticipants(filtered);
  }

  searchInput.addEventListener('input', filterParticipants);
  clubFilter.addEventListener('change', filterParticipants);
  categoryFilter?.addEventListener('change', filterParticipants);

  renderParticipants(participants);
}

  function initScrollIndicator() {
    const container = document.querySelector('#prestasi .table-container');
    const indicator = document.querySelector('#prestasi .scroll-indicator-bar');
    if (!container || !indicator) return;

    container.addEventListener('scroll', () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const percent = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
      indicator.style.width = percent + '%';
    });
  }

// Buat marquee infinite tanpa duplikasi manual di HTML
  async function setupInfiniteMarquee(rowEl, { speed = 30, gap = 45, reverse = false } = {}) {
    if (!rowEl) return;

    rowEl.classList.remove('animate-marquee-1','animate-marquee-2','animate-marquee','animate-marquee-mobile');

    // Kumpulkan item asli
    const items = Array.from(rowEl.querySelectorAll('img, a, picture, svg')).map(n => n.cloneNode(true));
    if (items.length === 0) return;

    // Reset isi & struktur
    rowEl.innerHTML = '';
    rowEl.style.overflow = 'hidden';

    const runner = document.createElement('div');
    runner.className = 'mq-runner';

    const track1 = document.createElement('div');
    track1.className = 'mq-track';
    track1.style.setProperty('--mq-gap', gap + 'px');
    items.forEach(n => track1.appendChild(n));

    const track2 = track1.cloneNode(true);

    track1.style.paddingRight = gap + 'px';
    track2.style.paddingRight = gap + 'px';


    runner.appendChild(track1);
    runner.appendChild(track2);
    rowEl.appendChild(runner);

    // Tunggu gambar load biar width akurat
    await Promise.all(Array.from(runner.querySelectorAll('img')).map(img => {
      if (img.complete) return;
      return new Promise(res => { img.addEventListener('load', res, { once:true }); img.addEventListener('error', res, { once:true }); });
    }));

    const containerW = rowEl.getBoundingClientRect().width;
    let t1w = track1.getBoundingClientRect().width;

    if (t1w < containerW) {
      // gandakan isi track1 sampai > container
      const copies = Math.ceil(containerW / t1w) + 1;
      for (let c = 1; c < copies; c++) {
        items.forEach(n => track1.appendChild(n.cloneNode(true)));
      }
      // samakan track2 dengan track1 (seamless)
      track2.innerHTML = track1.innerHTML;

      // ukur ulang
      t1w = track1.getBoundingClientRect().width;
    }

    const distance = track1.getBoundingClientRect().width;
    const durationSec = Math.max(8, distance / Math.max(20, speed));
    runner.style.setProperty('--mq-distance', distance + 'px');
    runner.style.setProperty('--mq-duration', durationSec + 's');

    runner.classList.add('mq-anim-left');
    if (reverse) runner.style.animationDirection = 'reverse';

    if (rowEl.dataset.mqPaused === '1') {
      runner.style.animationPlayState = 'paused';
    }

    if (rowEl.dataset.mqBound !== '1') {
      rowEl.addEventListener('click', () => {
        const paused = rowEl.dataset.mqPaused === '1';       
        rowEl.dataset.mqPaused = paused ? '0' : '1';
        runner.style.animationPlayState = paused ? 'running' : 'paused';
      });
      rowEl.dataset.mqBound = '1';
    }

  // Recalc saat resize
  if (!rowEl._mqResizeBound) {
    rowEl._mqResizeBound = true;
    let t = null, lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (Math.abs(window.innerWidth - lastW) < 20) return;
      lastW = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => setupInfiniteMarquee(rowEl, { speed, gap, reverse }), 200);
    }, { passive: true });
  }
}

function initTeamMarqueeDesktop() {
  const section = document.querySelector('.team-participated');
  if (!section) return;

  const row1 = section.querySelector('.marquee.animate-marquee-1'); // baris 1 (10 logo)
  const row2 = section.querySelector('.marquee.animate-marquee-2'); // baris 2 (10 logo)

  // Desktop = 2 baris jalan berlawanan arah; Mobile digabung (fungsi mobile di bawah)
  const mql = window.matchMedia('(min-width: 768px)');

  async function apply() {
    if (!row1 || !row2) return;


    [row1, row2].forEach(r => {

      const runner = r.querySelector('.mq-runner');
      if (runner) {
        const firstTrack = runner.querySelector('.mq-track');
        if (firstTrack) {
          const originals = Array.from(firstTrack.children).map(n => n.cloneNode(true));
          r.innerHTML = '';
          originals.forEach(n => r.appendChild(n));
        }
      }
      r.classList.remove('is-paused');
    });

    if (mql.matches) {
      // Desktop: jalankan 2 baris terpisah (tanpa duplikat manual)
      await setupInfiniteMarquee(row1, { speed: 30, gap: 70, reverse: false });
      await setupInfiniteMarquee(row2, { speed: 30, gap: 70, reverse: true  });
    } else {
    }
  }

  apply();
  mql.addEventListener('change', apply);
}


function initTeamMarqueeMobile() {
  const section = document.querySelector('.team-participated');
  if (!section) return;

  const row1 = section.querySelector('.marquee.animate-marquee-1');
  const row2 = section.querySelector('.marquee.animate-marquee-2');
  const mobileRow = section.querySelector('#marquee-mobile');
  if (!row1 || !row2 || !mobileRow) return;

  const mql = window.matchMedia('(max-width: 767px)');

  async function buildMobile() {
    // Kumpulkan 20 logo unik (urut sesuai baris 1 lalu baris 2)
    const list = [];
    const seen = new Set();
    [row1, row2].forEach(r => {
      r.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (!seen.has(src)) { seen.add(src); list.push(src); }
      });
    });

    // render 20 logo
    mobileRow.innerHTML = list.map(src => `<img src="${src}" alt="" class="h-12 object-contain" />`).join('');
    

    // loop via JS
    await setupInfiniteMarquee(mobileRow, { speed: 30, gap: 45, reverse: false });
  }

  async function apply() {
    if (mql.matches) {
      // Tampilkan mobile, sembunyikan 2 baris desktop
      row1.classList.add('hidden');
      row2.classList.add('hidden');
      mobileRow.classList.remove('hidden');
      await buildMobile();
    } else {
      // Kembali ke desktop
      mobileRow.classList.add('hidden');
      row1.classList.remove('hidden');
      row2.classList.remove('hidden');
    }
  }

  apply();
  mql.addEventListener('change', apply);
}

function initSponsorMarquee() {
  const row = document.getElementById('sponsor-marquee');
  if (!row) return;

  const seen = new Set();
  const uniques = [];
  row.querySelectorAll('img, a, picture, svg').forEach(n => {
    const key = n.tagName === 'IMG' ? n.getAttribute('src') : n.outerHTML;
    if (!seen.has(key)) { seen.add(key); uniques.push(n.cloneNode(true)); }
  });
  row.innerHTML = '';
  uniques.forEach(n => row.appendChild(n));

  // === atur gap berdasarkan breakpoint ===
  const mql = window.matchMedia('(min-width: 1024px)');

  function apply() {
    const GAP_DESKTOP = 80;
    const GAP_MOBILE  = 32; 
    const gap = mql.matches ? GAP_DESKTOP : GAP_MOBILE;
    setupInfiniteMarquee(row, { speed: 30, gap, reverse: false });
  }

  apply();
  mql.addEventListener('change', apply);
}

  function initMarqueePause() {
  document.querySelectorAll('.marquee').forEach(mq => {
    mq.addEventListener('click', () => {
      mq.classList.toggle('is-paused');
    });
  });
}


// ====== GALERI PER-EVENT: 1 slide = 8 foto (2x4)
const galleryEvents = [
  {
    year: 2023,
    images: [
      "images/galeri/event2023/foto1.png","images/galeri/event2023/foto2.png",
      "images/galeri/event2023/foto3.png","images/galeri/event2023/foto4.png",
      "images/galeri/event2023/foto5.png","images/galeri/event2023/foto6.png",
      "images/galeri/event2023/foto7.png","images/galeri/event2023/foto8.png"
    ]
  },
  {
    year: 2024,
    images: [
      "images/galeri/event2024/foto1.png","images/galeri/event2024/foto2.png",
      "images/galeri/event2024/foto3.png","images/galeri/event2024/foto4.png",
      "images/galeri/event2024/foto5.png","images/galeri/event2024/foto6.png",
      "images/galeri/event2024/foto7.png","images/galeri/event2024/foto8.png"
    ]
  },
  {
    year: 2025,
    images: [
      "images/galeri/event2025/foto1.png","images/galeri/event2025/foto2.png",
      "images/galeri/event2025/foto3.png","images/galeri/event2025/foto4.png",
      "images/galeri/event2025/foto5.png","images/galeri/event2025/foto6.png",
      "images/galeri/event2025/foto7.png","images/galeri/event2025/foto8.png"
    ]
  },
];

let gIndex = 0;

// ====== GALERI PER-EVENT: 1 slide = 8 foto (2x4) — mobile dibatasi 6
function initGallery() {
  const gridPerEvent = document.getElementById('gallery-slide');
  if (gridPerEvent) {
    const yearEl = document.getElementById('gallery-event-year');
    const prev   = document.getElementById('gallery-prev');
    const next   = document.getElementById('gallery-next');
    const prevM  = document.getElementById('gallery-prev-m');
    const nextM  = document.getElementById('gallery-next-m');

    // ==== Modal preview untuk galeri (per-event) ====
    const modal      = document.getElementById('gallery-modal');
    const modalImg   = document.getElementById('gallery-modal-img');
    const modalClose = document.getElementById('gallery-close');
    const backdrop   = modal ? modal.querySelector('.modal-backdrop') : null;

    // Tutup saat klik di overlay / area kosong
    modal.addEventListener('click', (e) => {
      const clickedOnImage = e.target.closest('#gallery-modal-img');
      const clickedOnClose = e.target.closest('#gallery-close');
      if (!clickedOnImage && !clickedOnClose) {
        closePreview();
      }
    });

    function openPreview(src){
      if (!modal || !modalImg) return;
      modalImg.src = src;
      document.body.classList.add('modal-open');
      modal.classList.remove('hidden');
      void modal.getBoundingClientRect();
      modal.classList.add('show');
    }

    function closePreview(){
      if (!modal || !modalImg) return;
      modal.classList.remove('show');
      const finish = () => {
        modal.classList.add('hidden');
        modal.removeEventListener('transitionend', finish);
        document.body.classList.remove('modal-open');
      };
      modal.addEventListener('transitionend', finish, { once: true });
    }

      // Delegasi klik
      gridPerEvent.addEventListener('click', (e) => {
        const img = e.target && e.target.tagName === 'IMG' ? e.target : e.target.closest('img');
        if (!img) return;
        const src = img.dataset.full || img.src;  
        openPreview(src);
      });


      modalClose?.addEventListener('click', closePreview);
      backdrop?.addEventListener('click', closePreview);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePreview(); });

      // helper breakpoint
      const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

      function renderGallery() {
        const data = galleryEvents[gIndex];
        const count = isMobile() ? 6 : data.images.length; // <= mobile 6 foto, desktop 8
        const imgs  = data.images.slice(0, count);

        gridPerEvent.classList.add("opacity-0");
        setTimeout(() => {
          gridPerEvent.innerHTML = imgs.map(src => `
            <figure class="relative overflow-hidden rounded-xl">
              <img src="${src}" alt="" class="w-full h-40 md:h-48 lg:h-56 object-cover
                  shadow-[0_6px_18px_rgba(0,0,0,.25)] hover:scale-[1.02] transition-transform">
            </figure>
          `).join("");
          if (yearEl) yearEl.textContent = data.year;
          gridPerEvent.classList.remove("opacity-0");
        }, 120);
      }

    function nextGallery() { gIndex = (gIndex + 1) % galleryEvents.length; renderGallery(); }
    function prevGallery() { gIndex = (gIndex - 1 + galleryEvents.length) % galleryEvents.length; renderGallery(); }

    prev?.addEventListener('click', prevGallery);
    next?.addEventListener('click', nextGallery);
    prevM?.addEventListener('click', prevGallery);
    nextM?.addEventListener('click', nextGallery);

    // re-render kalau melewati breakpoint (portrait <-> landscape, resize, dll)
    let lastIsMobile = isMobile();
    window.addEventListener('resize', () => {
      const now = isMobile();
      if (now !== lastIsMobile) {
        lastIsMobile = now;
        renderGallery();
      }
    });

    renderGallery();
    return;
  }

  // ====== fallback ke mode lama (grid + modal) ======
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  const modal = document.getElementById('gallery-modal');
  const modalImage = document.getElementById('modal-image');
  const closeModal = document.getElementById('close-modal');

  galleryGrid.innerHTML = galleryImages.map((image) => `
    <div class="gallery-item group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" data-image="${image.src}" data-title="${image.title}">
      <div class="aspect-w-4 aspect-h-3 overflow-hidden">
        <img src="${image.src}" alt="${image.alt}" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div class="gallery-overlay">
        <div class="gallery-overlay-content">
          <svg class="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-sm font-medium px-4">${image.title}</p>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const imageSrc = item.dataset.image;
      if (!modal || !modalImage) return;
      modalImage.src = imageSrc;
      modal.classList.remove('hidden');
    });
  });

  if (closeModal && modal) {
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }
}


// ====== Navigation functionality
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerHeight = 64;
    const offsetTop = element.offsetTop - headerHeight;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }
}

function updateActiveNavigation() {
  const sections = ['tentang', 'prestasi', 'galeri', 'kontak'];
  const scrollPosition = window.scrollY + 100;

  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const offsetTop = element.offsetTop;
      const offsetHeight = element.offsetHeight;
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection = section;
        break;
      }
    }
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const section = btn.dataset.section;
    if (section === activeSection) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// ====== HERO slider (prev/next + auto-play + indicators)
function initHeroSlider(){
  const root = document.getElementById('hero-slider');
  if (!root) return;

  const slides = root.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;

  // build indicators dynamically sesuai jumlah slide
  const indicatorsWrap = document.getElementById('hero-indicators');
  if (indicatorsWrap) {
    indicatorsWrap.innerHTML = Array.from({ length: slides.length })
      .map((_, i) => `<span class="hero-indicator${i === 0 ? ' active' : ''}"></span>`)
      .join('');
  }

  let indicators = root.querySelectorAll('.hero-indicator');

  const prev = document.getElementById('hero-prev');
  const next = document.getElementById('hero-next');

  // === Gestur mobile: tap = next, swipe kiri/kanan = next/prev
  let startX = 0, startY = 0;

  function goFallback(dir){
    const dots = root.querySelectorAll('.hero-indicator');
    let current = [...slides].findIndex(s => s.classList.contains('active'));
    current = current < 0 ? 0 : current;
    const nextIdx = (current + dir + slides.length) % slides.length;
    slides.forEach((s,i)=> s.classList.toggle('active', i === nextIdx));
    dots.forEach((d,i)=> d.classList.toggle('active',  i === nextIdx));
  }

  function safePrev(){ (document.getElementById('hero-prev')?.click?.()) || goFallback(-1); }
  function safeNext(){ (document.getElementById('hero-next')?.click?.()) || goFallback(+1); }

  root.addEventListener('touchstart', (e)=>{
    const t = e.changedTouches[0];
    startX = t.clientX; startY = t.clientY;
  }, {passive:true});

  root.addEventListener('touchend', (e)=>{
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // abaikan jika gerak vertikal dominan
    if (Math.abs(dy) > Math.abs(dx)) return;

    // tap kecil -> next
    if (Math.abs(dx) < 12){ safeNext(); return; }

    // swipe
    if (dx < -40) safeNext();     // geser kiri -> next
    else if (dx > 40) safePrev(); // geser kanan -> prev
  }, {passive:true});

  // === Auto-play & kontrol utama
  let idx = 0;
  let timer = null;
  const DURATION = 5000;

  function show(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, si)=> s.classList.toggle('active', si === idx));
    indicators.forEach((d, di)=> d.classList.toggle('active', di === idx));
  }

  function step(n){ show(idx + n); }
  function start(){ stop(); timer = setInterval(()=>step(1), DURATION); }
  function stop(){ if (timer) clearInterval(timer); }

  prev?.addEventListener('click', ()=>{ stop(); step(-1); start(); });
  next?.addEventListener('click', ()=>{ stop(); step(1); start(); });

  indicators.forEach((dot, i)=> dot.addEventListener('click', ()=>{ stop(); show(i); start(); }));

  // pause saat hover (desktop)
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  show(0);
  start();
}

document.addEventListener('DOMContentLoaded', function () {
    initHeroSlider();
    
    initSponsorMarquee(); 
  // Ambil data JSON dari Google Sheet
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxUm4W_gzJJH6ln7JTK0oFVymycSW9zQ89yXCL895W9USxzEXpXwNvK4HUtR64dM-G0U2W3Shye3sY/pub?gid=159638144&single=true&output=csv";

  fetch(sheetUrl)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").map(r => r.split(","));
      const headers = rows[0].map(h => h.trim().toLowerCase());

      participants = rows.slice(1).map((r, idx) => {
        const obj = headers.reduce((acc, h, i) => { acc[h] = r[i] ? r[i].trim() : ""; return acc; }, {});
        return {
          nomor: idx + 1,
          nama: obj["nama"] || obj["nama peserta"] || "-",
          kategori: obj["kategori"] || "-",
          kelas: obj["kelas"] || obj["kelas pertandingan"] || "-",
          tim: obj["team"] || obj["tim"] || "-",
          juara: obj["juara"] || ""
        };
      });
      
      initTeamMarqueeDesktop(); 
      initTeamMarqueeMobile();
      initCarousel();
      initParticipantTable();
      initGallery();
      initTimelineAnimation();
      initScrollIndicator();

      window.addEventListener("scroll", updateActiveNavigation);
      updateActiveNavigation();
    })
    .catch(err => console.error("Gagal ambil data:", err));
});

    function layoutTimelineConnectors() {
      const section = document.getElementById('timeline');
      if (!section) return;

      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const items = Array.from(section.querySelectorAll('.timeline-item'));

      items.forEach((item, i) => {
        const conn = item.querySelector('.timeline-connector');
        if (!conn) return;

        if (isDesktop) {
      // DESKTOP (horizontal)
      if (i === items.length - 1) { conn.style.width = '0px'; return; }
      const a = item.querySelector('.tl-anchor');
      const nextA = items[i + 1]?.querySelector('.tl-anchor');
      if (!a || !nextA) return;

      const aRect = a.getBoundingClientRect();
      const bRect = nextA.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;

      const aCenterX = aRect.left + scrollX + aRect.width / 2;
      const bCenterX = bRect.left + scrollX + bRect.width / 2;
      const itemLeftX = itemRect.left + scrollX;

      const PADDING = 10;
      const left = aCenterX - itemLeftX + PADDING * 4;
      const width = Math.max(0, (bCenterX - aCenterX) - PADDING * 8);

      conn.style.top = '50%';
      conn.style.left = `${left}px`;
      conn.style.height = '5px';
      conn.style.width = `${width}px`;
    } else {
      // MOBILE (vertical) 
      if (i === items.length - 1) { conn.style.height = '0px'; return; }

      const next = items[i + 1];
      if (!next) return;

      const itemRect = item.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      const itemBottom = itemRect.bottom + scrollY;
      const nextTop = nextRect.top + scrollY;
      const h = Math.max(0, nextTop - itemBottom + 32); 

      conn.style.left = '';  
      conn.style.width = ''; 
      conn.style.top = '3.5rem';
      conn.style.height = `${h}px`;
    }
  });
}


function initTimelineAnimation() {
  const section = document.getElementById('timeline');
  if (!section) return;

  // tetapkan delay bertahap antar konektor
  const connectors = section.querySelectorAll('.timeline-connector');
  connectors.forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 300}ms`);
  });

  layoutTimelineConnectors();

  // jalankan animasi saat terlihat (sekali)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        section.classList.add('is-inview');
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });
  io.observe(section);

  // responsif: ukur ulang saat resize/rotate/font change
  window.addEventListener('resize', layoutTimelineConnectors);
  window.addEventListener('load', layoutTimelineConnectors);
}
// ===== Header: Mobile menu init (super smooth + lock auto-hide) =====
function initHeaderMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const header = document.getElementById('header');
  if (!mobileMenu || !mobileMenuBtn || !header) return;

  let isOpen = false;
  let isAnimating = false;
  let lockTimer = null;

  const lockHeader = (ms=320) => {
    header.setAttribute('data-lock-hide', '1');
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => header.removeAttribute('data-lock-hide'), ms);
  };

  function openMenu() {
    if (isOpen || isAnimating) return;
    isAnimating = true;
    lockHeader();        

    mobileMenu.classList.remove('hidden'); 
    requestAnimationFrame(() => {
      mobileMenu.classList.add('show');   
    });

      mobileMenuBtn.setAttribute('aria-expanded', 'true');

    const onDone = (e) => {
      if (e && e.target !== mobileMenu) return;
      mobileMenu.removeEventListener('transitionend', onDone);
      isAnimating = false;
      isOpen = true;
      lockHeader();
    };
    mobileMenu.addEventListener('transitionend', onDone);
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;
    lockHeader();                  

    mobileMenu.classList.remove('show');    

    mobileMenuBtn.setAttribute('aria-expanded', 'false');

    const onDone = (e) => {
      if (e && e.target !== mobileMenu) return;
      mobileMenu.removeEventListener('transitionend', onDone);
      mobileMenu.classList.add('hidden');  
      isAnimating = false;
      isOpen = false;
      lockHeader();     
    };
    mobileMenu.addEventListener('transitionend', onDone);
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  mobileMenuBtn.addEventListener('click', () => {
    if (isOpen) closeMenu(); else openMenu();
  });

// === Logo -> scroll ke hero di halaman saat ini ===
const logoLink = header.querySelector('#site-logo');
if (logoLink) {
  const targetId = document.getElementById('tentang')
    ? 'tentang'
    : (document.getElementById('hero') ? 'hero' : null);

  if (targetId) {
    logoLink.setAttribute('href', '#' + targetId);

    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      const t = document.getElementById(targetId);
      if (t) {
        if (typeof isOpen !== 'undefined' && isOpen) {
          closeMenu();
        }
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  } else {
    logoLink.setAttribute('href', 'index.html#tentang');
  }
}


  document.querySelectorAll('#mobile-menu button, #mobile-menu a').forEach(item => {
    item.addEventListener('click', closeMenu);
  });
}

window.initHeaderMenu = initHeaderMenu;

/* ==== Sticky Header: hide on scroll down, show on scroll up (robust) ==== */
(function () {
  let inited = false;
  let lastY = 0, ticking = false;

  const DELTA = 8;    
  const TOP_LOCK = 2;  

  function initSticky(header) {
    if (!header || inited) return;
    inited = true;

    lastY = window.pageYOffset || document.documentElement.scrollTop || 0;

    function handle() {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      const delta = y - lastY;

      if (header.hasAttribute('data-lock-hide')) {
        ticking = false;
        return;
      }

      if (y <= TOP_LOCK) {
        header.classList.remove('header-hidden');
        header.classList.remove('header-solid');
        lastY = y; ticking = false; return;
      }
      if (Math.abs(delta) < DELTA) { ticking = false; return; }

      if (delta > 0) {
        // scroll turun -> sembunyikan
        header.classList.add('header-hidden');
      } else {
        // scroll naik -> tampilkan
        header.classList.remove('header-hidden');
        header.classList.add('header-solid');
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(handle);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => handle());
    window.addEventListener('load', () => handle());

    handle();
  }

  const immediate = document.getElementById('header');
  if (immediate) {
    initSticky(immediate);
    return;
  }

  const mo = new MutationObserver(() => {
    const header = document.getElementById('header');
    if (header) {
      initSticky(header);
      mo.disconnect();
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    if (header) { initSticky(header); mo.disconnect(); }
  });
})();


