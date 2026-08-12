import { useState } from "react";

function Settings({ theme, setTheme }) {
const [companyName, setCompanyName] = useState(
localStorage.getItem("companyName") || "Inventory SaaS"
);

const [currency, setCurrency] = useState(
localStorage.getItem("currency") || "NGN"
);

const [tax, setTax] = useState(
localStorage.getItem("tax") || "0"
);

const [saved, setSaved] = useState(false);

const handleThemeChange = (e) => {
const newTheme = e.target.value;


setTheme(newTheme);
localStorage.setItem("theme", newTheme);


};

const handleSave = () => {
  localStorage.setItem("companyName", companyName);
  localStorage.setItem("currency", currency);
  localStorage.setItem("tax", tax);
  localStorage.setItem("theme", theme);

  console.log("Settings saved:", {
    companyName,
    currency,
    tax,
    theme,
  });

  setSaved(true);

  setTimeout(() => {
    setSaved(false);
  }, 3000);
};


return ( <div className="settings-page">


  {/* ==========================
      SETTINGS HEADER
  ========================== */}

  <div className="settings-header">
    <div>
      <h1>⚙️ Settings</h1>
      <p>Manage your Inventory SaaS settings.</p>
    </div>
  </div>


  {/* ==========================
      SETTINGS GRID
  ========================== */}

  <div className="settings-grid">

    {/* COMPANY */}

    <div className="settings-card">

      <h2>🏢 Company Information</h2>

      <p className="settings-description">
        Update your company information.
      </p>

      <label htmlFor="companyName">
        Company Name
      </label>

      <input
  id="companyName"
  type="text"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
  placeholder="Enter company name"
/>

    </div>


    {/* CURRENCY */}

    <div className="settings-card">

      <h2>💰 Currency</h2>

      <p className="settings-description">
        Choose the currency used throughout your inventory.
      </p>

      <label htmlFor="currency">
        Currency
      </label>

      <select
        id="currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >

        <option value="NGN">
          ₦ Nigerian Naira
        </option>

        <option value="USD">
          $ US Dollar
        </option>

        <option value="GBP">
          £ British Pound
        </option>

        <option value="EUR">
          € Euro
        </option>

      </select>

    </div>


    {/* TAX */}

    <div className="settings-card">

      <h2>🧾 Tax Settings</h2>

      <p className="settings-description">
        Set the tax percentage for your business.
      </p>

      <label htmlFor="tax">
        Tax Percentage
      </label>

      <div className="input-with-symbol">

        <input
          id="tax"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          placeholder="0"
        />

        <span>%</span>

      </div>

    </div>


    {/* APPEARANCE */}

    <div className="settings-card">

      <h2>🎨 Appearance</h2>

      <p className="settings-description">
        Choose the appearance of your dashboard.
      </p>

      <label htmlFor="theme">
        Theme
      </label>

      <select
        id="theme"
        value={theme}
        onChange={handleThemeChange}
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

    </div>

  </div>


  {/* ==========================
      SAVE SETTINGS
  ========================== */}

  <div className="settings-actions">

    <button
      type="button"
      onClick={handleSave}
      className="save-settings-btn"
    >
      💾 Save Settings
    </button>

    {saved && (
      <span className="settings-saved">
        ✅ Settings saved successfully
      </span>
    )}

  </div>

</div>

);
}

export default Settings;
