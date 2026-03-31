"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
    initialQuery?: string;
};

export default function VendorsSearchClient({ initialQuery = "" }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    useEffect(() => {
        setSearchTerm(initialQuery);
    }, [initialQuery]);

    const submitSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = value.trim();

        if (trimmed) {
            params.set("q", trimmed);
        } else {
            params.delete("q");
        }

        const queryString = params.toString();
        router.push(queryString ? `/vendors?${queryString}` : "/vendors");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitSearch(searchTerm);
    };

    const handleClear = () => {
        setSearchTerm("");
        submitSearch("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search stores by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-virsa-primary focus:ring-2 focus:ring-virsa-primary/10 text-sm"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <button
                type="submit"
                className="px-5 py-3 bg-virsa-primary text-white rounded-2xl text-sm font-bold hover:bg-virsa-primary/90 transition-colors"
            >
                Search
            </button>
        </form>
    );
}
