export const MOCK_COLLECTIONS = [
  {
    id: 'coll_men',
    name: 'Men',
    slug: 'men',
    description: 'Modern and stylish apparel for men. From casual shirts to tailored pants.',
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-24479dcbc2ef?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_women',
    name: 'Women',
    slug: 'women',
    description: 'Elegant dresses, chic tops, and contemporary styles for the modern woman.',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_kids',
    name: 'Kids',
    slug: 'kids',
    description: 'Comfortable and fun clothing for the little ones.',
    imageUrl: 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_shoes',
    name: 'Shoes',
    slug: 'shoes',
    description: 'A wide selection of footwear, from classic sneakers to formal dress shoes.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_traditional',
    name: 'Traditional Wear',
    slug: 'traditional',
    description: 'Exquisite Habesha clothes, celebrating Ethiopian heritage with handcrafted details.',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop',
    active: true
  }
];

export const MOCK_PRODUCTS = [
  // Traditional Wear (Habesha clothes)
  {
    id: 'hab_1',
    name: 'Classic Men\'s Habesha Kemis',
    slug: 'classic-mens-habesha-kemis',
    basePrice: 4500,
    description: 'A traditional men\'s white cotton tunic with hand-embroidered Tilf patterns.',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_2',
    name: 'Elegant Women\'s Tilf Dress',
    slug: 'elegant-womens-tilf-dress',
    basePrice: 8500,
    description: 'Exquisitely hand-woven Ethiopian traditional dress with intricate gold Tilf embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop']
  },
  {
    id: 'hab_3',
    name: 'Gonder Style Men\'s Outfit',
    slug: 'gonder-style-mens-outfit',
    basePrice: 5200,
    description: 'Traditional men\'s outfit inspired by the heritage of Gonder, featuring bold embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1529139578501-0c14ad5e43f0?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1529139578501-0c14ad5e43f0?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_4',
    name: 'Modern Habesha Wedding Dress',
    slug: 'modern-habesha-wedding-dress',
    basePrice: 15000,
    description: 'A stunning blend of modern silhouette and traditional Ethiopian hand-weaving.',
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_5',
    name: 'Children\'s Habesha Set',
    slug: 'childrens-habesha-set',
    basePrice: 2800,
    description: 'Adorable traditional wear for children, perfect for holidays and celebrations.',
    imageUrl: 'https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_6',
    name: 'Axumite Pattern Netela',
    slug: 'axumite-pattern-netela',
    basePrice: 1500,
    description: 'Lightweight cotton shawl with patterns inspired by Axumite obelisks.',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop']
  },

  // Men's Modern Wear
  {
    id: 'men_1',
    name: 'Premium Cotton Oxford Shirt',
    slug: 'premium-cotton-oxford-shirt',
    basePrice: 1800,
    description: 'Crisp white cotton oxford shirt for a sharp, professional look.',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c717678?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c717678?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_2',
    name: 'Slim-Fit Chino Pants',
    slug: 'slim-fit-chino-pants',
    basePrice: 2200,
    description: 'Versatile navy chinos made from high-quality stretch cotton.',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_3',
    name: 'Addis Urban Denim Jacket',
    slug: 'addis-urban-denim-jacket',
    basePrice: 3500,
    description: 'Classic blue denim jacket with a modern tailored fit.',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_4',
    name: 'Graphic Print Culture Tee',
    slug: 'graphic-print-culture-tee',
    basePrice: 950,
    description: 'Soft cotton t-shirt with a unique Addis-inspired graphic print.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_5',
    name: 'Casual Linen Trousers',
    slug: 'casual-linen-trousers',
    basePrice: 2800,
    description: 'Breathable linen trousers perfect for warm days in the city.',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_6',
    name: 'Heavyweight Fleece Hoodie',
    slug: 'heavyweight-fleece-hoodie',
    basePrice: 3200,
    description: 'Premium weight hoodie made from 100% organic cotton.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop']
  },

  // Women's Modern Wear
  {
    id: 'wom_1',
    name: 'Floral Summer Maxi Dress',
    slug: 'floral-summer-maxi-dress',
    basePrice: 4200,
    description: 'Beautiful floral print dress with a flowing silhouette.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'wom_2',
    name: 'Satin Wrap Blouse',
    slug: 'satin-wrap-blouse',
    basePrice: 2400,
    description: 'Elegant satin blouse with a sophisticated wrap-around design.',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'wom_3',
    name: 'High-Waisted Wide-Leg Pants',
    slug: 'high-waisted-wide-leg-pants',
    basePrice: 3100,
    description: 'Modern wide-leg trousers that elongate the silhouette.',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'wom_4',
    name: 'Bohemian Midi Skirt',
    slug: 'bohemian-midi-skirt',
    basePrice: 1950,
    description: 'Comfortable and stylish midi skirt with a boho-chic vibe.',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'wom_5',
    name: 'Embroidered Linen Tunic',
    slug: 'embroidered-linen-tunic',
    basePrice: 2800,
    description: 'Hand-embroidered linen tunic, perfect for a relaxed yet refined look.',
    imageUrl: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68d?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1594932224828-b4b059b6f68d?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'wom_6',
    name: 'Chiffon Evening Gown',
    slug: 'chiffon-evening-gown',
    basePrice: 7800,
    description: 'Elegant evening gown made from flowing chiffon material.',
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop']
  },

  // Kids Wear
  {
    id: 'kid_1',
    name: 'Soft Cotton Toddler Set',
    slug: 'soft-cotton-toddler-set',
    basePrice: 1500,
    description: 'Adorable cotton set for toddlers, soft on delicate skin.',
    imageUrl: 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'kid_2',
    name: 'Durable Denim Overalls',
    slug: 'durable-denim-overalls',
    basePrice: 1800,
    description: 'Sturdy denim overalls for active kids.',
    imageUrl: 'https://images.unsplash.com/photo-1522771935876-249711cdca2a?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1522771935876-249711cdca2a?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'kid_3',
    name: 'Colorful Printed Hoodies',
    slug: 'colorful-printed-hoodies',
    basePrice: 1200,
    description: 'Warm and vibrant hoodies for cool days.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'kid_4',
    name: 'Kids Graphic Tee Pack',
    slug: 'kids-graphic-tee-pack',
    basePrice: 2200,
    description: 'A pack of three fun graphic tees for daily play.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'kid_5',
    name: 'Patterned Cotton Pajamas',
    slug: 'patterned-cotton-pajamas',
    basePrice: 950,
    description: 'Cozy and fun pajamas for a good night\'s sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1520006403993-4740f0ad4023?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1520006403993-4740f0ad4023?q=80&w=2000&auto=format&fit=crop']
  },

  // Shoes
  {
    id: 'sho_1',
    name: 'Handmade Leather Derby',
    slug: 'handmade-leather-derby',
    basePrice: 6500,
    description: 'Classic formal footwear crafted from premium local calfskin.',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_2',
    name: 'Urban Tech Runner',
    slug: 'urban-tech-runner',
    basePrice: 3800,
    description: 'Lightweight performance runner with a breathable knit upper.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_3',
    name: 'Heritage Chelsea Boot',
    slug: 'heritage-chelsea-boot',
    basePrice: 5200,
    description: 'Classic Chelsea boot handcrafted for durability and style.',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_4',
    name: 'Addis Canvas Sneakers',
    slug: 'addis-canvas-sneakers',
    basePrice: 2100,
    description: 'Simple and versatile canvas sneakers for daily wear.',
    imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_5',
    name: 'Artisan Heritage Sneaker',
    slug: 'artisan-heritage-sneaker',
    basePrice: 5800,
    description: 'Handcrafted premium leather sneakers by local artisans.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_6',
    name: 'Minimalist Leather Slide',
    slug: 'minimalist-leather-slide',
    basePrice: 1800,
    description: 'Comfortable and chic leather slides for effortless style.',
    imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2000&auto=format&fit=crop']
  },

  // More Products to reach 30+
  {
    id: 'add_1',
    name: 'Embroidered Linen Scarf',
    slug: 'embroidered-linen-scarf',
    basePrice: 1200,
    description: 'Beautifully embroidered linen scarf, perfect for layering.',
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_2',
    name: 'Canvas Utility Backpack',
    slug: 'canvas-utility-backpack',
    basePrice: 2800,
    description: 'Durable canvas backpack for work and travel.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_3',
    name: 'Wool Blend Overcoat',
    slug: 'wool-blend-overcoat',
    basePrice: 8500,
    description: 'Classic wool blend overcoat for a sophisticated look.',
    imageUrl: 'https://images.unsplash.com/photo-1539533377285-a28905204481?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1539533377285-a28905204481?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_4',
    name: 'Suede Ankle Boots',
    slug: 'suede-ankle-boots',
    basePrice: 4800,
    description: 'Chic suede ankle boots with a comfortable block heel.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_5',
    name: 'Cotton Blend Cardigan',
    slug: 'cotton-blend-cardigan',
    basePrice: 2400,
    description: 'Soft and cozy cardigan for easy layering.',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_6',
    name: 'Traditional Patterned Tote',
    slug: 'traditional-patterned-tote',
    basePrice: 1800,
    description: 'A spacious tote bag featuring traditional Ethiopian patterns.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop']
  }
];

