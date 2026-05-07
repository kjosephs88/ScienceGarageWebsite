// guard.js
const approvedEmails = ["kjosephs@ocsdny.org", "sbritton@ocsdny.org", "pianodemon88@gmail.com"];

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (approvedEmails.includes(user.email)) {
      // User is allowed, stay on page
      console.log("Access Granted");
      document.body.style.display = "block";
    } else {
      // Logged in but not approved
      alert("Access Denied: Your account is not authorized.");
      firebase.auth().signOut();
      window.location.href = "login.html";
    }
  } else {
    // Not logged in
    window.location.href = "login.html";
  }
});