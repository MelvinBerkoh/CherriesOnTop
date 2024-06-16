// script.js
document.addEventListener("DOMContentLoaded", function() {
  const backToTopButton = document.getElementById("back-to-top");

  // Show or hide the "Back to Top" button based on scroll position
  window.addEventListener("scroll", function() {
      if (window.scrollY > 300) {
          backToTopButton.style.display = "block";
          backToTopButton.style.opacity = "1";
      } else {
          backToTopButton.style.opacity = "0";
          setTimeout(() => {
              backToTopButton.style.display = "none";
          }, 300); // Wait for the transition to complete before hiding
      }
  });

  // Smooth scroll to the top of the page
  backToTopButton.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
