import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: Import ฟังก์ชันสำหรับอัปเดต State ของคุณ (เช่น Context หรือ Zustand)
// import { useAuth } from '../context/AuthContext'; 

const AuthCallback = () => {
  const navigate = useNavigate();
  // const { setUser } = useAuth(); // ตัวอย่างการดึงฟังก์ชันเซ็ต User จาก Context

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. ยิง API เพื่อขอข้อมูล User พร้อมแนบ Cookie
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: "include", 
        });

        if (response.ok) {
          const userData = await response.json();
          
          // 2. บันทึกข้อมูลลง State ของแอป (เอาไว้ใช้เช็ค Role หรือแสดงชื่อ User)
          // setUser(userData); 
          
          // 3. พาผู้ใช้กลับหน้าแผนที่หลักเมื่อทุกอย่างเรียบร้อย
          navigate('/');
        } else {
          // ถ้า Backend ตอบกลับมาว่าไม่สำเร็จ (เช่น 401 Unauthorized)
          console.error("Login failed or session not found.");
          navigate('/login'); // เด้งกลับไปหน้า login หรือหน้าแจ้งเตือน
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  return <div className="text-center py-20">Logging in, please wait...</div>;
};

export default AuthCallback;