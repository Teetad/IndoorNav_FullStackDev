import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import SearchBar from "../../components/SearchBar";
import { Bell, Send, Mail, Check } from "lucide-react";
import ReportCard from "../../components/ReportCard";
import LogInHeader from "../../components/LogInHeader";

interface Report {
  id: string;
  place_name: string;
  description: string;
  status: "Pending" | "In progress" | "Resolved" ;
  createdAt: string;
  updated_at: string;
}

// แปลงวันที่เป็นข้อความ เช่น 10 min ago, 1 h 10 min ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
      ? `${hours} h ${remainingMinutes} min ago`
      : `${hours} h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} d ago`;
};

// รองรับ Pending ที่อาจถูกส่งมาจาก Backend
const normalizeStatus = (status: string) => {
  const value = status.toLowerCase();
  if (value === "pending" || value === "submitting") {
    return "Pending"; // 📌 1. เปลี่ยนตรงนี้เป็น "Pending"
  }
  if (value === "received" || value === "in_progress") { // 📌 2. เพิ่ม in_progress ด้วย
    return "Received";
  }
  if (value === "resolved") return "Resolved";

  return status;
}

const DashBoardPage = () => {
  const navigate = useNavigate();

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [isReportsLoading, setReportsLoading] = useState(true);

  const goToMap = () => {
    navigate("/afloor-4");
    return;
  }

  // 📌 เพิ่ม useEffect เพื่อดึงข้อมูล Reports ล่าสุดมาแสดงในตาราง
  useEffect(() => {
    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/reports", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // แนบ Cookie ของ Admin ไปด้วย
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          console.error("Failed to fetch reports");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // เรียงจากรายงานใหม่ไปเก่า และแสดงไม่เกิน 3 รายการ
  const recentReports = [...reports]
    .sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();

      return (
        (Number.isNaN(dateB) ? 0 : dateB) -
        (Number.isNaN(dateA) ? 0 : dateA)
      );
    })
    .slice(0, 3);

  const getStatusStyle = (status: string) => {
    switch (normalizeStatus(status)) {
      case "Pending":
        return {
          color: "bg-[#6B8E9B]",
          Icon: Send,
        };
      case "Received":
        return {
          color: "bg-[#C29053]",
          Icon: Mail,
        };
      case "Resolved":
        return {
          color: "bg-[#5B8A66]",
          Icon: Check,
        };
      default:
        return {
          color: "bg-[#C29053]",
          Icon: Mail,
        };
    }
  };


  return (
    <div className="flex h-dvh overflow-hidden bg-[#F8F6F2] font-sans">
      <SideBar />

      <main className="ml-64 flex min-w-0 flex-1 flex-col overflow-y-auto px-10 py-6">
        {/* Header */}
        <div className="mb-6 flex shrink-0 items-center justify-between gap-8">
          <div className="relative w-ful l max-w-md">
            <SearchBar
              value={""}
              onChange={()=>{}}
              placeholder="Search location here"
              BackgroundColor="bg-[#EAE1D3] text-stone-700 placeholder-stone-500"
              onProfileClick={() => {}}
              onSearchClick={goToMap}
              isShowProfile={false}
            />

          </div>
          <LogInHeader></LogInHeader>
          
        </div>

        {/* Dashboard Overview */}
        <h1 className="mb-2 shrink-0 text-3xl font-bold text-stone-800 ">
          Dashboard Overview
        </h1>

        <h2 className="mb-6 shrink-0 text-xl font-semibold text-stone-700 py-8">
          Reports issues
        </h2>

        {/* Status Cards */}
        <div className="mb-8 grid shrink-0 grid-cols-4 gap-4">
          <ReportCard
            Status="All reports"
            Icon={Bell}
            ColorClass="bg-[#B85C5C]"
          />
          <ReportCard
            Status="Pending"
            Icon={Send}
            ColorClass="bg-[#6B8E9B]"
          />
          <ReportCard
            Status="Received"
            Icon={Mail}
            ColorClass="bg-[#C29053]"
          />
          <ReportCard
            Status="Resolved"
            Icon={Check}
            ColorClass="bg-[#5B8A66]"
          />
        </div>

        {/* Recently Reports */}
        <section className="mb-4 flex min-h-0 w-full max-w-4xl flex-col rounded-3xl bg-[#F4EFE9]/50 p-5 sm:p-6">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-stone-700 sm:text-xl">
              Recently reports issues
            </h3>

            <button
              type="button"
              onClick={() => navigate("/reportadmin")}
              className="shrink-0 text-sm font-semibold text-[#9A8175] transition-colors hover:text-stone-700 sm:text-base"
            >
              View All Reports
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isReportsLoading ? (
              <p className="py-6 text-stone-500">Loading reports...</p>
            ) : recentReports.length === 0 ? (
              <p className="py-6 text-stone-500">No reports found.</p>
            ) : (
              <div className="flex flex-col">
                {recentReports.map((report, index) => {
                  const status = getStatusStyle(report.status);
                  const StatusIcon = status.Icon;

                  return (
                    <div
                      key={report.id || index}
                      className="grid grid-cols-1 items-center gap-3 border-b border-stone-200/70 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-6"
                    >
                      {/* Category and description */}
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-stone-800">
                          {report.place_name }
                        </p>
                        <p className="mt-1 truncate text-sm text-stone-500">
                          {report.description || "No description"}
                        </p>
                      </div>

                      {/* Status */}
                      <div
                        className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white ${status.color}`}
                      >
                        <StatusIcon className="h-4 w-4 shrink-0" />
                        <span>{normalizeStatus(report.status)}</span>
                      </div>

                      {/* Created time */}
                      <span className="whitespace-nowrap text-sm text-stone-500">
                        {formatTimeAgo(report.updated_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashBoardPage;