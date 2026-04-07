document.addEventListener("DOMContentLoaded", function() {
  /* --- Sleek Toast Notification Setup --- */
  
  // 1. Create the small toast blurb and add it to the bottom of the page
  const toast = document.createElement("div");
  toast.id = "toast-notification";
  toast.innerText = "🚧 Unit page is not yet ready. Check back soon!";
  document.body.appendChild(toast);

  // 2. Find all the links inside your unit lists
  const unitLinks = document.querySelectorAll(".major-units a");

  // 3. When a unit link is clicked, show the blurb for 3 seconds
  unitLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      // Stop the browser from trying to open a new tab or navigate
      event.preventDefault(); 
      
      // Make the toast slide up and appear
      toast.classList.add("show");
      
      // Automatically hide it after 3 seconds (3000 milliseconds)
      setTimeout(function() {
        toast.classList.remove("show");
      }, 3000);
    });
  });
});
