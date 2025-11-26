import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { FileUpload } from "../components/FileUpload";
import { DataTable } from "../components/DataTable";
import { db } from "../firebaseConfig";
import { collection, addDoc, writeBatch, doc } from "firebase/firestore";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
    const { logout } = useAuth();
    const [parsedData, setParsedData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [datasetName, setDatasetName] = useState("");
    const [previewColumns, setPreviewColumns] = useState([]);
    const [publishing, setPublishing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleDataParsed = (data, name) => {
        setParsedData(data);
        setFileName(name);
        // Set default dataset name from filename (without extension)
        setDatasetName(name.replace(/\.[^/.]+$/, ""));
        // Capture column order from first row
        if (data && data.length > 0) {
            setPreviewColumns(Object.keys(data[0]));
        }
        setMessage({ type: "", text: "" });
    };

    const handlePublish = async () => {
        if (!parsedData) return;

        setPublishing(true);
        setMessage({ type: "", text: "" });
        setUploadProgress({ current: 0, total: parsedData.length });

        try {
            // Get column names in original order (first row's keys)
            const columns = Object.keys(parsedData[0]);

            // Create dataset metadata
            const datasetRef = await addDoc(collection(db, "datasets"), {
                name: datasetName || fileName, // Use custom name or fallback to filename
                columns: columns,
                uploadedAt: new Date().toISOString(),
                recordCount: parsedData.length
            });

            const datasetId = datasetRef.id;
            const collectionRef = collection(db, "public_data");

            const chunkSize = 450; // Safe margin for Firestore batch limit
            const chunks = [];
            for (let i = 0; i < parsedData.length; i += chunkSize) {
                chunks.push(parsedData.slice(i, i + chunkSize));
            }

            let totalAdded = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach((row) => {
                    const docRef = doc(collectionRef);
                    batch.set(docRef, {
                        ...row,
                        datasetId: datasetId,
                        uploadedAt: new Date().toISOString()
                    });
                });
                await batch.commit();
                totalAdded += chunk.length;
                setUploadProgress({ current: totalAdded, total: parsedData.length });
            }

            setMessage({ type: "success", text: `Successfully published ${totalAdded} records!` });
            // Delay clearing to show success message
            setTimeout(() => {
                setParsedData(null);
                setFileName("");
                setDatasetName("");
                setUploadProgress({ current: 0, total: 0 });
            }, 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to publish data: " + err.message });
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Administrator</span>
                            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Success/Error Message */}
                    {message.text && (
                        <div className={cn("p-4 rounded-md", message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                            {message.text}
                        </div>
                    )}

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Data</h2>
                        <FileUpload onDataParsed={handleDataParsed} />
                    </div>

                    {/* Preview Section */}
                    {parsedData && (
                        <div className="bg-white p-6 rounded-lg shadow space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Data Preview <span className="text-gray-500 text-sm">({parsedData.length} records)</span>
                                </h2>
                                <div className="space-x-2">
                                    <Button variant="outline" onClick={() => setParsedData(null)}>Cancel</Button>
                                    <Button onClick={handlePublish} isLoading={publishing}>
                                        {publishing ? "Publishing..." : "Publish Data"}
                                    </Button>
                                </div>
                            </div>

                            {/* Dataset Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dataset Name
                                </label>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    placeholder="Enter a name for this dataset"
                                />
                            </div>

                            {/* Upload Progress */}
                            {publishing && uploadProgress.total > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress.current} / {uploadProgress.total} records</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <DataTable data={parsedData} columns={previewColumns} itemsPerPage={5} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