export const MOCK_VARIANTS = [
  // Traditional Wear Variants
  { id: 'v_hab_1_s', productId: 'hab_1', size: 'S', color: 'White', price: 4500, stock: 10 },
  { id: 'v_hab_1_m', productId: 'hab_1', size: 'M', color: 'White', price: 4500, stock: 15 },
  { id: 'v_hab_1_l', productId: 'hab_1', size: 'L', color: 'White', price: 4500, stock: 12 },
  { id: 'v_hab_2_s', productId: 'hab_2', size: 'S', color: 'Gold/White', price: 8500, stock: 5 },
  { id: 'v_hab_2_m', productId: 'hab_2', size: 'M', color: 'Gold/White', price: 8500, stock: 8 },
  
  // Men Variants
  { id: 'v_men_1_m', productId: 'men_1', size: 'M', color: 'White', price: 1800, stock: 20 },
  { id: 'v_men_1_l', productId: 'men_1', size: 'L', color: 'White', price: 1800, stock: 25 },
  { id: 'v_men_2_32', productId: 'men_2', size: '32', color: 'Navy', price: 2200, stock: 15 },
  { id: 'v_men_2_34', productId: 'men_2', size: '34', color: 'Navy', price: 2200, stock: 18 },
  
  // Women Variants
  { id: 'v_wom_1_s', productId: 'wom_1', size: 'S', color: 'Floral', price: 4200, stock: 10 },
  { id: 'v_wom_1_m', productId: 'wom_1', size: 'M', color: 'Floral', price: 4200, stock: 15 },
  
  // Shoe Variants
  { id: 'v_sho_1_40', productId: 'sho_1', size: '40', color: 'Black', price: 6500, stock: 10 },
  { id: 'v_sho_1_42', productId: 'sho_1', size: '42', color: 'Black', price: 6500, stock: 12 },
  { id: 'v_sho_2_41', productId: 'sho_2', size: '41', color: 'Grey', price: 3800, stock: 20 },
  { id: 'v_sho_2_43', productId: 'sho_2', size: '43', color: 'Grey', price: 3800, stock: 15 }
];
