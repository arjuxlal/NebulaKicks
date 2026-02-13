"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Package, ClipboardList, TrendingUp, Settings, Trash2, CheckCircle, Clock, Truck, Upload, Loader2, LogOut, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    price: number | string;
    image: string;
    images?: string[];
    description: string;
    category?: string;
}

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image?: string;
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    address?: string;
    total: number;
    status: string;
    createdAt?: string;
    items?: OrderItem[];
}

interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "categories" | "analytics" | "settings">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Form states
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        image: "",
        images: [] as string[],
        description: "",
        category: "",
    });
    const [files, setFiles] = useState<FileList | null>(null);

    // Category form states
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        icon: ""
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, orderRes, catRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/orders"),
                fetch("/api/categories"),
            ]);
            const [prodData, orderData, catData] = await Promise.all([
                prodRes.json(),
                orderRes.json(),
                catRes.json(),
            ]);
            setProducts(prodData);
            setOrders(orderData);
            setCategories(catData);
        } catch (err) {
            console.error("Fetch Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Analytics calculations
    const validOrders = orders.filter(order => !["CANCELLED", "RETURNED"].includes(order.status));
    const lostOrders = orders.filter(order => ["CANCELLED", "RETURNED"].includes(order.status));

    const analytics = {
        totalRevenue: validOrders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: orders.length,
        averageOrderValue: validOrders.length > 0
            ? validOrders.reduce((sum, order) => sum + order.total, 0) / validOrders.length
            : 0,
        totalLoss: lostOrders.reduce((sum, order) => sum + order.total, 0),
        ordersByStatus: orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        const allImages = [...(newProduct.images || []), newProduct.image].filter(Boolean);

        try {
            // 1. Upload Files if selected
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const formData = new FormData();
                    formData.append("file", files[i]);
                    const uploadRes = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!uploadRes.ok) throw new Error("File upload failed");
                    const uploadData = await uploadRes.json();
                    allImages.push(uploadData.url);
                }
            }

            // 2. Create Product
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newProduct,
                    images: allImages,
                    image: allImages[0] || "" // Primary image
                }),
            });

            if (res.ok) {
                setNewProduct({ name: "", price: "", image: "", images: [], description: "", stock: "10", category: "" });
                setFiles(null);
                fetchData();
            }
        } catch (err) {
            console.error("Create Product Error:", err);
            alert("Failed to create product.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchData();
            } else {
                alert("Failed to delete product");
            }
        } catch (err) {
            console.error("Delete Product Error:", err);
            alert("Error deleting product");
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Update Order Error:", err);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                if (selectedOrder?.id === orderId) setSelectedOrder(null);
            } else {
                alert("Failed to delete order");
            }
        } catch (err) {
            console.error("Delete Order Error:", err);
            alert("Error deleting order");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "text-yellow-400";
            case "PROCESSING": return "text-blue-400";
            case "SHIPPED": return "text-neon-cyan";
            case "DELIVERED": return "text-green-400";
            case "CANCELLED": return "text-red-500";
            case "RETURNED": return "text-orange-500";
            default: return "text-white";
        }
    };

    // Category handlers
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            if (res.ok) {
                const createdCategory = await res.json();
                setCategories((prev) => [...prev, createdCategory]);
                setNewCategory({ name: "", description: "", icon: "" });
            }
        } catch (err) {
            console.error("Create Category Error:", err);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const res = await fetch("/api/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingCategory.id,
                    name: editingCategory.name,
                    description: editingCategory.description || "",
                    icon: editingCategory.icon || "",
                }),
            });

            if (res.ok) {
                const updatedCategory = await res.json();
                setCategories((prev) =>
                    prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
                );
                setEditingCategory(null);
            }
        } catch (err) {
            console.error("Update Category Error:", err);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
            }
        } catch (err) {
            console.error("Delete Category Error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-deep-dark text-white font-inter flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 hidden lg:flex flex-col">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-ultraviolet rounded-lg" />
                    <h1 className="font-orbitron font-bold text-xl tracking-tighter">NEBULA<span className="text-ultraviolet">OS</span></h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-white/5 text-white/50'}`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Products</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-white/5 text-white/50'}`}
                    >
                        <ClipboardList size={20} />
                        <span className="font-medium">Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-white/5 text-white/50'}`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Categories</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-white/5 text-white/50'}`}
                    >
                        <TrendingUp size={20} />
                        <span className="font-medium">Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-neon-cyan' : 'hover:bg-white/5 text-white/50'}`}
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </button>
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all mt-auto"
                >
                    <LogOut size={20} />
                    <span className="font-medium">System Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h2 className="text-3xl font-orbitron font-bold">
                            {activeTab === "products" ? "PRODUCT MANAGEMENT" : "ORDER MANAGEMENT"}
                        </h2>
                        <p className="text-white/40 mt-1">Status: <span className="text-neon-cyan">System Online</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold">{session?.user?.name || "Admin User"}</p>
                            <p className="text-xs text-white/40">Level 4 Clearance</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-ultraviolet to-neon-cyan p-[2px]">
                            <div className="w-full h-full rounded-full bg-deep-dark flex items-center justify-center">
                                <span className="font-bold">{session?.user?.name?.[0]?.toUpperCase() || "A"}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === "products" ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Add Product Form */}
                            <section className="glass-dark rounded-3xl p-8 border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Plus className="text-neon-cyan" />
                                    INITIALIZE NEW PRODUCT
                                </h3>
                                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">PRODUCT NAME</label>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                                            placeholder="e.g. Nebula 97 'Starfall'"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">PRICE (USD)</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                                            placeholder="299.99"
                                            required
                                        />
                                    </div>

                                    {/* Category Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">CATEGORY</label>
                                        <select
                                            value={newProduct.category || ""}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                                            required
                                        >
                                            <option value="" style={{ color: 'black' }}>Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name} style={{ color: 'black' }}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">PRODUCT IMAGES</label>
                                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={imageUrlInput}
                                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all pl-12"
                                                    placeholder="Enter external URL..."
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-xs">URL</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (imageUrlInput) {
                                                        setNewProduct({ ...newProduct, images: [...newProduct.images, imageUrlInput] });
                                                        setImageUrlInput("");
                                                    }
                                                }}
                                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
                                            >
                                                Add URL
                                            </button>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                    accept="image/*"
                                                    multiple
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className={`cursor-pointer h-full px-6 py-3 flex items-center gap-2 rounded-xl border border-white/10 transition-all ${files ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan" : "bg-white/5 hover:bg-white/10"}`}
                                                >
                                                    <Upload size={18} />
                                                    <span className="text-sm font-bold whitespace-nowrap">{files ? `${files.length} Files` : "Upload Local"}</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Image List Preview */}
                                        {newProduct.images.length > 0 && (
                                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                                {newProduct.images.map((img, idx) => (
                                                    <div key={idx} className="relative group flex-shrink-0">
                                                        <img src={img} className="w-20 h-20 object-cover rounded-xl border border-white/10 bg-white/5" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = [...newProduct.images];
                                                                newImages.splice(idx, 1);
                                                                setNewProduct({ ...newProduct, images: newImages });
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                        {idx === 0 && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-cyan text-black text-[10px] font-bold px-2 py-0.5 rounded-full">MAIN</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-white/40 tracking-widest">DESCRIPTION</label>
                                        <textarea
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all h-24 resize-none"
                                            placeholder="Enter holographic details..."
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="md:col-span-2 neon-button-cyan font-bold py-4 flex items-center justify-center gap-2"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" /> : "UPLOAD TO REPOSITORY"}
                                    </button>
                                </form>
                            </section>

                            {/* Product List */}
                            <section>
                                <h3 className="text-xl font-bold mb-6">EXISTING PROTO-MODELS</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="glass-dark border-white/5 p-6 rounded-2xl flex items-center gap-4">
                                            <img src={product.image} className="w-16 h-16 object-contain rounded-lg bg-white/5" />
                                            <div className="flex-1">
                                                <h4 className="font-bold line-clamp-1">{product.name}</h4>
                                                <p className="text-neon-cyan font-mono text-sm">₹{product.price}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {products.length === 0 && <p className="text-white/20 italic">No products found in local storage.</p>}
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-dark rounded-3xl overflow-hidden border-white/5">
                                <table className="w-full text-left">
                                    <thead className="bg-white/10 text-xs font-bold tracking-widest text-white/40">
                                        <tr>
                                            <th className="px-6 py-4">ORDER ID</th>
                                            <th className="px-6 py-4">CUSTOMER</th>
                                            <th className="px-6 py-4">TOTAL</th>
                                            <th className="px-6 py-4">STATUS</th>
                                            <th className="px-6 py-4 text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-6 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</td>
                                                <td className="px-6 py-6 font-medium">
                                                    {order.customerName}
                                                    <div className="text-xs text-white/30">{order.customerEmail}</div>
                                                </td>
                                                <td className="px-6 py-6 font-bold text-neon-cyan">₹{order.total}</td>
                                                <td className={`px-6 py-6 font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                                    {order.status === 'PENDING' && <Clock size={16} />}
                                                    {order.status === 'SHIPPED' && <Truck size={16} />}
                                                    {order.status === 'DELIVERED' && <CheckCircle size={16} />}
                                                    {order.status}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrder(order);
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-neon-cyan transition-all"
                                                            title="View Details"
                                                        >
                                                            <TrendingUp size={18} />
                                                        </button>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateOrderStatus(order.id, e.target.value);
                                                            }}
                                                            className="bg-deep-dark border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-neon-cyan"
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="PROCESSING">Processing</option>
                                                            <option value="SHIPPED">Shipped</option>
                                                            <option value="DELIVERED">Delivered</option>
                                                            <option value="CANCELLED">Cancelled</option>
                                                            <option value="RETURNED">Returned</option>
                                                        </select>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOrder(order.id);
                                                            }}
                                                            className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-lg transition-all"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && (
                                    <div className="py-20 text-center text-white/20 italic">
                                        No active transmissions found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === "categories" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-orbitron font-bold mb-2">Category Management</h2>
                                <p className="text-white/50">Organize products with custom categories</p>
                            </div>

                            {/* Create/Edit Category Form */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-4">
                                    {editingCategory ? "Edit Category" : "Create New Category"}
                                </h3>
                                <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">CATEGORY NAME*</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Running Shoes"
                                                value={editingCategory ? editingCategory.name : newCategory.name}
                                                onChange={(e) =>
                                                    editingCategory
                                                        ? setEditingCategory({ ...editingCategory, name: e.target.value })
                                                        : setNewCategory({ ...newCategory, name: e.target.value })
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">ICON (OPTIONAL)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 👟"
                                                value={editingCategory ? editingCategory.icon : newCategory.icon}
                                                onChange={(e) =>
                                                    editingCategory
                                                        ? setEditingCategory({ ...editingCategory, icon: e.target.value })
                                                        : setNewCategory({ ...newCategory, icon: e.target.value })
                                                }
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">DESCRIPTION (OPTIONAL)</label>
                                        <textarea
                                            placeholder="Brief description of the category"
                                            value={editingCategory ? editingCategory.description : newCategory.description}
                                            onChange={(e) =>
                                                editingCategory
                                                    ? setEditingCategory({ ...editingCategory, description: e.target.value })
                                                    : setNewCategory({ ...newCategory, description: e.target.value })
                                            }
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan h-24"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-ultraviolet to-neonpink text-white px-6 py-3 rounded-lg font-bold hover:shadow-neon transition-all"
                                        >
                                            {editingCategory ? "Update Category" : "Create Category"}
                                        </button>
                                        {editingCategory && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingCategory(null)}
                                                className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Categories List */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6">Existing Categories ({categories.length})</h3>
                                {categories.length === 0 ? (
                                    <div className="text-center py-12 text-white/30 italic">
                                        No categories yet. Create one above!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-ultraviolet/50 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {category.icon && <span className="text-2xl">{category.icon}</span>}
                                                        <h4 className="font-bold text-lg">{category.name}</h4>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingCategory(category)}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Settings size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {category.description && (
                                                    <p className="text-sm text-white/50">{category.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-orbitron font-bold mb-2">Analytics Dashboard</h2>
                                <p className="text-white/50">Business insights and performance metrics</p>
                            </div>

                            {/* Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <TrendingUp className="text-green-400" size={24} />
                                        <span className="text-xs text-white/40 font-bold">REVENUE</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-neon-cyan mb-1">₹{analytics.totalRevenue.toLocaleString()}</h3>
                                    <p className="text-white/50 text-sm">Total Revenue</p>
                                </div>

                                <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <ClipboardList className="text-blue-400" size={24} />
                                        <span className="text-xs text-white/40 font-bold">ORDERS</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{analytics.totalOrders}</h3>
                                    <p className="text-white/50 text-sm">Total Orders</p>
                                </div>

                                <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <Package className="text-purple-400" size={24} />
                                        <span className="text-xs text-white/40 font-bold">AVG. VALUE</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-ultraviolet mb-1">₹{analytics.averageOrderValue.toFixed(2)}</h3>
                                    <p className="text-white/50 text-sm">Avg Order Value</p>
                                </div>

                                <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <LogOut className="text-red-500" size={24} />
                                        <span className="text-xs text-white/40 font-bold">LOSS</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-red-500 mb-1">₹{analytics.totalLoss.toLocaleString()}</h3>
                                    <p className="text-white/50 text-sm">Cancelled/Returned</p>
                                </div>
                            </div>


                            {/* Orders by Status */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6">Orders by Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <span className="font-medium text-white/70">{status}</span>
                                            <span className="text-2xl font-bold text-neon-cyan">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Orders Summary */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6">Recent Orders</h3>
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="font-bold">{order.customerName}</p>
                                                <p className="text-sm text-white/50">{order.customerEmail}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-neon-cyan">₹{order.total}</p>
                                                <p className="text-xs text-white/50">{order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-orbitron font-bold mb-2">Settings</h2>
                                <p className="text-white/50">Store configuration and system information</p>
                            </div>

                            {/* Store Information */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6 flex items-center gap-2">
                                    <Package className="text-ultraviolet" />
                                    Store Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">STORE NAME</label>
                                        <p className="text-lg font-medium mt-1">Nebula Kicks</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">DESCRIPTION</label>
                                        <p className="text-white/70 mt-1">Premium sneaker e-commerce platform with futuristic design</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">CURRENCY</label>
                                        <p className="text-lg font-medium mt-1">INR (₹)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Gateway */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-neon-cyan" />
                                    Payment Gateway
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">PROVIDER</label>
                                        <p className="text-lg font-medium mt-1">Razorpay</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">MODE</label>
                                        <p className="text-lg font-medium mt-1 text-yellow-400">Test Mode</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">STATUS</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-green-400 font-medium">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Profile */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6 flex items-center gap-2">
                                    <Settings className="text-ultraviolet" />
                                    Admin Profile
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">NAME</label>
                                        <p className="text-lg font-medium mt-1">{session?.user?.name || "Admin"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">EMAIL</label>
                                        <p className="text-lg font-medium mt-1">{session?.user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-white/40 tracking-widest">ROLE</label>
                                        <p className="text-lg font-medium mt-1 text-neon-cyan">{session?.user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="glass-dark p-6 rounded-2xl border border-white/5">
                                <h3 className="font-orbitron font-bold text-xl mb-6">System Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-white/70">Firebase Connection</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-green-400 font-medium">Connected</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-white/70">API Endpoints</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-green-400 font-medium">Operational</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-white/70">Platform</span>
                                        <span className="font-medium text-white">Next.js 14</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main >

            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-deep-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-orbitron font-bold">ORDER DETAILS</h3>
                                    <p className="text-white/40 text-xs font-mono">ID: {selectedOrder.id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all"
                                    >
                                        <Plus size={16} className="rotate-45" />
                                        Print Details
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar printable-container" id="printable-order">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-white/40 tracking-widest uppercase">Customer Information</h4>
                                        <div className="space-y-2">
                                            <p className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50">Full Name</span>
                                                <span className="font-bold">{selectedOrder.customerName}</span>
                                            </p>
                                            <p className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50">Email Address</span>
                                                <span className="font-bold">{selectedOrder.customerEmail}</span>
                                            </p>
                                            <p className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50">Phone Number</span>
                                                <span className="font-bold">{selectedOrder.customerPhone || "N/A"}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-white/40 tracking-widest uppercase">Shipping Details</h4>
                                        <div className="space-y-2">
                                            <p className="text-white/50 text-sm leading-relaxed">
                                                {selectedOrder.address || "No address provided"}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className="text-xs font-bold text-white/40 uppercase">Status:</span>
                                                <span className={`font-bold ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-white/40 tracking-widest uppercase">Order Manifest</h4>
                                    <div className="border border-white/5 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                                                <tr>
                                                    <th className="px-6 py-3">Item</th>
                                                    <th className="px-6 py-3">Spec</th>
                                                    <th className="px-6 py-3 text-center">Qty</th>
                                                    <th className="px-6 py-3 text-right">Price</th>
                                                    <th className="px-6 py-3 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-4 font-bold flex items-center gap-3">
                                                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-white/5" />}
                                                            <span>{item.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-white/50">Size: {item.size}</td>
                                                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right font-mono text-white/50">₹{item.price}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-neon-cyan font-mono">₹{item.price * item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-white/5">
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-right font-bold tracking-widest uppercase text-[10px] text-white/40">Grand Total</td>
                                                    <td className="px-6 py-4 text-right font-bold text-xl text-neon-cyan font-mono">₹{selectedOrder.total}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    /* Hide everything except the printable section */
                    body > *:not(#__next) {
                        display: none !important;
                    }
                    
                    #__next > *:not(.printable-container) {
                        display: none !important;
                    }
                    
                    /* Show only printable content */
                    .printable-container * {
                        visibility: visible !important;
                        display: block !important;
                    }
                    
                    table, thead, tbody, tfoot, tr, td, th {
                        display: table !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    tbody {
                        display: table-row-group !important;
                    }
                    
                    tfoot {
                        display: table-footer-group !important;
                    }
                    
                    tr {
                        display: table-row !important;
                    }
                    
                    td, th {
                        display: table-cell !important;
                    }
                    
                    /* Print layout */
                    .printable-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 40px;
                    }
                    
                    /* Override theme colors for print */
                    * {
                        background: white !important;
                        color: black !important;
                        border-color: #ddd !important;
                    }
                    
                    h3, h4, span, p, td, th {
                        color: black !important;
                    }
                    
                    /* Table styling */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #ddd !important;
                        padding: 12px 8px;
                        text-align: left;
                    }
                    
                    th {
                        background: #f5f5f5 !important;
                        font-weight: bold;
                    }
                    
                    /* Hide buttons and interactive elements */
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div >
    );
}
