import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export function DataTable({ data, columns, itemsPerPage = 10 }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-gray-500">No data available</div>;
    }

    // Use explicit columns if provided, otherwise auto-generate and filter
    const tableColumns = columns && columns.length > 0
        ? columns.filter(key => !['uploadedAt', 'sourceFile', 'datasetId'].includes(key))
        : Object.keys(data[0])
            .filter(key => !['uploadedAt', 'sourceFile', 'datasetId'].includes(key))
            .sort(); // Fallback to alphabetical if no explicit columns

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Showing {filteredData.length} results
                </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {tableColumns.map((col) => (
                                <th
                                    key={col}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentData.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {tableColumns.map((col) => (
                                    <td key={`${i}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
