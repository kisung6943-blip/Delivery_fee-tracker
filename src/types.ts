export interface DeliveryFee {
  id: string;
  date: string;
  amount: number;
  description: string;
  isPaid: boolean;
  isInvoiceIssued?: boolean;
}
