'use client';

import React, { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import { getChapter } from '@/lib/firestoreService';

const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto mt-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl mt-8" />
    </div>
);

export default function CenterPanel() {
    const { currentChapter, isLeftPanelOpen, isRightPanelOpen } = useStore();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchChapterContent = async () => {
            if (currentChapter) {
                setLoading(true);
                try {
                    // If chapter has content property, use it directly
                    if (currentChapter.content) {
                        setContent(currentChapter.content);
                    } else {
                        // Otherwise fetch from Firestore
                        const chapterData = await getChapter(currentChapter.id);
                        if (chapterData && chapterData.content) {
                            setContent(chapterData.content);
                        } else {
                            // Fallback to demo content
                            setContent(`
                                <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">${currentChapter.title}</h1>
                                <p class="text-lg leading-relaxed mb-4 text-gray-900 dark:text-gray-300">
                                    This chapter doesn't have content yet. Admin can add content using the "Add Content" button.
                                </p>
                            `);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching chapter:', error);
                    setContent(`
                        <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Error Loading Chapter</h1>
                        <p class="text-lg leading-relaxed mb-4 text-red-600 dark:text-red-400">
                            Failed to load chapter content. Please try again.
                        </p>
                    `);
                }
                setLoading(false);
            } else {
                setContent(null);
            }
        };

        fetchChapterContent();
    }, [currentChapter]);

    if (!currentChapter) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">📚</span>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome to Reader</h1>
                <p className="text-gray-700 dark:text-gray-400 max-w-md">
                    Select a chapter from the library on the left to start reading.
                </p>
            </div>
        );
    }

    // Dynamically adjust max-width based on sidebar state and screen size
    // Mobile: full width, Desktop varies by sidebar state
    const getMaxWidth = () => {
        // On mobile, always use full width
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return 'max-w-full';
        }
        // Desktop: adjust based on sidebars
        if (!isLeftPanelOpen && !isRightPanelOpen) return 'max-w-5xl';
        if (isLeftPanelOpen && isRightPanelOpen) return 'max-w-3xl';
        return 'max-w-4xl';
    };

    return (
        <div className={`${getMaxWidth()} mx-auto pb-20`}>
            {loading ? (
                <SkeletonLoader />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
        </div>
    );
}
