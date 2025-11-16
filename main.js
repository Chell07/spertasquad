/**
 * main.js (FULL, updated) - Modern music player integrated with your site
 * - Fixed loading-screen behavior.
 *
 * === PERUBAHAN OLEH GEMINI (v3.1) ===
 * - Menghapus baris 'Nothing to do.' yang salah ketik dan menyebabkan error.
 * - Fungsionalitas (membaca title/artist dari JSON) tetap sama.
 * === AKHIR PERUBAHAN ===
 */

/* ============================
   MUSIC PLAYLIST - EDIT HERE
   ============================
*/
const musicFiles = [
  'music/amelsound.mp3',
  'music/sigma.mp3',
  'music/sperta.mp3'
];
/* ============================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready — initializing site...');
  Site.init();
});

const Site = (function(){
  // Elements
  const audio = document.getElementById('background-music');

  // Modern UI elements (must exist in HTML)
  const modern = {
    container: document.getElementById('modern-music-player'),
    toggle: document.getElementById('modern-toggle'),
    album: document.getElementById('modern-album'),
    title: document.getElementById('modern-title'),
    artist: document.getElementById('modern-artist'),
    lyrics: document.getElementById('modern-lyrics'),
    playBtn: document.getElementById('modern-play'),
    playIcon: document.getElementById('modern-play-icon'),
    prevBtn: document.getElementById('modern-prev'),
    nextBtn: document.getElementById('modern-next'),
    progressContainer: document.getElementById('modern-progress-container'),
    progressBar: document.getElementById('modern-progress'),
    currentTime: document.getElementById('modern-current'),
    totalTime: document.getElementById('modern-total')
  };

  // State
  let currentIndex = 0;
  let isPlaying = false;
  let rafId = null;
  
  // State Lirik
  let currentLyrics = []; 
  let currentLyricIndex = -1;

  /* ----------------- helpers ----------------- */
  function fmt(time){
    if (!isFinite(time) || time <= 0) return '0:00';
    const m = Math.floor(time/60), s = Math.floor(time%60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function baseName(path){
    if (!path) return '';
    return path.split('/').pop().replace(/\.[^/.]+$/, '');
  }

  // Fungsi ini sekarang HANYA digunakan sebagai FALLBACK
  function metaFromPath(path){
    const base = baseName(path);
    const title = base.replace(/[-_]/g, ' ');
    const img = `images/${base}.jpg`;
    return { title: decodeURIComponent(title), artist: '', img };
  }

  /* ----------------- audio controls ----------------- */
  
  // === FUNGSI loadTrack YANG DIPERBARUI SECARA SIGNIFIKAN ===
  function loadTrack(index){
    if (!audio) return;
    if (!musicFiles || musicFiles.length === 0) {
      audio.removeAttribute('src');
      renderMeta({ title: 'No Song', artist: '', img: 'images/elaina.jpg' });
      updateTimeUI(0,0);
      return;
    }
    currentIndex = ((index % musicFiles.length) + musicFiles.length) % musicFiles.length;
    const path = musicFiles[currentIndex];
    audio.src = path;
    audio.load();

    // Reset state lirik & UI sementara
    currentLyrics = [];
    currentLyricIndex = -1;
    modern.lyrics.textContent = '...'; // Placeholder saat memuat
    
    const base = baseName(path); // e.g., "sperta"
    const lyricFilePath = `${base}.json`; // e.g., "sperta.json"

    console.log(`Memuat lagu: ${path}. Mencoba lirik/meta dari: ${lyricFilePath}`);

    // Fetch lirik DAN metadata dari file JSON
    fetch(lyricFilePath)
      .then(res => {
          // Cek jika file tidak ditemukan (404)
          if (!res.ok) {
            throw new Error(`File JSON '${lyricFilePath}' tidak ditemukan.`);
          }
          return res.json();
      })
      .then(data => {
        // === KASUS SUKSES: File JSON Ditemukan dan Valid ===
        if (data.music) {
          const musicData = data.music;
          
          // 1. Muat Lirik
          currentLyrics = musicData.timeSync || [];
          updateLyrics(0); // Tampilkan lirik pertama/placeholder

          // 2. Siapkan Metadata dari JSON
          // Gunakan data JSON, tapi siapkan fallback ke nama file jika data JSON kosong
          const title = musicData.title || base.replace(/[-_]/g, ' '); 
          const artist = musicData.artist || ""; // Artis dari JSON
          const img = musicData.albumArt || `images/${base}.jpg`; // Gambar dari JSON
          
          // 3. Render Metadata dari JSON
          renderMeta({ title: title, artist: artist, img: img });

        } else {
          // JSON ada tapi formatnya salah
          throw new Error(`Format file JSON '${lyricFilePath}' salah.`);
        }
      })
      .catch(err => {
        // === KASUS GAGAL: File JSON Tidak Ada (404) atau Format Salah ===
        console.warn(`Gagal memuat metadata/lirik dari ${lyricFilePath}:`, err.message);
        
        // 1. Set Lirik Gagal
        currentLyrics = [];
        modern.lyrics.textContent = 'Lirik tidak tersedia.'; 
        
        // 2. Render Metadata FALLBACK (pakai nama file)
        const meta = metaFromPath(path); // {title: "sperta", artist: "", img: "images/sperta.jpg"}
        renderMeta(meta);
      });
  }
  // ======================================


  function play(){
    if (!audio || !audio.src) return;
    audio.play().catch(e => console.warn('Playback prevented:', e));
    isPlaying = true;
    updatePlayIcon();
    startRAF();
  }

  function pause(){
    if (!audio) return;
    audio.pause();
    isPlaying = false;
    updatePlayIcon();
    cancelRAF();
  }

  function togglePlay(){
    if (isPlaying) pause(); else play();
  }

  function prev(){
    loadTrack(currentIndex - 1);
    if (isPlaying) setTimeout(()=> play(), 150);
  }

  function next(){
    loadTrack(currentIndex - 1);
    if (isPlaying) setTimeout(()=> play(), 150);
  }

  function updatePlayIcon(){
    if (!modern.playIcon) return;
    modern.playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }

  // Fungsi ini tidak berubah, hanya menerima data dan menampilkannya
  function renderMeta(meta){
    if (!modern) return;
    modern.title.textContent = meta.title || 'Unknown';
    modern.artist.textContent = meta.artist || ''; // Akan menampilkan artis jika ada
    
    // Set gambar album, tapi gunakan fallback jika gagal
    modern.album.src = meta.img || 'images/elaina.jpg';
  }

  function updateTimeUI(current, total){
    if (!modern) return;
    modern.currentTime.textContent = fmt(current);
    modern.totalTime.textContent = fmt(total);
    const pct = total ? (current / total) * 100 : 0;
    modern.progressBar.style.width = pct + '%';
  }

  function onTimeUpdate(){
    if (!audio) return;
    updateTimeUI(audio.currentTime || 0, audio.duration || 0);
  }

  function onLoadedMetadata(){
    if (!audio) return;
    updateTimeUI(0, audio.duration || 0);
  }

  function onEnded(){
    next();
  }

  function seek(e){
    if (!modern.progressContainer || !audio) return;
    const rect = modern.progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
    onTimeUpdate();
  }

  function startRAF(){
    cancelRAF();
    const step = () => {
      if (audio && audio.duration) {
        const currentTime = audio.currentTime || 0;
        updateTimeUI(currentTime, audio.duration);
        updateLyrics(currentTime); // PANGGILAN UPDATE LIRIK
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  function cancelRAF(){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  
  // Fungsi sinkronisasi lirik (tidak berubah)
  function updateLyrics(time) {
    if (!currentLyrics || currentLyrics.length === 0) return; 

    let newLyricIndex = -1;
    let currentLyricText = null;
    
    for (let i = 0; i < currentLyrics.length; i++) {
      if (currentLyrics[i].time <= time) {
        currentLyricText = currentLyrics[i].text;
        newLyricIndex = i;
      } else {
        break; 
      }
    }

    if (newLyricIndex !== currentLyricIndex) {
      currentLyricIndex = newLyricIndex;
      
      if (currentLyricText) {
        modern.lyrics.textContent = currentLyricText;
      } else if (currentLyricIndex === -1 && currentLyrics.length > 0) {
         // Jika lagu baru dimulai dan belum ada lirik, tampilkan placeholder
        modern.lyrics.textContent = '...';
      }
    }
  }

  /* ----------------- UI binding ----------------- */
  function attachModernUI(){
    if (!modern) return;

    if (modern.playBtn) modern.playBtn.addEventListener('click', (e)=> { e.stopPropagation(); togglePlay(); });
    if (modern.prevBtn) modern.prevBtn.addEventListener('click', (e)=> { e.stopPropagation(); prev(); });
    if (modern.nextBtn) modern.nextBtn.addEventListener('click', (e)=> { e.stopPropagation(); next(); });
    if (modern.progressContainer) modern.progressContainer.addEventListener('click', seek);
    
    if (modern.toggle) modern.toggle.addEventListener('click', (e)=> { 
      e.stopPropagation(); 
      modern.container.classList.toggle('minimized'); 
    });

    if (modern.album) {
      modern.album.onerror = function() {
        if (!this.src.endsWith('elaina.jpg')) {
          this.src = 'images/elaina.jpg';
        }
      };
    }

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
    });

    // audio events
    if (!audio) return;
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    // ===== BARIS YANG SALAH SUDAH DIHAPUS DARI SINI =====
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', () => { isPlaying = true; updatePlayIcon(); startRAF(); });
    audio.addEventListener('pause', () => { isPlaying = false; updatePlayIcon(); cancelRAF(); });
  }

  /* ----------------- other site features (kept) ----------------- */
  function initImageViewer(){
    const viewer = document.getElementById('image-viewer');
    const viewerImage = document.getElementById('viewer-image');
    const currentIndexEl = document.getElementById('current-index');
    const totalImages = document.getElementById('total-images');
    if (!viewer || !viewerImage) return;

    const imgs = Array.from(document.querySelectorAll('.member-photo-simple')).map(img => ({ src: img.src, alt: img.alt }));
    if (totalImages) totalImages.textContent = imgs.length;

    document.querySelectorAll('.member-photo-simple').forEach((img, idx) => {
      img.addEventListener('click', () => {
        viewer.classList.add('active');
        viewerImage.src = imgs[idx].src;
        viewerImage.alt = imgs[idx].alt;
        if (currentIndexEl) currentIndexEl.textContent = idx + 1;
        document.body.style.overflow = 'hidden';
      });
    });

    const closeBtn = document.querySelector('.close-viewer');
    if (closeBtn) closeBtn.addEventListener('click', () => { viewer.classList.remove('active'); document.body.style.overflow = ''; });
    viewer.addEventListener('click', (e) => { if (e.target === viewer) { viewer.classList.remove('active'); document.body.style.overflow = ''; } });

    const prevBtn = document.querySelector('.viewer-prev');
    const nextBtn = document.querySelector('.viewer-next');
    let idx = 0;
    function update(i){ idx = (i + imgs.length) % imgs.length; viewerImage.src = imgs[idx].src; viewerImage.alt = imgs[idx].alt; if (currentIndexEl) currentIndexEl.textContent = idx+1; }
    if (prevBtn) prevBtn.addEventListener('click', () => update(idx-1));
    if (nextBtn) nextBtn.addEventListener('click', () => update(idx+1));
    document.addEventListener('keydown', (e) => { if (viewer.classList.contains('active')){ if (e.key==='Escape') viewer.classList.remove('active'); if (e.key==='ArrowLeft') update(idx-1); if (e.key==='ArrowRight') update(idx+1); }});
  }

  function initVideoPopup(){
    const videoPopup = document.getElementById('video-popup');
    const popupVideo = document.getElementById('popup-video');
    const aboutVideo = document.querySelector('.about-video');

    function open(){
      if (!aboutVideo || !popupVideo || !videoPopup) return;
      const src = aboutVideo.querySelector('source') ? aboutVideo.querySelector('source').src : null;
      if (!src) return;
      popupVideo.innerHTML = '';
      const s = document.createElement('source');
      s.src = src; s.type = 'video/mp4';
      popupVideo.appendChild(s);
      popupVideo.load();
      videoPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(()=> {
        popupVideo.play().catch(e => console.warn('Video popup playback prevented:', e));
      }, 200);
    }
    function close(){
      if (popupVideo) { popupVideo.pause(); popupVideo.currentTime = 0; }
      if (videoPopup) { videoPopup.classList.remove('active'); }
      document.body.style.overflow = '';
      if (aboutVideo && aboutVideo.paused) aboutVideo.play().catch(()=>{});
    }

    const overlay = document.querySelector('.video-overlay');
    if (overlay) overlay.addEventListener('click', open);
    const closeBtn = document.querySelector('.close-video-popup');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (videoPopup) videoPopup.addEventListener('click', (e)=>{ if (e.target === videoPopup) close(); });
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && videoPopup && videoPopup.classList.contains('active')) close();});
  }

  function initNavAndBackToTop(){
    const navLinks = document.querySelectorAll('.ul-list li a');
    const sections = document.querySelectorAll('section');

    function removeActive(){ navLinks.forEach(link => link.parentElement.classList.remove('active')); }

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        const sec = document.getElementById(id);
        if (!sec) return;
        window.scrollTo({ top: sec.offsetTop - 80, behavior: 'smooth' });
        removeActive();
        link.parentElement.classList.add('active');
      });
    });

    window.addEventListener('scroll', () => {
      let scrollPos = window.scrollY + 100;
      sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
          removeActive();
          const activeLink = document.querySelector(`.ul-list li a[href="#${section.id}"]`);
          if (activeLink) activeLink.parentElement.classList.add('active');
        }
      });
    });

    // back to top
    let backToTop = document.getElementById('back-to-top');
    if (!backToTop) {
      backToTop = document.createElement('div');
      backToTop.id = 'back-to-top';
      backToTop.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
      document.body.appendChild(backToTop);
      backToTop.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#474af0;color:#fff;width:50px;height:50px;border-radius:50%;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:1000;transition:transform .3s;';
      backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    }
    window.addEventListener('scroll', ()=> { backToTop.style.display = window.scrollY > 500 ? 'flex' : 'none'; });
  }

  function initRevealObserver(){
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = { threshold:0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active-reveal'); });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initTeamScroll(){
    const teamScrollWrapper = document.querySelector('.team-scroll-wrapper');
    if (teamScrollWrapper) {
      teamScrollWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        teamScrollWrapper.scrollLeft += e.deltaY;
      });
    }
  }

  function initThemeToggle(){
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
      const btn = document.createElement('button');
      btn.className = 'theme-toggle';
      btn.innerHTML = '<i class="fas fa-moon"></i>';
      document.body.appendChild(btn);
      btn.addEventListener('click', toggleTheme);
    } else {
      themeToggle.addEventListener('click', toggleTheme);
    }

    const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (saved === 'dark') document.body.classList.add('dark-mode');
  }

  function toggleTheme(){
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme','light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme','dark');
    }
  }

  /* ----------------- Loading & Typing (FIXED) ----------------- */
  function initLoadingAndTyping(){
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    const mainIcon = document.querySelector('.custom-logo');
    const subIcons = document.querySelectorAll('.sub-icons i');
    const designerText = document.getElementById('designer-text');
    const mainPage = document.getElementById('main-page');

    function showElement(el, delay = 0){
      if (!el) return;
      setTimeout(() => {
        el.classList.remove('hidden'); 
        el.classList.add('fall');
      }, delay);
    }

    function hideLoadingSequence(){
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.style.transition = 'opacity 0.45s ease';
          loadingScreen.style.opacity = '0';
        }
        setTimeout(()=>{
          if (loadingScreen) loadingScreen.style.display = 'none';
          if (mainPage) mainPage.classList.add('visible');
          document.body.style.overflow = '';
        }, 500);
      }, 350); 
    }

    function startSequenceThenHide(){
      showElement(mainIcon, 0);
      showElement(loadingText, 650);
      subIcons.forEach((icon, idx) => showElement(icon, 1200 + idx * 350));
      showElement(designerText, 2200);
      setTimeout(hideLoadingSequence, 3200);
    }

    if (!loadingScreen) {
      if (mainPage) mainPage.classList.add('visible');
      return;
    }

    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
    document.body.style.overflow = 'hidden';

    if (document.readyState === 'complete') {
      setTimeout(startSequenceThenHide, 200);
    } else {
      let didRun = false;
      const runOnce = () => {
        if (didRun) return;
        didRun = true;
        startSequenceThenHide();
      };
      window.addEventListener('load', () => runOnce());
      setTimeout(() => runOnce(), 6500);
    }

    const typingElement = document.querySelector('.info-home h3');
    if (typingElement) {
      const words = ["Computer Engineering Students", "Web Development Learners", "Politeknik Negeri Manado", "Sperta Squad"];
      let wordIndex = 0, charIndex = 0, isDeleting = false;
      function type(){
        const currentWord = words[wordIndex];
        let displayed = currentWord.substring(0,charIndex);
        typingElement.innerHTML = displayed + '<span class="cursor">|</span>';
        if (!isDeleting && charIndex < currentWord.length) { charIndex++; setTimeout(type, 100); }
        else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(type, 50); }
        else { isDeleting = !isDeleting; if (!isDeleting) wordIndex = (wordIndex+1)%words.length; setTimeout(type, 800); }
      }
      setTimeout(() => { try{ type(); } catch(e){} }, 800);
    }
  }

  /* ----------------- initialization ----------------- */
  function init(){
    attachModernUI();
    loadTrack(0); // <-- Ini akan otomatis memuat 'amelsound.mp3' DAN 'amelsound.json'
    initImageViewer();
    initVideoPopup();
    initNavAndBackToTop();
    initRevealObserver();
    initTeamScroll();
    initThemeToggle();
    initLoadingAndTyping();

    document.addEventListener('click', function first() {
      if (audio && audio.src && !isPlaying) {
        audio.play().then(()=> audio.pause()).catch(e => console.warn('Audio priming failed:', e));
      }
      document.removeEventListener('click', first);
    }, { once: true, capture: true });
  }

  return { init };
})();

let userData = null;
let currentLyricIndex = -1;
let songDuration = 60;
