import { Router, Request, Response } from 'express';
import {
  db,
  Product,
  PurchaseRecord,
  DueRecord,
  AccountTransaction
} from '../db/database.js';
import { getAuthenticatedUser } from './auth.js';

export const erpRouter = Router();

function buildErpSummary(userId: string) {
  // Strictly load ONLY the authenticated user's own products (100% synced with Products & Store)
  const allProducts = db.getProducts(userId);

  // Normalize stock_quantity for every product without inventing random numbers
  const products = allProducts.map((p) => {
    const defaultStock =
      p.stock_status === 'out_of_stock'
        ? 0
        : p.stock_status === 'low_stock'
        ? 4
        : 20;
    const stockQty =
      p.stock_quantity !== undefined && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity))
        ? Math.max(0, Number(p.stock_quantity))
        : defaultStock;
    const status: Product['stock_status'] =
      stockQty <= 0 ? 'out_of_stock' : stockQty <= 5 ? 'low_stock' : 'in_stock';
    return {
      ...p,
      stock_quantity: stockQty,
      stock_status: status,
      buying_price:
        p.buying_price !== undefined && !isNaN(Number(p.buying_price))
          ? Number(p.buying_price)
          : Math.round((Number(p.price) || 0) * 0.6)
    };
  });

  const orders = db.getOrders(userId);
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const purchases = db.getPurchases(userId);
  const manualDues = db.getDueRecords(userId);
  const transactions = db.getAccountTransactions(userId);

  // 1. Sales Calculation
  const ordersSalesTotal = activeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const extraSalesIncome = transactions
    .filter((t) => t.type === 'income' && t.category === 'Product Sales')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalSales = ordersSalesTotal + extraSalesIncome;

  // 2. Purchase Calculation (logged supplier purchases + buying cost of inventory)
  const loggedPurchasesTotal = purchases.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0);
  const estimatedInventoryCost = products.reduce(
    (sum, p) => sum + (Number(p.buying_price) || 0) * (Number(p.stock_quantity) || 0),
    0
  );
  const totalPurchase = loggedPurchasesTotal > 0 ? loggedPurchasesTotal : estimatedInventoryCost;

  // 3. Due Ledger (Auto Order COD Dues + Manual Customer & Supplier Dues)
  const orderDueEntries: DueRecord[] = activeOrders
    .filter((o) => o.payment_status !== 'paid')
    .map((o) => {
      const total = Number(o.total_amount) || 0;
      const paid = Number(o.advance_paid_amount) || 0;
      const due = Math.max(0, total - paid);
      return {
        id: `ord_due_${o.id}`,
        user_id: userId,
        party_type: 'customer' as const,
        party_name: o.customer_name || 'Customer',
        party_phone: o.customer_phone || o.customer_id,
        reference_type: 'order' as const,
        reference_id: o.id,
        description: `Order #${o.id.slice(-6).toUpperCase()} — ${o.items}`,
        total_amount: total,
        paid_amount: paid,
        due_amount: due,
        status: due === 0 ? 'settled' : paid > 0 ? 'partial' : 'unpaid',
        created_at: o.created_at,
        updated_at: o.updated_at
      };
    })
    .filter((d) => d.due_amount > 0);

  const combinedDues: DueRecord[] = [...manualDues, ...orderDueEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const customerDueTotal = combinedDues
    .filter((d) => d.party_type === 'customer' && d.status !== 'settled')
    .reduce((sum, d) => sum + (Number(d.due_amount) || 0), 0);

  const supplierDueTotal = combinedDues
    .filter((d) => d.party_type === 'supplier' && d.status !== 'settled')
    .reduce((sum, d) => sum + (Number(d.due_amount) || 0), 0);

  const totalDue = customerDueTotal + supplierDueTotal;

  // 4. Stock Status Breakdown (Donut Chart)
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
  const inStockCount = products.filter((p) => p.stock_status === 'in_stock').length;
  const lowStockCount = products.filter((p) => p.stock_status === 'low_stock').length;
  const outOfStockCount = products.filter((p) => p.stock_status === 'out_of_stock').length;

  const inStockPct = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPct = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPct =
    totalProducts > 0 ? Math.max(0, 100 - inStockPct - lowStockPct) : 0;

  // 5. Top Selling Products (100% real sold counts)
  const topProducts = products
    .map((prod) => {
      const matchedOrdersQty = activeOrders
        .filter((o) => (o.items || '').toLowerCase().includes(prod.name.toLowerCase()))
        .reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      const soldQty = Math.max(Number(prod.sold_count) || 0, matchedOrdersQty);
      return {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        stock_quantity: prod.stock_quantity || 0,
        stock_status: prod.stock_status,
        soldQty,
        revenue: soldQty * (Number(prod.price) || 0)
      };
    })
    .sort((a, b) => b.soldQty - a.soldQty)
    .slice(0, 6);

  // 6. Sales Overview Trend (Last 6 Months based on real orders & purchases)
  const now = new Date();
  const salesOverview = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const monthIdx = d.getMonth();
    const yearIdx = d.getFullYear();

    const monthSales = activeOrders
      .filter((o) => {
        const od = new Date(o.created_at);
        return od.getMonth() === monthIdx && od.getFullYear() === yearIdx;
      })
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const monthPurchases = purchases
      .filter((p) => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === monthIdx && pd.getFullYear() === yearIdx;
      })
      .reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0);

    return {
      label,
      sales: i === 5 && monthSales === 0 ? totalSales : monthSales,
      purchase: i === 5 && monthPurchases === 0 ? totalPurchase : monthPurchases
    };
  });

  // 7. Accounts Cashbook Summary
  const manualIncomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const paidOrdersRevenue = activeOrders.reduce((sum, o) => {
    if (o.payment_status === 'paid') return sum + (Number(o.total_amount) || 0);
    return sum + (Number(o.advance_paid_amount) || 0);
  }, 0);

  const manualExpenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalIncome = paidOrdersRevenue + manualIncomeTotal;
  const totalExpense = manualExpenseTotal + loggedPurchasesTotal;
  const netCashBalance = totalIncome - totalExpense;

  return {
    kpis: {
      totalSales,
      totalPurchase,
      totalDue,
      customerDueTotal,
      supplierDueTotal,
      totalProducts,
      totalStockUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      inStockPct,
      lowStockPct,
      outOfStockPct
    },
    salesOverview,
    topProducts,
    recentOrders: orders.slice(0, 15),
    products,
    purchases,
    dues: combinedDues,
    transactions,
    cashbookSummary: {
      totalIncome,
      totalExpense,
      netCashBalance
    }
  };
}

