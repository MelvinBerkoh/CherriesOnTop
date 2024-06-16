document.addEventListener("DOMContentLoaded", function() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  
  faqQuestions.forEach(question => {
      question.addEventListener("click", function() {
          this.classList.toggle("active");
          const answer = this.nextElementSibling;
          if (answer.style.maxHeight) {
              answer.style.maxHeight = null;
          } else {
              answer.style.maxHeight = answer.scrollHeight + "px";
          }
      });
  });
});