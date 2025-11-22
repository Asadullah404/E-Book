import { create } from 'zustand';

const useStore = create((set) => ({
    // UI State
    isLeftPanelOpen: true,
    isRightPanelOpen: true,
    toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
    toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

    // Theme State
    theme: 'light',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        // Apply dark class to body
        if (typeof document !== 'undefined') {
            if (newTheme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        }
        return { theme: newTheme };
    }),
    setTheme: (theme) => set((state) => {
        // Apply dark class to body
        if (typeof document !== 'undefined') {
            if (theme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        }
        return { theme };
    }),

    // Content State
    currentBook: null,
    currentChapter: null,
    setCurrentBook: (book) => set({ currentBook: book }),
    setCurrentChapter: (chapter) => set({ currentChapter: chapter }),


    // Modal State
    isAddContentModalOpen: false,
    toggleAddContentModal: () => set((state) => ({ isAddContentModalOpen: !state.isAddContentModalOpen })),
}));

export default useStore;
