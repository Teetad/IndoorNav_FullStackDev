import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ConciergeBell,
  LogOut
} from "lucide-react";
import { useAuth } from '../context/AuthContext'; // 📌 ปรับ path ให้ตรงกับโครงสร้างโฟลเดอร์ของคุณ

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 📌 ดึง hook สำหรับเปลี่ยนหน้า
  const { logout } = useAuth(); // 📌 ดึงฟังก์ชันล้างค่า state จาก Context

  const isActive = (paths: string[]) => {
    return paths.some((path) => location.pathname === path);
  };

  // เช็คสถานะ Active สำหรับหน้า Map
  const isMapActive = ['/afloor-4'].some(
    (path) => location.pathname === path
  );

  // 📌 ฟังก์ชันจัดการการ Log out
  const handleLogOut = async () => {
    try {
      // 1. ยิง API ไปบอก Backend ให้ลบ Session
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out from server:', error);
    } finally {
      // 2. เคลียร์ค่า User State และ LocalStorage ฝั่ง Frontend
      logout();
      // 3. พาผู้ใช้กลับไปหน้า Login
      navigate('/login');
    }
  };

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
              : 'text-gray-700 hover:bg-[#D9D9D9] font-medium'
          }`}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span>Dashboard</span>
        </Link>

        {/* Map */}
        <Link 
          to="/afloor-4" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            isMapActive 
              ? 'bg-secondary text-black font-semibold' 
              : 'text-gray-700 hover:bg-[#D9D9D9] font-medium'
          }`}
        >
          <Map className="h-6 w-6" />
          <span>Map</span>
        </Link>

        {/* Reports */}
        <Link 
          to="/reportadmin" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            isActive(['/reportadmin']) 
              ? 'bg-secondary text-black font-semibold' 
              : 'text-gray-700 hover:bg-[#D9D9D9] font-medium'
          }`}
        >
          <ConciergeBell className="h-6 w-6" />
          <span>Reports</span>
        </Link>
      </div>

      {/* เมนูด้านล่าง (Log out) */}
      <div>
        <button 
          onClick={handleLogOut} // 📌 เรียกใช้ฟังก์ชันที่สร้างขึ้น
          className="flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all text-[#B04A4A] hover:bg-red-50 font-medium cursor-pointer"
        >
          <LogOut className="h-6 w-6" />
          <span>Log out</span>
        </button>
      </div>

    </div>
  );
};

export default SideBar;