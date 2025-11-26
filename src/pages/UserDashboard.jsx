import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/DataTable";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function UserDashboard() {
    const { logout, currentUser } = useAuth();
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch available datasets
    useEffect(() => {
        async function fetchDatasets() {
            try {
                const q = query(collection(db, "datasets"), orderBy("uploadedAt", "desc"));
                const querySnapshot = await getDocs(q);

                const fetchedDatasets = [];
                querySnapshot.forEach((doc) => {
                    fetchedDatasets.push({ id: doc.id, ...doc.data() });
                });

                setDatasets(fetchedDatasets);

                // Auto-select first dataset
                if (fetchedDatasets.length > 0) {
                    setSelectedDataset(fetchedDatasets[0]);
                }
            } catch (err) {
                console.error("Error fetching datasets:", err);
                setError("Failed to load datasets.");
            } finally {
                setLoading(false);
            }
        }

        fetchDatasets();
    }, []);

    // Fetch data for selected dataset
    useEffect(() => {
        if (!selectedDataset) return;

        async function fetchData() {
            try {
                setLoading(true);
                setError("");

                // Fetch data for this dataset
                const q = query(
                    collection(db, "public_data"),
                    where("datasetId", "==", selectedDataset.id)
                );
                const querySnapshot = await getDocs(q);

                const fetchedData = [];
                querySnapshot.forEach((doc) => {
                    const { datasetId, uploadedAt, ...rest } = doc.data();
                    fetchedData.push(rest);
                });

                setData(fetchedData);
                setColumns(selectedDataset.columns || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedDataset]);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Data Portal</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{currentUser?.email}</span>
                            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Dataset Selector */}
                    {datasets.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Dataset
                            </label>
                            <select
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={selectedDataset?.id || ""}
                                onChange={(e) => {
                                    const dataset = datasets.find(d => d.id === e.target.value);
                                    setSelectedDataset(dataset);
                                }}
                            >
                                {datasets.map((ds) => (
                                    <option key={ds.id} value={ds.id}>
                                        {ds.name} ({ds.recordCount} records)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Data Display */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium text-gray-900">
                                {selectedDataset?.name || "Data"}
                            </h2>
                            {loading && <span className="text-sm text-gray-500">Loading...</span>}
                        </div>

                        {error && (
                            <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}

                        {!loading && !error && data.length === 0 && (
                            <div className="text-center p-8 text-gray-500">
                                No data available. Admin hasn't published any datasets yet.
                            </div>
                        )}

                        {!loading && !error && data.length > 0 && (
                            <DataTable data={data} columns={columns} itemsPerPage={10} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
