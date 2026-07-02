
document.addEventListener('DOMContentLoaded', () => {
  
var allRelated = [];
  var mogoTimeout;

  function mogoRelated(json) {
    var currentUrl = "<data:post.url.canonical/>".replace(/\/$/, "");
    var entries = json.feed.entry || [];
    
    // 1. Saare labels se data collect karna
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var url = (entry.link.find(function(l) { return l.rel === 'alternate'; }) || {}).href || '';
      if (url && url.replace(/\/$/, "") !== currentUrl && !allRelated.some(function(r) { return r.url === url; })) {
        allRelated.push({ title: entry.title.$t, url: url });
      }
    }
    
    // 2. Debounce lagana taaki saari requests poori hone ke baad ek hi baar render ho
    clearTimeout(mogoTimeout);
    mogoTimeout = setTimeout(renderRelatedTools, 200);
  }

  function renderRelatedTools() {
    // 3. Array ko random mix (shuffle) karna taaki har baar same tools na dikhein
    allRelated.sort(function() { return 0.5 - Math.random(); });

    var html = '', count = 0, max = 4;
    for (var j = 0; j < allRelated.length && count < max; j++) {
      html += '<div style="border-left:3px solid #007bff; margin-top:5px; font-family: Inter; padding:9px 15px; background:#f9f9f9; border-radius:0 4px 4px 0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
              '<h4 style="font-size:14px; margin:0; font-family: Inter; line-height:1.4;">' +
              '<a href="' + allRelated[j].url + '" style="color:#333; text-decoration:none; font-weight:600; display:block;">' + allRelated[j].title + '</a>' +
              '</h4></div>';
      count++;
    }
    document.getElementById('related-posts-grid').innerHTML = html;
  }
  
  // --- Menu Logic Start ---

  const menuBtn = document.getElementById('mobile-menu-btn'); 
  const navMenu = document.getElementById('main-nav'); 

  if (menuBtn && navMenu) {
    // Hamburger Button Click
    menuBtn.onclick = (e) => {
      e.stopPropagation(); 
      navMenu.classList.toggle('active'); 
      menuBtn.classList.toggle('menu-open');
    };

    // Mobile Dropdown Toggle (AI Tools / Free Tools)
    // Aapki CSS 'li.dropdown' aur 'li.open' par depend hai
    const dropdownLinks = document.querySelectorAll('nav ul li.dropdown > a');
    
    dropdownLinks.forEach(link => {
      link.onclick = function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault(); // Link ko khulne se rokne ke liye
          e.stopPropagation();
          const parentLi = this.parentElement;
          parentLi.classList.toggle('open'); // CSS 'li.open' ko handle karegi
        }
      };
    });

    // Bahar click karne par sab band kar do
    window.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
          navMenu.classList.remove('active'); 
          menuBtn.classList.remove('menu-open');
          
          // Saare open dropdowns bhi band kar do
          document.querySelectorAll('nav ul li.open').forEach(li => {
            li.classList.remove('open');
          });
        }
      }
    }, true);
  }

// --- Menu Logic End ---
  
    // --- Search Logic Start ---
  const openSearchBtn = document.getElementById('openSearchBtn');
  const searchDropdown = document.getElementById('searchDropdown');
  const blurOverlay = document.getElementById('blurOverlay');
  const searchInput = document.getElementById('searchInput');

  if (openSearchBtn && searchDropdown) {
    // Search open/close toggle
    openSearchBtn.addEventListener('click', function(e) {
      e.stopPropagation(); 
      searchDropdown.classList.toggle('active');
      
      if (blurOverlay) blurOverlay.classList.toggle('active');
      
      // Focus on input when opened
      if (searchDropdown.classList.contains('active') && searchInput) {
        setTimeout(() => searchInput.focus(), 50); 
      }
    });

    // Bahar click karne par search band hona
    window.addEventListener('click', function(e) {
      if (searchDropdown.classList.contains('active')) {
        if (!searchDropdown.contains(e.target) && !openSearchBtn.contains(e.target)) {
          searchDropdown.classList.remove('active');
          if (blurOverlay) blurOverlay.classList.remove('active');
        }
      }
    }, true);
  }
// --- Search Logic End ---


  // --- 3. Accordion Logic ---
  const questions = document.querySelectorAll('.faq-question');
  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = q.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Pehle baaki sab band karein
      questions.forEach(otherQ => {
        otherQ.parentElement.classList.remove('active');
        if (otherQ.nextElementSibling) {
          otherQ.nextElementSibling.style.maxHeight = null;
        }
      });

      // Agar pehle active nahi tha toh kholein
      if (!isActive) {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + "px"; 
      }
    });
  });

  // --- 4. Back to Top Logic ---
  const scrollTopBtn = document.getElementById('back-to-top');
  if(scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

}); // DOMContentLoaded ends here

// --- 5. Global Functions (Share & Print) ---
// Inhe DOMContentLoaded ke bahar rakha jata hai taaki HTML onclick="sharePost()" kaam kare
function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    }).then(() => {
      console.log('Successfully shared');
    }).catch((error) => console.log('Error sharing:', error));
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Post link copied to clipboard!');
  }
}

function printPost() {
  const oldTitle = document.title;
  const h1Text = document.querySelector('h1')?.innerText?.trim();
  document.title = (h1Text ? h1Text : oldTitle.split('|')[0].trim()) + " | Mogotools.com";
  window.print();
  setTimeout(() => { document.title = oldTitle; }, 100);
}
