import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { InventoryItem, Branch, Transaction as StockTransaction } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  throw new Error(errorJson);
}

export const api = {
  async getItems(): Promise<InventoryItem[]> {
    const path = 'items';
    try {
      const q = query(collection(db, path), orderBy("lastUpdated", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createItem(item: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const path = 'items';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...item,
        lastUpdated: new Date().toISOString()
      });
      return { id: docRef.id, ...item, lastUpdated: new Date().toISOString() } as InventoryItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async updateItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const path = `items/${id}`;
    try {
      const docRef = doc(db, 'items', id);
      const updateData = { ...item, lastUpdated: new Date().toISOString() };
      await updateDoc(docRef, updateData);
      return { id, ...updateData } as InventoryItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async getBranches(): Promise<Branch[]> {
    const path = 'branches';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createBranch(branch: Omit<Branch, "id">): Promise<Branch> {
    const path = 'branches';
    try {
      const docRef = await addDoc(collection(db, path), branch);
      return { id: docRef.id, ...branch } as Branch;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async getTransactions(): Promise<StockTransaction[]> {
    const path = 'transactions';
    try {
      const q = query(collection(db, path), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockTransaction));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createTransaction(transaction: Omit<StockTransaction, "id" | "date">): Promise<StockTransaction> {
    const txPath = 'transactions';
    try {
      return await runTransaction(db, async (txn) => {
        const itemRef = doc(db, 'items', transaction.itemId);
        const itemDoc = await txn.get(itemRef);
        
        if (!itemDoc.exists()) {
          throw new Error("Item does not exist");
        }

        const currentStock = itemDoc.data().stockLevel;
        const newStock = transaction.type === 'Stock In' 
          ? currentStock + transaction.quantity 
          : currentStock - transaction.quantity;

        const date = new Date().toISOString();
        
        // Update item stock
        txn.update(itemRef, { 
          stockLevel: newStock,
          lastUpdated: date
        });

        // Add transaction log
        const newTxRef = doc(collection(db, txPath));
        txn.set(newTxRef, { ...transaction, date });

        return { id: newTxRef.id, ...transaction, date } as StockTransaction;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, txPath);
      throw error;
    }
  },
};
