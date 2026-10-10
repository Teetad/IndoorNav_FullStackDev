import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 📌 1. Import useAuth เข้ามา (อย่าลืมเช็ค path ให้ตรงกับที่เก็บไฟล์ AuthContext)
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  // 📌 2. เรียกใช้ฟังก์ชัน login จาก Global State
  const { login } = useAuth(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. ยิง API เพื่อขอข้อมูล User พร้อมแนบ Cookie
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          
          // 📌 3. นำข้อมูลไปเก็บใน Global State แทนการใช้ setUserData
          login("session-active", {
            id: data.user_id,
            name: data.display_name,
            email: data.email
          });
          
          // 4. เช็ค Role เพื่อนำทาง
          if (data.role && data.role.toLowerCase() === 'admin') {
            navigate('/dashboard');
            return; // หยุดการทำงานชั่วคราวเพื่อไม่ให้วิ่งไปหน้า '/' ต่อ
          }
          
          // 5. พาผู้ใช้กลับหน้าแผนที่หลักเมื่อทุกอย่างเรียบร้อย
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); 

  return <div className="text-center py-20 text-stone-600 animate-pulse">Logging in, please wait...</div>;
};

export default AuthCallback;