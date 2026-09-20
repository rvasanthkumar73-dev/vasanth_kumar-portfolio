/* --------------------------------------------------
   Dark Theatrical Portfolio Logic
   -------------------------------------------------- */

function bootPortfolio() {
  initNavigation();
  initScrollAnimations();
  initTypewriterTitles();
  initHeroMetricsCountUp();
  initAmbientCanvas();
  initResumeModal();
  initSkills3D();
  initCertVault();
  initFooterRobotObserver();
  optimizeSplineDPR();
  initProjectVideoObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPortfolio, { passive: true });
} else {
  bootPortfolio();
}

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
    anchor.addEventListener('click', function (e) {
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
      threshold: 0.01,
      rootMargin: '100px 0px 100px 0px' // triggers instantly as elements approach viewport
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

  function updateParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    connectParticles();
    particles.forEach(particle => particle.update());
  }

  function animate() {
    updateParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Event Listeners with Passive Touch & Mouse Support
  window.addEventListener('resize', resizeCanvas, { passive: true });

  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });
  } else {
    // Preserve touch-interaction on mobile devices for finger touches
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });
  }

  // Initialize and paint initial frame instantly
  resizeCanvas();
  connectParticles();
  particles.forEach(particle => particle.draw());
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
      link.href = './Resume.pdf?v=2';
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
    if (!inner) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isHovered = false;

    function updateTilt() {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      inner.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;

      if (isHovered || Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        requestAnimationFrame(updateTilt);
      } else if (!isHovered) {
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      targetX = ((centerY - y) / centerY) * 16;
      targetY = ((x - centerX) / centerX) * 16;

      if (!isHovered) {
        isHovered = true;
        requestAnimationFrame(updateTilt);
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    }, { passive: true });
  });
}

/* --------------------------------------------------
   6. 3D CoverFlow Certificate Vault & Lightbox Modal
   -------------------------------------------------- */
