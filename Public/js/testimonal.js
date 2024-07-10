document.addEventListener('DOMContentLoaded', () => {
  console.log("JavaScript loaded and running");

  const testimonials = [
      {
          title: "CherriesOnTop is a good company",
          text: "I have been a customer of CherriesOnTop for a few years now and I have never been disappointed. The ice cream is always delicious and the service is always great. I would recommend CherriesOnTop to anyone looking for a good ice cream company.",
          author: "John Doe",
          stars: 5
      },
      {
          title: "Best ice cream ever!",
          text: "The variety of flavors is amazing and each one tastes better than the last. Highly recommend!",
          author: "Jane Smith",
          stars: 4
      },
      {
          title: "Fantastic service",
          text: "The staff are friendly and helpful. They always make sure you get exactly what you want.",
          author: "Tom Brown",
          stars: 5
      }
  ];

  let currentIndex = 0;

  function showTestimonial(index) {
      const testimonial = testimonials[index];
      document.getElementById('testimonial-title').innerText = testimonial.title;
      document.getElementById('testimonial-text').innerText = testimonial.text;
      document.getElementById('testimonial-author').innerText = testimonial.author;

      const starsContainer = document.getElementById('testimonial-stars');
      starsContainer.innerHTML = '';
      for (let i = 0; i < testimonial.stars; i++) {
          const star = document.createElement('span');
          star.innerHTML = '&#9733;';
          starsContainer.appendChild(star);
      }
  }

  function cycleTestimonials() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
  }

  showTestimonial(currentIndex);
  setInterval(cycleTestimonials, 5000); // Change testimonial every 5 seconds
});
