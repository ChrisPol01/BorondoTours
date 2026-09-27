/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".main-nav a[href*=" + sectionId + "]")
        .classList.add("active");
    } else {
      document
        .querySelector(".main-nav a[href*=" + sectionId + "]")
        .classList.remove("active");
    }
  });
}
window.addEventListener("scroll", scrollActive);
