'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Plus, Book, FileText, ArrowLeft, ChevronRight } from 'lucide-react';
import useStore from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { getBooks, addBook, deleteBook, addChapter, deleteChapter, getChaptersByBook } from '@/lib/firestoreService';

export default function AddContentModal() {
    const { isAddContentModalOpen, toggleAddContentModal } = useStore();
    const { isAdmin } = useAuth();

    // View state: 'books' or 'chapters'
    const [view, setView] = useState('books');
    const [selectedBook, setSelectedBook] = useState(null);

    // Data state
    const [books, setBooks] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [bookTitle, setBookTitle] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [fileName, setFileName] = useState('');

    // Fetch books when modal opens
    useEffect(() => {
        if (isAddContentModalOpen && isAdmin) {
            fetchBooks();
        }
    }, [isAddContentModalOpen, isAdmin]);

    // Only render if user is admin
    if (!isAdmin) return null;

    const fetchBooks = async () => {
        setLoading(true);
        const booksData = await getBooks();
        setBooks(booksData);
        setLoading(false);
    };

    const fetchChapters = async (bookId) => {
        setLoading(true);
        const chaptersData = await getChaptersByBook(bookId);
        setChapters(chaptersData);
        setLoading(false);
    };

    const handleCreateBook = async () => {
        if (!bookTitle.trim()) {
            alert('Please enter a book title');
            return;
        }

        try {
            setLoading(true);
            await addBook({
                title: bookTitle,
                order: Date.now(),
            });
            setBookTitle('');
            await fetchBooks();
            alert('Book created successfully!');
        } catch (error) {
            console.error('Error creating book:', error);
            alert('Failed to create book');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async (bookId, bookTitle) => {
        if (!confirm(`Delete "${bookTitle}"? This will NOT delete its chapters.`)) return;

        try {
            setLoading(true);
            await deleteBook(bookId);
            await fetchBooks();
            alert('Book deleted successfully!');
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = async (book) => {
        setSelectedBook(book);
        setView('chapters');
        await fetchChapters(book.id);
    };

    const handleBackToBooks = () => {
        setView('books');
        setSelectedBook(null);
        setChapters([]);
        setChapterTitle('');
        setHtmlContent('');
        setFileName('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setHtmlContent(event.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleAddChapter = async () => {
        if (!chapterTitle.trim()) {
            alert('Please enter a chapter title');
            return;
        }
        if (!htmlContent.trim()) {
            alert('Please upload HTML content');
            return;
        }

        try {
            setLoading(true);
            await addChapter({
                title: chapterTitle,
                bookId: selectedBook.id,
                content: htmlContent,
                order: Date.now(),
            });
            setChapterTitle('');
            setHtmlContent('');
            setFileName('');
            await fetchChapters(selectedBook.id);
            alert('Chapter added successfully!');
        } catch (error) {
            console.error('Error adding chapter:', error);
            alert('Failed to add chapter');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChapter = async (chapterId, chapterTitle) => {
        if (!confirm(`Delete chapter "${chapterTitle}"?`)) return;

        try {
            setLoading(true);
            await deleteChapter(chapterId);
            await fetchChapters(selectedBook.id);
            alert('Chapter deleted successfully!');
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('Failed to delete chapter');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isAddContentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleAddContentModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                            <div className="flex items-center gap-3">
                                {view === 'chapters' && (
                                    <button
                                        onClick={handleBackToBooks}
                                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {view === 'books' ? 'Manage Books' : `Manage Chapters: ${selectedBook?.title}`}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {view === 'books' ? 'Create and manage your book collection' : 'Add or remove chapters'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleAddContentModal}
                                className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {view === 'books' ? (
                                <BooksView
                                    books={books}
                                    loading={loading}
                                    bookTitle={bookTitle}
                                    setBookTitle={setBookTitle}
                                    handleCreateBook={handleCreateBook}
                                    handleSelectBook={handleSelectBook}
                                    handleDeleteBook={handleDeleteBook}
                                />
                            ) : (
                                <ChaptersView
                                    chapters={chapters}
                                    loading={loading}
                                    chapterTitle={chapterTitle}
                                    setChapterTitle={setChapterTitle}
                                    fileName={fileName}
                                    handleFileUpload={handleFileUpload}
                                    handleAddChapter={handleAddChapter}
                                    handleDeleteChapter={handleDeleteChapter}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Books View Component
function BooksView({ books, loading, bookTitle, setBookTitle, handleCreateBook, handleSelectBook, handleDeleteBook }) {
    return (
        <div className="space-y-6">
            {/* Create New Book */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl border border-blue-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Plus size={20} className="text-blue-600 dark:text-blue-400" /> Create New Book
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Enter book title..."
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateBook()}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleCreateBook}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {loading ? 'Creating...' : 'Create Book'}
                    </button>
                </div>
            </div>

            {/* Books List */}
            <div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Your Books ({books.length})</h3>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {books.map((book) => (
                            <motion.div
                                key={book.id}
                                whileHover={{ scale: 1.02 }}
                                className="group relative bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <div onClick={() => handleSelectBook(book)} className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Book size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                            {book.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {book.children?.length || 0} chapters
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBook(book.id, book.title);
                                    }}
                                    className="absolute top-3 right-3 p-2 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Book size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No books yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first book above</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Chapters View Component
function ChaptersView({ chapters, loading, chapterTitle, setChapterTitle, fileName, handleFileUpload, handleAddChapter, handleDeleteChapter }) {
    return (
        <div className="space-y-6">
            {/* Add New Chapter */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl border border-purple-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Plus size={20} className="text-purple-600 dark:text-purple-400" /> Add New Chapter
                </h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Chapter title..."
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gray-900 dark:text-white"
                    />
                    <label className="block w-full cursor-pointer">
                        <div className="border-2 border-dashed border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                            <Upload size={32} className="mx-auto text-purple-500 mb-2" />
                            <p className="font-medium text-purple-600 dark:text-purple-400">
                                {fileName || 'Click to upload HTML file'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">HTML files only</p>
                        </div>
                        <input type="file" className="hidden" accept=".html" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={handleAddChapter}
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Adding...' : 'Add Chapter'}
                    </button>
                </div>
            </div>

            {/* Chapters List */}
            <div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Chapters ({chapters.length})</h3>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                    </div>
                ) : chapters.length > 0 ? (
                    <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{chapter.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(chapter.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                                    className="p-2 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No chapters yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add your first chapter above</p>
                    </div>
                )}
            </div>
        </div>
    );
}
