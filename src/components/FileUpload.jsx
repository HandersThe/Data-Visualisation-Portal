import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { parseFile } from "../lib/parser";
import { Button } from "./ui/Button";

export function FileUpload({ onDataParsed }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const processFile = async (selectedFile) => {
        if (!selectedFile) return;

        const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
        // Note: MIME types can be tricky, checking extension is also good practice which parser does.

        setFile(selectedFile);
        setError("");
        setLoading(true);

        try {
            const data = await parseFile(selectedFile);
            onDataParsed(data, selectedFile.name);
        } catch (err) {
            setError(err.message);
            setFile(null);
        } finally {
            setLoading(false);
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
        onDataParsed(null, null);
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                        error && "border-red-500 bg-red-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={cn("w-10 h-10 mb-3", error ? "text-red-500" : "text-gray-400")} />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV or Excel (XLSX)</p>
                    </div>
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".csv, .xlsx, .xls"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                            <File className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFile}>
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>
            )}

            {loading && <p className="mt-2 text-sm text-blue-600">Parsing file...</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