const CERTIFICATES_DATA = [
  {
    id: "cert-anudip-frontend",
    title: "Advance Frontend Development",
    issuer: "Anudip | Mettl Certified",
    badge: "Grade A1 (249 Hrs)",
    issueDate: "May 21, 2026",
    image: "./assets/certificates/cert_9_anudip_frontend.png",
    description: "Comprehensive 249-hour certification (Student ID: AF05103953) with Grade A1. In-depth mastery of advanced HTML5/CSS3, JavaScript ES6+, React component lifecycle, responsive design systems, and state management."
  },
  {
    id: "cert-kaggle-vibe",
    title: "5-Day AI Agents: Intensive Vibe Coding",
    issuer: "Kaggle | Google",
    badge: "Badge Earned",
    issueDate: "Jul 30, 2026",
    image: "./assets/certificates/cert_8_kaggle_ai.png",
    description: "Official Kaggle & Google AI certification for completing the intensive 5-day AI Agents course. Covered autonomous agent orchestration, multi-tool function calling, stateful memory graphs, and prompt engineering."
  },
  {
    id: "cert-dbms",
    title: "Data Base Management System",
    issuer: "NPTEL (SWAYAM) — IIT Kharagpur",
    badge: "Elite Certificate (67%)",
    issueDate: "Jul - Sep 2024",
    image: "./assets/certificates/cert_1_dbms.png",
    description: "Elite NPTEL 8-week course certification (Roll No: NPTEL24CS75S249500369) funded by MoE, Govt. of India. Covers relational algebra, SQL optimization, indexing structures, transaction management, and concurrency control."
  },
  {
    id: "cert-pgdca",
    title: "PGDCA - Diploma Certificate",
    issuer: "VCTC (Approved by BSS NDA, Govt. of India)",
    badge: "Grade A",
    issueDate: "Nov 2016 - Nov 2017",
    image: "./assets/certificates/cert_2_pgdca.png",
    description: "Post Graduate Diploma in Computer Applications (Reg. No. 802). In-depth mastery covering Computer Fundamentals, Windows, MS Office, C, C++, VB, Java, MS-DOS, HTML, Hardware Concepts & Internet."
  },
  {
    id: "cert-ibm-ai",
    title: "Artificial Intelligence Fundamentals",
    issuer: "IBM SkillsBuild",
    badge: "Credly Verified",
    issueDate: "Oct 08, 2025",
    image: "./assets/certificates/cert_4_ibm_ai.png",
    description: "Professional IBM certification recognizing commitment to AI excellence. Mastery of Artificial Intelligence fundamentals, machine learning workflows, neural network architectures, and practical AI application frameworks."
  },
  {
    id: "cert-fullstack-novitech",
    title: "Full Stack Development Internship",
    issuer: "NoviTech R&D Private Limited",
    badge: "ISO 9001:2015 Certified",
    issueDate: "Jun 29 - Jul 29, 2025",
    image: "./assets/certificates/cert_3_fullstack.png",
    description: "One-month industry internship (NT_FSDIN119) in Full Stack Development. Hands-on experience in modern frontend web architecture, backend RESTful APIs, database design, and end-to-end web deployment."
  },
  {
    id: "cert-be10x",
    title: "AI Tools & ChatGPT Workshop",
    issuer: "be10x (Verified)",
    badge: "Workshop Certified",
    issueDate: "Sep 13, 2026",
    image: "./assets/certificates/cert_be10x.png",
    description: "Certificate of Completion awarded by be10x for mastering AI tools & ChatGPT. Ability to create AI presentations in under 5 min, analyze data using AI in under 30 min, and code/debug using AI in under 10 min."
  },
  {
    id: "cert-n8n",
    title: "Automate Everything With n8n",
    issuer: "LetsUpgrade x NSDC (Collab with GDG MAD)",
    badge: "Workflow Specialist",
    issueDate: "May 17, 2026",
    image: "./assets/certificates/cert_5_n8n.png",
    description: "Certified completion (No: LUEN8NMAY126266) in collaboration with NSDC, ITM Edutech, & GDG MAD. Specialized in building autonomous n8n workflows, generative AI node integrations, webhooks, and automated data pipelines."
  },
  {
    id: "cert-lnt-bootcamp",
    title: "Full-Stack Web Dev Bootcamp",
    issuer: "L&T EduTech",
    badge: "Pathway Certified",
    issueDate: "2025",
    image: "./assets/certificates/cert_6_lnt_fullstack.png",
    description: "Certificate of Course Pathway Completion (CID: LTE/EI/1000) covering 8 full-stack courses and 33 hours of learning in HTML, CSS, JS, PHP, and WordPress web architecture."
  },
  {
    id: "cert-novitech-ml",
    title: "30 Days MasterClass in Machine Learning",
    issuer: "NoviTech R&D Private Limited",
    badge: "ISO 9001:2015 Certified",
    issueDate: "Mar 10 - Apr 14, 2025",
    image: "./assets/certificates/cert_7_novitech_ml.png",
    description: "Intensive 30-day MasterClass (NT_B4ML374) in Machine Learning. Covered supervised and unsupervised learning algorithms, regression, classification, feature engineering, and model evaluation metrics."
  }
];

