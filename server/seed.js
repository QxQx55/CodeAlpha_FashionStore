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
];

export const products = productRecords.map(([id, name, slug, basePrice, description, imageUrl, collectionId, gender]) => ({
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
