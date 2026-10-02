import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";

const Floor_7 = () => {
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

  return (
    // 1. ใช้ fixed หรือ absolute ครอบเต็มจอ (inset-0) พร้อมเปลี่ยนพื้นหลังเป็นสีแผนที่
    <div className="absolute inset-0 w-full h-screen bg-[#F3EFEA] overflow-hidden">
      
      {/* 2. กล่องแผนที่ที่สามารถเลื่อนซ้าย-ขวา/ขึ้น-ลง ได้เต็มหน้าจอ (overflow-auto) */}
      <div className="w-full h-full overflow-auto relative flex justify-center items-center">
        
        {/* กรอบห่อรูปแผนที่ขนาดใหญ่ (ปรับขนาด w-[1200px] h-[1200px] ได้ตามความเหมาะสมของรูปภาพ) */}
        <div className="relative w-[100vw] max-w-[1000px] aspect-square flex-shrink-0">
          
          {/* รูปภาพแผนที่ชั้น 7 */}
          <img 
            src="/Images/floor7.jpg" 
            alt="Floor 7 Map" 
            className="w-full h-full object-contain select-none pointer-events-none"
          />

          {/* ตำแหน่ง Hotspots สำหรับกดเลือกห้อง */}
        </div>
      </div>

      {/* 3. SearchBar วางแบบลอยอยู่ด้านบนสุดของหน้าจอ (Absolute + z-30) */}
      <div className="absolute top-4 left-4 right-4 z-30 max-w-md mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search location here"
          BackgroundColor="bg-[#E6DFD5]/90 backdrop-blur-md shadow-md" 
          onProfileClick={handleProfileClick}
          onSearchClick={handleSearch}
        />
      </div>


      {/* 5. ปุ่มควบคุมชั้น (FloorControl) ลอยอยู่ที่มุมขวาล่างเสมอ */}
      <FloorControl currentFloor={7} />
    </div>
  );
};

export default Floor_7;