const AppShell = {
  render() {
    return `
      <header>
        <nav class="nav-wrapper">
          <a href="#/" class="brand-logo">Story App</a>
          <ul class="right" id="nav-menu"></ul>
        </nav>
      </header>
      <main id="main-content" tabindex="-1"></main>
      <footer class="footer">
        <p>&copy; 2024 Story App. All rights reserved.</p>
      </footer>
    `;
  }
};

export default AppShell; 