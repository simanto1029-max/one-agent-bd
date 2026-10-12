import { Router, Request, Response } from 'express';
import { db, Product } from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const productsRouter = Router();

// GET /api/products - Get all products for the authenticated merchant
productsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { category, stock_status, search } = req.query;
  let products = db.getProducts(user.id);

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (stock_status && typeof stock_status === 'string' && stock_status !== 'all') {
    products = products.filter((p) => p.stock_status === stock_status);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }

  // Calculate catalog stats
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.stock_status === 'in_stock').length;
  const lowStockCount = products.filter((p) => p.stock_status === 'low_stock').length;
  const outOfStockCount = products.filter((p) => p.stock_status === 'out_of_stock').length;

  // Extract unique categories
  const allUserProducts = db.getProducts(user.id);
  const categories = Array.from(new Set(allUserProducts.map((p) => p.category).filter(Boolean)));

  return res.json({
    products,
    stats: {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount
    },
    categories
  });
});

// GET /api/products/:id - Get a single product
productsRouter.get('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ product });
});

// POST /api/products - Create a new product
productsRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    name,
    price,
    buying_price,
    stock_quantity,
    currency = 'BDT',
    category = 'General',
    description = '',
    image_url = '',
    stock_status = 'in_stock',
    keywords = []
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: 'A valid product price is required' });
  }

  const numericBuyingPrice =
    buying_price !== undefined && buying_price !== '' && !isNaN(Number(buying_price))
      ? Math.max(0, Number(buying_price))
      : Math.round(numericPrice * 0.58);

  const numericStockQty =
    stock_quantity !== undefined && stock_quantity !== '' && !isNaN(Number(stock_quantity))
      ? Math.max(0, Number(stock_quantity))
      : stock_status === 'out_of_stock'
      ? 0
      : stock_status === 'low_stock'
      ? 4
      : 25;

  const computedStatus: Product['stock_status'] =
    stock_quantity !== undefined && stock_quantity !== ''
      ? numericStockQty <= 0
        ? 'out_of_stock'
        : numericStockQty <= 5
        ? 'low_stock'
        : 'in_stock'
      : stock_status || 'in_stock';

  // Parse keywords if string
  let parsedKeywords: string[] = [];
  if (Array.isArray(keywords)) {
    parsedKeywords = keywords.map((k) => String(k).trim()).filter(Boolean);
  } else if (typeof keywords === 'string') {
    parsedKeywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    name: name.trim(),
    price: numericPrice,
    buying_price: numericBuyingPrice,
    stock_quantity: numericStockQty,
    sold_count: 0,
    currency: currency.toUpperCase().trim() || 'BDT',
    category: category.trim() || 'General',
    description: description.trim(),
    image_url: image_url.trim(),
    stock_status: computedStatus,
    keywords: parsedKeywords,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createProduct(newProduct);

  return res.status(201).json({
    product: newProduct,
    message: 'Product added successfully to your catalog. AI can now recommend and share this product.'
  });
});

// PUT /api/products/:id - Update an existing product
productsRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (existing.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    name,
    price,
    buying_price,
    stock_quantity,
    currency,
    category,
    description,
    image_url,
    stock_status,
    keywords
  } = req.body;

  let parsedKeywords = existing.keywords;
  if (keywords !== undefined) {
    if (Array.isArray(keywords)) {
      parsedKeywords = keywords.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof keywords === 'string') {
      parsedKeywords = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
    }
  }

  const updates: Partial<Product> = {};
  if (name !== undefined) updates.name = name.trim();
  if (price !== undefined) {
    const num = Number(price);
    if (!isNaN(num) && num >= 0) updates.price = num;
  }
  if (buying_price !== undefined) {
    const numBuy = Number(buying_price);
    if (!isNaN(numBuy) && numBuy >= 0) updates.buying_price = numBuy;
  }
  if (stock_quantity !== undefined && stock_quantity !== '') {
    const numStock = Math.max(0, Number(stock_quantity));
    if (!isNaN(numStock)) {
      updates.stock_quantity = numStock;
      updates.stock_status =
        numStock <= 0 ? 'out_of_stock' : numStock <= 5 ? 'low_stock' : 'in_stock';
    }
  } else if (stock_status !== undefined) {
    updates.stock_status = stock_status;
  }
  if (currency !== undefined) updates.currency = currency.toUpperCase().trim();
  if (category !== undefined) updates.category = category.trim();
  if (description !== undefined) updates.description = description.trim();
  if (image_url !== undefined) updates.image_url = image_url.trim();
  if (parsedKeywords !== undefined) updates.keywords = parsedKeywords;

  const updated = db.updateProduct(req.params.id, updates);

  return res.json({
    product: updated,
    message: 'Product updated successfully.'
  });
});

// DELETE /api/products/:id - Delete a product
productsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (existing.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteProduct(req.params.id);

  return res.json({
    success: true,
    message: 'Product deleted from catalog.'
  });
});