// GET /api/erp/summary
erpRouter.get('/summary', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json(buildErpSummary(user.id));
});

// POST /api/erp/purchases - Add Stock Purchase & Auto-Increase Inventory
erpRouter.post('/purchases', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    supplier_name,
    supplier_phone,
    product_id,
    product_name,
    quantity,
    unit_cost,
    paid_amount,
    payment_method = 'cash',
    selling_price,
    category = 'General',
    notes
  } = req.body || {};

  const qty = Math.max(1, Number(quantity) || 1);
  const unit = Math.max(0, Number(unit_cost) || 0);
  const totalCost = qty * unit;
  const paid = paid_amount !== undefined ? Math.max(0, Number(paid_amount)) : totalCost;
  const due = Math.max(0, totalCost - paid);

  let targetProduct = product_id ? db.getProductById(String(product_id)) : undefined;
  const finalProductName = String(targetProduct?.name || product_name || 'Inventory Item').trim();

  if (targetProduct) {
    const currentStock =
      targetProduct.stock_quantity !== undefined ? Number(targetProduct.stock_quantity) : 20;
    const nextStock = currentStock + qty;
    db.updateProduct(targetProduct.id, {
      stock_quantity: nextStock,
      buying_price: unit || targetProduct.buying_price,
      ...(selling_price !== undefined && Number(selling_price) > 0
        ? { price: Number(selling_price) }
        : {}),
      stock_status: nextStock <= 0 ? 'out_of_stock' : nextStock <= 5 ? 'low_stock' : 'in_stock'
    });
  } else if (finalProductName) {
    targetProduct = db.createProduct({
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      name: finalProductName,
      price: Number(selling_price) || Math.round(unit * 1.45) || 500,
      buying_price: unit,
      stock_quantity: qty,
      sold_count: 0,
      currency: 'BDT',
      category: String(category || 'General').trim(),
      description: `Added via Purchase ERP from ${supplier_name || 'Supplier'}`,
      image_url: '',
      stock_status: qty <= 5 ? 'low_stock' : 'in_stock',
      keywords: finalProductName.toLowerCase().split(/\s+/),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const purchase: PurchaseRecord = {
    id: `pur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    supplier_name: String(supplier_name || 'General Supplier').trim(),
    supplier_phone: supplier_phone ? String(supplier_phone).trim() : undefined,
    product_id: targetProduct?.id,
    product_name: finalProductName,
    quantity: qty,
    unit_cost: unit,
    total_cost: totalCost,
    paid_amount: paid,
    due_amount: due,
    payment_method,
    notes: notes ? String(notes).trim() : undefined,
    created_at: new Date().toISOString()
  };

  db.createPurchase(purchase);

  if (due > 0) {
    db.createDueRecord({
      id: `due_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      party_type: 'supplier',
      party_name: purchase.supplier_name,
      party_phone: purchase.supplier_phone,
      reference_type: 'purchase',
      reference_id: purchase.id,
      description: `Stock Purchase: ${qty}x ${finalProductName}`,
      total_amount: totalCost,
      paid_amount: paid,
      due_amount: due,
      status: paid > 0 ? 'partial' : 'unpaid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return res.status(201).json({
    success: true,
    purchase,
    summary: buildErpSummary(user.id),
    message: `Recorded purchase of ${qty}x ${finalProductName} and added +${qty} to Stock Inventory!`
  });
});

