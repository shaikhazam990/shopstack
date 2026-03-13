export const formatPrice = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export const formatDiscount = (original, sale) =>
  Math.round(((original - sale) / original) * 100);

export const freeShippingRemaining = (subtotal, threshold = 500) =>
  Math.max(0, threshold - subtotal);
