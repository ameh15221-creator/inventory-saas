function DashboardCards({
  totalProducts,
  totalQuantity,
  totalValue,
  lowStock
}) {
  
  return (
    <section className="cards">

      <div className="card">
        <h3>📦 Total Products</h3>
        <h2>{totalProducts}</h2>
      </div>

      <div className="card">
        <h3>📊 Total Stock</h3>
        <h2>{totalQuantity}</h2>
      </div>

      <div className="card">
        <h3>💰 Inventory Value</h3>
        <h2>
          ₦{Number(totalValue).toLocaleString()}
        </h2>
      </div>

      <div className="card">
        <h3>⚠️ Low Stock</h3>
        <h2>{lowStock}</h2>
      </div>

    </section>
  );
}

export default DashboardCards;
