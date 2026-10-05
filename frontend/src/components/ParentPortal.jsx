import React, { useState } from "react";

export default function ParentPortal({ onBackToAdminLogin }) {
  const [identifier, setIdentifier] = useState("ADM101");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);

  const fetchDashboardData = async (idToFetch) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/parent/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: idToFetch.trim() }),
      });

      const resData = await res.json();

      if (res.ok) {
        setData(resData);
      } else {
        setError(resData.message || "विद्यार्थी सापडला नाही. कृपया तपशील तपासा.");
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setError("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = (e) => {
    e.preventDefault();
    fetchDashboardData(identifier);
  };

  const handleOpenPay = () => {
    if (data && data.fees.due_amount > 0) {
      setPayAmount(data.fees.due_amount);
      setPaySuccess(null);
      setShowPayModal(true);
    } else {
      alert("सर्व फी आधीच भरलेली आहे!");
    }
  };

  const handleConfirmPay = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      alert("कृपया योग्य रक्कम टाका.");
      return;
    }

    const firstUnpaidFee = data.fees.records.find((r) => Number(r.total_amount) > Number(r.paid_amount));
    if (!firstUnpaidFee) {
      alert("कोणतेही प्रलंबित फी चलन सापडले नाही.");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/parent/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fee_id: firstUnpaidFee.id,
          amount: Number(payAmount),
          payment_method: "UPI / QR",
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        setPaySuccess({
          txnId: resData.transaction_id,
          amount: payAmount,
          date: new Date().toLocaleString("en-IN"),
        });
        fetchDashboardData(identifier);
      } else {
        alert(resData.message || "पेमेंट प्रक्रिया अयशस्वी झाली.");
      }
    } catch (err) {
      console.error(err);
      alert("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "430px", background: "#f8fafc", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "6px solid #1e293b", minHeight: "690px", display: "flex", flexDirection: "column" }}>
        
        <div style={{ background: "#312e81", color: "#fff", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700" }}>📱 पालक पोर्टल (Parent App)</h3>
            <span style={{ fontSize: "11px", color: "#c7d2fe" }}>Student Mobile Companion</span>
          </div>
          <button
            onClick={onBackToAdminLogin}
            style={{ background: "#4338ca", color: "#fff", border: "1px solid #6366f1", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
          >
            Admin Login ⎋
          </button>
        </div>

        <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
          
          <form onSubmit={handleFetch} style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
              प्रवेश क्रमांक किंवा पालकांचा फोन नंबर:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="उदा. ADM101 किंवा फोन"
                required
                style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
              >
                {loading ? "..." : "शोधा"}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px", textAlign: "center" }}>
              {error}
            </div>
          )}

          {data && (
            <div>
              <div style={{ background: "linear-gradient(135deg, #4338ca, #6366f1)", color: "#fff", padding: "16px", borderRadius: "14px", marginBottom: "14px", boxShadow: "0 4px 6px -1px rgba(79,70,229,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px" }}>{data.student.name}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#e0e7ff" }}>
                      इयत्ता: {data.student.class_name} ({data.student.section}) | Roll No: {data.student.admission_number}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#c7d2fe" }}>
                      🏫 {data.student.school_name}
                    </p>
                  </div>
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                    Active
                  </span>
                </div>
              </div>

              {/* Notice Board Banner for Parents */}
              {data.notices && data.notices.length > 0 && (
                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "12px", padding: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "16px" }}>📢</span>
                    <strong style={{ fontSize: "13px", color: "#92400e" }}>शाळेच्या ताज्या सूचना (Notice Board)</strong>
                  </div>
                  {data.notices.map((n) => (
                    <div key={n.id} style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", marginTop: "6px", border: "1px solid #fef08a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>{n.title}</span>
                        <span style={{ fontSize: "10px", color: "#b45309", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>{n.date}</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#475569", margin: "4px 0 0" }}>{n.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 2x2 Grid Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                
                <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "26px", marginBottom: "4px" }}>📅</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>उपस्थिती (Attendance)</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: data.attendance.is_low ? "#dc2626" : "#16a34a", marginTop: "2px" }}>
                    {data.attendance.percentage}%
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                    {data.attendance.present_days}/{data.attendance.total_days} दिवस हजर
                  </div>
                </div>

                <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "26px", marginBottom: "4px" }}>💳</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>शिल्लक फी (Due Fee)</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: data.fees.due_amount > 0 ? "#dc2626" : "#16a34a", marginTop: "2px" }}>
                    ₹{data.fees.due_amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px", marginBottom: "6px" }}>
                    जमा: ₹{data.fees.paid_amount.toLocaleString()}
                  </div>
                  {data.fees.due_amount > 0 && (
                    <button
                      onClick={handleOpenPay}
                      style={{ background: "#16a34a", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", width: "100%" }}
                    >
                      ⚡ फी भरा (Pay)
                    </button>
                  )}
                </div>

                <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "26px", marginBottom: "4px" }}>🚌</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>स्कूल बस (Route)</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", marginTop: "4px" }}>मार्ग क्र. ४</div>
                  <div style={{ fontSize: "10px", color: "#16a34a", marginTop: "2px" }}>● वेळेवर (On Time)</div>
                </div>

                <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "26px", marginBottom: "4px" }}>📝</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>गृहपाठ (Homework)</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#7c3aed", marginTop: "4px" }}>२ बाकी</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>गणित व इंग्रजी</div>
                </div>

              </div>

              {/* Exam Marksheet */}
              <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#1e293b" }}>📊 परीक्षा निकाल (Exam Marksheet)</h4>
                {data.exams.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0, textAlign: "center" }}>अद्याप कोणत्याही परीक्षेचा निकाल लागलेला नाही.</p>
                ) : (
                  data.exams.map((ex) => (
                    <div key={ex.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600" }}>{ex.exam_name}</span>
                        <span style={{ background: ex.grade === "F" ? "#fee2e2" : "#dcfce7", color: ex.grade === "F" ? "#dc2626" : "#16a34a", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {ex.grade} ({ex.percentage}%)
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        मराठी: {ex.marathi} | इंग्रजी: {ex.english} | गणित: {ex.mathematics} | विज्ञान: {ex.science}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {showPayModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            {!paySuccess ? (
              <>
                <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "18px" }}>ऑनलाइन फी भरणा (UPI)</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b" }}>शाळा: {data?.student.school_name}</p>

                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "2px dashed #cbd5e1", display: "inline-block", marginBottom: "14px" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=schoolerp@upi&pn=${encodeURIComponent(data?.student.school_name || "School")}&am=${payAmount}`}
                    alt="UPI QR Code"
                    style={{ width: "140px", height: "140px", display: "block" }}
                  />
                  <span style={{ display: "block", fontSize: "11px", color: "#475569", fontWeight: "bold", marginTop: "6px" }}>GPay / PhonePe / Paytm</span>
                </div>

                <div style={{ marginBottom: "16px", textAlign: "left" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>भरावयाची रक्कम (₹):</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={data?.fees.due_amount}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", fontWeight: "bold", color: "#16a34a", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setShowPayModal(false)}
                    style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                  >
                    रद्द करा
                  </button>
                  <button
                    onClick={handleConfirmPay}
                    disabled={paying}
                    style={{ flex: 1, padding: "10px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                  >
                    {paying ? "प्रक्रिया..." : "भरणा पूर्ण करा ✓"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "44px", color: "#16a34a", marginBottom: "8px" }}>🎉</div>
                <h3 style={{ margin: "0 0 6px 0", color: "#16a34a", fontSize: "18px" }}>फी यशस्वीरीत्या जमा झाली!</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b" }}>पावती क्र.: <strong>{paySuccess.txnId}</strong></p>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "13px", marginBottom: "16px" }}>
                  <div style={{ marginBottom: "4px" }}><strong>विद्यार्थी:</strong> {data?.student.name}</div>
                  <div style={{ marginBottom: "4px" }}><strong>जमा रक्कम:</strong> ₹{Number(paySuccess.amount).toLocaleString()}</div>
                  <div style={{ marginBottom: "4px" }}><strong>तारीख:</strong> {paySuccess.date}</div>
                  <div><strong>माध्यम:</strong> UPI Instant Pay</div>
                </div>

                <button
                  onClick={() => setShowPayModal(false)}
                  style={{ width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                >
                  डॅशबोर्डवर परत जा
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}