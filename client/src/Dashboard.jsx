import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardCards from "./components/DashboardCards";
import WelcomeCard from "./components/WelcomeCard";
import RecentActivity from "./components/RecentActivity";
import ProductForm from "./components/ProductForm";
import ProductTable from "./components/ProductTable";

import Categories from "./Categories";
import Reports from "./Reports";

function Dashboard() {
const [page, setPage] = useState("dashboard");

const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [activities, setActivities] = useState([]);

const [formData, setFormData] = useState({
name: "",
category_id: "",
quantity: "",
price: "",
supplier: ""
});

const [editId, setEditId] = useState(null);

// =====================================================
// FETCH PRODUCTS
// =====================================================

const fetchProducts = async () => {
try {
const response = await fetch(
"http://localhost:5000/api/products"
);


  const data = await response.json();

  setProducts(data.data || []);
} catch (error) {
  console.error("Product Fetch Error:", error);
}


};

// =====================================================
// FETCH CATEGORIES
// =====================================================

const fetchCategories = async () => {
try {
const response = await fetch(
"http://localhost:5000/api/categories"
);


  const data = await response.json();

  setCategories(data.data || []);
} catch (error) {
  console.error("Category Fetch Error:", error);
}


};

// =====================================================
// INITIAL DATA LOAD
// =====================================================

useEffect(() => {
fetchProducts();
fetchCategories();
}, []);

// =====================================================
// HANDLE FORM CHANGE
// =====================================================

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

// =====================================================
// ADD / UPDATE PRODUCT
// =====================================================

const handleSubmit = async (e) => {
e.preventDefault();


const url = editId
  ? `http://localhost:5000/api/products/${editId}`
  : "http://localhost:5000/api/products";

const method = editId ? "PUT" : "POST";

try {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error("Failed to save product");
  }

  const productName = formData.name;

  const activity = {
    id: Date.now(),
    type: editId ? "update" : "add",
    icon: editId ? "✏️" : "🆕",
    title: editId
      ? "Product Updated"
      : "Product Added",
    message: editId
      ? `${productName} was updated`
      : `${productName} was added`,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  setActivities((previousActivities) => [
    activity,
    ...previousActivities
  ].slice(0, 8));

  setFormData({
    name: "",
    category_id: "",
    quantity: "",
    price: "",
    supplier: ""
  });

  setEditId(null);

  await fetchProducts();

} catch (error) {
  console.error("Save Error:", error);
}


};

// =====================================================
// EDIT PRODUCT
// =====================================================

const editProduct = (product) => {
setEditId(product.id);


setFormData({
  name: product.name || "",
  category_id: String(product.category_id || ""),
  quantity: String(product.quantity || ""),
  price: String(product.price || ""),
  supplier: product.supplier || ""
});


};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (id) => {
const confirmed = window.confirm(
"Are you sure you want to delete this product?"
);


if (!confirmed) {
  return;
}

try {
  const productToDelete = products.find(
    (product) => product.id === id
  );

  const response = await fetch(
    `http://localhost:5000/api/products/${id}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }

  if (productToDelete) {
    const activity = {
      id: Date.now(),
      type: "delete",
      icon: "🗑️",
      title: "Product Deleted",
      message: `${productToDelete.name} was deleted`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setActivities((previousActivities) => [
      activity,
      ...previousActivities
    ].slice(0, 8));
  }

  await fetchProducts();

} catch (error) {
  console.error("Delete Error:", error);
}


};

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

const totalProducts = products.length;

const totalQuantity = products.reduce(
(sum, product) => {
return sum + Number(product.quantity || 0);
},
0
);

const totalValue = products.reduce(
(sum, product) => {
return (
sum +
Number(product.price || 0) *
Number(product.quantity || 0)
);
},
0
);

const lowStock = products.filter(
(product) =>
Number(product.quantity || 0) <= 10
).length;

// =====================================================
// DASHBOARD
// =====================================================

return ( <div className="dashboard">


  <Sidebar setPage={setPage} />

  <main className="main">

    <Header page={page} />

    {/* =================================================
        CATEGORIES PAGE
    ================================================= */}

    {page === "categories" ? (
      <Categories />

    ) : page === "reports" ? (

    /* =================================================
       REPORTS PAGE
    ================================================= */

      <Reports products={products} />

    ) : (

    /* =================================================
       DASHBOARD PAGE
    ================================================= */

      <>
        {/* WELCOME CARD */}
        <WelcomeCard
          totalProducts={totalProducts}
          totalQuantity={totalQuantity}
          totalValue={totalValue}
          lowStock={lowStock}
        />

        {/* DASHBOARD STATISTICS */}
        <DashboardCards
          totalProducts={totalProducts}
          totalQuantity={totalQuantity}
          totalValue={totalValue}
          lowStock={lowStock}
        />

        {/* RECENT ACTIVITY */}
        <RecentActivity
          activities={activities}
        />

        {/* PRODUCT FORM */}
        <ProductForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          categories={categories}
          editId={editId}
        />

        {/* PRODUCT TABLE */}
        <ProductTable
          products={products}
          categories={categories}
          editProduct={editProduct}
          deleteProduct={deleteProduct}
        />
      </>
    )}

  </main>

</div>


);
}

export default Dashboard;
