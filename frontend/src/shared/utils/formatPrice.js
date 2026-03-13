export const formatPrice = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatDiscount = (original, sale) =>
  Math.round(((original - sale) / original) * 100);

export const freeShippingRemaining = (subtotal, threshold = 500) =>
  Math.max(0, threshold - subtotal);