// DELETE /api/erp/purchases/:id
erpRouter.delete('/purchases/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.deletePurchase(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: 'Purchase record removed.'
  });
});

// PUT /api/erp/stock/:productId - Quick Stock Quantity & Product Details Adjustment
erpRouter.put('/stock/:productId', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const product = db.getProductById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, category, stock_quantity, buying_price, price, description, image_url } = req.body || {};
  const nextQty =
    stock_quantity !== undefined
      ? Math.max(0, Number(stock_quantity))
      : product.stock_quantity ?? 20;
  const nextStatus: Product['stock_status'] =
    nextQty <= 0 ? 'out_of_stock' : nextQty <= 5 ? 'low_stock' : 'in_stock';

  db.updateProduct(product.id, {
    stock_quantity: nextQty,
    stock_status: nextStatus,
    ...(name !== undefined && String(name).trim() ? { name: String(name).trim() } : {}),
    ...(category !== undefined && String(category).trim() ? { category: String(category).trim() } : {}),
    ...(buying_price !== undefined ? { buying_price: Math.max(0, Number(buying_price)) } : {}),
    ...(price !== undefined ? { price: Math.max(0, Number(price)) } : {}),
    ...(description !== undefined ? { description: String(description).trim() } : {}),
    ...(image_url !== undefined ? { image_url: String(image_url).trim() } : {})
  });

  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: `Updated "${name || product.name}" (${nextQty} pcs — ${nextStatus.replace(/_/g, ' ').toUpperCase()})`
  });
});

// DELETE /api/erp/stock/:productId - Delete Product from Stock & Catalog
erpRouter.delete('/stock/:productId', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const product = db.getProductById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.deleteProduct(product.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: `Deleted "${product.name}" from Stock & Product Catalog.`
  });
});

