
import { useEffect, useState } from "react";

import Categories from "./Categories";
import Reports from "./Reports";
import Profile from "./Profile";
import Login from "./pages/Login";
import Header from "./components/Header";
import WelcomeCard from "./components/WelcomeCard";
import RecentActivity from "./components/RecentActivity";
import Settings from "./components/Settings";

import "./App.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
   Legend,
} from "recharts";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

function App() {
  // ==========================
  // USER
  // ==========================

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // ==========================
  // PAGE
  // ==========================

  const [page, setPage] = useState("dashboard");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [companyName, setCompanyName] = useState(
    localStorage.getItem("companyName") || "Inventory SaaS"
  );

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ==========================
  // DATA
  // ==========================

  const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [stockMovements, setStockMovements] =
  useState([]);

const [sortBy, setSortBy] = useState("name");
const [sortOrder, setSortOrder] = useState("asc");

const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 8;


const [activities, setActivities] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("activities")) || [];
  } catch (error) {
    console.error("Activities loading error:", error);
    return [];
  }
});


const [notifications, setNotifications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("notifications")
    ) || [];
  } catch (error) {
    console.error(
      "Notifications loading error:",
      error
    );

    return [];
  }
});

useEffect(() => {
  localStorage.setItem(
    "notifications",
    JSON.stringify(notifications)
  );
}, [notifications]);

const [highlightedProductId, setHighlightedProductId] =
  useState(null);

  useEffect(() => {
  if (highlightedProductId === null) {
    return;
  }

  const timer = setTimeout(() => {
    setHighlightedProductId(null);
  }, 5000);

  return () => clearTimeout(timer);
}, [highlightedProductId]);


  // ==========================
  // ADD ACTIVITY
  // ==========================

  const addActivity = (title, message, icon = "📦") => {
    const newActivity = {
      id: Date.now(),
      title,
      message,
      icon,
      time: new Date().toLocaleString(),
    };

    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, 10);

      localStorage.setItem(
        "activities",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // ==========================
  // SEARCH
  // ==========================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ==========================
  // EDIT
  // ==========================

  const [editId, setEditId] = useState(null);

  // ==========================
  // FORM
  // ==========================

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    quantity: "",
    price: "",
    supplier: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  // ==========================
  // COLORS
  // ==========================

  const COLORS = [
    "#2563EB",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
  ];

  // ==========================
// FETCH PRODUCTS
// ==========================

const fetchProducts = async () => {
  try {
    const token = getToken();

    const res = await fetch(
      `${API_URL}/products`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(
        data.message ||
          "Failed to load products"
      );

      return [];
    }

    setProducts(data.data || []);

    return data.data || [];
  } catch (err) {
    console.error(
      "Fetch Products Error:",
      err
    );

    toast.error(
      "Failed to load products"
    );

    return [];
  }
};

// ==========================
// FETCH STOCK MOVEMENT HISTORY
// ==========================

const fetchStockMovements = async () => {
  try {
    const res = await fetch(
      `${API_URL}/products/stock-movements`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(
        data.message ||
          "Failed to load stock history"
      );

      return [];
    }

    setStockMovements(data.data || []);

    return data.data || [];
  } catch (err) {
    console.error(
      "Fetch Stock Movements Error:",
      err
    );

    toast.error(
      "Failed to load stock history"
    );

    return [];
  }
};

  // ==========================
  // FETCH CATEGORIES
  // ==========================

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Failed to load categories"
        );

        return;
      }

      setCategories(data.data || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);

      toast.error("Failed to load categories");
    }
  };

  // ==========================
  // LOAD DATA
  // ==========================

  const loadData = async () => {
  const loadedProducts = await fetchProducts();

  await fetchStockMovements();

  await fetchCategories();

  const lowProducts = (loadedProducts || []).filter(
    (product) => Number(product.quantity) <= 10
  );

  if (lowProducts.length > 0) {
    const lowStockNotifications = lowProducts
      .slice(0, 5)
      .map((product) => ({
  id: `low-stock-${product.id}`,
  productId: product.id,
  title: "Low Stock Alert",
  message: `${product.name} has only ${product.quantity} unit(s) remaining.`,
  icon: "⚠️",
  time: new Date().toLocaleString(),
}));

    setNotifications((prev) => {
      const existingIds = new Set(
        prev.map((notification) => notification.id)
      );

      const newNotifications =
        lowStockNotifications.filter(
          (notification) =>
            !existingIds.has(notification.id)
        );

      return [
        ...newNotifications,
        ...prev,
      ].slice(0, 10);
    });

    toast.warning(
      `⚠️ ${lowProducts.length} product(s) are running low on stock.`,
      {
        autoClose: 4000,
      }
    );
  }
};

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // ==========================
  // HANDLE CHANGE
  // ==========================

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      if (file) {
        setImagePreview(
          URL.createObjectURL(file)
        );
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

// ==========================
// ADD / UPDATE PRODUCT
// ==========================

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const isEditing = Boolean(editId);

    const url = isEditing
      ? `${API_URL}/products/${editId}`
      : `${API_URL}/products`;

    const method = isEditing ? "PUT" : "POST";

    const productData = new FormData();

    productData.append(
      "name",
      formData.name
    );

    productData.append(
      "category_id",
      Number(formData.category_id)
    );

    productData.append(
      "quantity",
      Number(formData.quantity)
    );

    productData.append(
      "price",
      Number(formData.price)
    );

    productData.append(
      "supplier",
      formData.supplier || ""
    );

    if (formData.image) {
      productData.append(
        "image",
        formData.image
      );
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: productData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Unable to save product"
      );
    }
    
    // Refresh products from the backend
    await fetchProducts();

    // Reset form
    setFormData({
      name: "",
      category_id: "",
      quantity: "",
      price: "",
      supplier: "",
      image: null,
    });

    setEditId(null);

    toast.success(
      isEditing
        ? "✅ Product updated successfully"
        : "✅ Product added successfully"
    );
  } catch (err) {
    
    console.error(
  "Save Product Error:",
  err
);

    toast.error(
      err.message ||
        "❌ Failed to save product"
    );
  }
};

