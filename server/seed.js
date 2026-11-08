export const collections = [
  {
    id: 'coll_men',
    name: 'Men',
    slug: 'men',
    description: 'Modern essentials with thoughtful details.',
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-24479dcbc2ef?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_women',
    name: 'Women',
    slug: 'women',
    description: 'Contemporary pieces made for everyday elegance.',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_kids',
    name: 'Kids',
    slug: 'kids',
    description: 'Comfortable favorites for little ones.',
    imageUrl: 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_shoes',
    name: 'Shoes',
    slug: 'shoes',
    description: 'Everyday footwear, crafted to last.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_traditional',
    name: 'Traditional Wear',
    slug: 'traditional',
    description: 'Ethiopian heritage meets handcrafted modern design.',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Finishing touches for every look.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Layer up with versatile pieces for every season.',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
  {
    id: 'coll_activewear',
    name: 'Activewear',
    slug: 'activewear',
    description: 'Comfortable performance clothing made to move.',
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
    active: '1',
  },
];

const productRecords = [
  ['hab_1', 'Classic Men\'s Habesha Kemis', 'classic-mens-habesha-kemis', 4500, 'A traditional white cotton tunic with hand-embroidered Tilf patterns.', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop', 'coll_traditional', 'men'],
  ['hab_2', 'Elegant Women\'s Tilf Dress', 'elegant-womens-tilf-dress', 8500, 'Hand-woven Ethiopian traditional dress with intricate Tilf embroidery.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop', 'coll_traditional', 'women'],
  ['men_1', 'Premium Cotton Oxford Shirt', 'premium-cotton-oxford-shirt', 1800, 'A crisp cotton oxford shirt for a sharp, comfortable everyday look.', 'https://images.unsplash.com/photo-1598033129183-c4f50c717678?q=80&w=1200&auto=format&fit=crop', 'coll_men', 'men'],
  ['men_2', 'Slim-Fit Chino Pants', 'slim-fit-chino-pants', 2200, 'Versatile stretch-cotton chinos with a clean, modern fit.', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop', 'coll_men', 'men'],
  ['wom_1', 'Floral Summer Maxi Dress', 'floral-summer-maxi-dress', 4200, 'A flowing floral dress made for warm days and easy evenings.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop', 'coll_women', 'women'],
  ['wom_2', 'Satin Wrap Blouse', 'satin-wrap-blouse', 2400, 'An elegant satin blouse with a refined wrap silhouette.', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1200&auto=format&fit=crop', 'coll_women', 'women'],
  ['kid_1', 'Soft Cotton Toddler Set', 'soft-cotton-toddler-set', 1500, 'A soft, comfortable cotton set for little explorers.', 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=1200&auto=format&fit=crop', 'coll_kids', 'kids'],
  ['sho_1', 'Leather Derby Shoes', 'leather-derby-shoes', 6500, 'Classic formal footwear crafted from premium leather.', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop', 'coll_shoes', 'unisex'],
  ['sho_2', 'Urban Knit Runners', 'urban-knit-runners', 3800, 'Lightweight runners with a breathable knit upper.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', 'coll_shoes', 'unisex'],
  ['acc_1', 'Minimalist Chronograph Watch', 'minimalist-chronograph-watch', 12500, 'A sleek chronograph with a stainless-steel mesh strap.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop', 'coll_accessories', 'unisex'],
  ['acc_2', 'Leather Messenger Bag', 'leather-messenger-bag', 7200, 'A durable leather bag designed for work and travel.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop', 'coll_accessories', 'unisex'],
  ['out_1', 'Wool Blend Overcoat', 'wool-blend-overcoat', 8500, 'A polished wool-blend coat for effortless layering.', 'https://images.unsplash.com/photo-1539533377285-a28905204481?q=80&w=1200&auto=format&fit=crop', 'coll_outerwear', 'unisex'],
  ['act_1', 'Compression Pro Leggings', 'compression-pro-leggings', 3200, 'Supportive performance leggings designed for movement.', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop', 'coll_activewear', 'unisex'],
  ['demo_men_1', 'Everyday Linen Blend Shirt', 'demo-everyday-linen-blend-shirt', 1950, 'A lightweight linen-blend shirt for easy everyday dressing.', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop', 'coll_men', 'men'],
  ['demo_women_1', 'Relaxed Everyday Blouse', 'demo-relaxed-everyday-blouse', 2150, 'A soft, easy-to-style blouse with a relaxed silhouette.', 'https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=1200&auto=format&fit=crop', 'coll_women', 'women'],
  ['demo_kids_1', 'Little Explorer Hoodie', 'demo-little-explorer-hoodie', 1350, 'A cozy cotton hoodie made for playtime and cooler days.', 'https://images.unsplash.com/photo-1519234110450-1aa963672068?q=80&w=1200&auto=format&fit=crop', 'coll_kids', 'kids'],
  ['demo_shoes_1', 'Classic Canvas Sneakers', 'demo-classic-canvas-sneakers', 2450, 'Everyday canvas sneakers with a comfortable cushioned sole.', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop', 'coll_shoes', 'unisex'],
  ['demo_traditional_1', 'Handwoven Cotton Scarf', 'demo-handwoven-cotton-scarf', 1800, 'A handwoven cotton scarf inspired by Ethiopian textile traditions.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1200&auto=format&fit=crop', 'coll_traditional', 'unisex'],
  ['demo_accessories_1', 'Woven Everyday Tote', 'demo-woven-everyday-tote', 1650, 'A versatile woven tote for daily errands and weekend outings.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop', 'coll_accessories', 'unisex'],
  ['demo_outerwear_1', 'Lightweight Utility Jacket', 'demo-lightweight-utility-jacket', 4600, 'A lightweight layer with a practical fit for changing weather.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop', 'coll_outerwear', 'unisex'],
  ['demo_activewear_1', 'Everyday Training Tee', 'demo-everyday-training-tee', 1250, 'A breathable training tee for workouts and everyday movement.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop', 'coll_activewear', 'unisex'],
];

const demoProductsByCollection = {
  coll_men: [
    ["Men's Classic Cotton Polo", 'mens-classic-cotton-polo', 1450, 'A versatile cotton polo for relaxed everyday wear.', 'men'],
    ["Men's Relaxed Fit Jeans", 'mens-relaxed-fit-jeans', 2850, 'Comfortable denim jeans with a relaxed straight-leg fit.', 'men'],
    ["Men's Everyday Crewneck Tee", 'mens-everyday-crewneck-tee', 950, 'A soft cotton crewneck tee made for daily layering.', 'men'],
    ["Men's Lightweight Knit Sweater", 'mens-lightweight-knit-sweater', 3200, 'A breathable knit sweater for an easy smart-casual layer.', 'men'],
    ["Men's Button-Down Casual Shirt", 'mens-button-down-casual-shirt', 2100, 'A clean button-down shirt for workdays and weekends.', 'men'],
    ["Men's Drawstring Chino Shorts", 'mens-drawstring-chino-shorts', 1750, 'Easy-fit chino shorts with an adjustable drawstring waist.', 'men'],
    ["Men's Everyday Cotton Hoodie", 'mens-everyday-cotton-hoodie', 2650, 'A comfortable cotton-blend hoodie for cool days.', 'men'],
    ["Men's Tapered Jogger Pants", 'mens-tapered-jogger-pants', 2300, 'Soft tapered joggers with a practical everyday fit.', 'men'],
  ],
  coll_women: [
    ["Women's Classic Cotton T-Shirt", 'womens-classic-cotton-tshirt', 1050, 'A soft everyday cotton tee with a clean, versatile shape.', 'women'],
    ["Women's Pleated Midi Skirt", 'womens-pleated-midi-skirt', 2450, 'A flowing pleated midi skirt for work or weekends.', 'women'],
    ["Women's Relaxed Linen Trousers", 'womens-relaxed-linen-trousers', 2800, 'Breathable relaxed trousers with an easy straight-leg fit.', 'women'],
    ["Women's Everyday Knit Cardigan", 'womens-everyday-knit-cardigan', 3100, 'A soft open-front cardigan for an extra layer of comfort.', 'women'],
    ["Women's Cotton Button-Front Dress", 'womens-cotton-button-front-dress', 3650, 'A comfortable cotton dress with a simple button-front detail.', 'women'],
    ["Women's Ribbed Tank Top", 'womens-ribbed-tank-top', 1250, 'A soft ribbed tank for warm days and easy layering.', 'women'],
    ["Women's Tailored Ankle Pants", 'womens-tailored-ankle-pants', 2550, 'Polished ankle-length trousers with a comfortable tailored fit.', 'women'],
    ["Women's Floral Wrap Dress", 'womens-floral-wrap-dress', 3950, 'A versatile wrap dress with a colorful floral print.', 'women'],
  ],
  coll_kids: [
    ['Kids Cozy Cotton Sweatshirt', 'kids-cozy-cotton-sweatshirt', 1250, 'A soft cotton sweatshirt for school, play, and relaxing.', 'kids'],
    ['Kids Everyday Jogger Set', 'kids-everyday-jogger-set', 1850, 'A comfortable matching top and jogger set for active days.', 'kids'],
    ['Kids Colorful Cotton T-Shirt', 'kids-colorful-cotton-tshirt', 650, 'A lightweight cotton tee in a bright, kid-friendly style.', 'kids'],
    ['Kids Hooded Rain Jacket', 'kids-hooded-rain-jacket', 2250, 'A lightweight hooded jacket for drizzly days and outdoor play.', 'kids'],
    ['Kids Soft Denim Overalls', 'kids-soft-denim-overalls', 1950, 'Easy-wearing denim overalls with adjustable shoulder straps.', 'kids'],
    ['Kids Weekend Pajama Set', 'kids-weekend-pajama-set', 1450, 'A soft and breathable pajama set for a comfortable night.', 'kids'],
    ['Kids Everyday Cotton Leggings', 'kids-everyday-cotton-leggings', 750, 'Stretchy cotton leggings made for comfort and movement.', 'kids'],
    ['Kids Classic Knit Cardigan', 'kids-classic-knit-cardigan', 1650, 'A cozy button-front cardigan for an extra warm layer.', 'kids'],
  ],
  coll_shoes: [
    ['Shoes - Everyday Leather Loafers', 'shoes-everyday-leather-loafers', 4200, 'Classic slip-on leather loafers for polished everyday outfits.', 'unisex'],
    ['Shoes - Lightweight Running Sneakers', 'shoes-lightweight-running-sneakers', 3650, 'Lightweight sneakers with a breathable upper for daily runs.', 'unisex'],
    ['Shoes - Classic Ankle Boots', 'shoes-classic-ankle-boots', 5600, 'Versatile ankle boots with a comfortable low heel.', 'unisex'],
    ['Shoes - Cushioned Walking Trainers', 'shoes-cushioned-walking-trainers', 3300, 'Cushioned walking trainers for comfortable daily steps.', 'unisex'],
    ['Shoes - Minimal Leather Sandals', 'shoes-minimal-leather-sandals', 2400, 'Simple leather sandals with an adjustable everyday fit.', 'unisex'],
    ['Shoes - Canvas Slip-On Sneakers', 'shoes-canvas-slip-on-sneakers', 1950, 'Easy slip-on canvas shoes with a flexible sole.', 'unisex'],
    ['Shoes - Everyday Court Sneakers', 'shoes-everyday-court-sneakers', 2900, 'Clean low-top court sneakers for casual daily wear.', 'unisex'],
    ['Shoes - Soft House Slides', 'shoes-soft-house-slides', 850, 'Lightweight cushioned slides for comfortable indoor use.', 'unisex'],
  ],
  coll_traditional: [
    ['Traditional Wear - Handwoven Habesha Scarf', 'traditional-wear-handwoven-habesha-scarf', 1850, 'A handwoven scarf inspired by Ethiopian textile traditions.', 'unisex'],
    ['Traditional Wear - Embroidered Cotton Shirt', 'traditional-wear-embroidered-cotton-shirt', 3900, 'A breathable cotton shirt finished with traditional embroidery.', 'men'],
    ['Traditional Wear - Ethiopian Tibeb Shawl', 'traditional-wear-ethiopian-tibeb-shawl', 3200, 'A decorative woven shawl featuring classic Tibeb-inspired detail.', 'women'],
    ['Traditional Wear - Habesha Cotton Wrap', 'traditional-wear-habesha-cotton-wrap', 2750, 'A versatile cotton wrap made for traditional and modern styling.', 'women'],
    ['Traditional Wear - Handcrafted Tilf Top', 'traditional-wear-handcrafted-tilf-top', 3400, 'A comfortable traditional top with handcrafted Tilf-inspired trim.', 'women'],
    ['Traditional Wear - Ethiopian Woven Sash', 'traditional-wear-ethiopian-woven-sash', 1250, 'A colorful woven sash that adds a heritage-inspired finishing touch.', 'unisex'],
    ['Traditional Wear - Kids Habesha Dress', 'traditional-wear-kids-habesha-dress', 3600, 'A special-occasion cotton dress with traditional-inspired details.', 'kids'],
    ['Traditional Wear - Men Handwoven Cotton Tunic', 'traditional-wear-men-handwoven-cotton-tunic', 5200, 'A relaxed handwoven cotton tunic for celebrations and gatherings.', 'men'],
  ],
  coll_accessories: [
    ['Accessories - Woven Everyday Tote Bag', 'accessories-woven-everyday-tote-bag', 1650, 'A roomy woven tote for everyday errands and weekend outings.', 'unisex'],
    ['Accessories - Minimal Leather Wallet', 'accessories-minimal-leather-wallet', 1350, 'A compact leather wallet with useful everyday card slots.', 'unisex'],
    ['Accessories - Classic Canvas Belt', 'accessories-classic-canvas-belt', 850, 'A sturdy adjustable canvas belt for everyday outfits.', 'unisex'],
    ['Accessories - Beaded Heritage Necklace', 'accessories-beaded-heritage-necklace', 1750, 'A handcrafted beaded necklace inspired by Ethiopian design.', 'unisex'],
    ['Accessories - Everyday Crossbody Bag', 'accessories-everyday-crossbody-bag', 2850, 'A practical crossbody bag with room for daily essentials.', 'unisex'],
    ['Accessories - Cotton Patterned Scarf', 'accessories-cotton-patterned-scarf', 1150, 'A lightweight patterned cotton scarf for any season.', 'unisex'],
    ['Accessories - Woven Bucket Hat', 'accessories-woven-bucket-hat', 1450, 'A relaxed woven hat for sunny days and casual outfits.', 'unisex'],
    ['Accessories - Everyday Sunglasses', 'accessories-everyday-sunglasses', 1250, 'Classic sunglasses with a lightweight comfortable frame.', 'unisex'],
  ],
  coll_outerwear: [
    ['Outerwear - Everyday Denim Jacket', 'outerwear-everyday-denim-jacket', 4200, 'A classic denim jacket for easy year-round layering.', 'unisex'],
    ['Outerwear - Lightweight Hooded Raincoat', 'outerwear-lightweight-hooded-raincoat', 3900, 'A packable hooded raincoat for unpredictable weather.', 'unisex'],
    ['Outerwear - Quilted Everyday Vest', 'outerwear-quilted-everyday-vest', 3500, 'A lightweight quilted vest for comfortable extra warmth.', 'unisex'],
    ['Outerwear - Classic Wool Blend Coat', 'outerwear-classic-wool-blend-coat', 7800, 'A warm wool-blend coat with a timeless everyday silhouette.', 'unisex'],
    ['Outerwear - Relaxed Utility Overshirt', 'outerwear-relaxed-utility-overshirt', 3150, 'A sturdy utility overshirt that works as a light jacket.', 'unisex'],
    ['Outerwear - Everyday Zip-Up Windbreaker', 'outerwear-everyday-zip-up-windbreaker', 2950, 'A light zip-up windbreaker for breezy days outdoors.', 'unisex'],
    ['Outerwear - Soft Fleece-Lined Parka', 'outerwear-soft-fleece-lined-parka', 6900, 'A cozy fleece-lined parka for colder days and evening walks.', 'unisex'],
    ['Outerwear - Cropped Lightweight Jacket', 'outerwear-cropped-lightweight-jacket', 3650, 'A versatile cropped jacket for easy everyday layering.', 'women'],
  ],
  coll_activewear: [
    ['Activewear - Breathable Training T-Shirt', 'activewear-breathable-training-tshirt', 1150, 'A quick-drying breathable tee for workouts and everyday movement.', 'unisex'],
    ['Activewear - Everyday Stretch Leggings', 'activewear-everyday-stretch-leggings', 2200, 'Supportive stretch leggings for training, yoga, and daily wear.', 'women'],
    ['Activewear - Lightweight Running Shorts', 'activewear-lightweight-running-shorts', 1450, 'Lightweight running shorts with a comfortable elastic waist.', 'unisex'],
    ['Activewear - Zip-Up Training Hoodie', 'activewear-zip-up-training-hoodie', 2850, 'A soft training hoodie for warm-ups and cool-downs.', 'unisex'],
    ['Activewear - Supportive Sports Bra', 'activewear-supportive-sports-bra', 1950, 'A comfortable supportive sports bra for everyday training.', 'women'],
    ['Activewear - Performance Jogger Pants', 'activewear-performance-jogger-pants', 2450, 'Flexible jogger pants designed for workouts and rest days.', 'unisex'],
    ['Activewear - Quick-Dry Polo Shirt', 'activewear-quick-dry-polo-shirt', 1750, 'A lightweight quick-dry polo for active days and casual wear.', 'unisex'],
    ['Activewear - Stretch Cycling Tights', 'activewear-stretch-cycling-tights', 2650, 'Flexible cycling tights with a comfortable close fit.', 'unisex'],
  ],
};

const categoryDemoRecords = Object.entries(demoProductsByCollection).flatMap(([collectionId, definitions]) => {
  const collectionSlug = collectionId.replace('coll_', '');
  return definitions.map(([name, slug, price, description, gender], index) => [
    `demo_${collectionSlug}_${index + 2}`,
    name,
    slug,
    price,
    description,
    `https://picsum.photos/seed/wende-${slug}${slug === 'mens-drawstring-chino-shorts' ? '-unique' : ''}/800/1000`,
    collectionId,
    gender,
  ]);
});

const uniqueDemoRecords = productRecords.map((record) => {
  const [id, name, slug] = record;
  return id.startsWith('demo_')
    ? [id, name, slug, ...record.slice(3, 5), `https://picsum.photos/seed/wende-${slug}/800/1000`, ...record.slice(6)]
    : record;
});

export const products = [...uniqueDemoRecords, ...categoryDemoRecords].map(([id, name, slug, basePrice, description, imageUrl, collectionId, gender]) => ({
  id,
  name,
  slug,
  basePrice,
  description,
  imageUrl,
  collectionId,
  gender,
  active: '1',
  createdAt: new Date().toISOString(),
}));

export const productVariants = products.flatMap((product) => {
  const collection = collections.find((item) => item.id === product.collectionId);
  let sizes = ['One Size'];
  if (collection?.slug === 'men' || collection?.slug === 'women' || collection?.slug === 'traditional' || collection?.slug === 'outerwear' || collection?.slug === 'activewear') {
    sizes = ['XS', 'S', 'M', 'L', 'XL'];
  } else if (collection?.slug === 'kids') {
    sizes = ['2T', '3T', '4T', '5T', '6T'];
  } else if (collection?.slug === 'shoes') {
    sizes = ['38', '39', '40', '41', '42', '43', '44'];
  }

  const stockPerSize = Math.floor(25 / sizes.length);
  const extraStock = 25 % sizes.length;
  return sizes.map((size, index) => ({
    id: `variant_${product.id}_${size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    productId: product.id,
    size,
    color: 'Default',
    material: '',
    price: product.basePrice,
    stock: stockPerSize + (index < extraStock ? 1 : 0),
    imageUrls: JSON.stringify([product.imageUrl]),
  }));
});
