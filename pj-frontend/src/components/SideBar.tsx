import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ConciergeBell,
  LogOut
} from "lucide-react";

const SideBar = () => {
  const location = useLocation();

  const isActive = (paths: string[]) => {
    return paths.some((path) => location.pathname === path);
  };

  // เช็คสถานะ Active สำหรับหน้า Map (สามารถรวม path ของแต่ละชั้นได้เหมือนเดิม)
  const isMapActive = ['/dashboard'].some(
    (path) => location.pathname === path
  );

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-[#F8F7F4] flex flex-col justify-between py-8 px-4 border-r border-gray-200 z-20">
      
      {/* เมนูด้านบน */}
      <div className="flex flex-col gap-2">
        {/* Dashboard */}
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            isActive(['/dashboard']) 
              ? 'bg-secondary text-black font-semibold' 
              : 'text-gray-700 hover:bg-gray-100 font-medium'
          }`}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span>Dashboard</span>
        </Link>

        {/* Map */}
        <Link 
          to="/mapadmin" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            isMapActive 
              ? 'bg-secondary text-black font-semibold' 
              : 'text-gray-700 hover:bg-gray-100 font-medium'
          }`}
        >
          <Map className="h-6 w-6" />
          <span>Map</span>
        </Link>

        {/* Reports[cite: 1] */}
        <Link 
          to="/reportadmin" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            isActive(['/report']) 
              ? 'bg-secondary text-black font-semibold' 
              : 'text-gray-700 hover:bg-gray-100 font-medium'
          }`}
        >
          <ConciergeBell className="h-6 w-6" />
          <span>Reports</span>
        </Link>
      </div>

      {/* เมนูด้านล่าง (Log out)[cite: 1] */}
      <div>
        <button 
          onClick={() => {
            // เพิ่ม Logic สำหรับ Log out ตรงนี้
            console.log("Logout clicked");
          }}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all text-[#B04A4A] hover:bg-red-50 font-medium"
        >
          <LogOut className="h-6 w-6" />
          <span>Log out</span>
        </button>
      </div>

    </div>
  );
};

export default SideBar;