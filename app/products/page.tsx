import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-gray-50/50 min-h-screen">
                    <div className="container mx-auto px-4 py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 mt-4">Loading products...</p>
                    </div>
                </div>
            }
        >
            <ProductsClient />
        </Suspense>
    );
}
