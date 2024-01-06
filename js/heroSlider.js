var slideImg = document.getElementById("slideImg");
  
var images = new Array(
  "/Pictures/pic12.jpeg",
  "/Pictures/menu item2.jpeg",
  "/Pictures/menu item3.jpeg",
  "/Pictures/pic10.jpeg",
  "/Pictures/pic13.jpeg",
  "/Pictures/pic15.jpeg",
  "/Pictures/pic20.jpeg",
  "/Pictures/pic23.jpeg",
  "/Pictures/menu item9.jpeg"
);
var len = images.length;
var i = 0;
function slider() {
  if (i > len - 1) {
    i = 0;
  }
  slideImg.src = images[i];
  i++;
  setTimeout("slider()", 3000);
}