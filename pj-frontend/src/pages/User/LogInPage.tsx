import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
// 📌 1. Import useAuth เข้ามา (ปรับ path ให้ตรงกับที่เก็บไฟล์ AuthContext ของคุณ)
import { useAuth } from '../../context/AuthContext';

const LogInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 📌 2. ดึงข้อมูลและฟังก์ชันจาก Global State
  const { user, login, logout } = useAuth(); 

  const handleClose = () => {
    navigate(-1); 
  };

  const handleLogOut = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // 📌 3. เรียกใช้ logout() จาก Context แทนการ clear เอง
      // ฟังก์ชันนี้จะจัดการลบ LocalStorage และล้าง State ให้เราอัตโนมัติ
      logout(); 

    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogIn = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          method: 'GET',
          credentials: 'include' 
        });

        if (response.ok) {
          const data = await response.json();
          
          // 📌 4. เมื่อดึงข้อมูลสำเร็จ ให้อัปเดตเข้า Global State ทันที
          // สมมติว่าระบบของคุณไม่ได้ใช้ JWT (เพราะใช้ credentials: 'include') 
          // ให้ส่ง token จำลองไป หรือถ้ามี token ก็ใส่ token จริงๆ ได้เลย
          login("session-active", {
            id: data.user_id,
            name: data.display_name,
            email: data.email
          }); 
      
        } else {
          // ถ้าดึงข้อมูลไม่ได้ (เช่น session หมดอายุ) ให้เคลียร์ State
          logout();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        logout();
      } finally {
        setLoading(false); 
      }
    };

    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-xs">
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* กล่องหลัก */}
      <div className="w-full max-w-md h-[95vh] bg-primary rounded-t-[32px] p-6 flex flex-col items-center shadow-2xl animate-slide-up relative">
        
        {loading ? (
          <div className="mt-20 text-grey-700 font-medium">Loading...</div>
        ) : user ? ( // 📌 5. เปลี่ยนจาก userData เป็น user (ตัวแปรจาก Context)
          
          /* ----------------- UI เมื่อ Log in สำเร็จ ----------------- */
          <div className="w-full flex flex-col items-center pt-2">
            
            <div className="w-full relative flex items-center justify-center mb-8">
              <span className="text-grey-700 font-normal text-lg">
                {user.email} {/* 📌 ดึงค่าจาก Context */}
              </span>
              <button 
                onClick={handleClose}
                className="absolute right-0 text-[#5F8A72] text-lg font-medium cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
                <User className="w-12 h-12" />
              </div>
              {/* 📌 ดึงชื่อจาก Context */}
              <h2 className="text-2xl font-medium text-grey-700"> Hi, {user.name || "User"}!</h2>
            </div>

            <div className="w-full px-2 space-y-4 pt-10">
              <button 
                onClick={handleLogOut}
                className="w-full py-3.5 bg-[#E2E8F0]/80 text-grey-700 text-lg font-medium rounded-[14px] shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
              >
                Log out
              </button>
            </div>

          </div>

        ) : (
          
          /* ----------------- UI เมื่อยังไม่ Log in ----------------- */
          <div className="w-full flex flex-col items-center">
            
            <div className="w-full flex justify-end">
              <button 
                onClick={handleClose}
                className="text-[#5F8A72] text-lg font-medium cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-medium text-grey-700">Please log in</h2>
            </div>

            <div className="w-full px-2 space-y-4 pt-10">
              <button 
                onClick={handleLogIn}
                className="w-full py-3.5 bg-[#E2E8F0]/80 text-grey-700 text-lg font-medium rounded-[14px] shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
              >
                Log in
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
};

export default LogInPage;