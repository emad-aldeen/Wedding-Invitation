// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    initLanguageToggle();
    initAudioToggle();
    initIntroScreen();
    initHeroVideo();
    initScratchCard();
    initCountdown();
    initScrollReveal();
});

// Also scroll to top when page is fully loaded (including images)
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

// Scroll to top on page refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// ==================== 
// LANGUAGE TOGGLE
// ==================== 

let currentLang = 'en';

// ==================== 
// AUDIO TOGGLE
// ==================== 

let audioMuted = false;
let bgMusic = null;

function initAudioToggle() {
    bgMusic = document.getElementById('bgMusic');
    const audioToggle = document.getElementById('audioToggle');
    const audioOn = audioToggle?.querySelector('.audio-on');
    const audioOff = audioToggle?.querySelector('.audio-off');
    
    if (!bgMusic || !audioToggle) return;
    
    // Audio will start when intro screen is dismissed
    
    audioToggle.addEventListener('click', function() {
        audioMuted = !audioMuted;
        
        if (audioMuted) {
            bgMusic.pause();
            audioToggle.classList.add('muted');
            audioOn.classList.add('hidden');
            audioOff.classList.remove('hidden');
        } else {
            bgMusic.play().catch(err => console.log('Audio play failed:', err));
            audioToggle.classList.remove('muted');
            audioOn.classList.remove('hidden');
            audioOff.classList.add('hidden');
        }
    });
}

function startBackgroundMusic() {
    if (bgMusic && !audioMuted) {
        bgMusic.play().catch(err => console.log('Audio autoplay failed:', err));
    }
}

function initLanguageToggle() {
    const toggle = document.getElementById('langToggle');
    if (!toggle) return;
    
    const buttons = toggle.querySelectorAll('.lang-btn');
    
    // Check if there's a saved language preference
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        currentLang = savedLang;
    }
    
    // Always apply language on init
    applyLanguage(currentLang);
    updateToggleButtons(buttons, currentLang);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const lang = this.getAttribute('data-lang');
            currentLang = lang;
            applyLanguage(currentLang);
            updateToggleButtons(buttons, currentLang);
            localStorage.setItem('preferredLang', currentLang);
        });
    });
}

function updateToggleButtons(buttons, lang) {
    buttons.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function applyLanguage(lang) {
    const body = document.body;
    
    // Toggle RTL for Arabic
    if (lang === 'ar') {
        body.classList.add('rtl');
    } else {
        body.classList.remove('rtl');
    }
    
    // Update all elements with data-en and data-ar attributes
    const translatableElements = document.querySelectorAll('[data-en][data-ar]');
    translatableElements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            // Use innerHTML if text contains HTML tags like <br>
            if (text.includes('<')) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// ====================
// INTRO SCREEN
// ==================== 

function initIntroScreen() {
    const introScreen = document.getElementById('introScreen');
    const mainContent = document.getElementById('mainContent');

    introScreen.addEventListener('click', function() {
        introScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        
        // Start background music when intro is dismissed
        startBackgroundMusic();
        
        // Start the hero video after intro is dismissed
        setTimeout(() => {
            startHeroVideo();
            startScrollObserver();
        }, 500);
    });

    // Also allow keyboard activation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            introScreen.click();
        }
    });
}

// ==================== 
// HERO VIDEO SECTION
// ==================== 

let heroVideoInitialized = false;

function initHeroVideo() {
    const video = document.getElementById('heroVideo');
    const image = document.getElementById('heroImage');
    const namesOverlay = document.getElementById('namesOverlay');
    
    if (!video || !image || !namesOverlay) {
        return;
    }
    
    let namesShown = false;
    
    // Get video duration and set up timeupdate event
    video.addEventListener('loadedmetadata', function() {
        const duration = video.duration;
        const showNamesAt = duration / 2; // Show names at middle of video
        
        video.addEventListener('timeupdate', function() {
            // Show names overlay at middle of video
            if (video.currentTime >= showNamesAt && !namesShown) {
                namesShown = true;
                namesOverlay.classList.add('visible');
            }
        });
    });
    
    // Fallback: if video doesn't have metadata, show names after 2 seconds of playback
    video.addEventListener('playing', function() {
        setTimeout(() => {
            if (!namesShown) {
                namesShown = true;
                namesOverlay.classList.add('visible');
            }
        }, 2000);
    });
    
    // When video ends, fade out video and show image
    video.addEventListener('ended', function() {
        // Make sure names are visible
        if (!namesShown) {
            namesShown = true;
            namesOverlay.classList.add('visible');
        }

        // After fade out transition, hide video and show image
        setTimeout(() => {
            video.classList.add('hidden');
            image.classList.remove('hidden');
        }, 800);
    });
}

