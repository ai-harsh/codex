// Global variables
let canvas, ctx;
let particles = [];
let mouse = { x: 0, y: 0 };
let isMouseDown = false;
let particleCount = 150;
let animationId;

// Coding symbols for particles
const codingSymbols = ['{', '}', '(', ')', '=', '>', '/', ';', '*', '<', '>', '[', ']'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should show particles (not on mobile)
    if (window.innerWidth > 767) {
        initParticleSystem();
        animate();
    }
    
    initTextAnimations();
    initFormInteractions();
    initMouseTracking();
});

// Initialize Canvas particle system
function initParticleSystem() {
    const container = document.getElementById('particle-container');
    
    // Create canvas
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    container.appendChild(canvas);
    
    // Create particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function createParticles() {
    particles = [];
    
    // Adjust particle count based on screen size
    if (window.innerWidth < 1200) {
        particleCount = 100;
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 100 + 50, // Depth for parallax
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            vz: (Math.random() - 0.5) * 0.2,
            symbol: codingSymbols[Math.floor(Math.random() * codingSymbols.length)],
            originalX: 0,
            originalY: 0,
            opacity: Math.random() * 0.5 + 0.3
        });
        
        // Store original position
        particles[i].originalX = particles[i].x;
        particles[i].originalY = particles[i].y;
    }
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    updateParticles();
    drawParticles();
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Ambient drift motion with parallax
        const speed = 50 / particle.z; // Closer particles move faster
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        particle.z += particle.vz;
        
        // Mouse interaction
        if (mouse.x !== undefined && mouse.y !== undefined) {
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxDistance = 100;
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                
                if (isMouseDown) {
                    // Repulsion on click
                    const repulsionStrength = 3;
                    particle.x += (dx / distance) * force * repulsionStrength * speed;
                    particle.y += (dy / distance) * force * repulsionStrength * speed;
                } else {
                    // Attraction (gravity well)
                    const attractionStrength = 1;
                    particle.x -= (dx / distance) * force * attractionStrength * speed;
                    particle.y -= (dy / distance) * force * attractionStrength * speed;
                }
            }
        }
        
        // Boundary wrapping
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.z > 150) particle.z = 50;
        if (particle.z < 50) particle.z = 150;
    }
}

function drawParticles() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sort particles by depth (z) for proper layering
    particles.sort((a, b) => b.z - a.z);
    
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // Calculate size and opacity based on depth
        const scale = 50 / particle.z;
        const size = Math.max(8 * scale, 2);
        const opacity = particle.opacity * scale;
        
        // Set glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10 * scale;
        
        // Set text properties
        ctx.font = `${size}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw the coding symbol
        ctx.fillText(particle.symbol, particle.x, particle.y);
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Handle window resize
function onWindowResize() {
    if (window.innerWidth <= 767) {
        // Disable particles on mobile
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (canvas) {
            canvas.style.display = 'none';
        }
        return;
    }
    
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Recreate particles for new dimensions
        createParticles();
    }
}

// Mouse tracking
function initMouseTracking() {
    document.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    
    document.addEventListener('mousedown', () => {
        isMouseDown = true;
    });
    
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
}

// Text animations
function initTextAnimations() {
    // Character scramble effect for main heading
    const mainHeading = document.getElementById('main-heading');
    scrambleText(mainHeading, 'CODE X', 2000);
    
    // Sequential word animation for tagline
    setTimeout(() => {
        const words = document.querySelectorAll('.tagline .word');
        words.forEach((word, index) => {
            const delay = parseInt(word.dataset.delay);
            setTimeout(() => {
                word.style.animationDelay = '0s';
                word.classList.add('animate');
            }, delay);
        });
    }, 2000);
}

// Character scramble effect
function scrambleText(element, finalText, duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    const textLength = finalText.length;
    let scrambleInterval;
    let currentText = '';
    
    element.classList.add('scrambling');
    
    // Initialize with random characters
    for (let i = 0; i < textLength; i++) {
        currentText += chars[Math.floor(Math.random() * chars.length)];
    }
    
    let startTime = Date.now();
    
    scrambleInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Determine how many characters should be final
        const finalCharCount = Math.floor(progress * textLength);
        
        let newText = '';
        
        for (let i = 0; i < textLength; i++) {
            if (i < finalCharCount) {
                newText += finalText[i];
            } else {
                newText += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        element.textContent = newText;
        
        if (progress >= 1) {
            clearInterval(scrambleInterval);
            element.textContent = finalText;
            element.classList.remove('scrambling');
        }
    }, 50);
}

// Form interactions
function initFormInteractions() {
    const emailInput = document.getElementById('email-input');
    const ctaButton = document.getElementById('cta-button');
    
    // Show button when user starts typing
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim().length > 0) {
            ctaButton.classList.add('visible');
        } else {
            ctaButton.classList.remove('visible');
        }
    });
    
    // Handle form submission
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        
        if (email && isValidEmail(email)) {
            // Simulate form submission
            ctaButton.textContent = 'Added to Waitlist!';
            ctaButton.style.background = 'rgba(0, 255, 255, 0.2)';
            ctaButton.style.cursor = 'default';
            emailInput.disabled = true;
            
            // Reset after 3 seconds
            setTimeout(() => {
                ctaButton.textContent = 'Request Early Access';
                ctaButton.style.background = 'transparent';
                ctaButton.style.cursor = 'pointer';
                emailInput.disabled = false;
                emailInput.value = '';
                ctaButton.classList.remove('visible');
            }, 3000);
        } else {
            // Show error state
            emailInput.style.borderColor = '#ff4444';
            emailInput.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.3)';
            
            setTimeout(() => {
                emailInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                emailInput.style.boxShadow = 'none';
            }, 2000);
        }
    });
    
    // Handle Enter key in email input
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && ctaButton.classList.contains('visible')) {
            ctaButton.click();
        }
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});