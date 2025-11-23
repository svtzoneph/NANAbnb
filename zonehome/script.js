// --- THEME SAVER ---
(function() {
    const savedTheme = localStorage.getItem('zoneVaultTheme');
    if(savedTheme) {
      const style = document.createElement('style');
      style.innerHTML = `
        body { 
          background: ${savedTheme} !important; 
          background-size: cover !important;
          background-attachment: fixed !important;
          background-repeat: no-repeat !important;
          min-height: 100vh;
        }
      `;
      document.head.appendChild(style);
    }
  })();

// --- SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered');
  
      reg.onupdatefound = () => {
        const newSW = reg.installing;
        newSW.onstatechange = () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content available, reloading...');
            window.location.reload();
          }
        };
      };
    }).catch(err => console.error('Service Worker registration failed:', err));
  }

// --- ACCORDION TOGGLE ---
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const acc = header.parentElement;
        const open = acc.classList.contains('open');
        document.querySelectorAll('.accordion').forEach(a => a.classList.remove('open'));
        if (!open) acc.classList.add('open');
    });
});

// --- IMAGE SLIDER ---
const thumbnailBoxes = document.querySelectorAll('.thumb-box');
const mainImage = document.getElementById('mainDisplay');
let current = 0;

const extraSlides = [
    'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/Trailer -Cover.jpg',
    'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/new-tour.png',
    'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/right-here.png',
    'https://raw.githubusercontent.com/svtzoneph/gallery/main/images/website/warning_gwangju.png'
];

// Only use the combined array for cycling images, thumbnails stay separate
const slideshowSources = [
    ...Array.from(thumbnailBoxes).map(box => box.querySelector('img').src),
    ...extraSlides
];

function switchImageByIndex(index) {
    const newSrc = slideshowSources[index];
    mainImage.classList.add('fade-out');
    setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.classList.remove('fade-out');
    }, 300);

    // Only highlight thumbnails if it's one of the visible thumbs
    thumbnailBoxes.forEach(b => b.classList.remove('active'));
    if (index < thumbnailBoxes.length) {
        thumbnailBoxes[index].classList.add('active');
    }
}

setInterval(() => {
    current = (current + 1) % slideshowSources.length;
    switchImageByIndex(current);
}, 2000);

// Manual switch from visible thumbnail
function switchImage(box) {
    const img = box.querySelector('img');
    mainImage.classList.add('fade-out');
    setTimeout(() => {
        mainImage.src = img.src;
        mainImage.classList.remove('fade-out');
    }, 300);

    thumbnailBoxes.forEach(b => b.classList.remove('active'));
    box.classList.add('active');
    current = slideshowSources.indexOf(img.src); // will keep cycling after this
}

// --- SIDEBAR ---
function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.toggle('open');
}

// --- SCROLL HEADER ---
let lastScrollY = window.scrollY;
const scrollHeader = document.getElementById('scrollHeader');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scroll Down → Hide header
        scrollHeader.classList.add('hide');
    } else {
        // Scroll Up → Show header smoothly
        scrollHeader.classList.remove('hide');
    }

    lastScrollY = currentScrollY;
});

// --- LINK FLASH EFFECT ---
const categoryLinks = document.querySelectorAll('.category-link');

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // prevent immediate jump

        // Remove flash class from all
        categoryLinks.forEach(l => l.classList.remove('flash'));

        // Add flash class to the clicked one
        link.classList.add('flash');

        // Remove it after a short delay (fade out effect)
        setTimeout(() => {
        link.classList.remove('flash');
        // Redirect after animation (if it's a real page)
        window.location.href = link.href;
        }, 800); // adjust delay to match transition
    });
});

// --- PREVENT SIDEBAR SCROLL PROPAGATION ---
const sidebarNav = document.querySelector('.sidebar-nav');

if(sidebarNav){
    sidebarNav.addEventListener('wheel', function (e) {
        const isAtTop = sidebarNav.scrollTop === 0;
        const isAtBottom = sidebarNav.scrollHeight - sidebarNav.scrollTop === sidebarNav.clientHeight;

        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault(); // Prevent page scroll when at the edges
        }
    }, { passive: false });
}

// --- MODALS (NOTICE & SECOND) ---
document.addEventListener("DOMContentLoaded", () => {
    const noticeModal = document.getElementById("noticeModal");
    const secondModal = document.getElementById("secondModal");

    // Check if modal has already been shown in this session
    if (!sessionStorage.getItem("modalShown")) {
        // Show the first modal automatically when page loads
        setTimeout(() => {
        noticeModal.style.display = "flex";
        setTimeout(() => (noticeModal.style.opacity = "1"), 100);
        }, 500); // delay for smooth load

        // Mark modal as shown
        sessionStorage.setItem("modalShown", "true");
    }

    // Function for "I Understand"
    window.showSecondModal = function() {
        noticeModal.style.opacity = "0";
        setTimeout(() => {
        noticeModal.style.display = "none";
        secondModal.style.display = "flex";
        setTimeout(() => (secondModal.style.opacity = "1"), 100);
        }, 400);
    };

    // Function for "Close"
    window.closeSecondModal = function() {
        secondModal.style.opacity = "0";
        setTimeout(() => (secondModal.style.display = "none"), 400);
    };
});

// --- ACCESS CONTROL LOGIC ---
const allowedPaths = [
    '/index.html',
    '/home.html',
    '/nanabnb.html',
    '/newtour.html',
    '/hxwfanconcert.html',
    '/svtholiday.html',
    '/arenatour.html',
    '/svtjapanconcert.html',
    '/touragain.html',
    '/gallery.html',
    '/profile.html',
    '/soon.html'
  ];

  const currentPage = window.location.pathname;

  // Check if user already has internalAccess flag
  let hasInternalAccess = sessionStorage.getItem('internalAccess') === 'true';

  // Check if user came from an allowed page
  const referrer = document.referrer;
  const refPath = referrer ? new URL(referrer).pathname : null;
  const cameFromAllowedPage = refPath && allowedPaths.includes(refPath);

  // Grant internalAccess if coming from allowed page
  if (cameFromAllowedPage) {
    sessionStorage.setItem('internalAccess', 'true');
    hasInternalAccess = true;
  }

  // Allow access if user already has internalAccess or is on index page
  const isIndexPage = currentPage.endsWith('index.html') || currentPage === '/';
  if (!hasInternalAccess && !isIndexPage) {
    showAccessDeniedModal();
  }

  function showAccessDeniedModal() {
    const modal = document.createElement('div');
    modal.className = 'access-denied-modal';
    modal.innerHTML = `
      <strong>🚫 Access Denied</strong>
      <div>You cannot access this page directly.<br>
      Please go through the homepage or allowed sections.</div>
      <div id="redirectTimer">Redirecting in 3 seconds...</div>
      <button onclick="goBack()">Go Back</button>
    `;
    document.body.appendChild(modal);

    let countdown = 3;
    const timer = document.getElementById('redirectTimer');
    const interval = setInterval(() => {
      countdown--;
      timer.textContent = `Redirecting in ${countdown} seconds...`;
      if (countdown <= 0) {
        clearInterval(interval);
        window.location.href = "index.html";
      }
    }, 1000);
  }

  function goBack() {
    window.history.back();
  }
