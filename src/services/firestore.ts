
'use client';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  serverTimestamp,
  Query,
  documentId,
} from 'firebase/firestore';
import type { Category, Transaction, Budget, Goal, UserAchievement } from '@/lib/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';


// Helper to convert Firestore Timestamps
const convertTimestamp = (data: any) => {
    const a = { ...data };
    for (const key in a) {
        if (a[key] instanceof Timestamp) {
            a[key] = a[key].toDate();
        }
    }
    return a;
}


// --- CATEGORIES ---
export async function getCategories(userId: string): Promise<Category[]> {
  const categoriesRef = collection(db, `users/${userId}/categories`);
  const q = query(categoriesRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(userId: string, categoryData: Omit<Category, 'id' | 'icon'> & { icon: string, color: string }): Promise<string> {
  const categoriesRef = collection(db, `users/${userId}/categories`);
  const docRef = await addDoc(categoriesRef, categoryData);
  return docRef.id;
}

export async function updateCategory(userId: string, categoryId: string, categoryData: Partial<Omit<Category, 'icon'> & { icon: string, color: string }>): Promise<void> {
    const categoryDoc = doc(db, `users/${userId}/categories`, categoryId);
    await updateDoc(categoryDoc, categoryData);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
    const categoryDoc = doc(db, `users/${userId}/categories`, categoryId);
    await deleteDoc(categoryDoc);
}


// --- TRANSACTIONS ---
export async function getTransactions(userId: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const q = query(transactionsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) } as Transaction));
}

export async function addTransactionsWithDeduplication(
  userId: string,
  transactions: (Omit<Transaction, 'id' | 'category'> & { hash: string })[]
): Promise<Transaction[]> {
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  const incomingHashes = transactions.map(t => t.hash);

  // Firestore 'in' query can have at most 30 elements. We need to chunk.
  const chunk = <T>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  const hashChunks = chunk(incomingHashes, 30);
  const existingHashes = new Set<string>();

  for (const hashChunk of hashChunks) {
    if (hashChunk.length === 0) continue;
    const q = query(transactionsRef, where('hash', 'in', hashChunk));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      existingHashes.add(doc.data().hash);
    });
  }

  const newTransactions = transactions.filter(t => !existingHashes.has(t.hash));

  if (newTransactions.length === 0) {
    return [];
  }

  const batch = writeBatch(db);
  const addedDocs: Transaction[] = [];

  newTransactions.forEach(txData => {
    const docRef = doc(collection(db, `users/${userId}/transactions`));
    batch.set(docRef, txData);
    addedDocs.push({ id: docRef.id, ...txData });
  });

  await batch.commit();
  return addedDocs;
}


export async function updateTransaction(userId: string, transactionId: string, transactionData: Partial<Transaction>): Promise<void> {
    const transactionDoc = doc(db, `users/${userId}/transactions`, transactionId);
    await updateDoc(transactionDoc, transactionData);
}

// --- GOALS ---
export async function getGoals(userId: string): Promise<Goal[]> {
    const goalsRef = collection(db, `users/${userId}/goals`);
    const q = query(goalsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) } as Goal));
}

export async function addGoal(userId: string, goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<string> {
    const goalsRef = collection(db, `users/${userId}/goals`);
    const docRef = await addDoc(goalsRef, {
        ...goalData,
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

export async function updateGoal(userId: string, goalId: string, goalData: Partial<Goal>): Promise<void> {
    const goalDoc = doc(db, `users/${userId}/goals`, goalId);
    await updateDoc(goalDoc, goalData);
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalDoc = doc(db, `users/${userId}/goals`, goalId);
    await deleteDoc(goalDoc);
}

// --- BUDGETS ---
export async function getBudgets(userId: string): Promise<Budget[]> {
    const budgetsRef = collection(db, `users/${userId}/budgets`);
    const q = query(budgetsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) } as Budget));
}

export async function addBudget(userId: string, budgetData: Omit<Budget, 'id'>): Promise<string> {
    const budgetsRef = collection(db, `users/${userId}/budgets`);
    const docRef = await addDoc(budgetsRef, budgetData);
    return docRef.id;
}

export async function updateBudget(userId: string, budgetId: string, budgetData: Partial<Budget>): Promise<void> {
    const budgetDoc = doc(db, `users/${userId}/budgets`, budgetId);
    await updateDoc(budgetDoc, budgetData);
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
    const budgetDoc = doc(db, `users/${userId}/budgets`, budgetId);
    await deleteDoc(budgetDoc);
}

export async function updateBudgetOnTransactionChange(userId: string, categoryId: string, transactionDate: string) {
    // Dates in Firestore are strings, so we parse them. Adjust for timezone issues.
    const safeDate = new Date(transactionDate.replace(/-/g, '/'));
    const month = format(safeDate, 'yyyy-MM');

    const budgetsRef = collection(db, `users/${userId}/budgets`);
    const budgetQuery = query(budgetsRef, where('categoryId', '==', categoryId), where('month', '==', month));
    const budgetSnapshot = await getDocs(budgetQuery);

    if (budgetSnapshot.empty) {
        // No budget for this category and month, so nothing to update.
        return;
    }

    const budgetDoc = budgetSnapshot.docs[0];

    // Recalculate the total spent for this category in the given month
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const monthStartDate = format(startOfMonth(safeDate), 'yyyy-MM-dd');
    const monthEndDate = format(endOfMonth(safeDate), 'yyyy-MM-dd');
    
    const transactionsQuery = query(
        transactionsRef,
        where('category', '==', categoryId),
        where('date', '>=', monthStartDate),
        where('date', '<=', monthEndDate),
        where('amount', '<', 0)
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);
    const totalSpent = transactionsSnapshot.docs.reduce((acc, doc) => acc + Math.abs(doc.data().amount), 0);
    
    await updateDoc(budgetDoc.ref, { current: totalSpent });
}

// --- ACHIEVEMENTS ---
export async function getAchievements(userId: string): Promise<UserAchievement[]> {
    const achievementsRef = collection(db, `users/${userId}/achievements`);
    const q = query(achievementsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) } as UserAchievement));
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<string> {
    const achievementsRef = collection(db, `users/${userId}/achievements`);
    const docRef = await addDoc(achievementsRef, {
        achievementId: achievementId,
        unlockedAt: serverTimestamp(),
    });
    return docRef.id;
}
