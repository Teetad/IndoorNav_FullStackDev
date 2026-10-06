import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const LogInPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // กลับไปหน้าก่อนหน้า
  };

  const handleLogIn = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-map-background backdrop-blur-xs">
      
      {/* ใส่ CSS Keyframes ตรงนี้เพื่อให้ทำงานได้ทันทีโดยไม่ต้องพึ่งปลั๊กอิน */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* กล่องสีฟ้าที่จะสไลด์ขึ้นมาจากด้านล่าง */}
      <div className="w-full max-w-md h-[95vh] bg-primary rounded-t-3xl p-6 flex flex-col items-center shadow-2xl animate-slide-up">
        
        {/* ปุ่ม Done มุมขวาบน */}
        <div className="w-full flex justify-end">
          <button 
            onClick={handleClose}
            className="text-[#5F8A72] font-medium cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* ส่วนรูปโปรไฟล์และข้อความ Please log in */}
        <div className="flex flex-col items-center mt-12">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#8E796E] text-[#F3EFEA] shadow-md mb-4">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-medium text-grey-700">Please log in</h2>
        </div>

        {/* ปุ่ม Log in ตรงกลาง */}
        <div 
        onClick={handleLogIn}
        className="w-full mt-10 ">
          <button className="w-full py-3.5 bg-primary-light text-grey-700 text-xl font-medium rounded-[12px] shadow-sm transition-all cursor-pointer">
            Log in
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogInPage;