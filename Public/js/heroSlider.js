var slideImg = document.getElementById("slideImg");
  
var images = new Array(
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
  "/Public/Pictures/IMG_3575.jpg",
);
var len = images.length;
var i = 0;
function slider() {
  if (i > len - 1) {
    i = 0;
  }
  slideImg.src = images[i];
  i++;
  setTimeout("slider()", 5000);
}