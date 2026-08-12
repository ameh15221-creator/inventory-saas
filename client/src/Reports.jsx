import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./App.css";

function Reports({ products = [] }) {

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
  // EXPORT PDF
  // ==========================

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Inventory SaaS Report", 14, 20);

    doc.setFontSize(12);
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      30
    );

    const tableData = products.map((product) => [

      product.name,

      product.quantity,

      `₦${Number(product.price).toLocaleString()}`,

      product.supplier || "-",

      `₦${(
        Number(product.quantity) *
        Number(product.price)
      ).toLocaleString()}`,

    ]);

    autoTable(doc, {

      startY: 40,

      head: [[
        "Product",
        "Quantity",
        "Price",
        "Supplier",
        "Value",
      ]],

      body: tableData,

    });

    doc.save("inventory-report.pdf");

  };

  // ==========================
  // EXPORT EXCEL
  // ==========================

  const exportExcel = () => {

    const reportData = products.map((product) => ({

      Product: product.name,

      Quantity: Number(product.quantity),

      Price: Number(product.price),

      Supplier: product.supplier || "-",

      Value:
        Number(product.quantity) *
        Number(product.price),

    }));

    const worksheet =
      XLSX.utils.json_to_sheet(reportData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventory Report"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const file = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      file,
      "inventory-report.xlsx"
    );

  };

  // ==========================
  // DASHBOARD DATA
  // ==========================

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.price) *
      Number(product.quantity),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.quantity) <= 10
  );

  const chartData = products.map((product) => ({

    name: product.name,

    quantity: Number(product.quantity),

  }));

  const stockData = products.map((product) => ({

    name: product.name,

    value: Number(product.quantity),

  }));

  // ==========================
  // RETURN
  // ==========================

  return (
        <div className="main">

      {/* ==========================
          HEADER
      ========================== */}

      <header className="reports-header">

        <div>

          <h1>📊 Reports Dashboard</h1>

          <p>
            Inventory performance and analysis
          </p>

        </div>

        <div className="report-actions">

          <button
            className="export-btn"
            onClick={exportPDF}
          >
            📄 Export PDF
          </button>

          <button
            className="excel-btn"
            onClick={exportExcel}
          >
            📊 Export Excel
          </button>

        </div>

      </header>

      {/* ==========================
          SUMMARY CARDS
      ========================== */}

      <section className="cards">

        <div className="card">

          <h3>📦 Total Products</h3>

          <h2>{totalProducts}</h2>

        </div>

        <div className="card">

          <h3>📊 Total Stock</h3>

          <h2>{totalQuantity.toLocaleString()}</h2>

        </div>

        <div className="card">

          <h3>💰 Inventory Value</h3>

          <h2>₦{totalValue.toLocaleString()}</h2>

        </div>

        <div className="card">

          <h3>⚠️ Low Stock</h3>

          <h2>{lowStock.length}</h2>

        </div>

      </section>

      {/* ==========================
          BAR CHART
      ========================== */}

      <section className="table-section">

        <h2>📈 Product Quantity Report</h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="quantity"
              fill="#2563EB"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </section>

      {/* ==========================
          PIE CHART
      ========================== */}

      <section className="table-section">

        <h2>🥧 Stock Distribution</h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <PieChart>

            <Pie
              data={stockData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {stockData.map((item, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />

              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </section>

      {/* ==========================
          LOW STOCK TABLE
      ========================== */}

      <section className="table-section">

        <h2>⚠️ Low Stock Products</h2>

        {lowStock.length === 0 ? (

          <p>
            No low stock products 🎉
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>Name</th>

                <th>Quantity</th>

                <th>Supplier</th>

              </tr>

            </thead>

            <tbody>

              {lowStock.map((product) => (

                <tr key={product.id}>

                  <td>{product.name}</td>

                  <td>{product.quantity}</td>

                  <td>{product.supplier || "-"}</td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </section>

    </div>

  );

}

export default Reports;