function initCertVault() {
  const container = document.getElementById('cert-vault-root');
  if (!container) return;

  let currentIndex = 0; // Starts at 1st certificate (DBMS)

  // Generate cards HTML (exactly 9 cards, no duplicates!)
  const cardsHTML = CERTIFICATES_DATA.map((item, idx) => {
    return `
      <div class="cert-vault-card-wrapper" data-index="${idx}">
        <div class="cert-vault-card" data-id="${item.id}">
          <div class="cert-vault-glow-layer"></div>
          <div class="cert-vault-image-box">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="cert-vault-img"/>
            <div class="cert-vault-img-overlay"></div>
            <span class="cert-vault-badge"><i class="fa-solid fa-award"></i> ${item.badge}</span>
            <span class="cert-vault-date">${item.issueDate}</span>
          </div>
          <div class="cert-vault-body">
            <div class="cert-vault-issuer">
              <i class="fa-solid fa-graduation-cap"></i>
              <span>${item.issuer}</span>
            </div>
            <h3 class="cert-vault-title">${item.title}</h3>
            <p class="cert-vault-desc">${item.description}</p>
            <div class="cert-vault-action">
              <span class="cert-vault-btn">
                <span>Inspect Certificate</span>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Step dots HTML for 9 certificates
  const stepDotsHTML = CERTIFICATES_DATA.map((item, idx) => {
    const shortTitle = item.title.length > 20 ? item.title.substring(0, 18) + '...' : item.title;
    return `
      <button class="cert-vault-step-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Go to ${item.title}">
        <span>${idx + 1}</span>
        <span class="cert-vault-dot-tooltip">${shortTitle}</span>
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cert-vault-coverflow-viewport" id="cert-vault-viewport">
      <!-- Fixed Left and Right Navigation Buttons -->
      <button id="cert-vault-prev-btn" class="cert-vault-nav-btn cert-vault-prev-btn" aria-label="Previous Certificate">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button id="cert-vault-next-btn" class="cert-vault-nav-btn cert-vault-next-btn" aria-label="Next Certificate">
        <i class="fa-solid fa-chevron-right"></i>
      </button>

      <div class="cert-vault-coverflow-track" id="cert-vault-track">
        ${cardsHTML}
      </div>
    </div>

    <!-- Creative Custom Horizontal Scrollbar & Progress Indicator -->
    <div class="cert-vault-scrollbar-section">
      <div class="cert-vault-scroll-track-bg" id="cert-vault-scroll-track">
        <div class="cert-vault-scroll-fill" id="cert-vault-scroll-fill" style="width: 0%;"></div>
      </div>
      <div class="cert-vault-step-dots" id="cert-vault-step-dots">
        ${stepDotsHTML}
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div id="cert-vault-modal" class="cert-vault-modal-backdrop cert-vault-hidden" role="dialog" aria-modal="true">
      <div class="cert-vault-modal-content">
        <button id="cert-vault-modal-close" class="cert-vault-modal-close-btn" aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="cert-vault-modal-body">
          <div class="cert-vault-modal-preview">
            <img id="cert-vault-modal-img" src="" alt="Certificate View" />
          </div>
          <div class="cert-vault-modal-info">
            <div class="cert-vault-modal-header-tags">
              <span id="cert-vault-modal-badge" class="cert-vault-badge"></span>
              <span id="cert-vault-modal-date" class="cert-vault-date"></span>
            </div>
            <h2 id="cert-vault-modal-title" class="cert-vault-modal-title"></h2>
            <div id="cert-vault-modal-issuer" class="cert-vault-issuer cert-vault-modal-issuer"></div>
            <div class="cert-vault-modal-divider"></div>
            <p id="cert-vault-modal-desc" class="cert-vault-modal-desc-text"></p>
            <div class="cert-vault-modal-actions">
              <button class="cert-vault-modal-action-btn" id="cert-vault-modal-verify-btn">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Verified Credential</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const viewport = container.querySelector('#cert-vault-viewport');
  const prevBtn = container.querySelector('#cert-vault-prev-btn');
  const nextBtn = container.querySelector('#cert-vault-next-btn');
  const cardWrappers = container.querySelectorAll('.cert-vault-card-wrapper');
  const scrollFill = container.querySelector('#cert-vault-scroll-fill');
  const stepDots = container.querySelectorAll('.cert-vault-step-dot');
  const scrollTrack = container.querySelector('#cert-vault-scroll-track');

  // Update CoverFlow 3D Positions & Scale Highlight
  function updateCoverflow() {
    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? 250 : 340;

    cardWrappers.forEach((wrapper, idx) => {
      const offset = idx - currentIndex;
      const card = wrapper.querySelector('.cert-vault-card');

      if (offset === 0) {
        // Active Center Focus Card (Scaled Up & Highlighted!)
        wrapper.style.transform = `translateX(0px) scale(1.14) translateZ(40px)`;
        wrapper.style.opacity = '1';
        wrapper.style.zIndex = '10';
        wrapper.style.filter = 'none';
        wrapper.style.pointerEvents = 'auto';
        if (card) card.classList.add('cert-vault-card-active');
      } else if (offset === -1) {
        // Immediate Left Card
        wrapper.style.transform = `translateX(-${spacing}px) scale(0.86) rotateY(18deg)`;
        wrapper.style.opacity = '0.6';
        wrapper.style.zIndex = '5';
        wrapper.style.filter = 'brightness(0.7) blur(0.5px)';
        wrapper.style.pointerEvents = 'auto';
        if (card) card.classList.remove('cert-vault-card-active');
      } else if (offset === 1) {
        // Immediate Right Card
        wrapper.style.transform = `translateX(${spacing}px) scale(0.86) rotateY(-18deg)`;
        wrapper.style.opacity = '0.6';
        wrapper.style.zIndex = '5';
        wrapper.style.filter = 'brightness(0.7) blur(0.5px)';
        wrapper.style.pointerEvents = 'auto';
        if (card) card.classList.remove('cert-vault-card-active');
      } else {
        // Further Cards (Hidden/Faded)
        const sign = offset < 0 ? -1 : 1;
        wrapper.style.transform = `translateX(${sign * spacing * 1.6}px) scale(0.7) rotateY(${-sign * 25}deg)`;
        wrapper.style.opacity = '0';
        wrapper.style.zIndex = '1';
        wrapper.style.pointerEvents = 'none';
        if (card) card.classList.remove('cert-vault-card-active');
      }
    });

    // Update Navigation Buttons state
    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
      prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
      prevBtn.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex === CERTIFICATES_DATA.length - 1;
      nextBtn.style.opacity = currentIndex === CERTIFICATES_DATA.length - 1 ? '0.35' : '1';
      nextBtn.style.cursor = currentIndex === CERTIFICATES_DATA.length - 1 ? 'not-allowed' : 'pointer';
    }

    // Update Progress Bar Fill Width & Step Dots
    const progressPct = (currentIndex / (CERTIFICATES_DATA.length - 1)) * 100;
    if (scrollFill) {
      scrollFill.style.width = `${progressPct}%`;
    }

    stepDots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Navigation Button Handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCoverflow();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < CERTIFICATES_DATA.length - 1) {
        currentIndex++;
        updateCoverflow();
      }
    });
  }

  // Step Dot Click Handlers
  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        currentIndex = idx;
        updateCoverflow();
      }
    });
  });

  // Track bar click handler
  if (scrollTrack) {
    scrollTrack.addEventListener('click', (e) => {
      const rect = scrollTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      const targetIndex = Math.round(pct * (CERTIFICATES_DATA.length - 1));
      currentIndex = Math.max(0, Math.min(CERTIFICATES_DATA.length - 1, targetIndex));
      updateCoverflow();
    });
  }

  // Touch Swipe & Drag Handlers
  let touchStartX = 0;
  let touchEndX = 0;

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentIndex < CERTIFICATES_DATA.length - 1) {
          currentIndex++; // Swipe Left -> Next
          updateCoverflow();
        } else if (diff < 0 && currentIndex > 0) {
          currentIndex--; // Swipe Right -> Prev
          updateCoverflow();
        }
      }
    }
  }

  // Card click handler: click center card opens modal; click side card centers it!
  cardWrappers.forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      const idx = parseInt(wrapper.getAttribute('data-index'), 10);
      if (idx === currentIndex) {
        // Open Lightbox Modal for focused center card
        const certId = wrapper.querySelector('.cert-vault-card').getAttribute('data-id');
        const itemData = CERTIFICATES_DATA.find(c => c.id === certId);
        if (itemData) {
          openModal(itemData);
        }
      } else {
        // Shift focus to clicked card
        currentIndex = idx;
        updateCoverflow();
      }
    });
  });

  // Attach 3D Mouse Tilt effect ONLY to focused active card
  const cards = container.querySelectorAll('.cert-vault-card');
  cards.forEach(card => {
    const glow = card.querySelector('.cert-vault-glow-layer');

    card.addEventListener('mousemove', (e) => {
      if (!card.classList.contains('cert-vault-card-active')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(139, 92, 246, 0.4), transparent 70%)`;
        glow.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      if (glow) glow.style.opacity = '0';
    });
  });

  // Modal logic
  const modal = document.getElementById('cert-vault-modal');
  const closeBtn = document.getElementById('cert-vault-modal-close');
  const modalImg = document.getElementById('cert-vault-modal-img');
  const modalBadge = document.getElementById('cert-vault-modal-badge');
  const modalDate = document.getElementById('cert-vault-modal-date');
  const modalTitle = document.getElementById('cert-vault-modal-title');
  const modalIssuer = document.getElementById('cert-vault-modal-issuer');
  const modalDesc = document.getElementById('cert-vault-modal-desc');

  function openModal(data) {
    if (!modal) return;
    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalBadge.innerHTML = `<i class="fa-solid fa-award"></i> ${data.badge}`;
    modalDate.textContent = data.issueDate;
    modalTitle.textContent = data.title;
    modalIssuer.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${data.issuer}`;
    modalDesc.textContent = data.description;

    modal.classList.remove('cert-vault-hidden');
    modal.offsetHeight; // force reflow
    modal.classList.add('cert-vault-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('cert-vault-active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modal.classList.contains('cert-vault-active')) {
        modal.classList.add('cert-vault-hidden');
      }
    }, 300);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('cert-vault-active')) {
      closeModal();
    } else if (e.key === 'ArrowLeft' && modal && modal.classList.contains('cert-vault-hidden')) {
      if (currentIndex > 0) { currentIndex--; updateCoverflow(); }
    } else if (e.key === 'ArrowRight' && modal && modal.classList.contains('cert-vault-hidden')) {
      if (currentIndex < CERTIFICATES_DATA.length - 1) { currentIndex++; updateCoverflow(); }
    }
  });

  window.addEventListener('resize', updateCoverflow);

  // Initialize view
  updateCoverflow();
}

