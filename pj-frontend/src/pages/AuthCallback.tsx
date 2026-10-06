import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // เมื่อ Backend ทำงานเสร็จและดีดกลับมาที่หน้านี้
    // ปกติ Cookie จะถูกเก็บบันทึกให้อัตโนมัติแล้ว
    // เราสามารถพาผู้ใช้กลับไปหน้าแผนที่หลักได้เลย
    navigate('/');
  }, [navigate]);

  return <div className="text-center py-20">Logging in, please wait...</div>;
};

export default AuthCallback;