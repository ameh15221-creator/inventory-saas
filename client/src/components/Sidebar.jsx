function Sidebar({ setPage }) {
  return (
    <aside className="sidebar">

      <h2>Inventory SaaS</h2>

      <nav>

        <button onClick={() => setPage("dashboard")}>
          📊 Dashboard
        </button>

        <button onClick={() => setPage("products")}>
          📦 Products
        </button>

        <button onClick={() => setPage("categories")}>
          🗂 Categories
        </button>

        <button onClick={() => setPage("reports")}>
          📈 Reports
        </button>

        <button onClick={() => setPage("settings")}>
          ⚙ Settings
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;
