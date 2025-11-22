import { useState, useEffect, useRef } from 'react';

export default function usePyodide() {
    const [pyodide, setPyodide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [output, setOutput] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadPyodide = async () => {
            if (window.pyodide) {
                setPyodide(window.pyodide);
                setIsLoading(false);
                return;
            }

            // Load script
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js";
            script.async = true;
            script.onload = async () => {
                if (!isMounted) return;
                try {
                    const py = await window.loadPyodide();
                    // Redirect stdout
                    py.setStdout({
                        batched: (msg) => {
                            setOutput((prev) => [...prev, msg]);
                        }
                    });
                    if (isMounted) {
                        setPyodide(py);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error("Failed to load Pyodide:", err);
                    if (isMounted) setIsLoading(false);
                }
            };
            document.body.appendChild(script);
        };

        loadPyodide();

        return () => {
            isMounted = false;
        };
    }, []);

    const runPython = async (code) => {
        if (!pyodide) return;
        setOutput([]); // Clear previous output
        try {
            await pyodide.runPythonAsync(code);
        } catch (err) {
            setOutput((prev) => [...prev, `Error: ${err.message}`]);
        }
    };

    return { pyodide, isLoading, output, runPython, clearOutput: () => setOutput([]) };
}
