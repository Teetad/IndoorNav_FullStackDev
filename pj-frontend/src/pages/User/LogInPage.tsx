import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  role?: string;
}

const LogInPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    navigate(-1); // กลับไปหน้าก่อนหน้า
  };

  const handleLogOut = async () => {
    try {
      // 1. ยิง API ไปบอก Backend ให้ลบ Session
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // 2. ลบข้อมูลใน Local Storage
      localStorage.clear(); 

      // 3. ล้างค่า State ของ User ในหน้าปัจจุบัน
      setUserData(null);


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
          setUserData(data); 

      
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } finally {
        setLoading(false); 
      }
    };

    fetchUserData();
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
        ) : userData ? (
          
          /* ----------------- UI เมื่อ Log in สำเร็จ ----------------- */
          <div className="w-full flex flex-col items-center pt-2">
            
            {/* Header: Email ตรงกลาง และ ปุ่ม Done ขวาบน */}
            <div className="w-full relative flex items-center justify-center mb-8">
              <span className="text-grey-700 font-normal text-lg">
                {userData.email}
              </span>
              <button 
                onClick={handleClose}
                className="absolute right-0 text-[#5F8A72] text-lg font-medium cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* รูปโปรไฟล์ */}
            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-medium text-grey-700"> Hi, {userData.display_name || "User"}!</h2>
            </div>

            {/* ปุ่ม Log out */}
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
            
            {/* ปุ่ม Done ขวาบน */}
            <div className="w-full flex justify-end">
              <button 
                onClick={handleClose}
                className="text-[#5F8A72] text-lg font-medium cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* รูปโปรไฟล์ตอนยังไม่เข้าระบบ */}
            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-medium text-grey-700">Please log in</h2>
            </div>

            {/* ปุ่ม Log in */}
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