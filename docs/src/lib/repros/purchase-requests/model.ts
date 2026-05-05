export type PurchaseRequest = {
  id: string;
  requestNumber: string;
  requester: string;
  area: string;
  status: 'Pending' | 'Review' | 'Approved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  total: number;
};