import { useState } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Package,
    DollarSign,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Typed product shape ───────────────────────────────────────────────────────
interface SellerProduct {
    id: string;
    title: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    imageUrl: string;
    description?: string;
}

interface ProductFormState {
    title: string;
    category: string;
    price: string; // string while editing, converted to number on save
    stock: string;
    description: string;
    imageUrl: string;
}

const EMPTY_FORM: ProductFormState = {
    title: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "/images/placeholder.svg"
};

const mockProducts: SellerProduct[] = [
    {
        id: "1",
        title: "Wireless Headphones",
        category: "Electronics",
        price: 89.99,
        stock: 45,
        status: "active",
        imageUrl: "/images/placeholder.svg"
    },
    {
        id: "2",
        title: "Laptop Stand",
        category: "Accessories",
        price: 29.99,
        stock: 120,
        status: "active",
        imageUrl: "/images/placeholder.svg"
    }
];

export default function SellerProducts() {
    const [products, setProducts] = useState<SellerProduct[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(
        null
    );
    const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = () => {
        if (editingProduct) {
            setProducts(
                products.map(p =>
                    p.id === editingProduct.id
                        ? {
                              ...p,
                              title: formData.title,
                              category: formData.category,
                              price: Number(formData.price),
                              stock: Number(formData.stock),
                              description: formData.description
                          }
                        : p
                )
            );
        } else {
            const newProduct: SellerProduct = {
                id: Date.now().toString(),
                title: formData.title,
                category: formData.category,
                price: Number(formData.price),
                stock: Number(formData.stock),
                description: formData.description,
                imageUrl: formData.imageUrl || "/images/placeholder.svg",
                status: "active"
            };
            setProducts([...products, newProduct]);
        }
        closeDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const openEditDialog = (product: SellerProduct) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
            description: product.description || "",
            imageUrl: product.imageUrl
        });
        setShowAddDialog(true);
    };

    const closeDialog = () => {
        setShowAddDialog(false);
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Products
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage your product inventory
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddDialog(true)}
                    className="w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    icon={<Package className="w-10 h-10 text-indigo-500" />}
                    label="Total Products"
                    value={String(products.length)}
                />
                <StatCard
                    icon={<Eye className="w-10 h-10 text-emerald-500" />}
                    label="Total Stock"
                    value={String(products.reduce((s, p) => s + p.stock, 0))}
                />
                <StatCard
                    icon={<DollarSign className="w-10 h-10 text-yellow-500" />}
                    label="Total Value"
                    value={`₦${products.reduce((s, p) => s + p.price * p.stock, 0).toFixed(2)}`}
                />
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No products found
                        </p>
                        <Button
                            onClick={() => setShowAddDialog(true)}
                            className="mt-4"
                        >
                            Add Your First Product
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                                <tr>
                                    {[
                                        "Product",
                                        "Category",
                                        "Price",
                                        "Stock",
                                        "Status",
                                        "Actions"
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredProducts.map(product => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {product.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {product.category}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            ₦{product.price}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {product.stock}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEditDialog(product)
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={showAddDialog} onOpenChange={closeDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct
                                ? "Edit Product"
                                : "Add New Product"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Product Name</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value
                                    })
                                }
                                placeholder="Enter product name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value
                                        })
                                    }
                                    placeholder="e.g. Electronics"
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">Price (₦)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        stock: e.target.value
                                    })
                                }
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value
                                    })
                                }
                                placeholder="Describe your product..."
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="image">Product Image</Label>
                            <Input id="image" type="file" accept="image/*" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingProduct ? "Update" : "Add"} Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </p>
                </div>
                {icon}
            </div>
        </div>
    );
}
