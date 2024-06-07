var slideImg = document.getElementById("slideImg");
  
var images = new Array(
  "/Public/Pictures/pic10.jpeg",
  "/Public/Pictures/pic13.jpeg",
  "/Public/Pictures/pic20.jpeg",
  "/Public/Pictures/menu item7.jpeg",
  "/Public/Pictures/menu item6.jpeg",
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