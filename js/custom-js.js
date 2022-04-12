function myFunction() {
  var x = document.querySelector("#toggleBtn");
  if (x.innerHTML === "Less") {
    x.innerHTML = "More";
  } else {
    x.innerHTML = "Less";
  }
}
new Typed("#typed", {
  strings: ["Web Developer", "Digital Marketer"],
  typeSpeed: 100,
  backSpeed: 50,
  backDelay: 2000,
  loop: true,
});
