import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";
import MapSpot from "../../components/MapSpot";

const Floor_4 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = () => {
    console.log('Profile icon clicked!');
  };

  const handleSearch = () => {
    console.log('Search clicked!');
  };

  // 📌 สร้างตัวแปรเช็คสถานะการเปิด Popup (เป็น true เมื่อ selectedLocation มีข้อมูล)
  const isHidden = Boolean(selectedLocation);

  return (
    // ควบคุมการล็อกหน้าจอฉากหลัง (ถ้าเปิด Popup จะซ่อน Scrollbar ของหน้าแผนที่)
    <div className={`absolute inset-0 w-full h-[100dvh] bg-[#F3EFEA] flex flex-col ${isHidden ? 'overflow-hidden' : 'overflow-auto'}`}>
      
      {/* SearchBar ด้านบนสุด */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search location here"
          BackgroundColor="bg-[#E6DFD5]/90 backdrop-blur-md shadow-md" 
          onProfileClick={handleProfileClick}
          onSearchClick={handleSearch}
        />
      </div>

      {/* พื้นที่แผนที่ */}

      <MapSpot 
        Top="0%" 
        Left="50%" 
        Width="50%" 
        Height="26%" 
        onClick={() => setSelectedLocation({ name: '422345', type: 'co-working space' })} 
        imageSrc="/Images/floor4.jpg" 
        RoomID="422"
      />

      {/* 📌 ShowRoom Popup (ส่ง isHidden ไปด้วย) */}
      <ShowRoom 
        selectedLocation={selectedLocation} 
        setSelectedLocation={setSelectedLocation} 
      />

      {/* 📌 ปุ่มควบคุมชั้น (FloorControl) พร้อมส่ง isHidden ไปซ่อนตัวเวลาเปิด Popup */}
      <div className="absolute bottom-6 right-4 z-30">
        <FloorControl currentFloor={4} isHidden={isHidden} />
      </div>
    </div>
  );
};

export default Floor_4;