// ==========================
// STOCK ADJUSTMENT
// ==========================

const handleStockAdjustment = async (
  product,
  change
) => {
  const currentQuantity =
    Number(product.quantity) || 0;

  const newQuantity =
    currentQuantity + change;

  if (newQuantity < 0) {
    return;
  }

  try {
    const productData = new FormData();

    productData.append(
      "name",
      product.name
    );

    productData.append(
      "category_id",
      Number(product.category_id)
    );

    productData.append(
      "quantity",
      newQuantity
    );

    productData.append(
      "price",
      Number(product.price)
    );

    productData.append(
      "supplier",
      product.supplier || ""
    );

    const res = await fetch(
      `${API_URL}/products/${product.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: productData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Unable to update stock"
      );
    }

  
    await fetchProducts();

    setHighlightedProductId(product.id);

    toast.success(
      `Stock updated to ${newQuantity}`
    );
  } catch (err) {
    console.error(
      "Stock Adjustment Error:",
      err
    );

    toast.error(
      err.message ||
        "❌ Failed to update stock"
    );
  }
};


  // ==========================
  // EDIT PRODUCT
  // ==========================

  const editProduct = (product) => {
    setEditId(product.id);

    setFormData({
      name: product.name,
      category_id: String(
        product.category_id
      ),
      quantity: String(
        product.quantity
      ),
      price: String(product.price),
      supplier: product.supplier || "",
      image: null,
    });

    setImagePreview(null);

    setPage("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    toast.info(
      `✏️ Editing ${product.name}...`
    );
  };

  // ==========================
  // DELETE PRODUCT
  // ==========================

  const deleteProduct = async (id) => {
if (!window.confirm("Delete this product?")) {
return;
}

try {
// ==========================
// FIND PRODUCT BEFORE DELETE
// ==========================

const productToDelete = products.find(
  (product) =>
    Number(product.id) === Number(id)
);

const deletedProductName =
  productToDelete?.name || "Product";

// ==========================
// DELETE PRODUCT
// ==========================

const res = await fetch(
  `${API_URL}/products/${id}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }
);

const data = await res.json();

if (!res.ok) {
  throw new Error(
    data.message ||
      "Unable to delete product"
  );
}

// ==========================
// RECENT ACTIVITY
// ==========================

addActivity(
  "Product Deleted",
  `${deletedProductName} was removed from inventory.`,
  "🗑️"
);

// ==========================
// NOTIFICATION
// ==========================

setNotifications((prev) => [
  {
    id: Date.now(),
    title: "Product Deleted",
    message: `${deletedProductName} was removed from inventory.`,
    icon: "🗑️",
    time: new Date().toLocaleString(),
  },
  ...prev,
].slice(0, 10));

// ==========================
// SUCCESS MESSAGE
// ==========================

toast.success(
  `🗑 ${deletedProductName} deleted successfully`
);

// ==========================
// REFRESH PRODUCTS
// ==========================

await fetchProducts();

} catch (err) {
console.error(
"Delete Product Error:",
err
);

toast.error(
  err.message ||
    "Unable to delete product"
);


}
};


  // ==========================
  // LOGOUT
  // ==========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success(
      "Logged out successfully"
    );

    setTimeout(() => {
      setUser(null);
    }, 800);
  };

  // ==========================
  // DASHBOARD CALCULATIONS
  // ==========================

  const totalProducts =
    products.length;

  const totalQuantity =
    products.reduce(
      (sum, product) =>
        sum +
        Number(product.quantity),
      0
    );

  const totalValue =
  products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity) *
        Number(product.price),
    0
  );

