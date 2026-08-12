import { useState } from "react";


function Header({
  page,
  user,
  logout,
  theme,
  setTheme,
  notifications,
  setNotifications,
  setPage,
 setHighlightedProductId,
}) {

const [showNotifications, setShowNotifications] = useState(false);

const getTitle = () => {
switch (page) {
case "dashboard":
return "Dashboard";
case "products":
return "Products";
case "categories":
return "Categories";
case "reports":
return "Reports";
case "profile":
return "Profile";
case "settings":
return "Settings";
default:
return "Inventory SaaS";
}
};

return ( <header className="dashboard-header">


  {/* ==========================
      PAGE TITLE
  ========================== */}

  <div className="header-page-info">
    <h1>{getTitle()}</h1>

    <p>
      {page === "dashboard"
        ? "Welcome back! Here's your inventory overview."
        : `Manage your ${page} easily`}
    </p>
  </div>

  {/* ==========================
      USER AREA
  ========================== */}

  <div className="header-user">

    <div className="user-details">
      <strong>
        👤 {user?.name || "User"}
      </strong>

      <span>
        {user?.role || "Staff"}
      </span>
    </div>

    <div className="header-actions">
     {/* ==========================
    NOTIFICATION CENTER
========================== */}

<div className="notification-wrapper">

  <button
    className="notification-button"
    title="Notifications"
    type="button"
    onClick={() =>
      setShowNotifications((prev) => !prev)
    }
  >
    🔔

    {notifications.length > 0 && (
      <span className="notification-badge">
        {notifications.length > 99
          ? "99+"
          : notifications.length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="notification-dropdown">

      <div className="notification-header">

        <div>
          <h3>Notifications</h3>

          <span>
            {notifications.length} notification
            {notifications.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="notification-header-actions">

          {notifications.length > 0 && (
            <button
              type="button"
              className="notification-clear"
              onClick={() =>
                setNotifications([])
              }
            >
              Clear all
            </button>
          )}

          <button
            type="button"
            className="notification-close"
            onClick={() =>
              setShowNotifications(false)
            }
          >
            ×
          </button>

        </div>

      </div>

      <div className="notification-list">

        {notifications.length === 0 ? (

          <div className="notification-empty">

            <div className="notification-empty-icon">
              🔔
            </div>

            <strong>
              You're all caught up!
            </strong>

            <p>
              No new notifications right now.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification, index) => (

              <div
                className="notification-item"
                key={
                  notification.id || index
                }
                onClick={() => {
                  if (
                    notification.id
                      ?.toString()
                      .startsWith("low-stock-")
                  ) {
                    setPage("products");

                    setHighlightedProductId(
                      notification.productId
                    );

                    setShowNotifications(false);
                  }
                }}
              >

                <div className="notification-icon">
                  {notification.icon || "🔔"}
                </div>

                <div className="notification-content">

                  <strong>
                    {notification.title ||
                      "Notification"}
                  </strong>

                  <p>
                    {notification.message ||
                      "You have a new notification."}
                  </p>

                  {notification.time && (
                    <small>
                      {notification.time}
                    </small>
                  )}

                </div>

                <button
                  type="button"
                  className="notification-remove"
                  title="Remove notification"
                  onClick={(e) => {
                    e.stopPropagation();

                    setNotifications((prev) =>
                      prev.filter(
                        (item) =>
                          item.id !==
                          notification.id
                      )
                    );
                  }}
                >
                  ×
                </button>

              </div>

            )
          )

        )}

      </div>

    </div>
  )}

</div>
      {/* ==========================
          THEME SELECTOR
      ========================== */}

      <select
        value={theme}
        onChange={(e) =>
          setTheme(e.target.value)
        }
        className="theme-select"
        title="Change theme"
      >

        <option value="light">
          ☀️ Light
        </option>

        <option value="dark">
          🌙 Dark
        </option>

        <option value="ocean">
          🌊 Ocean
        </option>

        <option value="royal">
          👑 Royal
        </option>

        <option value="emerald">
          💚 Emerald
        </option>

        <option value="sunset">
          🌅 Sunset
        </option>

      </select>

      {/* ==========================
          LOGOUT
      ========================== */}

      <button
        onClick={logout}
        className="header-logout"
        type="button"
      >
        🚪 Logout
      </button>

    </div>

  </div>

</header>

);
}

export default Header;
