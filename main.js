// Music System
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('background-music');
        this.musicFiles = [
            'music/amelsound.mp3',
            'music/sigma.mp3',
            'music/sperta.mp3'
        ];
        this.currentMusicIndex = 0;
        this.isPlaying = false;
        this.isRandom = true;
        
        this.initializeMusic();
    }

    initializeMusic() {
        // Set event listeners
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('loadedmetadata', () => this.updateNowPlaying());

        // Set initial music
        this.loadMusic(this.currentMusicIndex);
        
        // Auto start music after loading
        setTimeout(() => {
            this.play();
        }, 2000);
    }

    loadMusic(index) {
        this.currentMusicIndex = index;
        this.audio.src = this.musicFiles[index];
        this.updateNowPlaying();
    }

    playNext() {
        if (this.isRandom) {
            this.currentMusicIndex = Math.floor(Math.random() * this.musicFiles.length);
        } else {
            this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicFiles.length;
        }
        this.loadMusic(this.currentMusicIndex);
        if (this.isPlaying) {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    playPrev() {
        this.currentMusicIndex = (this.currentMusicIndex - 1 + this.musicFiles.length) % this.musicFiles.length;
        this.loadMusic(this.currentMusicIndex);
        if (this.isPlaying) {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play().catch(e => console.log('Audio play failed:', e));
        this.isPlaying = true;
        this.updatePlayButton();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    updatePlayButton() {
        const playBtn = document.getElementById('play-pause-music');
        const icon = this.isPlaying ? 'fa-pause' : 'fa-play';
        
        if (playBtn) playBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    updateNowPlaying() {
        const nowPlaying = document.getElementById('now-playing');
        if (nowPlaying) {
            const musicName = this.musicFiles[this.currentMusicIndex].split('/').pop().replace('.mp3', '');
            nowPlaying.textContent = this.isPlaying ? `Playing: ${musicName}` : 'Music Off';
        }
    }
}

// Initialize Music Player
const musicPlayer = new MusicPlayer();

// Image Viewer System
class ImageViewer {
    constructor() {
        this.viewer = document.getElementById('image-viewer');
        this.viewerImage = document.getElementById('viewer-image');
        this.currentIndex = document.getElementById('current-index');
        this.totalImages = document.getElementById('total-images');
        this.images = [];
        this.currentImageIndex = 0;
        
        this.initializeViewer();
    }

    initializeViewer() {
        // Collect all team images
        this.images = Array.from(document.querySelectorAll('.member-photo-simple')).map(img => ({
            src: img.src,
            alt: img.alt
        }));

        this.totalImages.textContent = this.images.length;

        // Add click events to team images
        document.querySelectorAll('.member-photo-simple').forEach((img, index) => {
            img.addEventListener('click', () => this.openViewer(index));
        });

        // Close viewer events
        document.querySelector('.close-viewer').addEventListener('click', () => this.closeViewer());
        this.viewer.addEventListener('click', (e) => {
            if (e.target === this.viewer) this.closeViewer();
        });

        // Navigation events
        document.querySelector('.viewer-prev').addEventListener('click', () => this.prevImage());
        document.querySelector('.viewer-next').addEventListener('click', () => this.nextImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.viewer.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeViewer();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
    }

    openViewer(index) {
        this.currentImageIndex = index;
        this.updateViewer();
        this.viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeViewer() {
        this.viewer.classList.remove('active');
        document.body.style.overflow = '';
    }

    prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.updateViewer();
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateViewer();
    }

    updateViewer() {
        const image = this.images[this.currentImageIndex];
        this.viewerImage.src = image.src;
        this.viewerImage.alt = image.alt;
        this.currentIndex.textContent = this.currentImageIndex + 1;
    }
}

// Initialize Image Viewer
const imageViewer = new ImageViewer();

// Video Popup System - SIMPLIFIED VERSION
class VideoPopup {
    constructor() {
        this.videoPopup = document.getElementById('video-popup');
        this.popupVideo = document.getElementById('popup-video');
        this.aboutVideo = document.querySelector('.about-video');
        
        this.initializeVideoPopup();
    }

    initializeVideoPopup() {
        // Open video popup when clicking on video container
        const videoOverlay = document.querySelector('.video-overlay');
        if (videoOverlay) {
            videoOverlay.addEventListener('click', () => this.openPopup());
        }
        
        // Close video popup events
        const closeBtn = document.querySelector('.close-video-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePopup());
        }
        
        // Close when clicking outside video
        if (this.videoPopup) {
            this.videoPopup.addEventListener('click', (e) => {
                if (e.target === this.videoPopup) this.closePopup();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.videoPopup || !this.videoPopup.classList.contains('active')) return;
            
            if(e.key === 'Escape') {
                this.closePopup();
            }
        });
    }

    openPopup() {
        if (!this.aboutVideo || !this.popupVideo || !this.videoPopup) {
            console.log('Video elements not found');
            return;
        }
        
        console.log('Opening video popup');
        
        // Set popup video source
        this.popupVideo.src = this.aboutVideo.src;
        this.popupVideo.muted = false;
        this.popupVideo.controls = true;
        this.popupVideo.currentTime = this.aboutVideo.currentTime;
        
        // Show popup
        this.videoPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Try to play video
        const playPromise = this.popupVideo.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playback started successfully');
            }).catch(error => {
                console.log('Auto-play failed, user interaction required:', error);
                // Show controls for manual play
                this.popupVideo.controls = true;
            });
        }
    }

    closePopup() {
        if (!this.aboutVideo || !this.popupVideo || !this.videoPopup) return;
        
        console.log('Closing video popup');
        
        // Pause and reset popup video
        this.popupVideo.pause();
        this.popupVideo.currentTime = 0;
        this.popupVideo.src = '';
        
        // Resume background video
        this.aboutVideo.muted = true;
        if (this.aboutVideo.paused) {
            this.aboutVideo.play().catch(e => console.log('Background video resume error:', e));
        }
        
        // Close popup
        this.videoPopup.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Music Controls Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const playPauseBtn = document.getElementById('play-pause-music');
    const nextBtn = document.getElementById('next-music');
    const prevBtn = document.getElementById('prev-music');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => musicPlayer.togglePlay());
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => musicPlayer.playNext());
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => musicPlayer.playPrev());
    }

    // Initialize Video Popup
    window.videoPopup = new VideoPopup();
});