const averageProductValue =
  totalProducts > 0
    ? totalValue / totalProducts
    : 0;

const lowStockProducts = products.filter(
  (product) => Number(product.quantity) <= 10
);

const lowStock = lowStockProducts.length;

const lowStockPercentage =
  totalProducts > 0
    ? ((lowStock / totalProducts) * 100).toFixed(1)
    : "0.0";

  // ==========================
  // CHART DATA
  // ==========================

  const chartData = products.map(
    (product) => ({
      name: product.name,
      quantity: Number(
        product.quantity
      ),
      value:
        Number(product.quantity) *
        Number(product.price),
    })
  );
// ==========================
// FILTER + SORT PRODUCTS
// ==========================

const filteredProducts = products
  .filter((product) => {
    const searchMatch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "" ||
      Number(product.category_id) ===
        Number(selectedCategory);

    return searchMatch && categoryMatch;
  })
  .sort((a, b) => {
    let valueA;
    let valueB;

    if (sortBy === "name") {
      valueA = a.name.toLowerCase();
      valueB = b.name.toLowerCase();
    } else if (sortBy === "quantity") {
      valueA = Number(a.quantity);
      valueB = Number(b.quantity);
    } else if (sortBy === "price") {
      valueA = Number(a.price);
      valueB = Number(b.price);
    } else if (sortBy === "value") {
      valueA =
        Number(a.quantity) *
        Number(a.price);

      valueB =
        Number(b.quantity) *
        Number(b.price);
    }

    if (valueA < valueB) {
      return sortOrder === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortOrder === "asc" ? 1 : -1;
    }

    return 0;
  });

// ==========================
// PAGINATION
// ==========================

const totalPages = Math.ceil(
  filteredProducts.length / productsPerPage
);

const startIndex =
  (currentPage - 1) * productsPerPage;

