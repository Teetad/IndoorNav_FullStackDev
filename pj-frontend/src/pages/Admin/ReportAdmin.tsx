import React, { useState, useEffect } from "react";
import { Send, Mail, Check, User, ChevronDown } from "lucide-react";
import SideBar from "../../components/SideBar";

interface Report {
  report_id: string;
  user_id: string;
  user_email: string;
  place_id: string;
  place_name: string;
  description: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const ReportAdminPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 📌 1. เพิ่ม State สำหรับควบคุมการเปิด/ปิด Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 📌 2. สร้างรายการตัวเลือกเพื่อให้ Render และจัดการง่ายขึ้น
  const statusOptions = [
    { value: "ALL", label: "All status" },
    { value: "PENDING", label: "Submitting" },
    { value: "RECEIVED", label: "Received" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  // หา label ปัจจุบันเพื่อไปแสดงบนปุ่ม
  const currentStatusLabel = statusOptions.find(opt => opt.value === filterStatus)?.label;

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const endpoint = filterStatus === "ALL" 
          ? "http://localhost:3000/reports" 
          : `http://localhost:3000/reports/${filterStatus.toLowerCase()}`;

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          console.error("Failed to fetch reports");
          setReports([]); 
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filterStatus]);

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") {
      return (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium bg-[#6B8E9B] w-32">
          <Send className="w-4 h-4" /> Submitting
        </div>
      );
    } else if (s === "received") {
      return (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium bg-[#C29053] w-32">
          <Mail className="w-4 h-4" /> Received
        </div>
      );
    } else if (s === "resolved") {
      return (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium bg-[#5B8A66] w-32">
          <Check className="w-4 h-4" /> Resolved
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#F8F6F2] font-sans">
      
      <SideBar />

      <main className="flex-1 flex flex-col px-10 py-10 overflow-y-auto ml-64">
        
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Reports</h1>

        {/* 📌 3. Custom Dropdown Filter */}
        <div 
          className="mb-8 relative inline-block w-48"
          // เมื่อคลิกพื้นที่อื่นนอกจาก Dropdown ให้ปิดเมนูอัตโนมัติ
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsDropdownOpen(false);
            }
          }}
        >
          {/* ปุ่มกด (Trigger) */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-[#EAE1D3] text-stone-800 font-medium py-2.5 px-5 rounded-full focus:outline-none transition-colors hover:bg-[#E2D8C9]"
          >
            <span>{currentStatusLabel}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* เมนู Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-full bg-[#F4EFE9] border border-[#EAE1D3] rounded-3xl shadow-lg py-3 z-50 flex flex-col">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFilterStatus(option.value);
                    setIsDropdownOpen(false); // ปิดเมนูหลังจากเลือก
                  }}
                  className="flex items-center px-4 py-2.5 text-stone-800 hover:bg-[#EAE1D3] transition-colors w-full text-left text-lg focus:outline-none hover:no-underline"
                >
                  {/* พื้นที่สำหรับ Checkmark[cite: 5] */}
                  <div className="w-8 flex justify-center items-center">
                    {filterStatus === option.value && (
                      <Check className="w-5 h-5 text-stone-800 stroke-[3]" />
                    )}
                  </div>
                  {/* ข้อความ Label */}
                  <span className={filterStatus === option.value ? "font-medium" : ""}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of Reports */}
        {isLoading ? (
          <p className="text-stone-500 animate-pulse">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-stone-500">No reports found for this status.</p>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl">
            {reports.map((report) => (
              <div key={report.report_id} className="bg-[#E2E8EE] rounded-2xl p-6 shadow-sm flex flex-col">
                
                <div className="mb-4">
                  <h3 className="font-bold text-stone-800 text-lg mb-1">{report.place_name || "Report Category"}</h3>
                  <p className="text-stone-500 text-[15px]">{report.description}</p>
                </div>

                <div className="h-px bg-[#C8D1DA] w-full mb-4"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#8E796E] p-1.5 rounded-full text-[#F3EFEA]">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-stone-700 font-medium">{report.user_email}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    {renderStatusBadge(report.status)}
                    <button className="text-[#6B8E9B] font-medium hover:text-[#4A7280] transition-colors">
                      Update status
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default ReportAdminPage;