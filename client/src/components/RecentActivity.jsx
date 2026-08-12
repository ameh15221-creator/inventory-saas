function RecentActivity({ activities = [] }) {
return ( <section className="recent-activity">


  {/* ==========================
      HEADER
  ========================== */}

  <div className="recent-activity-header">
    <div>
      <h2>📜 Recent Activity</h2>
      <p>Latest inventory changes</p>
    </div>

    {activities.length > 0 && (
      <span className="activity-count">
        {activities.length} recent
      </span>
    )}
  </div>


  {/* ==========================
      EMPTY STATE
  ========================== */}

  {activities.length === 0 ? (

    <div className="activity-empty">

      <div className="activity-empty-icon">
        📋
      </div>

      <h3>No recent activity</h3>

      <p>
        Add, edit, or delete a product to see
        activity here.
      </p>

    </div>

  ) : (

    /* ==========================
       ACTIVITY LIST
    ========================== */

    <div className="activity-list">

      {activities.map((activity, index) => (

        <div
          className="activity-item"
          key={activity.id || index}
        >

          {/* ICON */}

          <div className="activity-icon">
            {activity.icon || "📦"}
          </div>


          {/* CONTENT */}

          <div className="activity-content">

            <strong>
              {activity.title || "Inventory Activity"}
            </strong>

            <p>
              {activity.message || "An inventory change was made."}
            </p>

            <span className="activity-time">
              🕒 {activity.time || "Recently"}
            </span>

          </div>

        </div>

      ))}

    </div>

  )}

</section>

);
}

export default RecentActivity;
