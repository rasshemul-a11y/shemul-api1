export type Category = 'Book' | 'Stationery' | 'Electronics' | 'Other';
export type Program = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'Medical' | 'Engineering' | 'Varsity A' | 'Varsity B' | 'Custom';
export type Version = 'Bangla' | 'English' | 'N/A';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  version: Version;
  program?: Program;
  subProgram?: string; // e.g., "Medical + Engineering Short Course"
  stockLevel: number;
  unit: string;
  lastUpdated: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export type TransactionType = 'Stock In' | 'Stock Out';
export type RecipientType = 'Office' | 'Teacher' | 'Student' | 'Other';

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  itemVersion: Version;
  type: TransactionType;
  quantity: number;
  voucherNumber: string;
  recipient?: RecipientType;
  recipientName?: string;
  branchId: string;
  branchName: string;
  date: string;
  note?: string;
}
