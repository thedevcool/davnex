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
import { Product, Section, Order, Category } from "@/types";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Mail,
  KeyRound,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "products" | "sections" | "orders" | "categories" | "emails" | "dataCodes"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);

  const { logout } = useAuthStore();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    stockQuantity: 0,
    category: "",
    description: "",
    badge: "",
    inStock: true,
    featured: false,
    sectionId: "",
    availableDate: "",
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
    fetchCategories();
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
        orderBy("displayOrder", "asc"),
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

  const fetchCategories = async () => {
    if (!isFirebaseConfigured() || !db) {
      return;
    }

    try {
      const q = query(
        collection(db, "categories"),
        orderBy("displayOrder", "asc"),
      );
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories");
    }
  };

  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: Order["orderStatus"],
  ) => {
    if (!isFirebaseConfigured() || !db) {
      alert("Firebase is not configured");
      return;
    }

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: newStatus, updatedAt: new Date() }
            : order,
        ),
      );

      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
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
        "Cloudinary is not configured. Please add your Cloudinary credentials to .env.local",
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
        "Firebase is not configured. Please add your Firebase credentials to .env.local file.",
      );
      return;
    }

    if (!isCloudinaryConfigured() && imageFile) {
      alert(
        "Cloudinary is not configured. Please add your Cloudinary credentials to .env.local file to upload images.",
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
        p.id !== editingProduct?.id,
    );
    if (duplicateProduct) {
      alert(
        `A product with the name "${formData.name}" already exists. Please use a unique name.`,
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

      // Restock detection logic
      const oldStockQuantity = editingProduct?.stockQuantity || 0;
      const newStockQuantity = formData.stockQuantity;
      let restockDate = editingProduct?.restockDate;

      // If stock was 0 and now is > 0, set restockDate
      if (oldStockQuantity === 0 && newStockQuantity > 0) {
        restockDate = new Date();
      }

      // Automatically update inStock based on stockQuantity
      const inStock = newStockQuantity > 0;

      const productData = {
        ...formData,
        image: imageUrl,
        sectionId: formData.sectionId || null,
        stockQuantity: newStockQuantity,
        inStock: inStock,
        restockDate: restockDate || null,
        availableDate: formData.availableDate
          ? new Date(formData.availableDate)
          : null,
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
      stockQuantity: product.stockQuantity || 0,
      category: product.category,
      description: product.description,
      badge: product.badge || "",
      inStock: product.inStock,
      featured: product.featured || false,
      sectionId: product.sectionId || "",
      availableDate: product.availableDate
        ? new Date(product.availableDate).toISOString().slice(0, 16)
        : "",
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
      stockQuantity: 0,
      category: "",
      description: "",
      badge: "",
      inStock: true,
      featured: false,
      sectionId: "",
      availableDate: "",
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
        s.id !== editingSection?.id,
    );
    if (duplicateSection) {
      alert(
        `A section with the name "${sectionFormData.name}" already exists. Please use a unique name.`,
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

  // Category handlers
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    image: "",
    displayOrder: 0,
    isActive: true,
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");

  const handleCategoryImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured() || !db) {
      alert("Firebase is not configured");
      return;
    }

    if (!categoryFormData.name.trim()) {
      alert("Category name is required");
      return;
    }

    // Check for unique category name
    const duplicateCategory = categories.find(
      (c) =>
        c.name.toLowerCase().trim() ===
          categoryFormData.name.toLowerCase().trim() &&
        c.id !== editingCategory?.id,
    );
    if (duplicateCategory) {
      alert(
        `A category with the name "${categoryFormData.name}" already exists.`,
      );
      return;
    }

    if (!editingCategory && !categoryImageFile) {
      alert("Please upload a category image");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = editingCategory?.image || "";

      if (categoryImageFile) {
        imageUrl = await uploadImage(categoryImageFile);
      }

      // Auto-generate slug from name if not editing
      const slug =
        categoryFormData.slug ||
        categoryFormData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const categoryData = {
        name: categoryFormData.name,
        slug: slug,
        image: imageUrl,
        displayOrder: categoryFormData.displayOrder,
        isActive: categoryFormData.isActive,
        updatedAt: new Date(),
      };

      if (editingCategory) {
        await updateDoc(
          doc(db, "categories", editingCategory.id),
          categoryData,
        );
        alert("Category updated successfully!");
      } else {
        await addDoc(collection(db, "categories"), {
          ...categoryData,
          createdAt: new Date(),
        });
        alert("Category created successfully!");
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setUploading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      image: category.image,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setCategoryImagePreview(category.image);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    if (!db) {
      alert("Database not initialized");
      return;
    }

    try {
      await deleteDoc(doc(db, "categories", id));
      alert("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      slug: "",
      image: "",
      displayOrder: 0,
      isActive: true,
    });
    setCategoryImageFile(null);
    setCategoryImagePreview("");
    setEditingCategory(null);
    setShowForm(false);
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
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/data-codes"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  Data Codes
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
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
                resetCategoryForm();
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
                resetCategoryForm();
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
                resetCategoryForm();
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
            <button
              onClick={() => {
                setActiveTab("categories");
                setShowForm(false);
                resetForm();
                resetSectionForm();
                resetCategoryForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              Categories
            </button>
            <button
              onClick={() => {
                setActiveTab("emails");
                setShowForm(false);
                resetForm();
                resetSectionForm();
                resetCategoryForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "emails"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <Mail className="w-5 h-5" />
              Emails
            </button>
            <button
              onClick={() => {
                setActiveTab("dataCodes");
                setShowForm(false);
                resetForm();
                resetSectionForm();
                resetCategoryForm();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
                activeTab === "dataCodes"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white shadow-lg"
                  : "bg-white text-apple-gray-700 hover:bg-apple-gray-50"
              }`}
            >
              <KeyRound className="w-5 h-5" />
              Data Codes
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
            ) : activeTab === "dataCodes" ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <KeyRound className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-apple-gray-600">Data Codes</p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        Secure Access
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-apple-gray-600">Quick Actions</p>
                  <p className="text-lg font-semibold text-apple-gray-900">
                    Manage Lodge Internet codes
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-apple-gray-600">Plans</p>
                  <p className="text-2xl font-bold text-apple-gray-900">
                    3 & 5 Users
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Add Button */}
          {activeTab !== "orders" &&
            activeTab !== "categories" &&
            activeTab !== "dataCodes" && (
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
                      placeholder="For showing discount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stockQuantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-apple-gray-500 mt-1">
                      Decreases automatically on purchase. Set to 0 for out of
                      stock.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Available Date - Optional
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.availableDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availableDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-apple-gray-500 mt-1">
                      For coming soon products with countdown timer
                    </p>
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
                          Payment Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Order Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                          Actions
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
                              0,
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order.id,
                                  e.target.value as Order["orderStatus"],
                                )
                              }
                              className="text-sm border border-apple-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="packing">Packing</option>
                              <option value="on-the-way">On the Way</option>
                              <option value="delivered-station">
                                Delivered to Station
                              </option>
                              <option value="delivered-doorstep">
                                Delivered to Doorstep
                              </option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-600">
                            {order.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-xs text-apple-gray-500">
                              {order.deliveryMethod === "door-to-door"
                                ? "🚪 Door-to-Door"
                                : "📦 Station Pickup"}
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

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <>
              {/* Add Category Button */}
              {!loading && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() => {
                      if (showForm) {
                        resetCategoryForm();
                      } else {
                        setShowForm(true);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {showForm ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {showForm ? "Cancel" : "Add New Category"}
                  </button>
                </div>
              )}

              {/* Category Form */}
              {showForm && activeTab === "categories" && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>

                  <form onSubmit={handleCategorySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={categoryFormData.name}
                          onChange={(e) =>
                            setCategoryFormData({
                              ...categoryFormData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                          Slug (URL-friendly name)
                        </label>
                        <input
                          type="text"
                          value={categoryFormData.slug}
                          onChange={(e) =>
                            setCategoryFormData({
                              ...categoryFormData,
                              slug: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Auto-generated if empty"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={categoryFormData.displayOrder}
                          onChange={(e) =>
                            setCategoryFormData({
                              ...categoryFormData,
                              displayOrder: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={categoryFormData.isActive}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                isActive: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-apple-gray-700">
                            Active (Visible on site)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Category Image *
                      </label>
                      <div className="flex items-start gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-apple-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <Upload className="w-8 h-8 text-apple-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-apple-gray-600">
                              Click to upload category image
                            </p>
                            <p className="text-xs text-apple-gray-500 mt-1">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryImageChange}
                            className="hidden"
                          />
                        </label>

                        {categoryImagePreview && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-apple-gray-200">
                            <img
                              src={categoryImagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {uploading
                          ? "Uploading..."
                          : editingCategory
                            ? "Update Category"
                            : "Add Category"}
                      </button>
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-6 py-3 border border-apple-gray-300 text-apple-gray-700 font-semibold rounded-lg hover:bg-apple-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories List */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-apple-gray-200">
                  <h2 className="text-lg font-bold text-apple-gray-900">
                    All Categories ({categories.length})
                  </h2>
                </div>

                {categories.length === 0 ? (
                  <div className="p-12 text-center">
                    <LayoutGrid className="w-16 h-16 text-apple-gray-300 mx-auto mb-4" />
                    <p className="text-apple-gray-600">
                      No categories yet. Create your first category!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-apple-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                            Display Order
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
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-apple-gray-900">
                                {category.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-apple-gray-600 font-mono">
                                {category.slug}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                              {category.displayOrder}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  category.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Emails Tab */}
          {activeTab === "emails" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-apple-gray-900 mb-6">
                Email Management
              </h2>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Promotional
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {/* This will be populated from Firestore */}
                    -- <span className="text-lg">users</span>
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Opted-in for promos
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Stock Alerts
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    -- <span className="text-lg">users</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Watching products
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    -- <span className="text-lg">users</span>
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Opted-in for new products
                  </p>
                </div>
              </div>

              {/* Promotional Email Composer */}
              <div className="border border-apple-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-apple-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Send Promotional Email
                </h3>

                <div className="space-y-4">
                  {/* Email Title */}
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Exclusive Weekend Sale - 30% Off!"
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Email Message */}
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Email Message *
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Write your promotional message here... You can use HTML for formatting."
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-apple-gray-500">
                      Tip: Use HTML tags for formatting (e.g., &lt;p&gt;,
                      &lt;strong&gt;, &lt;br/&gt;)
                    </p>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/promo-image.jpg"
                      className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* CTA Text */}
                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Button Text (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Shop Now"
                        className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* CTA URL */}
                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Button Link (optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-store.com/sale"
                        className="w-full px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                      onClick={() => {
                        alert(
                          "Email sending functionality - Connect to /api/email/promotional",
                        );
                      }}
                    >
                      <Mail className="w-5 h-5" />
                      Send to All Opted-In Users
                    </button>
                    <button
                      className="px-6 py-3 border border-apple-gray-300 rounded-lg font-medium text-apple-gray-700 hover:bg-apple-gray-50 transition-colors"
                      onClick={() => {
                        alert(
                          "Preview functionality - Opens email preview in new window",
                        );
                      }}
                    >
                      Preview
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> This email will be sent to all
                      users who opted-in for promotional emails. Recipients can
                      manage their preferences at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-apple-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors cursor-pointer">
                  <h4 className="font-semibold text-apple-gray-900 mb-2">
                    📧 Test Email Configuration
                  </h4>
                  <p className="text-sm text-apple-gray-600 mb-3">
                    Send a test email to verify your setup is working correctly.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Send Test Email →
                  </button>
                </div>

                <div className="border border-apple-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors cursor-pointer">
                  <h4 className="font-semibold text-apple-gray-900 mb-2">
                    📊 Email Stats
                  </h4>
                  <p className="text-sm text-apple-gray-600 mb-3">
                    View detailed statistics about your email campaigns.
                  </p>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View Statistics →
                  </button>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  ⚙️ Email Setup Required
                </h4>
                <p className="text-sm text-yellow-800 mb-2">
                  To enable email sending, configure your Google App Password in{" "}
                  <code className="bg-yellow-100 px-1 rounded">.env.local</code>
                  :
                </p>
                <pre className="bg-yellow-100 p-3 rounded text-xs text-yellow-900 overflow-x-auto">
                  {`EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-gmail@gmail.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
                </pre>
                <p className="text-xs text-yellow-700 mt-2">
                  See <code>EMAIL_SYSTEM_GUIDE.md</code> for detailed setup
                  instructions.
                </p>
              </div>
            </div>
          )}

          {/* Data Codes Tab */}
          {activeTab === "dataCodes" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-apple-gray-900">
                    Data Codes
                  </h2>
                  <p className="text-sm text-apple-gray-600">
                    Manage Lodge Internet access codes securely.
                  </p>
                </div>
                <Link
                  href="/admin/data-codes"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <KeyRound className="w-4 h-4" />
                  Open Data Codes
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border border-apple-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-apple-gray-900 mb-2">
                    How it works
                  </h3>
                  <p className="text-sm text-apple-gray-600">
                    Choose a data plan, add codes one at a time, and see masked
                    codes appear instantly.
                  </p>
                </div>
                <div className="border border-apple-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-apple-gray-900 mb-2">
                    Security
                  </h3>
                  <p className="text-sm text-apple-gray-600">
                    Codes are encrypted and hashed. Only masked values appear in
                    the dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