const paginatedProducts =
  filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // ==========================
  // CATEGORY NAME
  // ==========================

  const getCategoryName = (id) => {
    const category =
      categories.find(
        (c) =>
          Number(c.id) ===
          Number(id)
      );

    return category
      ? category.name
      : "Unknown";
  };

  // ==========================
  // CATEGORY ICON
  // ==========================

  const getCategoryIcon = (id) => {
    const category =
      categories.find(
        (c) =>
          Number(c.id) ===
          Number(id)
      );

    if (!category) {
      return "📦";
    }

    switch (
      category.name.toLowerCase()
    ) {
      case "electronics":
        return "💻";

      case "food":
        return "🍚";

      case "clothing":
        return "👕";

      case "phones":
        return "📱";

      case "cosmetics":
        return "🧴";

      default:
        return "📦";
    }
  };

  // ==========================
  // IMAGE URL
  // ==========================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000/uploads/${image}`;
  };

  // ==========================
  // LOGIN CHECK
  // ==========================

  if (!user) {
    return (
      <Login setUser={setUser} />
    );
  }

  // ==========================
  // RETURN
  // ==========================

  return (
    <div className="layout">

      {/* ==========================
          SIDEBAR
      ========================== */}

      <aside className="sidebar">

        <div className="logo">
          <h2>
            📦 {companyName}
          </h2>

          <p>
            Management System
          </p>
        </div>

        <button
          className={
            page === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("dashboard")
          }
        >
          🏠 Dashboard
        </button>

        <button
          className={
            page === "products"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("products")
          }
        >
          📦 Products
        </button>

        <button
          className={
            page === "categories"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("categories")
          }
        >
          📁 Categories
        </button>

        <button
          className={
            page === "reports"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("reports")
          }
        >
          📊 Reports
        </button>

        <button
          className={
            page === "profile"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("profile")
          }
        >
          👤 Profile
        </button>

        <button
          className={
            page === "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("settings")
          }
        >
          ⚙️ Settings
        </button>

        <hr />

        <button onClick={logout}>
          🚪 Logout
        </button>

      </aside>

      {/* ==========================
          MAIN CONTENT
      ========================== */}

      <main className="content">

        <Header
  page={page}
  user={user}
  logout={logout}
  theme={theme}
  setTheme={setTheme}
  notifications={notifications}
   setNotifications={setNotifications}
    setPage={setPage}
     setHighlightedProductId={setHighlightedProductId}
/>

        {/* ==========================
            DASHBOARD
        ========================== */}

        {page === "dashboard" && (
          <section>

            <WelcomeCard

  user={user}
  totalProducts={totalProducts}
  totalQuantity={totalQuantity}
  totalValue={totalValue}
  lowStock={lowStock}
/>

 <div
  className="card"
  onClick={() => setPage("products")}
  style={{ cursor: "pointer" }}
>
  <h3>
    📦 Total Products
  </h3>

  <h2>
    {totalProducts}
  </h2>

  <span className="kpi-status positive">
    {categories.length} categor
    {categories.length === 1 ? "y" : "ies"} across inventory
  </span>
</div>


<div
  className="card"
  onClick={() => setPage("products")}
  style={{ cursor: "pointer" }}
>
  <h3>
    📊 Total Stock
  </h3>

  <h2>
    {totalQuantity}
  </h2>

  <span className="kpi-status positive">
    Units in inventory
  </span>
</div>

  <div className="card">
    <h3>
      💰 Inventory Value
    </h3>

    <h2>
      ₦
      {Number(
        totalValue
      ).toLocaleString()}
    </h2>

    <span className="kpi-status positive">
  Avg. ₦
  {averageProductValue.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 0,
    }
  )}{" "}
  per product
</span>
     
  </div>

  <div
  className="card"
  onClick={() => setPage("products")}
  style={{ cursor: "pointer" }}
>
  <h3>
    ⚠️ Low Stock
  </h3>

  <h2>
    {lowStock}
  </h2>

  <span
    className={
      lowStock > 0
        ? "kpi-status warning"
        : "kpi-status positive"
    }
  >
    {lowStock > 0
      ? `${lowStockPercentage}% of products need attention`
      : "Stock healthy"}
  </span>
</div>



            <div className="charts">

              {/* ==========================
                  BAR CHART
              ========================== */}

              <div className="chart-box">

                <h3>
                  📊 Product Quantity
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={340}
                >
                  <BarChart
                    data={chartData}
                  >
                    <XAxis
                     dataKey="name"
                     angle={-35}
                     textAnchor="end"
                     height={80}
                     interval={0}
                     tick={{
                     fill: "var(--text-light)",
                      fontSize: 11,
                      }}
                    />


                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="quantity"
                      fill="#2563EB"
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
              <div className="chart-box">
  <h3>
    📋 Stock Movement History
  </h3>

  {stockMovements.length === 0 ? (
    <p>
      No stock movements recorded yet.
    </p>
  ) : (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Previous</th>
            <th>New</th>
            <th>Change</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {stockMovements
            .slice(0, 10)
            .map((movement) => (
              <tr key={movement.id}>
                <td>
                  {movement.product_name ||
                    "Unknown Product"}
                </td>

                <td>
                  {movement.previous_quantity}
                </td>

                <td>
                  {movement.new_quantity}
                </td>

                <td>
                  {movement.quantity_change > 0
                    ? `+${movement.quantity_change}`
                    : movement.quantity_change}
                </td>

                <td>
                  {movement.movement_type === "IN"
                    ? "📥 IN"
                    : "📤 OUT"}
                </td>

                <td>
                  {new Date(
                    movement.created_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )}
</div>


              {/* ==========================
                  PIE CHART
              ========================== */}

              <div className="chart-box">

                <h3>
                  💰 Inventory Value
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <PieChart>

                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                    >
                      {chartData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                  <Legend />

                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* ==========================
                RECENT ACTIVITY
            ========================== */}

            <RecentActivity
              activities={activities}
            />

          </section>
        )}

        {/* ==========================
            PRODUCTS
        ========================== */}

        {page === "products" && (
          <section>

            <h1>
              📦 Product Management
            </h1>

            <form
              onSubmit={handleSubmit}
              className="product-form"
            >

              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
              />

              <select
                name="category_id"
                value={
                  formData.category_id
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}

              </select>

              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={
                  formData.quantity
                }
                onChange={
                  handleChange
                }
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                required
              />

              <input
                type="text"
                name="supplier"
                placeholder="Supplier"
                value={
                  formData.supplier
                }
                onChange={
                  handleChange
                }
              />

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={
                  handleChange
                }
              />

              {imagePreview && (
                <div className="image-preview">

                  <img
                    src={
                      imagePreview
                    }
                    alt="Preview"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(
                        null
                      );

                      setFormData(
                        (prev) => ({
                          ...prev,
                          image: null,
                        })
                      );
                    }}
                  >
                    ❌ Remove Image
                  </button>

                </div>
              )}

              <button type="submit">
                {editId
                  ? "✅ Update Product"
                  : "➕ Add Product"}
              </button>

            </form>

            <div className="toolbar">

              <input
                type="text"
                placeholder="🔍 Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              <select
                value={
                  selectedCategory
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}

              </select>

              <select
  value={sortBy}
  onChange={(e) => {
    setSortBy(e.target.value);
    setSortOrder("asc");
  }}
>
  <option value="name">Sort by Name</option>
  <option value="quantity">Sort by Quantity</option>
  <option value="price">Sort by Price</option>
  <option value="value">Sort by Inventory Value</option>
</select>

<button
  type="button"
  onClick={() =>
    setSortOrder((prev) =>
      prev === "asc" ? "desc" : "asc"
    )
  }
  title={
    sortOrder === "asc"
      ? "Ascending"
      : "Descending"
  }
>
  {sortOrder === "asc" ? "↑" : "↓"}
</button>

            </div>

            <table>

              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "30px",
                      }}
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                        className={`
  ${
    Number(product.quantity) <= 10
      ? "low-stock-row"
      : ""
  }
  ${
    String(product.id) ===
    String(highlightedProductId)
      ? "highlighted-product-row"
      : ""
  }
`}
                      >

                        <td
                          style={{
                            fontSize:
                              "26px",
                            textAlign:
                              "center",
                          }}
                        >
                          {getCategoryIcon(
                            product.category_id
                          )}
                        </td>

                        <td>

                          {product.image ? (
                            <img
                              src={getImageUrl(
                                product.image
                              )}
                              alt={
                                product.name
                              }
                              style={{
                                width:
                                  "60px",
                                height:
                                  "60px",
                                objectFit:
                                  "cover",
                                borderRadius:
                                  "8px",
                                border:
                                  "1px solid #ddd",
                              }}
                              onError={(
                                e
                              ) => {
                                e.target.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span>
                              No Image
                            </span>
                          )}

                        </td>

                        <td>
                          <strong>
                            {
                              product.name
                            }
                          </strong>
                        </td>

                        <td>
                          {getCategoryName(
                            product.category_id
                          )}
                        </td>

                        <td>
  <div className="stock-controls">
  <button
    type="button"
    onClick={() =>
      handleStockAdjustment(product, -1)
    }
    disabled={Number(product.quantity) <= 0}
    title="Decrease stock"
  >
    −
  </button>

  <span>{product.quantity}</span>

  <button
    type="button"
    onClick={() =>
      handleStockAdjustment(product, 1)
    }
    title="Increase stock"
  >
    +
  </button>
</div>

</td>

                        <td>
                          ₦
                          {Number(
                            product.price
                          ).toLocaleString()}
                        </td>

                        <td>
                          {
                            product.supplier
                          }
                        </td>

                        <td>

                          {Number(
                            product.quantity
                          ) <= 10 ? (
                            <span className="low-badge">
                              ⚠️ Low Stock
                            </span>
                          ) : (
                            <span className="good-badge">
                              ✅ In Stock
                            </span>
                          )}

                        </td>

                        <td className="action-buttons">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              editProduct(
                                product
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteProduct(
                                product.id
                              )
                            }
                          >
                            🗑 Delete
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>
           {totalPages > 1 && (
  <div className="pagination">

    <button
      type="button"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((prev) => prev - 1)
      }
    >
      ← Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      type="button"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((prev) => prev + 1)
      }
    >
      Next →
    </button>

  </div>
)}
          </section>
        )}

        {/* ==========================
            CATEGORIES
        ========================== */}

        {page === "categories" && (
          <section>
            <Categories />
          </section>
        )}

        {/* ==========================
            REPORTS
        ========================== */}

        {page === "reports" && (
          <section>
            <Reports
              products={products}
            />
          </section>
        )}

        {/* ==========================
            PROFILE
        ========================== */}

        {page === "profile" && (
          <section>
            <Profile user={user} />
          </section>
        )}

        {/* ==========================
            SETTINGS
        ========================== */}

        {page === "settings" && (
          <section>
            <Settings
              theme={theme}
              setTheme={setTheme}
              companyName={
                companyName
              }
              setCompanyName={
                setCompanyName
              }
            />
          </section>
        )}

      </main>

      {/* ==========================
          TOAST NOTIFICATIONS
      ========================== */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

    </div>
  );
}

export default App;

