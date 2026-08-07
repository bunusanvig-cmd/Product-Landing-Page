export type OrderPayload = {
  customerName: string;
  phoneNumber: string;
  emailAddress: string;
  exactLocation: string;
  productName: string;
  quantity: number;
  pricePerPiece: number;
  totalPrice: number;
  notes?: string;
};

export type StoredOrder = OrderPayload & {
  orderId: string;
  dateTime: string;
  paymentMethod: 'Cash On Delivery';
  orderStatus: 'New Order';
};