function startHeroVideo() {
    if (heroVideoInitialized) return;
    heroVideoInitialized = true;
    
    const video = document.getElementById('heroVideo');
    const namesOverlay = document.getElementById('namesOverlay');
    
    if (video) {
        video.play().catch(err => {
            // If autoplay fails, show the image immediately
            const image = document.getElementById('heroImage');
            if (image) {
                video.classList.add('hidden');
                image.classList.remove('hidden');
            }
            if (namesOverlay) {
                namesOverlay.classList.add('visible');
            }
        });
    }
}

// ==================== 
// SCROLL REVEAL ANIMATION
// ==================== 

function initScrollReveal() {
    // Initial state - all reveal texts are hidden (handled by CSS)
}

function startScrollObserver() {
    const revealElements = document.querySelectorAll('.reveal-text');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });
}

// ==================== 
// SCRATCH CIRCLES WITH SCROLL LOCK & CONFETTI
// ==================== 

let revealedCircles = [false, false, false];
let scrollLocked = false;
let confettiTriggered = false;

function initScratchCard() {
    const circles = document.querySelectorAll('.scratch-circle');
    const revealSection = document.getElementById('revealSection');
    
    if (circles.length === 0) return;
    
    circles.forEach((circle, index) => {
        const canvas = circle.querySelector('.scratch-canvas-circle');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastPoint = null;
        let scratchedPixels = 0;
        let totalPixels = 0;
        let canvasInitialized = false;
        
        function initCanvas() {
            // Don't reinitialize if already revealed
            if (revealedCircles[index]) return;
            
            const rect = circle.getBoundingClientRect();
            // Only reinitialize if size actually changed significantly
            if (canvasInitialized && Math.abs(canvas.width - rect.width) < 5) return;
            
            canvas.width = rect.width;
            canvas.height = rect.height;
            totalPixels = canvas.width * canvas.height;
            
            // Create metallic gradient
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            gradient.addColorStop(0, '#d4af37');
            gradient.addColorStop(0.3, '#f5d76e');
            gradient.addColorStop(0.5, '#c9a227');
            gradient.addColorStop(0.7, '#e6c35c');
            gradient.addColorStop(1, '#aa8c2c');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shimmer effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(canvas.width / 3, canvas.height / 3, canvas.width / 4, canvas.height / 6, -0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Add scratch text
            ctx.fillStyle = 'rgba(139, 100, 20, 0.7)';
            ctx.font = 'bold 12px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SCRATCH', canvas.width / 2, canvas.height / 2);
            
            canvasInitialized = true;
        }
        
        setTimeout(initCanvas, 100);
        // Debounce resize to prevent frequent reinit
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initCanvas, 250);
        });
        
        function getPosition(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            if (e.touches && e.touches.length > 0) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            }
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }
        
        function checkRevealProgress() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparentPixels = 0;
            
            for (let i = 3; i < imageData.data.length; i += 4) {
                if (imageData.data[i] === 0) {
                    transparentPixels++;
                }
            }
            
            const revealPercentage = (transparentPixels / totalPixels) * 100;
            
            // If more than 50% is revealed, consider it done
            if (revealPercentage > 50 && !revealedCircles[index]) {
                revealedCircles[index] = true;
                circle.classList.add('revealed');
                
                // Clear remaining canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                checkAllRevealed();
            }
        }
        
        function scratch(e) {
            if (!isDrawing) return;
            
            const pos = getPosition(e);
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 30;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (lastPoint) {
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            lastPoint = pos;
        }
        
        function startScratch(e) {
            e.preventDefault();
            isDrawing = true;
            lastPoint = getPosition(e);
            scratch(e);
        }
        
        function stopScratch() {
            isDrawing = false;
            lastPoint = null;
            checkRevealProgress();
        }
        
        // Mouse events
        canvas.addEventListener('mousedown', startScratch);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', stopScratch);
        canvas.addEventListener('mouseleave', stopScratch);
        
        // Touch events
        canvas.addEventListener('touchstart', startScratch, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            scratch(e);
        }, { passive: false });
        canvas.addEventListener('touchend', stopScratch);
        canvas.addEventListener('touchcancel', stopScratch);
    });
    
    // Set up scroll lock observer
    setupScrollLock();
}

let isScrollingToSection = false;

