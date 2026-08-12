function ProductTable({
  products,
  editProduct,
  deleteProduct,
  categories = []
}) {

  console.log("========== ProductTable ==========");
  console.log("Products:", products);
  console.log("Categories:", categories);

  const getCategoryName = (categoryId) => {

    console.log("Looking for category:", categoryId);

    const category = categories.find(
      (c) => Number(c.id) === Number(categoryId)
    );

    console.log("Found:", category);

    return category ? category.name : "Unknown";

  };

  return (

    <section className="table-section">

      <h2>Products</h2>

      <table>

        <thead>

          <tr>

            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Supplier</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {products.length === 0 ? (

            <tr>

              <td
                colSpan="6"
                style={{ textAlign: "center" }}
              >
                No products found.
              </td>

            </tr>

          ) : (

            products.map((product) => (

              <tr key={product.id}>

                <td>{product.name}</td>

                <td>{getCategoryName(product.category_id)}</td>

                <td>{product.quantity}</td>

                <td>
                  ₦{Number(product.price).toLocaleString()}
                </td>

                <td>{product.supplier}</td>

                <td>

                  <button
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </section>

  );

}

export default ProductTable;
