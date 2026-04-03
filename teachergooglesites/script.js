document.addEventListener("DOMContentLoaded", function() {
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.getElementById("openNav");
  const closeBtn = document.getElementById("closeNav");

  // Open sidebar
  if (openBtn) {
    openBtn.addEventListener("click", function() {
      sidebar.classList.add("open");
    });
  }

  // Close sidebar
  if (closeBtn) {
    closeBtn.addEventListener("click", function(e) {
      e.preventDefault();
      sidebar.classList.remove("open");
    });
  }
});