/* --------------------------------------------------
   Terminal Typewriter Animation for Section Titles
   -------------------------------------------------- */
function initTypewriterTitles() {
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Store original title text for layout preservation
  titles.forEach(title => {
    const textSpan = title.querySelector('.text-gradient') || title;
    if (!title.dataset.originalText) {
      title.dataset.originalText = textSpan.textContent.trim();
    }
  });

  if (prefersReducedMotion) return;

  function runTypewriter(title, force = false) {
    const originalText = title.dataset.originalText;
    if (!originalText) return;

    // Skip if already animated unless forced (e.g., via navbar click)
    if (title.dataset.hasTyped === 'true' && !force) return;
    title.dataset.hasTyped = 'true';

    // Clear any active animation timers on this title
    if (title._typewriterTimer) clearInterval(title._typewriterTimer);
    if (title._cursorTimer) clearTimeout(title._cursorTimer);

    let textSpan = title.querySelector('.text-gradient');
    if (!textSpan) {
      textSpan = document.createElement('span');
      textSpan.className = 'text-gradient';
      title.innerHTML = '';
      title.appendChild(textSpan);
    }

    let cursorSpan = title.querySelector('.title-cursor');
    if (!cursorSpan) {
      cursorSpan = document.createElement('span');
      cursorSpan.className = 'title-cursor';
      cursorSpan.textContent = '_';
    }

    cursorSpan.classList.remove('fade-out');
    textSpan.textContent = '';

    if (cursorSpan.parentNode !== title) {
      title.appendChild(cursorSpan);
    }

    let charIndex = 0;
    const speed = 85; // 85ms per character (relaxed, measured natural terminal cadence)

    title._typewriterTimer = setInterval(() => {
      charIndex++;
      textSpan.textContent = originalText.substring(0, charIndex);

      if (charIndex >= originalText.length) {
        clearInterval(title._typewriterTimer);
        title._typewriterTimer = null;

        // Keep blinking cursor visible for ~700ms after text finishes before fade-out
        title._cursorTimer = setTimeout(() => {
          cursorSpan.classList.add('fade-out');
          title._cursorTimer = setTimeout(() => {
            if (cursorSpan.parentNode) {
              cursorSpan.parentNode.removeChild(cursorSpan);
            }
          }, 350);
        }, 700);
      }
    }, speed);
  }

  // Trigger via IntersectionObserver (threshold: 0.25)
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.25,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runTypewriter(entry.target);
        }
      });
    }, observerOptions);

    titles.forEach(title => observer.observe(title));
  } else {
    titles.forEach(title => runTypewriter(title));
  }

  // Navbar link click immediate trigger
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function () {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        const title = targetSection.querySelector('.section-title');
        if (title) {
          runTypewriter(title, true);
        }
      }
    });
  });
}

