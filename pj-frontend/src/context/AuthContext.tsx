import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// 1. กำหนดรูปแบบข้อมูลผู้ใช้
interface User {
  id: string;
  name: string; // เอาไว้โชว์บน Dashboard
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // 📌 2. โหลดข้อมูลจาก localStorage ทันทีตั้งแต่ตอนประกาศ State
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  // (ลบ useEffect ออกไปแล้ว เพราะเราใช้ Function อ่านค่าตั้งต้นใน useState ด้านบนแทน)

  // 3. ฟังก์ชันตอน Login สำเร็จ
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData)); // เก็บชื่อลงเครื่อง
  };

  // 4. ฟังก์ชันตอนกด Log out
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};