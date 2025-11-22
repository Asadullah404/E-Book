'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Book, FileText, Hash } from 'lucide-react';
import useStore from '@/store/useStore';
import { getBooks } from '@/lib/firestoreService';

const NavItem = ({ item, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { setCurrentChapter } = useStore();

    const hasChildren = item.children && item.children.length > 0;

    const handleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
        if (item.type === 'chapter') {
            setCurrentChapter(item);
        }
    };

    const getIcon = () => {
        if (item.type === 'category') return <Book size={16} className="text-blue-500" />;
        if (item.type === 'chapter') return <FileText size={16} className="text-purple-500" />;
        return <Hash size={14} className="text-gray-400" />;
    };

    return (
        <div className="select-none">
            <motion.div
                onClick={handleClick}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${depth > 0 ? 'ml-4' : ''
                    }`}
                whileHover={{ x: 4 }}
            >
                <span className="text-gray-500 dark:text-gray-400">
                    {hasChildren ? (
                        <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight size={14} />
                        </motion.div>
                    ) : (
                        <div className="w-3.5" />
                    )}
                </span>
                {getIcon()}
                <span className={`text-sm ${item.type === 'heading' ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-white'}`}>
                    {item.title}
                </span>
            </motion.div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {item.children.map((child) => (
                            <NavItem key={child.id} item={child} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function LeftPanel() {
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibrary = async () => {
            setLoading(true);
            const books = await getBooks();
            setLibrary(books);
            setLoading(false);
        };

        fetchLibrary();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Library
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : library.length > 0 ? (
                    library.map((item) => (
                        <NavItem key={item.id} item={item} />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        <p>No books available</p>
                        <p className="text-xs mt-2">Admin can add content</p>
                    </div>
                )}
            </div>
        </div>
    );
}
