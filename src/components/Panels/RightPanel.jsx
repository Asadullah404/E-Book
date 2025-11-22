import React, { useState, useEffect } from 'react';
import usePyodide from '@/hooks/usePyodide';
import { Play, Trash2, Terminal } from 'lucide-react';
import useStore from '@/store/useStore';

export default function RightPanel() {
    const { pyodide, isLoading, output, runPython, clearOutput } = usePyodide();
    const [code, setCode] = useState('# Write your Python code here\nprint("Hello from Pyodide!")\n\nfor i in range(5):\n    print(f"Count: {i}")');
    const { currentChapter } = useStore();

    // Update code snippet based on chapter (optional)
    useEffect(() => {
        if (currentChapter && currentChapter.id === 'chap2') {
            setCode('# Example: Variables\nx = 10\ny = 20\nprint(f"Sum: {x + y}")');
        }
    }, [currentChapter]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Terminal size={18} className="text-green-500" />
                    Sandbox
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={clearOutput}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Clear Output"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => runPython(code)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={14} /> Run
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {/* Editor */}
                <div className="flex-1 relative bg-gray-50 dark:bg-gray-900/50">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full p-4 bg-transparent resize-none outline-none font-mono text-sm text-gray-800 dark:text-gray-200"
                        spellCheck="false"
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                        </div>
                    )}
                </div>

                {/* Output */}
                <div className="h-1/3 bg-black text-green-400 font-mono text-xs p-4 overflow-y-auto border-t border-gray-800">
                    <div className="mb-2 text-gray-500 uppercase tracking-wider text-[10px]">Console Output</div>
                    {output.length === 0 ? (
                        <span className="text-gray-600 italic">Ready...</span>
                    ) : (
                        output.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap border-b border-gray-800/50 pb-1 mb-1 last:border-0">{line}</div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
