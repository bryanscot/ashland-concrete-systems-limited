/* Product catalogue — edit names, dimensions, images and copy here.
   Dimensions are length × width × height in millimetres (keep decimals as strings/numbers exactly). */
window.ASHLAND_PRODUCTS = [
  {
    id: "road-kerb", name: "Ashland Road Kerb", category: "kerbs",
    dims: { l: 800, w: 140, h: 250 },
    image: "assets/images/ashland-road-kerb-block.webp",
    inUseImage: "assets/images/ashland-road-kerb-roadside.webp",
    alt: "Ashland Road Kerb, a long concrete kerb unit with a chamfered top edge",
    description: "Long concrete kerb unit with a chamfered top edge for road and landscape edging.",
    shownIn: "Shown on the flyer edging a road beside a planted verge."
  },
  {
    id: "hb-150", name: "Ashland HB 150", category: "blocks",
    dims: { l: 400, w: 150, h: 200 },
    image: "assets/images/ashland-hb-150-block.webp",
    inUseImage: "assets/images/ashland-hb-150-site.webp",
    alt: "Hollow concrete block with three cavities on bare soil",
    description: "Three-cell hollow concrete block in the 150 mm width.",
    shownIn: "Flyer shows hollow blocks set between reinforcement bars on a building site."
  },
  {
    id: "hb-230", name: "Ashland HB 230", category: "blocks",
    dims: { l: 400, w: 230, h: 200 },
    image: "assets/images/ashland-hb-230-block.webp",
    inUseImage: "assets/images/ashland-hb-230-site.webp",
    alt: "Hollow concrete block with three cavities on bare soil",
    description: "Three-cell hollow concrete block in the 230 mm width.",
    shownIn: "Flyer shows hollow blocks set between reinforcement bars on a building site."
  },
  {
    id: "hb-300", name: "Ashland HB 300", category: "blocks",
    dims: { l: 400, w: 300, h: 200 },
    image: "assets/images/ashland-hb-300-block.webp",
    inUseImage: "assets/images/ashland-hb-300-site.webp",
    alt: "Close view of a hollow concrete block with three cavities",
    description: "Three-cell hollow concrete block in the 300 mm width.",
    shownIn: "Flyer shows hollow blocks set between reinforcement bars on a building site."
  },
  {
    id: "cabro-60", name: "Ashland Cabro 60", category: "paving",
    dims: { l: 200, w: 100, h: 60 },
    image: "assets/images/ashland-cabro-60-block.webp",
    inUseImage: "assets/images/ashland-cabro-60-driveway.webp",
    alt: "Ashland Cabro 60, a rectangular grey concrete paving block",
    description: "Rectangular concrete paving block, 60 mm thick.",
    shownIn: "Flyer shows the block laid as a driveway in front of a gate."
  },
  {
    id: "cabro-80", name: "Ashland Cabro 80", category: "paving",
    dims: { l: 200, w: 100, h: 80 },
    image: "assets/images/ashland-cabro-80-block.webp",
    inUseImage: "assets/images/ashland-cabro-80-driveway.webp",
    alt: "Ashland Cabro 80, a rectangular grey concrete paving block",
    description: "Rectangular concrete paving block, 80 mm thick.",
    shownIn: "Flyer shows the block laid as a driveway with kerb edging."
  },
  {
    id: "uni-60", name: "Ashland Uni 60", category: "paving",
    dims: { l: 225, w: 112.5, h: 60 },
    image: "assets/images/ashland-uni-60-block.webp",
    inUseImage: "assets/images/ashland-uni-60-driveway.webp",
    alt: "Ashland Uni 60, a wave-profile grey concrete paving block",
    description: "Shaped concrete paving block with a wave profile, 60 mm thick.",
    shownIn: "Flyer shows the block laid as a driveway between kerbs."
  },
  {
    id: "uni-80", name: "Ashland Uni 80", category: "paving",
    dims: { l: 225, w: 112.5, h: 80 },
    image: "assets/images/ashland-uni-80-block.webp",
    inUseImage: "assets/images/ashland-uni-80-driveway.webp",
    alt: "Ashland Uni 80, a wave-profile grey concrete paving block",
    description: "Shaped concrete paving block with a wave profile, 80 mm thick.",
    shownIn: "Flyer shows the block laid as a driveway beside a raised planter."
  },
  {
    id: "pavers-60", name: "Ashland Pavers 60", category: "paving",
    dims: { l: 250, w: 144, h: 60 },
    image: "assets/images/ashland-pavers-60-block.webp",
    inUseImage: "assets/images/ashland-pavers-60-walkway.webp",
    alt: "Ashland Pavers 60, an angular concrete paver",
    description: "Angular-profile concrete paver, 60 mm thick.",
    shownIn: "Flyer shows the pavers laid as a garden walkway in a multi-colour pattern."
  }
];

window.ASHLAND_CATEGORIES = [
  { id: "all", label: "All products" },
  { id: "paving", label: "Cabro & paving" },
  { id: "blocks", label: "Hollow blocks" },
  { id: "kerbs", label: "Kerbs" }
];
