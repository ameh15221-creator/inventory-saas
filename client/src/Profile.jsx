import { toast } from "react-toastify";
import "./App.css";


function Profile({ user }) {


  const handleCopyEmail = () => {

    if(user?.email){

      navigator.clipboard.writeText(
        user.email
      );

      toast.success(
        "Email copied!"
      );

    }

  };



  return (


    <div className="main">


      <header>

        <h1>
          👤 Profile
        </h1>

        <p>
          Manage your account information
        </p>

      </header>





      <section className="profile-card">


        <div className="profile-avatar">

          👤

        </div>





        <h2>

          {user?.name || "Admin User"}

        </h2>




        <p>

          <strong>
            Email:
          </strong>

          {" "}

          {user?.email || "No email available"}

        </p>




        <p>

          <strong>
            Role:
          </strong>

          {" "}

          {user?.role || "Admin"}

        </p>





        <button

          className="edit-btn"

          onClick={handleCopyEmail}

        >

          📋 Copy Email

        </button>



      </section>







      <section className="table-section">


        <h2>
          Account Information
        </h2>



        <table>


          <tbody>


            <tr>

              <td>
                Full Name
              </td>

              <td>
                {user?.name || "Admin User"}
              </td>

            </tr>




            <tr>

              <td>
                Email Address
              </td>

              <td>
                {user?.email || "No email"}
              </td>

            </tr>




            <tr>

              <td>
                Account Type
              </td>

              <td>
                {user?.role || "Administrator"}
              </td>

            </tr>



            <tr>

              <td>
                Status
              </td>

              <td>
                🟢 Active
              </td>

            </tr>



          </tbody>


        </table>


      </section>




    </div>


  );

}


export default Profile;