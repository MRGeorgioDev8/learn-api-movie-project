document.addEventListener("DOMContentLoaded", function() {
  gsap.set("#h1-animation", { opacity: 0 });

  gsap.to("#h1-animation", { duration: 1, opacity: 1, delay: 0.4, ease: "bounce.inOut" });

  gsap.set(".animation-search", {scale: 0, y:-100});

  gsap.to(".animation-search", {duration: 0.6, scale: 1, y:0, delay: 1.3, ease: "power2.inOut" });
});
