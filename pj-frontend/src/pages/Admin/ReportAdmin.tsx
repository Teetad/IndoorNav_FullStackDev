import React, { useState, useEffect } from "react";
import { Send, Mail, Check, User, ChevronDown } from "lucide-react";
import SideBar from "../../components/SideBar"; // 📌 นำเข้า SideBar ให้ตรงกับโฟลเดอร์ของคุณ

// 1. กำหนด Interface ตามโครงสร้างข้อมูล API
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
  // State สำหรับเก็บข้อมูลและสถานะการโหลด
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Effect สำหรับยิง API ทุกครั้งที่เปลี่ยน Filter
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // ตรวจสอบเงื่อนไขเพื่อกำหนด URL
        const endpoint = filterStatus === "ALL" 
          ? "http://localhost:3000/reports" 
          : `http://localhost:3000/reports/${filterStatus.toLowerCase()}`;

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include", // 📌 ต้องแนบ Cookie ไปด้วย
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          console.error("Failed to fetch reports");
          setReports([]); // เคลียร์ค่ากรณี error
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filterStatus]); // 📌 ทำงานซ้ำเมื่อ filterStatus เปลี่ยน

  // 3. ฟังก์ชันช่วยสร้างป้ายสถานะ (Badge) ตามสีใน UI
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
      
      {/* ซ้าย: SideBar */}
      <SideBar />

      {/* ขวา: Main Content */}
      <main className="flex-1 flex flex-col px-10 py-10 overflow-y-auto ml-64">
        
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Reports</h1>

        {/* Dropdown Filter */}
        <div className="mb-8 relative inline-block w-40">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full appearance-none bg-[#EAE1D3] text-stone-800 font-medium py-2.5 px-5 pr-10 rounded-full focus:outline-none cursor-pointer"
          >
            <option value="ALL">All status</option>
            <option value="PENDING">Submitting</option>
            <option value="RECEIVED">Received</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-800">
            <ChevronDown className="w-5 h-5" />
          </div>
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
                
                {/* ส่วนบน: Category & Description */}
                <div className="mb-4">
                  <h3 className="font-bold text-stone-800 text-lg mb-1">{report.place_name || "Report Category"}</h3>
                  <p className="text-stone-500 text-[15px]">{report.description}</p>
                </div>

                {/* เส้นคั่น */}
                <div className="h-px bg-[#C8D1DA] w-full mb-4"></div>

                {/* ส่วนล่าง: User, Status, Action */}
                <div className="flex items-center justify-between">
                  
                  {/* ข้อมูลผู้ใช้งาน */}
                  <div className="flex items-center gap-3">
                    <div className="bg-[#8E796E] p-1.5 rounded-full text-[#F3EFEA]">
                      <User className="w-5 h-5" />
                    </div>
                    {/* ใช้ email หรือดึงชื่อมาแสดง */}
                    <span className="text-stone-700 font-medium">{report.user_email}</span>
                  </div>

                  {/* ป้ายสถานะ และ ปุ่มแก้ไข */}
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