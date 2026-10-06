export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  width: number;
  height: number;
};

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: "celebration-service",
    src: "/images/gallery/celebration-service.jpg",
    alt: "Guests gathering at the Cherries On Top trailer outdoors",
    caption: "A little sweetness for the occasion.",
    category: "Celebrations",
    width: 3264,
    height: 2448,
  },
  {
    id: "chocolate-milkshakes",
    src: "/images/gallery/chocolate-milkshakes.jpg",
    alt: "Two milkshakes topped with whipped cream and chocolate drizzle",
    caption: "Made for chocolate lovers.",
    category: "Treats",
    width: 3024,
    height: 4032,
  },
  {
    id: "vintage-trailer",
    src: "/images/gallery/vintage-trailer.jpg",
    alt: "The vintage Cherries On Top trailer parked at an outdoor event",
    caption: "Our happy place, on wheels.",
    category: "The trailer",
    width: 960,
    height: 720,
  },
  {
    id: "waffle-sundae",
    src: "/images/gallery/waffle-sundae.jpg",
    alt: "An ice cream sundae served on a waffle",
    caption: "A waffle worth making room for.",
    category: "Treats",
    width: 1536,
    height: 2048,
  },
  {
    id: "cherries-team",
    src: "/images/gallery/cherries-team.jpg",
    alt: "Two members of the Cherries On Top team smiling inside the trailer",
    caption: "The smiles behind the scoops.",
    category: "Our team",
    width: 709,
    height: 945,
  },
  {
    id: "ice-cream-and-cones",
    src: "/images/gallery/ice-cream-and-cones.jpg",
    alt: "Scooped ice cream in a tub beside waffle cones",
    caption: "The good stuff, ready to scoop.",
    category: "Treats",
    width: 3264,
    height: 2448,
  },
  {
    id: "finishing-a-milkshake",
    src: "/images/gallery/finishing-a-milkshake.jpg",
    alt: "A milkshake being finished with toppings inside the trailer",
    caption: "Every last finishing touch.",
    category: "Treats",
    width: 3024,
    height: 4032,
  },
  {
    id: "autumn-event",
    src: "/images/gallery/autumn-event.jpg",
    alt: "The Cherries On Top trailer decorated for autumn beside a building",
    caption: "Sweet moments in every season.",
    category: "The trailer",
    width: 1536,
    height: 2048,
  },
];