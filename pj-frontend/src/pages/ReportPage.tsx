import { useState, useEffect } from 'react';
import { User, Check, Mail, Send } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

// กำหนดโครงสร้างข้อมูลที่ได้จาก API
interface Report {
  report_id: string;
  place_id: string;
  place_name: string;
  description: string;
  status: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

const ReportPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogIn = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  const handleReport = () => {
    navigate('/addreport');
  };

  // 1. เช็คสถานะการล็อกอิน
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          method: 'GET',
          credentials: 'include' 
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // 2. ถ้าล็อกอินแล้ว ให้ดึงข้อมูล Report ของตัวเองมาแสดง
  useEffect(() => {
    if (isLoggedIn) {
      const fetchMyReports = async () => {
        setLoadingReports(true);
        try {
          const response = await fetch('http://localhost:3000/reports/me', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setReports(data);
          }
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoadingReports(false);
        }
      };

      fetchMyReports();
    }
  }, [isLoggedIn]);

  // แสดง Loading ระหว่างรอเช็คสถานะ Cookie
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EBE1]">
        <span className="text-grey-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EBE1] pb-24 relative">
      
      {/* 📌 ส่วน Header "Report" */}
      <div className="w-full pt-12 pb-4 border-b border-[#D6CFC8] flex justify-center items-center shrink-0">
        <h1 className="text-2xl font-bold text-grey-700">Report</h1>
      </div>

      {/* 📌 ส่วนเนื้อหาหลัก */}
      <div className="flex-1 flex flex-col items-center w-full relative">
        
        {!isLoggedIn ? (
          
          /* ---------------- UI เมื่อยังไม่ Log in ---------------- */
          <div className="flex flex-col items-center w-full mt-16 px-6">
            
            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-medium text-grey-700"> Please Log in </h2>
            </div>

            {/* ปุ่ม Log in */}
            <button 
              onClick={handleLogIn}
              className="w-full mt-10 py-3 bg-[#E2E8F0]/80 text-grey-700 text-[17px] font-medium rounded-[12px] shadow-sm hover:bg-white/80 transition-colors cursor-pointer"
            >
              Log in
            </button>
          </div>

        ) : (

          /* ---------------- UI โครงสร้างเมื่อ Log in แล้ว ---------------- */
          <div className="flex flex-col w-full h-full relative">
            
            {/* พื้นที่สำหรับแสดง List API */}
            <div className="flex-1 w-full overflow-y-auto scrollbar-none pb-20">
              {loadingReports ? (
                <div className="text-center py-10 text-grey-700 font-medium">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-10 text-grey-700">No reports found.</div>
              ) : (
                reports.map((report) => (
                  <div key={report.report_id} className="w-full px-6 py-5 border-b border-[#D6CFC8] flex justify-between items-start gap-4">
                    
                    {/* ฝั่งซ้าย: ชื่อสถานที่และคำอธิบาย */}
                    <div className="flex-1">
                      <h3 className="font-bold text-grey-700 text-[17px] leading-tight">
                        {report.place_name || "Unknown Place"}
                      </h3>
                      <p className="text-stone-500 text-[15px] mt-1 leading-snug break-words">
                        {report.description}
                      </p>
                    </div>

                    {/* ฝั่งขวา: สถานะ (Status Badge) */}
                    <div className="shrink-0">
  {(() => {
    const status = report.status?.toLowerCase();

    if (status === 'resolved') {
      return (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5F8A72] text-white rounded-full text-sm font-medium">
          <Check className="w-4 h-4 stroke-[3]" />
          Resolved
        </div>
      );
    }

    if (status === 'received') {
      return (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C89B68] text-white rounded-full text-sm font-medium">
          <Mail className="w-4 h-4" />
          Received
        </div>
      );
    }

    // Default: แสดงเป็น Submitting เมื่อสถานะเพิ่งถูกสร้างหรือเป็นค่าอื่นๆ
    return (
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#718F9F] text-white rounded-full text-sm font-medium">
        <Send className="w-4 h-4" />
        Submitting
      </div>
    );
  })()}
</div>

                  </div>
                ))
              )}
            </div>

            {/* ปุ่ม Add new report (ยึดติดขอบล่างของหน้า) */}
            <div className="absolute bottom-6 w-full flex justify-center left-0 px-6 bg-gradient-to-t from-[#F4EBE1] via-[#F4EBE1] to-transparent pt-4">
              <button 
                onClick={handleReport}
                className="w-full py-3.5 bg-primary-light text-grey-700 text-[17px] font-medium rounded-[14px] shadow-sm hover:bg-white/80 transition-colors cursor-pointer"
              >
                Add new report
              </button>
            </div>
            
          </div>

        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ReportPage;