// POST /api/products/sample-seed - Seed realistic ecommerce products (Pants, Shirts, Watches)
productsRouter.post('/sample-seed', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sampleProducts: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      user_id: user.id,
      name: 'Cargo Jogger Pant (Olive Green)',
      price: 1150,
      currency: 'BDT',
      category: 'Pants',
      description: 'Heavyweight stretchable cotton twill fabric with 6 utility pockets, elastic jogger ankles, and adjustable waist drawstrings. Available sizes: 30, 32, 34, 36.',
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['cargo', 'jogger', 'pant', 'olive', 'green', 'কার্গো', 'প্যান্ট', 'কটন']
    },
    {
      user_id: user.id,
      name: 'Slim Fit Denim Jeans (Deep Blue)',
      price: 1250,
      currency: 'BDT',
      category: 'Pants',
      description: 'Premium stretch denim with dark blue wash, reinforced stitching, and brass rivets. Soft and comfortable for everyday wear. Sizes: 30, 32, 34, 36.',
      image_url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['denim', 'jeans', 'pant', 'blue', 'ডেনিম', 'জিন্স', 'প্যান্ট', 'স্লিম']
    },
    {
      user_id: user.id,
      name: 'Formal Chino Pant (Charcoal Grey)',
      price: 980,
      currency: 'BDT',
      category: 'Pants',
      description: 'Wrinkle-resistant cotton blend formal chino pants. Ideal for office, meetings, or smart-casual outings. Sizes: 30, 32, 34, 36.',
      image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['chino', 'formal', 'pant', 'grey', 'অফিস', 'ফর্মাল', 'প্যান্ট', 'চিনো']
    },
    {
      user_id: user.id,
      name: 'Casual Oxford Cotton Shirt (Sky Blue)',
      price: 850,
      currency: 'BDT',
      category: 'Shirts',
      description: '100% combed breathable cotton Oxford shirt with button-down collar and curved hem. Perfect for all seasons. Sizes: M, L, XL, XXL.',
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['shirt', 'oxford', 'cotton', 'blue', 'শার্ট', 'কটন', 'ফুল হাতা']
    },
    {
      user_id: user.id,
      name: 'Smart Calling Watch (Series 9 Metallic Black)',
      price: 2450,
      currency: 'BDT',
      category: 'Watches',
      description: '1.99 inch HD AMOLED screen with Bluetooth call support, heart rate and blood oxygen monitoring, 100+ sports modes, and 5-day battery backup. IP68 water resistant.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['watch', 'smartwatch', 'smart', 'calling', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ']
    },
    {
      user_id: user.id,
      name: 'Classic Luxury Chronograph Watch (Silver Steel)',
      price: 1850,
      currency: 'BDT',
      category: 'Watches',
      description: 'Stainless steel analog watch with functional stopwatch subdials, scratch-resistant sapphire crystal glass, and date display.',
      image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      stock_status: 'in_stock',
      keywords: ['watch', 'chronograph', 'steel', 'analog', 'ঘড়ি', 'স্টিল', 'হাতঘড়ি']
    }
  ];

  const createdList: Product[] = [];
  sampleProducts.forEach((sp) => {
    const item: Product = {
      ...sp,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.createProduct(item);
    createdList.push(item);
  });

  return res.status(201).json({
    products: createdList,
    message: `${createdList.length} sample products (Pants, Shirts, Watches) loaded successfully!`
  });
});

// GET /api/products/:id/image - Public image endpoint for Meta (WhatsApp/Messenger/Instagram) & Web
productsRouter.get('/:id/image', (req: Request, res: Response) => {
  const prod = db.getProductById(req.params.id);
  if (!prod || !prod.image_url) {
    return res.status(404).send('Product photo not found');
  }

  const url = prod.image_url.trim();
  if (url.startsWith('data:image/')) {
    const matches = url.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send('Invalid data URL');
    }
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return res.redirect(302, url);
  }

  return res.status(404).send('Invalid image format');
});

// POST /api/products/test-ai-query - Test AI inquiry directly against the merchant's catalog & products
productsRouter.post('/test-ai-query', async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { message, platform = 'messenger', productId } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const { generateAIReply } = await import('../services/aiService.js');
    const aiResult = await generateAIReply({
      userId: user.id,
      incomingMessage: message.trim(),
      customerId: `test_merchant_${user.id}`,
      customerName: 'Customer',
      platform: platform as any,
      channelName: (user as any).business_name || user.full_name || 'My Store',
      targetProductId: productId || undefined
    });

    return res.json({
      success: true,
      reply: aiResult.replyText,
      attachedImageUrl: aiResult.attachedImageUrl,
      attachedProductName: aiResult.attachedProductName,
      attachedProductPrice: aiResult.attachedProductPrice,
      attachedProducts: aiResult.attachedProducts,
      attachedImages: aiResult.attachedImages
    });
  } catch (err: any) {
    console.error('Error generating product AI test reply:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate product AI reply' });
  }
});