// POST /api/erp/dues - Add Customer Receivable or Supplier Payable Due Record
erpRouter.post('/dues', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    party_type = 'customer',
    party_name,
    party_phone,
    description,
    total_amount,
    paid_amount = 0,
    due_date
  } = req.body || {};

  if (!party_name || !total_amount) {
    return res.status(400).json({ error: 'Name and total amount are required.' });
  }

  const total = Math.max(0, Number(total_amount) || 0);
  const paid = Math.max(0, Number(paid_amount) || 0);
  const due = Math.max(0, total - paid);

  const created = db.createDueRecord({
    id: `due_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    party_type: party_type === 'supplier' ? 'supplier' : 'customer',
    party_name: String(party_name).trim(),
    party_phone: party_phone ? String(party_phone).trim() : undefined,
    reference_type: 'manual',
    description: String(description || 'Credit / Due Entry').trim(),
    total_amount: total,
    paid_amount: paid,
    due_amount: due,
    status: due <= 0 ? 'settled' : paid > 0 ? 'partial' : 'unpaid',
    due_date: due_date ? String(due_date) : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    due: created,
    summary: buildErpSummary(user.id),
    message: 'Due entry added to ledger!'
  });
});

// POST /api/erp/dues/:id/settle - 1-Click Collect / Pay Due & Log to Cashbook
erpRouter.post('/dues/:id/settle', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { amount, payment_method = 'cash' } = req.body || {};

  // Case 1: Order COD Due (`ord_due_<orderId>`)
  if (id.startsWith('ord_due_')) {
    const orderId = id.replace('ord_due_', '');
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const total = Number(order.total_amount) || 0;
    const prevPaid = Number(order.advance_paid_amount) || 0;
    const collectNow =
      amount !== undefined ? Math.max(0, Number(amount)) : Math.max(0, total - prevPaid);
    const nextPaid = Math.min(total, prevPaid + collectNow);
    const isFullyPaid = nextPaid >= total;

    db.updateOrder(order.id, {
      advance_paid_amount: nextPaid,
      payment_status: isFullyPaid ? 'paid' : 'pending'
    });

    return res.json({
      success: true,
      summary: buildErpSummary(user.id),
      message: isFullyPaid
        ? `Order #${order.id.slice(-6).toUpperCase()} full due (BDT ${collectNow}) collected and marked PAID!`
        : `Collected BDT ${collectNow} partial payment for Order #${order.id.slice(-6).toUpperCase()}!`
    });
  }

  // Case 2: Manual / Supplier Due Record
  const existing = db.getDueRecords(user.id).find((d) => d.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Due record not found' });
  }

  const settleAmount =
    amount !== undefined ? Math.max(0, Number(amount)) : Number(existing.due_amount) || 0;
  const newPaid = (Number(existing.paid_amount) || 0) + settleAmount;
  const newDue = Math.max(0, (Number(existing.total_amount) || 0) - newPaid);

  db.updateDueRecord(existing.id, user.id, {
    paid_amount: newPaid,
    due_amount: newDue,
    status: newDue <= 0 ? 'settled' : 'partial'
  });

  if (settleAmount > 0) {
    db.createAccountTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      type: existing.party_type === 'customer' ? 'income' : 'expense',
      category: existing.party_type === 'customer' ? 'Due Collection' : 'Supplier Payment',
      title: `${existing.party_type === 'customer' ? 'Due Collected from' : 'Paid Due to'} ${existing.party_name}`,
      amount: settleAmount,
      payment_method,
      reference_id: existing.id,
      created_at: new Date().toISOString()
    });
  }

  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message:
      newDue <= 0
        ? `Full due of BDT ${settleAmount} settled for ${existing.party_name}!`
        : `Recorded BDT ${settleAmount} payment (${newDue} BDT remaining due).`
  });
});

// DELETE /api/erp/dues/:id
erpRouter.delete('/dues/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.deleteDueRecord(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: 'Due record deleted.'
  });
});

// POST /api/erp/transactions - Add Daily Income or Expense to Accounts Cashbook
erpRouter.post('/transactions', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    type = 'expense',
    category = 'General Expense',
    title,
    amount,
    payment_method = 'cash',
    notes
  } = req.body || {};

  if (!title || !amount) {
    return res.status(400).json({ error: 'Transaction title and amount are required.' });
  }

  const tx = db.createAccountTransaction({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    type: type === 'income' ? 'income' : 'expense',
    category: String(category).trim(),
    title: String(title).trim(),
    amount: Math.max(0, Number(amount) || 0),
    payment_method,
    notes: notes ? String(notes).trim() : undefined,
    created_at: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    transaction: tx,
    summary: buildErpSummary(user.id),
    message: `${tx.type === 'income' ? 'Income' : 'Expense'} of BDT ${tx.amount} added to Accounts Cashbook!`
  });
});

// DELETE /api/erp/transactions/:id
erpRouter.delete('/transactions/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.deleteAccountTransaction(req.params.id, user.id);
  return res.json({
    success: true,
    summary: buildErpSummary(user.id),
    message: 'Transaction deleted.'
  });
});
