// Firestore Service - Database operations
import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';

// ==================== USER OPERATIONS ====================

/**
 * Get user role from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<string>} - User role ('admin' or 'user')
 */
export const getUserRole = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().role || 'user';
        }
        return 'user'; // Default role
    } catch (error) {
        console.error('Error fetching user role:', error);
        return 'user';
    }
};

/**
 * Create or update user document in Firestore
 * @param {string} uid - User ID
 * @param {Object} userData - User data
 */
export const createOrUpdateUser = async (uid, userData) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user with default role
            await setDoc(userRef, {
                ...userData,
                role: 'user', // Default role for new users
                createdAt: new Date().toISOString(),
            });
        } else {
            // Update existing user (preserve role)
            await updateDoc(userRef, {
                ...userData,
                lastLogin: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};

/**
 * Upgrade user role to admin
 * @param {string} uid - User ID
 */
export const upgradeUserRole = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: 'admin'
        });
    } catch (error) {
        console.error('Error upgrading user role:', error);
        throw error;
    }
};

// ==================== BOOK OPERATIONS ====================

/**
 * Get all books/categories from Firestore
 * @returns {Promise<Array>} - Array of books
 */
export const getBooks = async () => {
    try {
        const booksSnapshot = await getDocs(collection(db, 'books'));
        const books = [];

        for (const bookDoc of booksSnapshot.docs) {
            const bookData = { id: bookDoc.id, ...bookDoc.data() };

            // Fetch chapters for this book
            const chaptersSnapshot = await getDocs(
                query(
                    collection(db, 'chapters'),
                    where('bookId', '==', bookDoc.id),
                    orderBy('order', 'asc')
                )
            );

            bookData.children = chaptersSnapshot.docs.map(chapterDoc => ({
                id: chapterDoc.id,
                ...chapterDoc.data(),
            }));

            books.push(bookData);
        }

        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
};

/**
 * Add a new book (admin only)
 * @param {Object} bookData - Book data
 * @returns {Promise<string>} - New book ID
 */
export const addBook = async (bookData) => {
    try {
        const docRef = await addDoc(collection(db, 'books'), {
            ...bookData,
            type: 'category',
            createdAt: new Date().toISOString(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
};

/**
 * Delete a book (admin only)
 * @param {string} bookId - Book ID
 */
export const deleteBook = async (bookId) => {
    try {
        const bookRef = doc(db, 'books', bookId);
        const bookSnap = await getDoc(bookRef);

        if (bookSnap.exists()) {
            // Optional: Check ownership if needed, but currently admin-only or owner-only logic is handled in UI/Rules
            // For now, we just delete.
            await deleteDoc(bookRef);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
};

// ==================== CHAPTER OPERATIONS ====================

/**
 * Get chapter content by ID
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Object>} - Chapter data
 */
export const getChapter = async (chapterId) => {
    try {
        const chapterDoc = await getDoc(doc(db, 'chapters', chapterId));
        if (chapterDoc.exists()) {
            return { id: chapterDoc.id, ...chapterDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching chapter:', error);
        return null;
    }
};

/**
 * Get chapters by book ID
 * @param {string} bookId - Book ID
 * @returns {Promise<Array>} - Array of chapters
 */
export const getChaptersByBook = async (bookId) => {
    try {
        const chaptersSnapshot = await getDocs(
            query(
                collection(db, 'chapters'),
                where('bookId', '==', bookId),
                orderBy('order', 'asc')
            )
        );
        return chaptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
};

/**
 * Add a new chapter (admin only)
 * @param {Object} chapterData - Chapter data
 * @returns {Promise<string>} - New chapter ID
 */
export const addChapter = async (chapterData) => {
    try {
        const docRef = await addDoc(collection(db, 'chapters'), {
            ...chapterData,
            type: 'chapter',
            createdAt: new Date().toISOString(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding chapter:', error);
        throw error;
    }
};

/**
 * Update chapter content (admin only)
 * @param {string} chapterId - Chapter ID
 * @param {Object} updates - Updated data
 */
export const updateChapter = async (chapterId, updates) => {
    try {
        await updateDoc(doc(db, 'chapters', chapterId), {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating chapter:', error);
        throw error;
    }
};

/**
 * Delete chapter (admin only)
 * @param {string} chapterId - Chapter ID
 */
export const deleteChapter = async (chapterId) => {
    try {
        await deleteDoc(doc(db, 'chapters', chapterId));
    } catch (error) {
        console.error('Error deleting chapter:', error);
        throw error;
    }
};
