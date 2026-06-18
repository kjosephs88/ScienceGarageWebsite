// guard.js
const approvedEmails = ["kjosephs@ocsdny.org", "pianodemon88@gmail.com"];

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (approvedEmails.includes(user.email)) {
      console.log("Access Granted");
      // Reveal the body content once authenticated
      if (document.body) {
        document.body.style.display = "block";
      }
    } else {
      // If they are logged into Google but NOT on your list
      alert("Access Denied: Your account is not authorized.");
      firebase.auth().signOut().then(() => {
        window.location.replace("login.html");
      });
    }
  } else {
    // Only redirect if we are NOT already on the login page
    if (!window.location.pathname.includes("login.html")) {
      window.location.replace("login.html");
    }
  }
});