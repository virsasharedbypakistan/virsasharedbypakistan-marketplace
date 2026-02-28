"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, X, CheckCircle2, Package, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

type Product = {
    id: number;
    name: string;
    category: string;
    status: "Active" | "Draft" | "Hidden";
    stock: number;
    price: number;
    image: string;
};

const PRODUCT_IMAGES = ["/images/products/product1.jpg", "/images/products/product2.jpg"];

const initialProducts: Product[] = [
    { id: 1, name: "Heritage Embroidered Shawl", category: "Textiles > Shawls", status: "Active", stock: 28, price: 199.99, image: PRODUCT_IMAGES[0] },
    { id: 2, name: "Hand-Painted Pottery Set", category: "Crafts > Pottery", status: "Active", stock: 0, price: 399.98, image: PRODUCT_IMAGES[1] },
    { id: 3, name: "Traditional Ajrak Fabric", category: "Textiles > Fabric", status: "Draft", stock: 56, price: 129.50, image: PRODUCT_IMAGES[0] },
    { id: 4, name: "Sindhi Embroidered Kurta", category: "Clothing > Kurta", status: "Active", stock: 42, price: 599.95, image: PRODUCT_IMAGES[1] },
    { id: 5, name: "Handwoven Kilim Rug", category: "Home Decor > Rugs", status: "Hidden", stock: 8, price: 999.99, image: PRODUCT_IMAGES[0] },
];

const statusStyle = (s: string) => {
    switch (s) {
        case "Active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "Draft": return "bg-amber-50 text-amber-600 border-amber-100";
        case "Hidden": return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-gray-50 text-gray-600";
    }
};

type FormState = { name: string; category: string; status: Product["status"]; stock: string; price: string; image: string };
const emptyForm: FormState = { name: "", category: "", status: "Active", stock: "", price: "", image: PRODUCT_IMAGES[0] };

export default function VendorProductsPage() {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
    const [form, setForm] = useState<FormState>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [savedId, setSavedId] = useState<number | null>(null);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, product: null }); setSavedId(null); };
    const openEdit = (p: Product) => {
        setForm({ name: p.name, category: p.category, status: p.status, stock: String(p.stock), price: String(p.price), image: p.image });
        setModal({ open: true, product: p });
        setSavedId(null);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        if (modal.product) {
            setProducts(prev => prev.map(p => p.id === modal.product!.id
                ? { ...p, name: form.name, category: form.category, status: form.status, stock: Number(form.stock), price: Number(form.price), image: form.image }
                : p
            ));
            setSavedId(modal.product.id);
        } else {
            const newId = Date.now();
            setProducts(prev => [...prev, { id: newId, name: form.name, category: form.category, status: form.status, stock: Number(form.stock), price: Number(form.price), image: form.image }]);
            setSavedId(newId);
        }
        setModal({ open: false, product: null });
    };

    const handleDelete = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
    };

    const toggleStatus = (id: number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "Active" ? "Hidden" : "Active" } : p));
    };

    const productToDelete = products.find(p => p.id === deleteConfirm);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your inventory, pricing, and product details.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-all shadow-md">
                    <Plus className="w-4 h-4" /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 w-full md:w-auto justify-end">
                        <span>Showing {filtered.length} of {products.length} items</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Inventory</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="font-medium">No products found</p>
                                </td></tr>
                            )}
                            {filtered.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-virsa-primary transition-colors">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${item.stock === 0 ? "text-red-500" : "text-gray-900"}`}>
                                            {item.stock === 0 ? "Out of Stock" : `${item.stock} in stock`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">Rs {item.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-virsa-primary hover:bg-virsa-light/30 rounded-md transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => toggleStatus(item.id)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title={item.status === "Active" ? "Hide" : "Show"}>
                                                {item.status === "Active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>Previous</button>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-virsa-primary text-white font-bold text-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">3</button>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">Next</button>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModal({ open: false, product: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">{modal.product ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={() => setModal({ open: false, product: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Image picker */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-2">Product Image</label>
                                <div className="flex gap-3">
                                    {PRODUCT_IMAGES.map(img => (
                                        <button key={img} onClick={() => setForm(f => ({ ...f, image: img }))} className={`w-20 h-20 rounded-xl overflow-hidden relative border-2 transition-all ${form.image === img ? "border-virsa-primary shadow-lg shadow-virsa-primary/20" : "border-gray-200"}`}>
                                            <Image src={img} alt="product" fill className="object-cover" />
                                            {form.image === img && <div className="absolute inset-0 bg-virsa-primary/20 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-virsa-primary" /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1.5">Product Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Heritage Embroidered Shawl"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1.5">Category</label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    placeholder="e.g. Textiles > Shawls"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Price (Rs)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={form.stock}
                                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-1.5">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Product["status"] }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setModal({ open: false, product: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.name.trim()}
                                    className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {modal.product ? "Save Changes" : "Add Product"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm !== null && productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                            <p className="text-sm text-gray-500 mb-1">This will permanently remove</p>
                            <p className="text-sm font-bold text-gray-900 mb-6 line-clamp-2">"{productToDelete.name}"</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
