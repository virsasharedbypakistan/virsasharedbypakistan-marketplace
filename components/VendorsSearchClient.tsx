"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function VendorsSearchClient() {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    return (
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search stores by name or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-virsa-primary focus:ring-2 focus:ring-virsa-primary/10 text-sm" 
                />
            </div>
            <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium bg-white appearance-none focus:outline-none focus:border-virsa-primary cursor-pointer"
            >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Kitchen</option>
                <option value="beauty">Beauty & Health</option>
                <option value="sports">Sports</option>
            </select>
        </div>
    );
}