/* --------------------------------------------------
   Hero Luminous Electric Metrics Count-Up & Spline Clean
   -------------------------------------------------- */
function initHeroMetricsCountUp() {
  const container = document.getElementById('hero-metrics');

  // Inject style specifically into splineViewer.shadowRoot to hide only the logo/watermark link
  function injectSplineShadowStyle() {
    const splineViewer = document.querySelector('spline-viewer');
    if (splineViewer) {
      function applyStyle() {
        if (splineViewer.shadowRoot) {
          const existing = splineViewer.shadowRoot.querySelector('#clean-spline-style');
          if (!existing) {
            const style = document.createElement('style');
            style.id = 'clean-spline-style';
            style.textContent = '#logo, #watermark, a[href*="spline.design"] { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }';
            splineViewer.shadowRoot.appendChild(style);
          }
        }
      }
      applyStyle();
      splineViewer.addEventListener('load', applyStyle);
    }
  }

  // Run shadow DOM injection
  injectSplineShadowStyle();
  setTimeout(injectSplineShadowStyle, 500);
  setTimeout(injectSplineShadowStyle, 1500);
  setTimeout(injectSplineShadowStyle, 3000);

  if (!container) return;

  const counters = container.querySelectorAll('.cyan-metric-text[data-target], [data-target]');
  if (!counters.length) return;

  let hasAnimated = false;

  function animateCounters() {
    if (hasAnimated) return;
    hasAnimated = true;

    const duration = 1800; // ~1.8 seconds smooth cubic ease-out
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        const suffix = counter.dataset.suffix || '';
        const currentValue = Math.floor(easeProgress * target);
        counter.textContent = `${currentValue}${suffix}`;
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counters.forEach(counter => {
          const target = counter.dataset.target;
          const suffix = counter.dataset.suffix || '';
          counter.textContent = `${target}${suffix}`;
        });
      }
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);
  } else {
    animateCounters();
  }
}

