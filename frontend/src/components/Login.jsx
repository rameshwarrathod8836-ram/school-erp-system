import React, { useState } from "react";

export default function Login({ onLoginSuccess, onOpenParentPortal }) {
  const [email, setEmail] = useState("admin@school.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "लॉगिन अयशस्वी. कृपया तपशील तपासा.");
      }
    } catch (err) {
      console.error(err);
      setError("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh", background: "#f8fafc", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "#ffffff", padding: "36px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", width: "100%", maxWidth: "380px", border: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🏫</div>
          <h2 style={{ margin: "0 0 6px 0", color: "#1e293b", fontSize: "20px" }}>School ERP Login</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>प्रशासकीय लॉगिन (Admin / Staff)</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>ईमेल पत्ता:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>पासवर्ड:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "6px", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
          >
            {loading ? "पडताळणी होत आहे..." : "लॉगिन करा"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }}>तुम्ही पालक आहात का?</p>
          <button
            onClick={onOpenParentPortal}
            style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", width: "100%" }}
          >
            📱 पालक मोबाइल पोर्टल उघडा (Parent App)
          </button>
        </div>
      </div>
    </div>
  );
}