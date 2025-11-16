"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { Product, Section, Order } from "@/types";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Upload,
  X,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "products" | "sections" | "orders"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [uploading, setUploading] = useState(false);

  const { logout } = useAuthStore();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    category: "",
    description: "",
    badge: "",
    inStock: true,
    featured: false,
    sectionId: "",
  });

  const [sectionFormData, setSectionFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchProducts();
    fetchSections();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    if (!isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!isFirebaseConfigured() || !db) {
      return;
    }

    try {
      const q = query(
        collection(db, "sections"),
        orderBy("displayOrder", "asc")
      );
      const querySnapshot = await getDocs(q);
      const sectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Section[];
      setSections(sectionsData);
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("Failed to load sections");
    }
  };

  const fetchOrders = async () => {
    if (!isFirebaseConfigured() || !db) {
      return;
    }

    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please add your Cloudinary credentials to .env.local"
      );
    }

    try {
      const imageUrl = await uploadToCloudinary(file);
      return imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured()) {
      alert(
        "Firebase is not configured. Please add your Firebase credentials to .env.local file."
      );
      return;
    }

    if (!isCloudinaryConfigured() && imageFile) {
      alert(
        "Cloudinary is not configured. Please add your Cloudinary credentials to .env.local file to upload images."
      );
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    // Check for unique product name
    const duplicateProduct = products.find(
      (p) =>
        p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
        p.id !== editingProduct?.id
    );
    if (duplicateProduct) {
      alert(
        `A product with the name "${formData.name}" already exists. Please use a unique name.`
      );
      return;
    }

    if (formData.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    if (!editingProduct && !imageFile) {
      alert("Please upload a product image");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingProduct?.image || "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        ...formData,
        image: imageUrl,
        sectionId: formData.sectionId || null,
        updatedAt: new Date(),
      };

      if (!db) {
        throw new Error("Database not initialized");
      }

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        alert("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
        alert("Product added successfully!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      description: product.description,
      badge: product.badge || "",
      inStock: product.inStock,
      featured: product.featured || false,
      sectionId: product.sectionId || "",
    });
    setImagePreview(product.image);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    if (!db) {
      alert("Database not initialized");
      return;
    }

    try {
      await deleteDoc(doc(db, "products", id));
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      originalPrice: 0,
      category: "",
      description: "",
      badge: "",
      inStock: true,
      featured: false,
      sectionId: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
    setShowForm(false);
  };

  const resetSectionForm = () => {
    setSectionFormData({
      name: "",
      description: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditingSection(null);
    setShowForm(false);
  };

  // Section handlers
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured() || !db) {
      alert("Firebase is not configured");
      return;
    }

    if (!sectionFormData.name.trim()) {
      alert("Section name is required");
      return;
    }

    // Check for unique section name
    const duplicateSection = sections.find(
      (s) =>
        s.name.toLowerCase().trim() ===
          sectionFormData.name.toLowerCase().trim() &&
        s.id !== editingSection?.id
    );
    if (duplicateSection) {
      alert(
        `A section with the name "${sectionFormData.name}" already exists. Please use a unique name.`
      );
      return;
    }

    try {
      const sectionData = {
        ...sectionFormData,
        updatedAt: new Date(),
      };

      if (editingSection) {
        await updateDoc(doc(db, "sections", editingSection.id), sectionData);
        alert("Section updated successfully!");
      } else {
        await addDoc(collection(db, "sections"), {
          ...sectionData,
          createdAt: new Date(),
        });
        alert("Section created successfully!");
      }

      resetSectionForm();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Failed to save section");
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      description: section.description,
      displayOrder: section.displayOrder,
      isActive: section.isActive,
    });
    setShowForm(true);
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    if (!db) {
      alert("Database not initialized");
      return;
    }

    try {
      await deleteDoc(doc(db, "sections", id));
      alert("Section deleted successfully!");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-apple-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo variant="dark" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setActiveTab("products");
                setShowForm(false);
                resetForm();
                resetSectionForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <Package className="w-5 h-5" />
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab("sections");
                setShowForm(false);
                resetForm();
                resetSectionForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "sections"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              Sections
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setShowForm(false);
                resetForm();
                resetSectionForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {activeTab === "products" ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {products.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {products.filter((p) => p.inStock).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">Featured</p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {products.filter((p) => p.featured).length}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === "sections" ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <LayoutGrid className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Total Sections
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {sections.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <LayoutGrid className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Active Sections
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {sections.filter((s) => s.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Products in Sections
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {products.filter((p) => p.sectionId).length}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === "orders" ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {orders.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">Paid Orders</p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        {
                          orders.filter((o) => o.paymentStatus === "paid")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        ₦
                        {orders
                          .filter((o) => o.paymentStatus === "paid")
                          .reduce((sum, o) => sum + o.total, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Add Button */}
          {activeTab !== "orders" && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {showForm ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {showForm
                  ? "Cancel"
                  : activeTab === "products"
                  ? "Add New Product"
                  : "Add New Section"}
              </button>
            </div>
          )}

          {/* Product Form */}
          {showForm && activeTab === "products" && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Audio, Cases, Charging"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Section - Optional
                    </label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) =>
                        setFormData({ ...formData, sectionId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Section</option>
                      {sections
                        .filter((s) => s.isActive)
                        .map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Original Price (₦) - Optional
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Badge - Optional
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData({ ...formData, badge: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., NEW, SALE, HOT"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inStock: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-apple-gray-700">
                        In Stock
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-apple-gray-700">
                        Featured
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Product Image *
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-apple-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <Upload className="w-8 h-8 text-apple-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-apple-gray-600">
                          Click to upload image
                        </p>
                        <p className="text-xs text-apple-gray-500 mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading || (!imageFile && !editingProduct)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {uploading
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-apple-gray-200 text-apple-gray-700 font-semibold rounded-lg hover:bg-apple-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section Form */}
          {showForm && activeTab === "sections" && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h2>

              <form onSubmit={handleSectionSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Section Name *
                    </label>
                    <input
                      type="text"
                      value={sectionFormData.name}
                      onChange={(e) =>
                        setSectionFormData({
                          ...sectionFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Latest Products, Holiday Picks"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Display Order *
                    </label>
                    <input
                      type="number"
                      value={sectionFormData.displayOrder}
                      onChange={(e) =>
                        setSectionFormData({
                          ...sectionFormData,
                          displayOrder: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0 = first, 1 = second, etc."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sectionFormData.isActive}
                        onChange={(e) =>
                          setSectionFormData({
                            ...sectionFormData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-apple-gray-700">
                        Active (Show on homepage)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={sectionFormData.description}
                    onChange={(e) =>
                      setSectionFormData({
                        ...sectionFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this section"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingSection ? "Update Section" : "Add Section"}
                  </button>

                  <button
                    type="button"
                    onClick={resetSectionForm}
                    className="px-6 py-3 bg-apple-gray-200 text-apple-gray-700 font-semibold rounded-lg hover:bg-apple-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          {activeTab === "products" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-apple-gray-200">
                <h2 className="text-lg font-bold text-apple-gray-900">
                  All Products
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-apple-gray-600">
                    Loading products...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-apple-gray-300 mx-auto mb-4" />
                  <p className="text-apple-gray-600">
                    No products yet. Add your first product!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-apple-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-apple-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-apple-gray-900">
                                  {product.name}
                                </div>
                                {product.badge && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                            ₦{product.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.inStock
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sections List */}
          {activeTab === "sections" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-apple-gray-200">
                <h2 className="text-lg font-bold text-apple-gray-900">
                  All Sections
                </h2>
              </div>

              {sections.length === 0 ? (
                <div className="p-12 text-center">
                  <LayoutGrid className="w-16 h-16 text-apple-gray-300 mx-auto mb-4" />
                  <p className="text-apple-gray-600">
                    No sections yet. Add your first section!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-apple-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Section Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-apple-gray-200">
                      {sections.map((section) => (
                        <tr key={section.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-apple-gray-900">
                              {section.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-apple-gray-600 max-w-xs truncate">
                              {section.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                            {section.displayOrder}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                            {
                              products.filter((p) => p.sectionId === section.id)
                                .length
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                section.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {section.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditSection(section)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders List */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-apple-gray-200">
                <h2 className="text-lg font-bold text-apple-gray-900">
                  All Orders
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-apple-gray-300 mx-auto mb-4" />
                  <p className="text-apple-gray-600">
                    No orders yet. Waiting for first customer!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-apple-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-apple-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-apple-gray-900">
                              #{order.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-apple-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-apple-gray-600">
                              {order.customerEmail}
                            </div>
                            <div className="text-sm text-apple-gray-500">
                              {order.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-apple-gray-900">
                            ₦{order.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-600">
                            {order.createdAt.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
