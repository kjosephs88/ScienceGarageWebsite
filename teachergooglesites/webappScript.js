// Function to swap the visible page natively
// Added 'isHistoryEvent' flag so the back button doesn't trap you in a loop
function switchView(viewName, isHistoryEvent = false) {
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
  
  // 3. Close the sidebar automatically (ONLY on mobile screens)
  if (window.innerWidth < 850) {
    document.getElementById("mySidebar").classList.remove("open");
  }
  
  // 4. Update the URL locally so the Back button remembers where we were
  if (!isHistoryEvent) {
    history.pushState({ mode: viewName }, '', '?mode=' + viewName);
  }
  
  // 5. Scroll to the top of the page on view switch
  window.scrollTo(0, 0);
}

// Listen for the browser's Back/Forward buttons!
window.addEventListener('popstate', function(event) {
  // If the browser remembers the state, use it. Otherwise, go home.
  const mode = (event.state && event.state.mode) ? event.state.mode : (window.initialAppMode || 'home');
  // Switch the view, passing 'true' so we don't mess up the history chain
  switchView(mode, true); 
});

// Function to handle the Contact Form
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
  status.style.color = "#333";
  
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
  
  // Initialize the first view and replace the blank history state
  const mode = window.initialAppMode || 'home';
  history.replaceState({ mode: mode }, '', '?mode=' + mode);
  switchView(mode, true);

  // Auto-open the sidebar on desktop when the site first loads
  if (window.innerWidth >= 850) {
    document.getElementById("mySidebar").classList.add("open");
  }

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