// Navigation and Scroll Effects
const navLinks = document.querySelectorAll('.ul-list li a');
const sections = document.querySelectorAll('section');

function removeActive() {
  navLinks.forEach(link => link.parentElement.classList.remove('active'));
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    window.scrollTo({
      top: targetSection.offsetTop - 80, 
      behavior: 'smooth'
    });

    removeActive();
    link.parentElement.classList.add('active');
  });
});

// Active navigation based on scroll position
window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      removeActive();
      const activeLink = document.querySelector(`.ul-list li a[href="#${section.id}"]`);
      if (activeLink) activeLink.parentElement.classList.add('active');
    }
  });

  // Back to top button visibility
  if(window.scrollY > 500){
    backToTop.style.display = "flex";
  } else {
    backToTop.style.display = "none";
  }

  // Reveal animations
  revealElements.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 150;

    if(elementTop < windowHeight - revealPoint){
      el.classList.add('active-reveal');
    }
  });
});

// Reveal elements on scroll
const revealElements = document.querySelectorAll('.home-container, .about-container, .team-scroll-container');
revealElements.forEach(el => el.classList.add('reveal'));

// Create back to top button
const backToTop = document.createElement('div');
backToTop.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
backToTop.id = "back-to-top";
document.body.appendChild(backToTop);

backToTop.style.cssText = `
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: #474af0;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(71, 74, 240, 0.3);
`;

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

backToTop.addEventListener('mouseover', () => backToTop.style.transform = 'scale(1.2)');
backToTop.addEventListener('mouseout', () => backToTop.style.transform = 'scale(1)');

// Hover effects for team member cards
const teamCards = document.querySelectorAll('.member-card-simple');
teamCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.05)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// Typing animation
const typingElement = document.querySelector('.info-home h3'); 
const words = ["Computer Engineering Students", "Web Development Learners", "Politeknik Negeri Manado", "Sperta Squad"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentWord = words[wordIndex];
    let displayedText = currentWord.substring(0, charIndex);
    
    typingElement.innerHTML = displayedText + '<span class="cursor">|</span>';

    if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
        setTimeout(type, typingSpeed);
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(type, typingSpeed / 2);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            wordIndex = (wordIndex + 1) % words.length;
        }
        setTimeout(type, 1000);
    }
}

// Loading screen animation
document.addEventListener("DOMContentLoaded", () => {
  const loadingText = document.getElementById("loading-text");
  const mainIcon = document.querySelector(".custom-logo");
  const subIcons = document.querySelectorAll(".sub-icons i");
  const designerText = document.getElementById("designer-text");
  const loadingScreen = document.getElementById("loading-screen");

  function showElement(element, delay = 0){
    setTimeout(() => {
      element.classList.remove("hidden");
      element.classList.add("fall");
    }, delay);
  }

  // Sequence loading animations
  showElement(mainIcon, 0);
  showElement(loadingText, 800);
  subIcons.forEach((icon, idx) => {
    showElement(icon, 1600 + idx * 400);  
  });
  showElement(designerText, 2800);

  // Hide loading screen after animations
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      document.body.classList.add("loaded");
    }, 500);
  }, 4000);

  // Start typing animation after loading
  setTimeout(type, 4200);
});

// Team section horizontal scroll with mouse wheel
const teamScrollWrapper = document.querySelector('.team-scroll-wrapper');
if (teamScrollWrapper) {
  teamScrollWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    teamScrollWrapper.scrollLeft += e.deltaY;
  });
}

// Add intersection observer for better performance
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active-reveal');
    }
  });
}, observerOptions);

// Observe all reveal elements
document.addEventListener('DOMContentLoaded', () => {
  const elementsToObserve = document.querySelectorAll('.reveal');
  elementsToObserve.forEach(el => {
    observer.observe(el);
  });
});

// Auto-scroll team section indicator
let scrollDirection = 1;
setInterval(() => {
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    if (scrollDirection === 1) {
      scrollHint.style.transform = 'translateX(5px)';
      scrollDirection = -1;
    } else {
      scrollHint.style.transform = 'translateX(-5px)';
      scrollDirection = 1;
    }
  }
}, 1000);

// Dark/Light Mode Toggle
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
document.body.appendChild(themeToggle);

// Check for saved theme preference or respect OS preference
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Toggle theme function
function toggleTheme() {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);

// Add event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Global function untuk membuka video popup
function openVideoPopup() {
    if (window.videoPopup) {
        window.videoPopup.openPopup();
    }
}
