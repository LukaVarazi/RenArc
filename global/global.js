//loadanimation
document.addEventListener("DOMContentLoaded", function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  const elements = document.querySelectorAll(
    "body *:not(#navbar):not(#navbar *):not(svg):not(svg *)"
  );

  elements.forEach((el) => {
    el.classList.add("pre-animate");
    observer.observe(el);
  });
});

//rest
document.addEventListener("DOMContentLoaded", function () {
  const backToTopButton = document.querySelector(".back-to-top");
  const triggerSection = document.querySelector("#footer"); // You can change to any section

  function showOrHideButton() {
    const sectionTop = triggerSection.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;

    if (sectionTop < viewportHeight * 0.9) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", showOrHideButton);
  window.addEventListener("resize", showOrHideButton);
  showOrHideButton(); // Call on load just in case

  // Smooth scroll
  backToTopButton.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Email icons
  const emailIcons = document.querySelectorAll(".email-icon");
  emailIcons.forEach((icon) => {
    icon.addEventListener("click", function (e) {
      e.preventDefault();
      const email = this.getAttribute("data-email");
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          email
        )}`,
        "_blank"
      );
    });
  });

  // Phone icon
  const phoneIcon = document.querySelector(".phone-icon");
  if (phoneIcon) {
    if (typeof $ !== "undefined") {
      $(phoneIcon).tooltip({
        title: "Copied!",
        trigger: "click",
        placement: "top",
      });
    }

    phoneIcon.addEventListener("click", function () {
      const phoneNumber = this.getAttribute("data-phone");
      const tempInput = document.createElement("input");
      tempInput.value = phoneNumber;
      document.body.appendChild(tempInput);
      tempInput.select();

      try {
        document.execCommand("copy");
        if (typeof $ !== "undefined") {
          $(this).tooltip("show");
          setTimeout(() => {
            $(this).tooltip("hide");
          }, 1500);
        }
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
      document.body.removeChild(tempInput);
    });
  }
});
