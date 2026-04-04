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
document.addEventListener("DOMContentLoaded", function() {
  /* --- Pop-up Structure Creation --- */
  // Create the main overlay div
  const overlay = document.createElement("div");
  overlay.id = "under-construction-overlay";

  // Create the inner white box div
  const popup = document.createElement("div");
  popup.id = "under-construction-popup";

  // Add the content inside the white box
  popup.innerHTML = `
    <div class="construction-icon">🚧</div>
    <h2>Curriculum in Progress</h2>
    <p>We are still busy building out the resources and assignments for this specific unit. Check back soon for the latest labs and materials!</p>
    <a href="#" class="btn" id="close-construction-popup">Close</a>
  `;

  // Assemble the parts
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  /* --- Pop-up Logic --- */
  const constructionLinks = document.querySelectorAll(".major-units a");
  const closePopupBtn = document.getElementById("close-construction-popup");

  // Open pop-up when any relevant link is clicked
  constructionLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent navigating to a new page
      overlay.classList.add("show");
    });
  });

  // Close pop-up function (removed the transition logic as CSS handles it)
  function closePopup() {
    overlay.classList.remove("show");
  }

  // Close pop-up when the "Close" button is clicked
  closePopupBtn.addEventListener("click", function(event) {
    event.preventDefault();
    closePopup();
  });

  // Close pop-up if the user clicks the dark background
  overlay.addEventListener("click", function(event) {
    if (event.target === overlay) {
      closePopup();
    }
  });

  // Close pop-up if the user presses the 'Escape' key
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && overlay.classList.contains("show")) {
      closePopup();
    }
  });
});