/* --------------------------------------------------
   Viewport-Aware Footer Bot Rendering (GPU Optimization & Jitter Fix)
   -------------------------------------------------- */
function initFooterRobotObserver() {
  const robotContainer = document.querySelector('.contact-robot-container');
  const iframeWrapper = document.querySelector('.robot-iframe-wrapper');
  if (!robotContainer || !iframeWrapper) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          iframeWrapper.style.display = 'block';
          iframeWrapper.style.visibility = 'visible';
          iframeWrapper.style.pointerEvents = 'auto';
        } else {
          iframeWrapper.style.display = 'none';
          iframeWrapper.style.visibility = 'hidden';
          iframeWrapper.style.pointerEvents = 'none';
        }
      });
    }, {
      root: null,
      rootMargin: '200px 0px 200px 0px',
      threshold: 0
    });

    observer.observe(robotContainer);
  }
}

/* --------------------------------------------------
   Mobile Hardware Acceleration & DPR Cap for WebGL
   -------------------------------------------------- */
function optimizeSplineDPR() {
  const maxDPR = window.devicePixelRatio > 2 ? 1.5 : Math.min(window.devicePixelRatio || 1, 1.5);
  const splineViewers = document.querySelectorAll('spline-viewer');

  splineViewers.forEach(viewer => {
    viewer.setAttribute('dpr', maxDPR.toString());

    const enforceDPR = () => {
      if (viewer.shadowRoot) {
        const canvas = viewer.shadowRoot.querySelector('canvas');
        if (canvas) {
          canvas.style.touchAction = 'pan-y';
        }
      }
    };
    enforceDPR();
    viewer.addEventListener('load', enforceDPR);
  });
}

/* --------------------------------------------------
   Viewport-Aware Project Demo Video Playback Throttling
   -------------------------------------------------- */
function initProjectVideoObserver() {
  const projectVideo = document.querySelector('.projects-section video');
  if (!projectVideo) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          projectVideo.play().catch(() => { });
        } else {
          projectVideo.pause();
        }
      });
    }, {
      root: null,
      rootMargin: '300px 0px 300px 0px',
      threshold: 0
    });

    observer.observe(projectVideo);
  }
}
