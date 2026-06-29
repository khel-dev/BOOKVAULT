(() => {
  const header = document.querySelector("[data-elevate]");
  const yearEl = document.getElementById("year");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (!header) return;
    header.setAttribute("data-scrolled", window.scrollY > 6 ? "true" : "false");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    menu.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }
})();
