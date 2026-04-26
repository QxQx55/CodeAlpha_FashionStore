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
  },
  {
    id: 'coll_accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'The finishing touches for any look. Watches, bags, and eyewear.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Durable coats and jackets built to withstand the elements.',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2000&auto=format&fit=crop',
    active: true
  },
  {
    id: 'coll_activewear',
    name: 'Activewear',
    slug: 'activewear',
    description: 'High-performance gear designed for movement and endurance.',
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=2000&auto=format&fit=crop',
    active: true
  }
];

export const MOCK_PRODUCTS = [
  // Traditional Wear (Habesha clothes)
  { id: 'hab_1', name: 'Classic Men\'s Habesha Kemis', slug: 'classic-mens-habesha-kemis', basePrice: 4500, description: 'A traditional men\'s white cotton tunic with hand-embroidered Tilf patterns.', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_2', name: 'Elegant Women\'s Tilf Dress', slug: 'elegant-womens-tilf-dress', basePrice: 8500, description: 'Exquisitely hand-woven Ethiopian traditional dress with intricate gold Tilf embroidery.', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop'] },
  { id: 'hab_3', name: 'Gonder Style Men\'s Outfit', slug: 'gonder-style-mens-outfit', basePrice: 5200, description: 'Traditional men\'s outfit inspired by the heritage of Gonder, featuring bold embroidery.', imageUrl: 'https://images.unsplash.com/photo-1529139578501-0c14ad5e43f0?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1529139578501-0c14ad5e43f0?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_4', name: 'Modern Habesha Wedding Dress', slug: 'modern-habesha-wedding-dress', basePrice: 15000, description: 'A stunning blend of modern silhouette and traditional Ethiopian hand-weaving.', imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_5', name: 'Children\'s Habesha Set', slug: 'childrens-habesha-set', basePrice: 2800, description: 'Adorable traditional wear for children, perfect for holidays and celebrations.', imageUrl: 'https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1621454523226-eb3037449231?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_6', name: 'Axumite Pattern Netela', slug: 'axumite-pattern-netela', basePrice: 1500, description: 'Lightweight cotton shawl with patterns inspired by Axumite obelisks.', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_7', name: 'Traditional Embroidered Scarf', slug: 'traditional-embroidered-scarf', basePrice: 1200, description: 'Beautifully hand-embroidered scarf featuring cultural motifs.', imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=2000&auto=format&fit=crop'] },

  // Men
  { id: 'men_1', name: 'Premium Cotton Oxford Shirt', slug: 'premium-cotton-oxford-shirt', basePrice: 1800, description: 'Crisp white cotton oxford shirt for a sharp, professional look.', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c717678?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1598033129183-c4f50c717678?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'men_2', name: 'Slim-Fit Chino Pants', slug: 'slim-fit-chino-pants', basePrice: 2200, description: 'Versatile navy chinos made from high-quality stretch cotton.', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'men_3', name: 'Urban Denim Jacket', slug: 'urban-denim-jacket', basePrice: 3500, description: 'Classic blue denim jacket with a modern tailored fit.', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'men_4', name: 'Graphic Print Tee', slug: 'graphic-print-tee', basePrice: 950, description: 'Soft cotton t-shirt with a unique Addis-inspired graphic print.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'men_5', name: 'Casual Linen Trousers', slug: 'casual-linen-trousers', basePrice: 2800, description: 'Breathable linen trousers perfect for warm days in the city.', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2000&auto=format&fit=crop'] },

  // Women
  { id: 'wom_1', name: 'Floral Summer Maxi Dress', slug: 'floral-summer-maxi-dress', basePrice: 4200, description: 'Beautiful floral print dress with a flowing silhouette.', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_women', active: true, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'wom_2', name: 'Satin Wrap Blouse', slug: 'satin-wrap-blouse', basePrice: 2400, description: 'Elegant satin blouse with a sophisticated wrap-around design.', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_women', active: true, images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'wom_3', name: 'Wide-Leg Tailored Trousers', slug: 'wide-leg-tailored-trousers', basePrice: 3100, description: 'Modern wide-leg trousers that elongate the silhouette.', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_women', active: true, images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'wom_4', name: 'Silk Blend Blouse', slug: 'silk-blend-blouse', basePrice: 2800, description: 'Sophisticated silk blend blouse for a refined evening look.', imageUrl: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68d?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_women', active: true, images: ['https://images.unsplash.com/photo-1594932224828-b4b059b6f68d?q=80&w=2000&auto=format&fit=crop'] },

  // Kids
  { id: 'kid_1', name: 'Soft Cotton Toddler Set', slug: 'soft-cotton-toddler-set', basePrice: 1500, description: 'Adorable cotton set for toddlers, soft on delicate skin.', imageUrl: 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_kids', active: true, images: ['https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'kid_2', name: 'Kids Denim Overalls', slug: 'kids-denim-overalls', basePrice: 1800, description: 'Durable and stylish denim overalls for active kids.', imageUrl: 'https://images.unsplash.com/photo-1522771935876-249711cdca2a?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_kids', active: true, images: ['https://images.unsplash.com/photo-1522771935876-249711cdca2a?q=80&w=2000&auto=format&fit=crop'] },

  // Shoes
  { id: 'sho_1', name: 'Leather Derby Shoes', slug: 'leather-derby-shoes', basePrice: 6500, description: 'Classic formal footwear crafted from premium calfskin.', imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_shoes', active: true, images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'sho_2', name: 'Urban Knit Runners', slug: 'urban-knit-runners', basePrice: 3800, description: 'Lightweight performance runner with a breathable knit upper.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_shoes', active: true, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'sho_3', name: 'Heritage Chelsea Boots', slug: 'heritage-chelsea-boots', basePrice: 5200, description: 'Timeless Chelsea boots handcrafted for durability and style.', imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_shoes', active: true, images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'sho_4', name: 'Artisan Leather Sneakers', slug: 'artisan-leather-sneakers', basePrice: 5800, description: 'Premium leather sneakers combining craftsmanship and modern design.', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_shoes', active: true, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop'] },

  // Accessories
  { id: 'acc_1', name: 'Minimalist Chronograph Watch', slug: 'minimalist-chronograph-watch', basePrice: 12500, description: 'A sleek, minimalist watch with a stainless steel mesh strap.', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_accessories', active: true, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'acc_2', name: 'Leather Messenger Bag', slug: 'leather-messenger-bag', basePrice: 7200, description: 'Durable leather bag for work and travel, designed for the modern professional.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_accessories', active: true, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'acc_3', name: 'Aviation Sunglasses', slug: 'aviation-sunglasses', basePrice: 4500, description: 'Classic aviator style with polarized lenses and 100% UV protection.', imageUrl: 'https://images.unsplash.com/photo-1511499767390-91f99f73948c?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_accessories', active: true, images: ['https://images.unsplash.com/photo-1511499767390-91f99f73948c?q=80&w=2000&auto=format&fit=crop'] },

  // Outerwear
  { id: 'out_1', name: 'Wool Blend Overcoat', slug: 'wool-blend-overcoat', basePrice: 8500, description: 'Sophisticated wool blend coat for a polished layered look.', imageUrl: 'https://images.unsplash.com/photo-1539533377285-a28905204481?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_outerwear', active: true, images: ['https://images.unsplash.com/photo-1539533377285-a28905204481?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'out_2', name: 'Insulated Puffer Jacket', slug: 'insulated-puffer-jacket', basePrice: 6200, description: 'Ultra-warm puffer jacket designed for extreme cold.', imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_outerwear', active: true, images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'out_3', name: 'Technical Shell Jacket', slug: 'technical-shell-jacket', basePrice: 7800, description: 'Weather-resistant shell for urban exploration and outdoor performance.', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_outerwear', active: true, images: ['https://images.unsplash.com/photo-1544022613-e87f17a7845b?q=80&w=2000&auto=format&fit=crop'] },

  // Activewear
  { id: 'act_1', name: 'Compression Pro Leggings', slug: 'compression-pro-leggings', basePrice: 3200, description: 'High-performance gear designed for movement and endurance.', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_activewear', active: true, images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'act_2', name: 'Tech-Knit Running Top', slug: 'tech-knit-running-top', basePrice: 2400, description: 'Breathable, moisture-wicking top for peak athletic performance.', imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_activewear', active: true, images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=2000&auto=format&fit=crop'] },

  // More to hit 40+ total
  { id: 'hab_9', name: 'Classic Habesha Kemis (Gold)', slug: 'classic-habesha-kemis-gold', basePrice: 9200, description: 'Hand-woven traditional dress with luxury gold embroidery.', imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'hab_10', name: 'Men\'s Traditional Gabi', slug: 'mens-traditional-gabi', basePrice: 3500, description: 'Heavyweight hand-woven cotton blanket/wrap for traditional ceremonies.', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_traditional', active: true, images: ['https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'men_9', name: 'Addis Culture Hoodie', slug: 'addis-culture-hoodie', basePrice: 2800, description: 'Modern streetwear hoodie with cultural embroidery details.', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_men', active: true, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'wom_9', name: 'Embroidered Kaftan', slug: 'embroidered-kaftan', basePrice: 4800, description: 'Relaxed fit kaftan with elegant hand-embroidered patterns.', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_women', active: true, images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'sho_7', name: 'Leather Suede Loafers', slug: 'leather-suede-loafers', basePrice: 4200, description: 'Comfortable and stylish loafers for everyday elegance.', imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_shoes', active: true, images: ['https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'kid_6', name: 'Cotton Summer Set (Kids)', slug: 'cotton-summer-set-kids', basePrice: 1800, description: 'Breathable and colorful set for warm Addis days.', imageUrl: 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_kids', active: true, images: ['https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=2000&auto=format&fit=crop'] },
  { id: 'acc_4', name: 'Hand-Woven Straw Tote', slug: 'hand-woven-straw-tote', basePrice: 2200, description: 'Lightweight and durable tote bag for summer outings.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop', collectionId: 'coll_accessories', active: true, images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop'] }
];

export const MOCK_VARIANTS = [
  // Traditional Wear Variants
  { id: 'v_hab_1_s', productId: 'hab_1', size: 'S', color: 'White', price: 4500, stock: 10 },
  { id: 'v_hab_1_m', productId: 'hab_1', size: 'M', color: 'White', price: 4500, stock: 15 },
  { id: 'v_hab_1_l', productId: 'hab_1', size: 'L', color: 'White', price: 4500, stock: 12 },
  { id: 'v_hab_2_s', productId: 'hab_2', size: 'S', color: 'Gold/White', price: 8500, stock: 5 },
  { id: 'v_hab_2_m', productId: 'hab_2', size: 'M', color: 'Gold/White', price: 8500, stock: 8 },
  { id: 'v_men_1_m', productId: 'men_1', size: 'M', color: 'White', price: 1800, stock: 20 },
  { id: 'v_men_1_l', productId: 'men_1', size: 'L', color: 'White', price: 1800, stock: 25 },
  { id: 'v_sho_1_40', productId: 'sho_1', size: '40', color: 'Black', price: 6500, stock: 10 },
  { id: 'v_sho_1_42', productId: 'sho_1', size: '42', color: 'Black', price: 6500, stock: 12 }
];
