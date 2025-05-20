import './styles/main.css';
import './styles/transitions.css';
import routes from './routes.js';
import 'leaflet/dist/leaflet.css';
import Auth from './src/utils/auth.js';
import AppShell from './src/views/app-shell.js';

if (!document.getElementById('main-content')) {
  document.body.innerHTML = AppShell.render();
}

const main = document.getElementById('main-content');
const skipLink = document.querySelector('.skip-to-content');
const mainContent = document.getElementById('main-content');

skipLink.addEventListener('click', function (event) {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth' });
});

function parseActiveUrl() {
  const url = window.location.hash.slice(1).toLowerCase() || '/';
  const urlParts = url.split('/');
  return urlParts.length > 2
    ? `/${urlParts[1]}/:id`
    : `/${urlParts[1] || ''}`;
}

function renderNavigation() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const user = Auth.getUser();
  nav.innerHTML = `
    <div class="nav-wrapper">
      <a href="#/" class="brand-logo">Story App</a>
      <ul class="right">
        ${user ? `
          <li><a href="#/add">Tambah Cerita</a></li>
          <li><a href="#/offline-stories">Offline Stories</a></li>
          <li><a href="#" id="logout">Logout</a></li>
        ` : `
          <li><a href="#/login">Login</a></li>
          <li><a href="#/register">Register</a></li>
        `}
      </ul>
    </div>
  `;
  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      window.location.hash = '/login';
    });
  }
}

async function renderPage() {
  const activeRoute = parseActiveUrl();
  const page = routes[activeRoute];
  if (page) {
    if (page.checkAuth && !Auth.isAuthenticated()) {
      window.location.hash = '/login';
      return;
    }
    try {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          main.innerHTML = await page.render();
          if (page.afterRender) await page.afterRender();
        });
        transition.ready.then(() => {
          console.log('View transition is ready');
        });
        transition.finished.then(() => {
          console.log('View transition is finished');
        });
      } else {
        main.innerHTML = await page.render();
        if (page.afterRender) await page.afterRender();
      }
    } catch (error) {
      console.error('Error during page transition:', error);
      main.innerHTML = `<h2>Terjadi kesalahan saat memuat halaman</h2>`;
    }
  } else {
    main.innerHTML = `<h2>404 Halaman Tidak Ditemukan</h2>`;
  }
  renderNavigation();
}

window.addEventListener('hashchange', renderPage);
requestAnimationFrame(renderPage);