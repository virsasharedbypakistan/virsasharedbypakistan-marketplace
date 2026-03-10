"use client";

import { useState } from "react";

export default function DealsClientActions() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="flex flex-wrap gap-3 mb-8">
            {["All Deals", "Flash Sales", "Best Sellers", "Electronics", "Fashion", "Home", "Beauty"].map((tab, i) => (
                <button 
                    key={tab} 
                    onClick={() => setFilter(i === 0 ? "all" : tab.toLowerCase())}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${i === 0 && filter === "all" ? 'bg-virsa-primary text-white border-virsa-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-virsa-primary hover:text-virsa-primary'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