function setupScrollLock() {
    const revealSection = document.getElementById('revealSection');
    if (!revealSection) return;
    
    // Observer to detect when section comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When section starts to appear (even partially)
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                const allRevealed = revealedCircles.every(r => r === true);
                
                if (!allRevealed && !scrollLocked && !isScrollingToSection) {
                    // Slide to section then lock
                    slideToSectionAndLock(revealSection);
                }
            }
        });
    }, { threshold: [0.1, 0.3, 0.5, 0.7, 1.0] });
    
    observer.observe(revealSection);
}

function slideToSectionAndLock(section) {
    isScrollingToSection = true;
    
    // Smoothly scroll to center the section
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait for scroll to complete, then lock
    setTimeout(() => {
        const allRevealed = revealedCircles.every(r => r === true);
        if (!allRevealed) {
            lockScroll();
        }
        isScrollingToSection = false;
    }, 600);
}

// Prevent touchmove when scroll is locked
function preventScroll(e) {
    if (scrollLocked) {
        // Allow touch on scratch canvases
        if (e.target.classList.contains('scratch-canvas-circle')) {
            return;
        }
        e.preventDefault();
    }
}

function lockScroll() {
    scrollLocked = true;
    
    document.body.classList.add('scroll-locked');
    document.documentElement.classList.add('scroll-locked');
    
    // Add touch event listener for iOS
    document.addEventListener('touchmove', preventScroll, { passive: false });
}

function unlockScroll() {
    scrollLocked = false;
    
    document.body.classList.remove('scroll-locked');
    document.documentElement.classList.remove('scroll-locked');
    
    // Remove touch event listener
    document.removeEventListener('touchmove', preventScroll);
    
    const scrollHint = document.getElementById('scrollHint');
    if (scrollHint) {
        scrollHint.classList.add('visible');
    }
}

function checkAllRevealed() {
    const allRevealed = revealedCircles.every(r => r === true);
    
    if (allRevealed && !confettiTriggered) {
        confettiTriggered = true;
        triggerMetallicConfetti();
        
        // Unlock scroll after a short delay
        setTimeout(() => {
            unlockScroll();
        }, 1500);
    }
}

function triggerMetallicConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const section = document.getElementById('revealSection');
    
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
    
    const confettiPieces = [];
    const colors = ['#d4af37', '#f5d76e', '#c9a227', '#e6c35c', '#aa8c2c', '#ffd700', '#b8860b', '#daa520'];
    
    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 100,
            width: Math.random() * 10 + 5,
            height: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            speedX: (Math.random() - 0.5) * 3,
            speedY: Math.random() * 3 + 2,
            oscillationSpeed: Math.random() * 0.05 + 0.02,
            oscillationDistance: Math.random() * 40 + 20,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    let animationFrame;
    let startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activePieces = 0;
        
        confettiPieces.forEach(piece => {
            if (piece.y < canvas.height + 50) {
                activePieces++;
                
                // Update position
                piece.y += piece.speedY;
                piece.x += piece.speedX + Math.sin(piece.phase) * piece.oscillationDistance * 0.02;
                piece.phase += piece.oscillationSpeed;
                piece.rotation += piece.rotationSpeed;
                
                // Add slight gravity effect
                piece.speedY += 0.02;
                
                // Draw piece
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation * Math.PI / 180);
                
                // Create metallic gradient
                const gradient = ctx.createLinearGradient(-piece.width/2, 0, piece.width/2, 0);
                gradient.addColorStop(0, piece.color);
                gradient.addColorStop(0.5, '#fff');
                gradient.addColorStop(1, piece.color);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
                
                ctx.restore();
            }
        });
        
        // Continue animation if pieces are still visible or within 5 seconds
        if (activePieces > 0 && elapsed < 5000) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// ====================
// COUNTDOWN TIMER
// ==================== 

function initCountdown() {
    // Wedding date: September 10, 2027 at 4:00 PM
    const weddingDate = new Date('2026-03-22T09:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '000';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Animate number changes
        animateNumber('days', days, 1);
        animateNumber('hours', hours, 2);
        animateNumber('minutes', minutes, 2);
        animateNumber('seconds', seconds, 2);
    }
    
    function animateNumber(id, value, padding) {
        const element = document.getElementById(id);
        const newValue = String(value).padStart(padding, '0');
        
        if (element.textContent !== newValue) {
            element.style.transform = 'translateY(-5px)';
            element.style.opacity = '0.5';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            }, 150);
        }
    }
    
    // Add transition styles to countdown numbers
    const countdownNumbers = document.querySelectorAll('.countdown-number');
    countdownNumbers.forEach(num => {
        num.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    });
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ==================== 
// SMOOTH SCROLL (for any internal links)
// ==================== 

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
