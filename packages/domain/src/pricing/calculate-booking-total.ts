// Función pura: calcula el total de un booking
// Ver: docs/04-Tech-Design/Services/Domain-Financiero.md §5

interface PaxItem { category: string; quantity: number; unitPrice: number; }
interface AddonItem { name: string; quantity: number; unitPrice: number; }

interface BookingTotalInput {
  paxItems: PaxItem[];
  addons: AddonItem[];
  markup: number;
  commissionPct: number;
  isExemptIva: boolean;
}

interface BookingTotalResult {
  operatorPrice: number;
  subtotal: number;
  commissionAmount: number;
  borondoAmount: number;
  ivaOnMargin: number;
  netBorondo: number;
  operatorGross: number;
  totalClient: number;
}

export function calculateBookingTotal(input: BookingTotalInput): BookingTotalResult {
  const { paxItems, addons, markup, commissionPct, isExemptIva } = input;

  const paxTotal = paxItems.reduce((sum, p) => sum + Math.floor(p.unitPrice * p.quantity), 0);
  const addonsTotal = addons.reduce((sum, a) => sum + Math.floor(a.unitPrice * a.quantity), 0);
  const operatorPrice = paxTotal + addonsTotal;
  const subtotal = operatorPrice + markup;
  const commissionAmount = Math.floor(operatorPrice * commissionPct);
  const borondoAmount = commissionAmount + markup;
  const ivaOnMargin = isExemptIva ? 0 : Math.floor(borondoAmount * 0.19);
  const netBorondo = borondoAmount - ivaOnMargin;
  const operatorGross = operatorPrice - commissionAmount;

  return {
    operatorPrice, subtotal, commissionAmount, borondoAmount,
    ivaOnMargin, netBorondo, operatorGross, totalClient: subtotal,
  };
}
