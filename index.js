/* --------------------------------------------------
   Dark Theatrical Portfolio Logic
   -------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation logic
  initNavigation();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize ambient interactive canvas background
  initAmbientCanvas();

  // Initialize interactive resume modal
  initResumeModal();

  // Initialize dynamic 3D skill cards
  initSkills3D();
});

/* --------------------------------------------------
   1. Navigation & Mobile Drawer
   -------------------------------------------------- */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Sticky Navbar class on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Scroll Spy active navigation state
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150; // offset for sticky nav

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Toggle mobile drawer
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
    // Toggle body scrolling to prevent backscroll when drawer is open
    document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile drawer on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll adjust for sticky header anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Hide mobile drawer if click is inside it
        hamburger.classList.remove('open');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';

        const headerOffset = 90; // approximate height of navbar
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --------------------------------------------------
   2. Scroll Triggered Entrance Animations
   -------------------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in-up');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // triggers slightly before entering viewport fully
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // stop observing once animated
        }
      });
    }, observerOptions);

    elements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    elements.forEach(element => {
      element.classList.add('active');
    });
  }
}

/* --------------------------------------------------
   3. Ambient Particle Canvas Background
   -------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 100 };
  let animationId = null;

  // Track if device is touch-only to optimize/disable mouse events
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Config based on screen width
  function getConfig() {
    const width = window.innerWidth;
    if (width < 768) {
      return {
        count: 22,             // Low count on mobile to prevent lag
        connectionDist: 85,    // Closer connections on small screens
        maxSpeed: 0.25,        // Slower movements
        particleRadius: 1.5
      };
    } else if (width < 1024) {
      return {
        count: 55,
        connectionDist: 100,
        maxSpeed: 0.4,
        particleRadius: 2.0
      };
    } else {
      return {
        count: 85,
        connectionDist: 120,
        maxSpeed: 0.5,
        particleRadius: 2.2
      };
    }
  }

  let config = getConfig();

  // Resize Handler with DPI support
  function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    
    // Scale drawings back down to visual space
    ctx.scale(scale, scale);
    
    // Reset config and rebuild particles
    config = getConfig();
    initParticles();
  }

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * config.maxSpeed;
      this.vy = (Math.random() - 0.5) * config.maxSpeed;
      this.radius = Math.random() * config.particleRadius + 0.8;
      
      // Select between cyber cyan and neon violet
      this.color = Math.random() > 0.5 ? 'rgba(6, 182, 212, ' : 'rgba(139, 92, 246, ';
      this.baseOpacity = Math.random() * 0.2 + 0.1; // quiet, theatrical ambient glow
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.baseOpacity + ')';
      ctx.fill();
    }

    update() {
      // Re-boundary checking
      if (this.x < 0 || this.x > window.innerWidth) this.vx = -this.vx;
      if (this.y < 0 || this.y > window.innerHeight) this.vy = -this.vy;

      // Mouse interactive repelling force (Desktops only, and if within radius)
      if (!isTouchDevice && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const forceX = (dx / dist) * force * 0.6;
          const forceY = (dy / dist) * force * 0.6;
          
          this.x -= forceX;
          this.y -= forceY;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Visual bound wrapping fallback
      if (this.x < 0) this.x = window.innerWidth;
      if (this.x > window.innerWidth) this.x = 0;
      if (this.y < 0) this.y = window.innerHeight;
      if (this.y > window.innerHeight) this.y = 0;

      this.draw();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < config.count; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDist) {
          // Line opacity fades out the further away particles get
          const opacity = (1 - (dist / config.connectionDist)) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          // Standard dark gradient style connection
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Draw connections and update nodes
    connectParticles();
    particles.forEach(particle => particle.update());
    
    animationId = requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', resizeCanvas);
  
  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // Initialize and run
  resizeCanvas();
  animate();
}

/* --------------------------------------------------
   4. Interactive Resume Download Handler
   -------------------------------------------------- */
/* --------------------------------------------------
   4. Interactive Resume Viewer Modal Handler
   -------------------------------------------------- */
function initResumeModal() {
  const showBtn = document.getElementById('show-resume-btn');
  const modal = document.getElementById('resume-modal');
  if (!showBtn || !modal) return;

  const closeBtn = document.getElementById('close-modal-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomLevel = document.getElementById('zoom-level');
  const pdfContainer = document.getElementById('pdf-scroll-container');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');

  let currentZoom = 100;

  // Open modal
  showBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
    // Force reflow
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  });

  // Close modal function
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scroll
    // Delay hiding display until opacity transition finishes
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.classList.add('hidden');
      }
    }, 300);
  };

  // Close event listeners
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    // Close only if clicking the overlay backdrop directly
    if (e.target === modal || e.target.classList.contains('modal-container')) {
      closeModal();
    }
  });

  // Escape key press to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Zoom controls
  if (zoomInBtn && zoomOutBtn && zoomLevel && pdfContainer) {
    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(currentZoom + 10, 150);
      zoomLevel.textContent = `${currentZoom}%`;
      pdfContainer.style.transform = `scale(${currentZoom / 100})`;
    });

    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(currentZoom - 10, 70);
      zoomLevel.textContent = `${currentZoom}%`;
      pdfContainer.style.transform = `scale(${currentZoom / 100})`;
    });
  }

  // Trigger download of PDF resume
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = './Resume.pdf';
      link.download = 'Vasanth_Kumar_R_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

/* --------------------------------------------------
   5. Dynamic 3D Skill Cards Perspective Parallax
   -------------------------------------------------- */
function initSkills3D() {
  const cards = document.querySelectorAll('.skill-card-3d');
  cards.forEach(card => {
    const inner = card.querySelector('.skill-card-3d-inner');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation: max 20 degrees in either direction
      const rotateX = ((centerY - y) / centerY) * 20;
      const rotateY = ((x - centerX) / centerX) * 20;
      
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}
