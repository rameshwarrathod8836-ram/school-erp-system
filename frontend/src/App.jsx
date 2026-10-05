import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import ParentPortal from "./components/ParentPortal";

export default function App() {
  const [viewMode, setViewMode] = useState("admin");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user_info");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(1);
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState({});

  const [studentForm, setStudentForm] = useState({
    admission_number: "",
    first_name: "",
    last_name: "",
    class_name: "10th",
    section: "A",
    parent_name: "",
    parent_phone: "",
  });

  const [feeForm, setFeeForm] = useState({
    student_id: "",
    title: "Term 1 Tuition Fee",
    total_amount: "",
    paid_amount: "0",
    due_date: new Date().toISOString().split("T")[0],
  });

  const [examForm, setExamForm] = useState({
    student_id: "",
    exam_name: "सत्र १ अंतिम परीक्षा (Term 1)",
    marathi: "",
    english: "",
    mathematics: "",
    science: "",
  });

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "General",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/schools")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((err) => console.error("Error fetching schools:", err));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resFees, resReport, resExams, resNotices] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/students?school_id=${selectedSchoolId}`),
        fetch(`http://127.0.0.1:8000/api/fees?school_id=${selectedSchoolId}`),
        fetch(`http://127.0.0.1:8000/api/attendances/monthly-report?school_id=${selectedSchoolId}`),
        fetch(`http://127.0.0.1:8000/api/exams?school_id=${selectedSchoolId}`),
        fetch(`http://127.0.0.1:8000/api/notices?school_id=${selectedSchoolId}`),
      ]);
      const dataStudents = await resStudents.json();
      const dataFees = await resFees.json();
      const dataReport = await resReport.json();
      const dataExams = await resExams.json();
      const dataNotices = await resNotices.json();

      setStudents(dataStudents);
      setFees(dataFees);
      setAttendanceReport(dataReport);
      setExams(dataExams);
      setNotices(dataNotices);

      if (dataStudents.length > 0) {
        setFeeForm((prev) => ({ ...prev, student_id: dataStudents[0].id }));
        setExamForm((prev) => ({ ...prev, student_id: dataStudents[0].id }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/attendances?school_id=${selectedSchoolId}&date=${date}`);
      const data = await res.json();
      const map = {};
      data.forEach((item) => {
        map[item.student_id] = item.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  useEffect(() => {
    if (user && viewMode === "admin") {
      fetchData();
    }
  }, [selectedSchoolId, user, viewMode]);

  useEffect(() => {
    if (user && viewMode === "admin") {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate, selectedSchoolId, user, viewMode]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    setUser(null);
  };

  if (viewMode === "parent") {
    return <ParentPortal onBackToAdminLogin={() => setViewMode("admin")} />;
  }

  if (!user) {
    return (
      <Login
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
        onOpenParentPortal={() => setViewMode("parent")}
      />
    );
  }

  const totalStudents = students.length;
  const totalCollectedFee = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
  const totalPendingFee = fees.reduce((sum, f) => sum + (Number(f.total_amount || 0) - Number(f.paid_amount || 0)), 0);
  const presentCount = Object.values(attendanceMap).filter((status) => status === "present").length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const currentSchool = schools.find((s) => s.id === Number(selectedSchoolId));

  const exportStudentsToCSV = () => {
    if (students.length === 0) return;
    const bom = "\uFEFF";
    const headers = "प्रवेश क्रमांक,विद्यार्थ्याचे नाव,इयत्ता,तुकडी,पालकांचे नाव,पालकांचा संपर्क क्रमांक\n";
    const rows = students
      .map((s) => `"${s.admission_number}","${s.first_name} ${s.last_name}","${s.class_name}","${s.section || "A"}","${s.parent_name}","${s.parent_phone}"`)
      .join("\n");

    const blob = new Blob([bom + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentSchool?.subdomain || "school"}_विद्यार्थी_यादी.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReceipt = (fee) => {
    const studentName = fee.student ? `${fee.student.first_name} ${fee.student.last_name}` : `Student #${fee.student_id}`;
    const admNo = fee.student?.admission_number || "-";
    const className = fee.student ? `${fee.student.class_name} (${fee.student.section || "A"})` : "-";
    const parentName = fee.student?.parent_name || "-";
    const schoolName = currentSchool?.name || "School ERP";
    const total = Number(fee.total_amount);
    const paid = Number(fee.paid_amount);
    const balance = total - paid;
    const receiptNo = `REC-${new Date().getFullYear()}-${String(fee.id).padStart(4, "0")}`;

    const printWindow = window.open("", "_blank", "width=850,height=650");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>पावती - ${receiptNo} - ${studentName}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            * { box-sizing: border-box; }
            body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
            .receipt-container { border: 2px solid #1e3a8a; border-radius: 8px; padding: 16px 20px; max-width: 720px; margin: 0 auto; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            .school-brand { display: flex; align-items: center; gap: 12px; }
            .school-title { font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #1e3a8a; color: #fff; text-align: left; padding: 6px 10px; font-size: 12px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .text-right { text-align: right; }
            .summary-table { width: 260px; float: right; margin-top: 8px; }
            .highlight-paid { background: #ecfdf5; color: #065f46; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="school-brand">
                <div>
                  <h1 class="school-title">${schoolName}</h1>
                  <p style="font-size:11px;color:#64748b;margin:2px 0;">UDISE: 27240801234 | शैक्षणिक वर्ष २०२६-२७</p>
                </div>
              </div>
              <div>
                <h3 style="margin:0;">अधिकृत फी पावती</h3>
                <span style="font-size:12px;color:#4338ca;font-weight:bold;">${receiptNo}</span>
              </div>
            </div>
            <div class="meta-grid">
              <div>
                <div><strong>विद्यार्थी:</strong> ${studentName}</div>
                <div><strong>पालक:</strong> ${parentName}</div>
                <div><strong>इयत्ता:</strong> ${className}</div>
              </div>
              <div>
                <div><strong>प्रवेश क्र.:</strong> ${admNo}</div>
                <div><strong>दिनांक:</strong> ${new Date().toLocaleDateString("en-IN")}</div>
              </div>
            </div>
            <table>
              <thead><tr><th>तपशील</th><th class="text-right">रक्कम</th></tr></thead>
              <tbody><tr><td>${fee.title}</td><td class="text-right">₹${total.toLocaleString("en-IN")}</td></tr></tbody>
            </table>
            <table class="summary-table">
              <tr><td>एकूण:</td><td class="text-right">₹${total.toLocaleString("en-IN")}</td></tr>
              <tr class="highlight-paid"><td>जमा रक्कम:</td><td class="text-right">₹${paid.toLocaleString("en-IN")}</td></tr>
              <tr><td>शिल्लक:</td><td class="text-right" style="color:#b91c1c;font-weight:bold;">₹${balance.toLocaleString("en-IN")}</td></tr>
            </table>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printMarksheet = (exam) => {
    const studentName = exam.student ? `${exam.student.first_name} ${exam.student.last_name}` : `Student #${exam.student_id}`;
    const admNo = exam.student?.admission_number || "-";
    const className = exam.student ? `${exam.student.class_name} (${exam.student.section || "A"})` : "-";
    const schoolName = currentSchool?.name || "School ERP";

    const printWindow = window.open("", "_blank", "width=850,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>प्रगती पुस्तक - ${admNo} - ${studentName}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: "Segoe UI", Arial, sans-serif; background: #fff; color: #0f172a; margin: 20px; }
            .sheet-container { border: 3px double #1e3a8a; border-radius: 8px; padding: 20px; max-width: 720px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 12px; }
            .school-title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #1e3a8a; color: #fff; padding: 8px; font-size: 12px; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="sheet-container">
            <div class="header">
              <h1 class="school-title">${schoolName}</h1>
              <div style="font-size:12px; color:#64748b;">विद्यार्थी प्रगती पुस्तक | ${exam.exam_name}</div>
            </div>
            <div style="margin-bottom: 12px; font-size: 13px;">
              <strong>विद्यार्थी:</strong> ${studentName} | <strong>प्रवेश क्र.:</strong> ${admNo} | <strong>इयत्ता:</strong> ${className}
            </div>
            <table>
              <thead><tr><th>विषय</th><th class="text-center">गुण (100 पैकी)</th></tr></thead>
              <tbody>
                <tr><td>मराठी</td><td class="text-center"><strong>${exam.marathi}</strong></td></tr>
                <tr><td>इंग्रजी</td><td class="text-center"><strong>${exam.english}</strong></td></tr>
                <tr><td>गणित</td><td class="text-center"><strong>${exam.mathematics}</strong></td></tr>
                <tr><td>विज्ञान</td><td class="text-center"><strong>${exam.science}</strong></td></tr>
                <tr style="background:#f1f5f9;font-weight:bold;"><td>एकूण बेरीज</td><td class="text-center">${exam.obtained_marks} / 400</td></tr>
              </tbody>
            </table>
            <div style="margin-top:14px;background:#eff6ff;padding:10px;border-radius:6px;display:flex;justify-content:space-around;">
              <div>टक्केवारी: <strong>${exam.percentage}%</strong></div>
              <div>श्रेणी: <strong>${exam.grade}</strong></div>
              <div>निकाल: <strong style="color:${exam.grade === "F" ? "#dc2626" : "#16a34a"};">${exam.grade === "F" ? "पुनर्परीक्षा" : "उत्तीर्ण"}</strong></div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...studentForm, school_id: selectedSchoolId }),
      });
      if (res.ok) {
        setMessage("विद्यार्थी यशस्वीरीत्या जोडला गेला!");
        setStudentForm({ admission_number: "", first_name: "", last_name: "", class_name: "10th", section: "A", parent_name: "", parent_phone: "" });
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {
      setMessage("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...feeForm, school_id: selectedSchoolId }),
      });
      if (res.ok) {
        setMessage("फी चलन यशस्वीरीत्या तयार झाले!");
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {
      setMessage("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...examForm, school_id: selectedSchoolId }),
      });
      if (res.ok) {
        setMessage("विद्यार्थ्याचे परीक्षा गुण यशस्वीरीत्या सेव्ह झाले!");
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {
      setMessage("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...noticeForm, school_id: selectedSchoolId }),
      });
      if (res.ok) {
        setMessage("नवीन सूचना यशस्वीरीत्या जारी झाली!");
        setNoticeForm({ title: "", description: "", date: new Date().toISOString().split("T")[0], category: "General" });
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {
      setMessage("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleAttendanceSubmit = async () => {
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || "present",
      }));
      const res = await fetch("http://127.0.0.1:8000/api/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ school_id: selectedSchoolId, date: selectedDate, records }),
      });
      if (res.ok) {
        setMessage(`दिनांक ${selectedDate} ची हजेरी यशस्वीरीत्या नोंदवली गेली!`);
        fetchAttendanceForDate(selectedDate);
        fetchData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {
      setMessage("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
        
        {/* Header */}
        <header style={{ background: "#1e293b", color: "#fff", padding: "20px 28px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px" }}>{currentSchool ? currentSchool.name : "School ERP"} — Dashboard</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
              लॉगिन: <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{user.name}</span> ({user.email}) | Subdomain: <span style={{ color: "#38bdf8" }}>{currentSchool?.subdomain}.erp.local</span>
            </p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setViewMode("parent")}
              style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}
            >
              📱 पालक पोर्टल पहा
            </button>
            <span style={{ fontSize: "13px", color: "#cbd5e1" }}>शाळा बदला:</span>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(Number(e.target.value))}
              style={{ background: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "8px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  🏫 {school.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}
            >
              लॉगआउट ⎋
            </button>
          </div>
        </header>

        {/* Analytics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "600" }}>एकूण विद्यार्थी</p>
            <h3 style={{ margin: "8px 0 0", fontSize: "24px", color: "#0f172a" }}>{totalStudents}</h3>
          </div>
          <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "600" }}>जमा झालेली फी</p>
            <h3 style={{ margin: "8px 0 0", fontSize: "24px", color: "#16a34a" }}>₹{totalCollectedFee.toLocaleString()}</h3>
          </div>
          <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "600" }}>शिल्लक फी (थकबाकी)</p>
            <h3 style={{ margin: "8px 0 0", fontSize: "24px", color: "#dc2626" }}>₹{totalPendingFee.toLocaleString()}</h3>
          </div>
          <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "600" }}>आजची उपस्थिती ({selectedDate})</p>
            <h3 style={{ margin: "8px 0 0", fontSize: "24px", color: "#2563eb" }}>{attendanceRate}%</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["students", "fees", "attendance", "reports", "exams", "notices"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                background: activeTab === tab ? "#2563eb" : "#e2e8f0",
                color: activeTab === tab ? "#fff" : "#475569",
              }}
            >
              {tab === "students" && `👨‍🎓 विद्यार्थी (${students.length})`}
              {tab === "fees" && `💳 फी व्यवस्थापन (${fees.length})`}
              {tab === "attendance" && "📅 दैनिक हजेरी"}
              {tab === "reports" && "📈 हजेरी अहवाल"}
              {tab === "exams" && `📝 परीक्षा निकाल (${exams.length})`}
              {tab === "notices" && `📢 सूचना फलक (${notices.length})`}
            </button>
          ))}
        </div>

        {message && (
          <div style={{ background: message.includes("त्रुटी") ? "#fee2e2" : "#dcfce7", color: message.includes("त्रुटी") ? "#b91c1c" : "#15803d", padding: "12px 18px", borderRadius: "8px", marginBottom: "20px", fontWeight: "500" }}>
            {message}
          </div>
        )}

        {/* Tab 1: Students */}
        {activeTab === "students" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>नवीन विद्यार्थी प्रवेश ({currentSchool?.name})</h2>
              <form onSubmit={handleStudentSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>प्रवेश क्र. (Admission No)</label>
                  <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.admission_number} onChange={(e) => setStudentForm({ ...studentForm, admission_number: e.target.value })} placeholder="e.g. ADM105" />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>नाव</label>
                    <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.first_name} onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>आडनाव</label>
                    <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.last_name} onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>इयत्ता</label>
                    <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.class_name} onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })} />
                  </div>
                  <div style={{ width: "80px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>तुकडी</label>
                    <input style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.section} onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>पालकांचे नाव</label>
                  <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.parent_name} onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>पालकांचा फोन</label>
                  <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={studentForm.parent_phone} onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })} />
                </div>
                <button type="submit" style={{ marginTop: "8px", background: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                  विद्यार्थी नोंदवा
                </button>
              </form>
            </div>

            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "17px", margin: 0, color: "#0f172a" }}>नोंदणीकृत विद्यार्थी ({currentSchool?.name})</h2>
                {students.length > 0 && (
                  <button onClick={exportStudentsToCSV} style={{ background: "#059669", border: "none", color: "#fff", padding: "7px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                    📊 Excel मध्ये डाऊनलोड करा
                  </button>
                )}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "8px" }}>प्रवेश क्र.</th>
                    <th style={{ padding: "8px" }}>नाव</th>
                    <th style={{ padding: "8px" }}>इयत्ता</th>
                    <th style={{ padding: "8px" }}>पालक</th>
                    <th style={{ padding: "8px" }}>फोन</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", fontWeight: "bold", color: "#2563eb" }}>{s.admission_number}</td>
                      <td style={{ padding: "10px 8px" }}>{s.first_name} {s.last_name}</td>
                      <td style={{ padding: "10px 8px" }}>{s.class_name} ({s.section})</td>
                      <td style={{ padding: "10px 8px" }}>{s.parent_name}</td>
                      <td style={{ padding: "10px 8px", color: "#64748b" }}>{s.parent_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Fees */}
        {activeTab === "fees" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>नवीन फी चलन (New Invoice)</h2>
              <form onSubmit={handleFeeSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>विद्यार्थी निवडा</label>
                  <select
                    style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    value={feeForm.student_id}
                    onChange={(e) => setFeeForm({ ...feeForm, student_id: e.target.value })}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>फी तपशील</label>
                  <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={feeForm.title} onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>एकूण फी (₹)</label>
                    <input required type="number" style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={feeForm.total_amount} onChange={(e) => setFeeForm({ ...feeForm, total_amount: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>जमा रक्कम (₹)</label>
                    <input type="number" style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={feeForm.paid_amount} onChange={(e) => setFeeForm({ ...feeForm, paid_amount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>अंतिम मुदत</label>
                  <input required type="date" style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} />
                </div>
                <button type="submit" style={{ marginTop: "8px", background: "#16a34a", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                  फी चलन तयार करा
                </button>
              </form>
            </div>

            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>फी इनव्हॉइसेस यादी ({currentSchool?.name})</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "8px" }}>विद्यार्थी</th>
                    <th style={{ padding: "8px" }}>तपशील</th>
                    <th style={{ padding: "8px" }}>एकूण</th>
                    <th style={{ padding: "8px" }}>भरलेली</th>
                    <th style={{ padding: "8px" }}>स्थिती</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>पावती</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", fontWeight: "600" }}>{f.student ? `${f.student.first_name} ${f.student.last_name}` : "Student #" + f.student_id}</td>
                      <td style={{ padding: "10px 8px", color: "#475569" }}>{f.title}</td>
                      <td style={{ padding: "10px 8px" }}>₹{Number(f.total_amount).toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", color: "#16a34a", fontWeight: "500" }}>₹{Number(f.paid_amount).toLocaleString()}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", background: f.status === "paid" ? "#dcfce7" : "#fef3c7", color: f.status === "paid" ? "#15803d" : "#b45309" }}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <button onClick={() => printReceipt(f)} style={{ background: "#1e3a8a", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                          🖨 पावती प्रिंट
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === "attendance" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "18px", margin: 0, color: "#0f172a" }}>दैनंदिन हजेरी नोंदणी पत्रक ({currentSchool?.name})</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>तारीख निवडा:</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>प्रवेश क्र.</th>
                  <th style={{ padding: "10px" }}>नाव</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>हजेरी मार्क करा</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const currentStatus = attendanceMap[s.id] || "present";
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold", color: "#2563eb" }}>{s.admission_number}</td>
                      <td style={{ padding: "12px 10px", fontWeight: "500" }}>{s.first_name} {s.last_name}</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button type="button" onClick={() => handleAttendanceChange(s.id, "present")} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", background: currentStatus === "present" ? "#16a34a" : "#e2e8f0", color: currentStatus === "present" ? "#fff" : "#475569" }}>✓ Present</button>
                          <button type="button" onClick={() => handleAttendanceChange(s.id, "absent")} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", background: currentStatus === "absent" ? "#dc2626" : "#e2e8f0", color: currentStatus === "absent" ? "#fff" : "#475569" }}>✗ Absent</button>
                          <button type="button" onClick={() => handleAttendanceChange(s.id, "late")} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold", background: currentStatus === "late" ? "#d97706" : "#e2e8f0", color: currentStatus === "late" ? "#fff" : "#475569" }}>⏱ Late</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleAttendanceSubmit} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>💾 आजची हजेरी सेव्ह करा</button>
            </div>
          </div>
        )}

        {/* Tab 4: Reports */}
        {activeTab === "reports" && (
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "18px", margin: "0 0 16px 0", color: "#0f172a" }}>मासिक उपस्थिती अहवाल</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>प्रवेश क्र.</th>
                  <th style={{ padding: "10px" }}>नाव</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>हजर दिवस</th>
                  <th style={{ padding: "10px" }}>टक्केवारी</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>स्थिती</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReport.map((r) => (
                  <tr key={r.student_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "bold", color: "#2563eb" }}>{r.admission_number}</td>
                    <td style={{ padding: "12px 10px", fontWeight: "600" }}>{r.name}</td>
                    <td style={{ padding: "12px 10px", textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>{r.present_days}/{r.total_days}</td>
                    <td style={{ padding: "12px 10px" }}>{r.percentage}%</td>
                    <td style={{ padding: "12px 10px", textAlign: "center" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", background: r.is_low ? "#fee2e2" : "#dcfce7", color: r.is_low ? "#b91c1c" : "#15803d" }}>
                        {r.is_low ? "⚠ Defaulter (<75%)" : "✓ Good"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Exams */}
        {activeTab === "exams" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>परीक्षेचे गुण नोंदणी</h2>
              <form onSubmit={handleExamSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>विद्यार्थी निवडा</label>
                  <select style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.student_id} onChange={(e) => setExamForm({ ...examForm, student_id: e.target.value })}>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>परीक्षा शीर्षक</label>
                  <input required style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.exam_name} onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#475569" }}>मराठी</label>
                    <input required type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.marathi} onChange={(e) => setExamForm({ ...examForm, marathi: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#475569" }}>इंग्रजी</label>
                    <input required type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.english} onChange={(e) => setExamForm({ ...examForm, english: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#475569" }}>गणित</label>
                    <input required type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.mathematics} onChange={(e) => setExamForm({ ...examForm, mathematics: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#475569" }}>विज्ञान</label>
                    <input required type="number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={examForm.science} onChange={(e) => setExamForm({ ...examForm, science: e.target.value })} />
                  </div>
                </div>
                <button type="submit" style={{ marginTop: "8px", background: "#7c3aed", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>💾 निकाल सेव्ह करा</button>
              </form>
            </div>

            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>परीक्षा निकाल यादी</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "8px" }}>विद्यार्थी</th>
                    <th style={{ padding: "8px" }}>परीक्षा</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>गुण</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>श्रेणी</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>गुणपत्रिका</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((ex) => (
                    <tr key={ex.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", fontWeight: "600" }}>{ex.student ? `${ex.student.first_name} ${ex.student.last_name}` : "Student #" + ex.student_id}</td>
                      <td style={{ padding: "10px 8px", color: "#475569" }}>{ex.exam_name}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: "bold" }}>{ex.obtained_marks}/400 ({ex.percentage}%)</td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>{ex.grade}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <button onClick={() => printMarksheet(ex)} style={{ background: "#7c3aed", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "5px", fontSize: "12px", cursor: "pointer" }}>🖨 निकाल पत्रक</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Notice Board (नवीन टॅब) */}
        {activeTab === "notices" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>नवीन सूचना जारी करा (Publish Notice)</h2>
              <form onSubmit={handleNoticeSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>सूचनेचे शीर्षक (Title)</label>
                  <input
                    required
                    style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="उदा. वार्षिक स्नेहसंमेलन / सुट्टी"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>तपशील (Description)</label>
                  <textarea
                    required
                    rows="4"
                    style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", resize: "vertical" }}
                    value={noticeForm.description}
                    onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                    placeholder="पालकांसाठी संपूर्ण सूचना लिहा..."
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>दिनांक</label>
                    <input
                      required
                      type="date"
                      style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      value={noticeForm.date}
                      onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>प्रकार (Category)</label>
                    <select
                      style={{ width: "100%", padding: "8px 10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      value={noticeForm.category}
                      onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    >
                      <option value="General">सामान्य सूचना (General)</option>
                      <option value="Holiday">सुट्टी (Holiday)</option>
                      <option value="Exam">परीक्षा (Exam)</option>
                      <option value="Event">कार्यक्रम / स्पर्धा (Event)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{ marginTop: "8px", background: "#f59e0b", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  📢 सूचना प्रकाशित करा
                </button>
              </form>
            </div>

            <div style={{ background: "#fff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "17px", marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>प्रकाशित सूचना यादी ({currentSchool?.name})</h2>
              {notices.length === 0 ? (
                <p style={{ color: "#64748b" }}>या शाळेसाठी अद्याप कोणतीही सूचना जारी करण्यात आलेली नाही.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {notices.map((n) => (
                    <div key={n.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>{n.title}</h4>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px" }}>
                            {n.category}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>📅 {n.date}</span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                        {n.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}