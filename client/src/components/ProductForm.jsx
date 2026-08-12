function ProductForm({
  formData,
  handleChange,
  handleSubmit,
  categories,
  editId
}) {
  return (
    <section className="table-section">

      <h2>
        {editId ? "Edit Product" : "Add New Product"}
      </h2>

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Category
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="supplier"
          placeholder="Supplier"
          value={formData.supplier}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>

      </form>

    </section>
  );
}

export default ProductForm;
