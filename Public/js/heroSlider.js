var slideImg = document.getElementById("slideImg");
  
var images = new Array(
  "/Public/Pictures/IMG_2303.JPG",
  "/Public/Pictures/pic13.jpeg",
  "/Public/Pictures/pic20.jpeg",
  "/Public/Pictures/IMG_1151.jpg",
  "/Public/Pictures/IMG_0311.jpg",
  "/Public/Pictures/menu item 2.jpeg",
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