import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-map-background flex flex-col md:flex-row">
      
      {/* 1. Desktop Sidebar (แสดงผลเฉพาะจอคอม md ขึ้นไป) */}
      <aside className="hidden md:flex flex-col w-64 bg-map-backkground p-4">

        {/* เมนู Sidebar ของ Desktop ตามภาพที่ 1 */}
        <nav className="space-y-2 pt-16">
          <a href="/" className="flex items-center gap-3 p-3 rounded-lg bg-secondary font-medium">Dashboard</a>
          <a href="/map" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white">Map</a>
          <a href="/report" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white">Reports</a>
        </nav>
      </aside>

      {/* 2. Main Content Area (พื้นที่แสดงเนื้อหาของแต่ละหน้า) */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet /> {/* หน้าย่อยต่างๆ จะมาแสดงตรงนี้ */}
      </main>

      {/* 3. Mobile Bottom Navigation (แสดงผลเฉพาะจอมือถือ ซ่อนในคอมด้วย md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

    </div>
  );
}