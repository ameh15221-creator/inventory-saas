import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./App.css";


const API_URL = "http://localhost:5000/api";


function Categories() {


  const [categories, setCategories] = useState([]);


  const [formData, setFormData] = useState({

    name: "",
    description: ""

  });


  const [editId, setEditId] = useState(null);





  // FETCH CATEGORIES

  const fetchCategories = async () => {

    try {

      const res = await fetch(
        `${API_URL}/categories`
      );


      const data = await res.json();


      setCategories(data.data || []);


    } catch(error) {

      console.error(error);

      toast.error(
        "Failed to load categories"
      );

    }

  };





  useEffect(() => {

    fetchCategories();

  }, []);





  // INPUT CHANGE

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };





  // ADD / UPDATE CATEGORY

  const handleSubmit = async (e) => {

    e.preventDefault();



    const url = editId

      ? `${API_URL}/categories/${editId}`

      : `${API_URL}/categories`;



    const method = editId
      ? "PUT"
      : "POST";



    try {


      const res = await fetch(url, {


        method,


        headers: {

          "Content-Type":
          "application/json"

        },


        body:
        JSON.stringify(formData)


      });



      const data = await res.json();



      if(!res.ok){

        throw new Error(
          data.message ||
          "Request failed"
        );

      }




      toast.success(

        editId

        ? "Category updated successfully!"

        : "Category added successfully!"

      );





      setFormData({

        name:"",
        description:""

      });



      setEditId(null);



      fetchCategories();




    } catch(error){


      console.error(error);


      toast.error(
        "Unable to save category"
      );


    }


  };





  // EDIT CATEGORY


  const editCategory = (category)=>{


    setEditId(category.id);



    setFormData({

      name: category.name,

      description:
      category.description || ""

    });


    toast.info(
      "Editing category..."
    );


  };  // DELETE CATEGORY

  const deleteCategory = async (id) => {


    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );


    if(!confirmDelete) return;




    try {


      const res = await fetch(
        `${API_URL}/categories/${id}`,
        {
          method: "DELETE"
        }
      );



      if(!res.ok){

        throw new Error(
          "Delete failed"
        );

      }



      toast.success(
        "Category deleted successfully!"
      );



      fetchCategories();



    } catch(error){


      console.error(error);


      toast.error(
        "Unable to delete category"
      );


    }


  };





  const getCategoryIcon = (name)=>{


    switch(name.toLowerCase()){


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






  return (


    <div className="main">


      <header>


        <h1>
          📁 Categories
        </h1>


        <p>
          Manage your product categories
        </p>


      </header>






      <section className="cards">


        <div className="card">


          <h3>
            Total Categories
          </h3>


          <h2>
            {categories.length}
          </h2>


        </div>


      </section>







      <section className="table-section">


        <h2>

          {editId
          ? "✏️ Edit Category"
          : "➕ Add Category"}

        </h2>




        <form
          className="product-form"
          onSubmit={handleSubmit}
        >



          <input

            type="text"

            name="name"

            placeholder="Category Name"

            value={formData.name}

            onChange={handleChange}

            required

          />




          <input

            type="text"

            name="description"

            placeholder="Description"

            value={formData.description}

            onChange={handleChange}

            required

          />




          <button type="submit">


            {editId
            ? "Update Category"
            : "Add Category"}


          </button>



        </form>


      </section>







      <section className="table-section">


        <h2>
          📋 Category List
        </h2>




        <table>


          <thead>


            <tr>

              <th>
                Icon
              </th>


              <th>
                Name
              </th>


              <th>
                Description
              </th>


              <th>
                Action
              </th>


            </tr>


          </thead>





          <tbody>



          {categories.map((category)=>(



            <tr key={category.id}>


              <td
                style={{
                  fontSize:"26px",
                  textAlign:"center"
                }}
              >

                {getCategoryIcon(
                  category.name
                )}

              </td>




              <td>

                <strong>
                  {category.name}
                </strong>

              </td>




              <td>

                {category.description}

              </td>




              <td
                className="action-buttons"
              >



                <button

                  className="edit-btn"

                  onClick={() =>
                    editCategory(category)
                  }

                >

                  ✏️ Edit

                </button>





                <button

                  className="delete-btn"

                  onClick={() =>
                    deleteCategory(category.id)
                  }

                >

                  🗑 Delete

                </button>



              </td>



            </tr>


          ))}



          </tbody>


        </table>


      </section>


    </div>


  );


}


export default Categories;