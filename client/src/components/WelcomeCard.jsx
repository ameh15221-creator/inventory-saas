function WelcomeCard({
user,
totalProducts,
totalQuantity,
totalValue,
lowStock
}) {
// Get the logged-in user
const storedUser = JSON.parse(
localStorage.getItem("user") || "null"
);

const currentUser = user || storedUser;

const userName =
currentUser?.name ||
"User";

const currentDate = new Date();

const formattedDate =
currentDate.toLocaleDateString("en-US", {
weekday: "long",
month: "long",
day: "numeric",
year: "numeric"
});

const formattedTime =
currentDate.toLocaleTimeString("en-US", {
hour: "2-digit",
minute: "2-digit"
});

return ( <div className="welcome-card">


  <div className="welcome-text">
    <h2>
      Welcome back, {userName} 👋
    </h2>

    <p>
      {formattedDate} • {formattedTime}
    </p>

    <span>
      Here's your inventory overview for today.
    </span>
  </div>

  <div className="welcome-summary">

    <div>
      <h3>{totalProducts}</h3>
      <p>📦 Products</p>
    </div>

    <div>
      <h3>{totalQuantity}</h3>
      <p>📊 Total Stock</p>
    </div>

    <div>
      <h3>
        ₦{Number(totalValue).toLocaleString()}
      </h3>
      <p>💰 Inventory Value</p>
    </div>

    <div>
      <h3>{lowStock}</h3>
      <p>⚠️ Low Stock</p>
    </div>

  </div>

</div>

);
}

export default WelcomeCard;
