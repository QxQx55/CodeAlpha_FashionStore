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
  // Traditional Wear
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
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_3',
    name: 'Modern Habesha Scarf',
    slug: 'modern-habesha-scarf',
    basePrice: 1200,
    description: 'Lightweight cotton Netela with colorful border patterns. Perfect for any occasion.',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_4',
    name: 'Kid\'s Traditional Vest',
    slug: 'kids-traditional-vest',
    basePrice: 2500,
    description: 'Adorned with traditional patterns, this vest is perfect for festive celebrations.',
    imageUrl: 'https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'hab_5',
    name: 'Hand-Woven Bulluk Bedspread',
    slug: 'hand-woven-bulluk-bedspread',
    basePrice: 5500,
    description: 'A heavy, hand-woven cotton blanket with traditional geometric designs.',
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_traditional',
    active: true,
    images: ['https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=2000&auto=format&fit=crop']
  },
  // Men
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
    name: 'Urban Denim Jacket',
    slug: 'urban-denim-jacket',
    basePrice: 3500,
    description: 'Classic blue denim jacket with a modern tailored fit.',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'men_4',
    name: 'Graphic Print Tee',
    slug: 'graphic-print-tee',
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
  // Women
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
  // Kids
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
    name: 'Kid\'s Running Shoes',
    slug: 'kids-running-shoes',
    basePrice: 2200,
    description: 'Lightweight and comfortable shoes for school and play.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_kids',
    active: true,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop']
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
    name: 'Manor Leather Derby',
    slug: 'manor-leather-derby',
    basePrice: 6500,
    description: 'Classic formal footwear by Manor. Crafted from premium calfskin.',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_2',
    name: 'Swift Minimalist Runner',
    slug: 'swift-minimalist-runner',
    basePrice: 3800,
    description: 'Lightweight performance runner by Swift. Breathable knit upper.',
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
    description: 'Classic Chelsea boot handcrafted by Manor Footwear.',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'sho_4',
    name: 'Urban Canvas Sneakers',
    slug: 'urban-canvas-sneakers',
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
    description: 'Handcrafted premium leather sneakers by Artisan.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_shoes',
    active: true,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop']
  },
  // Additional
  {
    id: 'add_1',
    name: 'Woven Straw Bag',
    slug: 'woven-straw-bag',
    basePrice: 1800,
    description: 'Hand-woven straw bag, perfect for summer days.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_2',
    name: 'Leather Messenger Bag',
    slug: 'leather-messenger-bag',
    basePrice: 4200,
    description: 'Durable leather messenger bag for work and travel.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_3',
    name: 'Lightweight Trench Coat',
    slug: 'lightweight-trench-coat',
    basePrice: 5500,
    description: 'Elegant trench coat for a sophisticated layered look.',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_4',
    name: 'Cashmere Knit Sweater',
    slug: 'cashmere-knit-sweater',
    basePrice: 4800,
    description: 'Sumptuously soft cashmere sweater for cool evenings.',
    imageUrl: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_men',
    active: true,
    images: ['https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=2000&auto=format&fit=crop']
  },
  {
    id: 'add_5',
    name: 'Silk Evening Gown',
    slug: 'silk-evening-gown',
    basePrice: 12000,
    description: 'Breathtaking silk gown for the most special occasions.',
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop',
    collectionId: 'coll_women',
    active: true,
    images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop']
  }
];

export const MOCK_VARIANTS = [
  // Habesha 1
  { id: 'v_hab_1_s', productId: 'hab_1', size: 'S', color: 'White', price: 4500, stock: 10 },
  { id: 'v_hab_1_m', productId: 'hab_1', size: 'M', color: 'White', price: 4500, stock: 15 },
  { id: 'v_hab_1_l', productId: 'hab_1', size: 'L', color: 'White', price: 4500, stock: 12 },
  // Habesha 2
  { id: 'v_hab_2_s', productId: 'hab_2', size: 'S', color: 'Gold/White', price: 8500, stock: 5 },
  { id: 'v_hab_2_m', productId: 'hab_2', size: 'M', color: 'Gold/White', price: 8500, stock: 8 },
  // Men 1
  { id: 'v_men_1_m', productId: 'men_1', size: 'M', color: 'White', price: 1800, stock: 20 },
  { id: 'v_men_1_l', productId: 'men_1', size: 'L', color: 'White', price: 1800, stock: 25 },
  // Women 1
  { id: 'v_wom_1_s', productId: 'wom_1', size: 'S', color: 'Floral', price: 4200, stock: 10 },
  { id: 'v_wom_1_m', productId: 'wom_1', size: 'M', color: 'Floral', price: 4200, stock: 15 },
  // Shoes 1
  { id: 'v_sho_1_40', productId: 'sho_1', size: '40', color: 'Black', price: 6500, stock: 10 },
  { id: 'v_sho_1_42', productId: 'sho_1', size: '42', color: 'Black', price: 6500, stock: 12 }
];
