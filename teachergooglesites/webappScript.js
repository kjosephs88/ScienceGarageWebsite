// Function to swap the visible page natively
function switchView(viewName) {
  // 1. Hide all views
  const allViews = document.querySelectorAll('.view-section');
  allViews.forEach(view => {
    view.style.display = 'none';
  });
  
  // 2. Show the targeted view
  const targetView = document.getElementById(viewName + '-view');
  if (targetView) {
    targetView.style.display = 'block';
  }
  
  // 3. Close the sidebar automatically
  document.getElementById("mySidebar").classList.remove("open");
  
  // 4. Update the URL locally without reloading (Optional, but looks pro!)
  history.pushState(null, '', '?mode=' + viewName);
}

function handleFormSubmit(event) {
  event.preventDefault(); // Stop page refresh
  
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail'); // Grab the new email field
  const msgInput = document.getElementById('contactMessage');
  
  // UI Update
  btn.innerText = "Sending...";
  btn.disabled = true;
  status.innerText = "";
  
  // Package the data, including the email
  const data = {
    name: nameInput.value,
    email: emailInput.value,
    message: msgInput.value
  };
  
  // Send data to Code.gs
  google.script.run
    .withSuccessHandler(function(response) {
      status.innerText = "✓ Message Sent!";
      status.style.color = "var(--accent-teal)";
      btn.innerText = "Send Message";
      btn.disabled = false;
      nameInput.value = "";
      emailInput.value = ""; // Clear the email field
      msgInput.value = "";
    })
    .withFailureHandler(function(error) {
      status.innerText = "❌ Error sending message.";
      status.style.color = "red";
      btn.innerText = "Send Message";
      btn.disabled = false;
    })
    .submitContactForm(data);
}
// Event Listeners for DOM Load
document.addEventListener("DOMContentLoaded", function() {
  
  // Initialize the correct view based on the URL parameter injected by GAS
  const mode = window.initialAppMode || 'home';
  switchView(mode);

  // Sidebar Controls
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.getElementById("openNav");
  const closeBtn = document.getElementById("closeNav");

  if (openBtn) {
    openBtn.addEventListener("click", function() {
      sidebar.classList.add("open");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function(e) {
      e.preventDefault();
      sidebar.classList.remove("open");
    });
  }
  
  // Toast Notification Logic for Unit Links
  const toast = document.getElementById("toast-notification");
  const unitLinks = document.querySelectorAll(".major-units a");

  unitLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault(); 
      toast.classList.add("show");
      setTimeout(function() {
        toast.classList.remove("show");
      }, 3000);
    });
  });
});
