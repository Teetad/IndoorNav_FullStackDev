import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";

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

  return (
    // คุมกรอบใหญ่ด้วย fixed หรือ absolute เต็มจอ h-[100dvh] ป้องกันหน้าจอเกิน
    <div className="absolute inset-0 w-full h-[100dvh] bg-[#F3EFEA] flex flex-col overflow-hidden">
      
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

      {/* พื้นที่แผนที่: ใช้ overflow-auto เพื่อให้เลื่อนดูรอบๆ ได้เต็มที่ */}
      <div className="w-full h-full overflow-auto relative flex items-center justify-center pt-20 pb-20">
        
        {/* 
          📌 จุดเปลี่ยนสำคัญ: 
          - ใช้ w-full max-w-[800px] (กำหนดขนาดสูงสุดไม่ให้รูปใหญ่เกินไปบนจอคอม แต่พอมือถือจะยืดเต็ม 100%)
          - เอา aspect-square ออก เพื่อให้ความสูงปรับตามรูปภาพจริงอัตโน0วัติ พิกัดจะไม่เพี้ยน
        */}
        <div className="relative w-full max-w-[800px] flex-shrink-0">
          
          {/* รูปภาพแผนที่ชั้น 4 */}
          <img 
            src="/Images/floor4.jpg" 
            alt="Floor 4 Map" 
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* ปุ่ม Hotspot ห้อง 422 (เกาะติดกับรูปภาพ 100%) */}
          <div 
            onClick={() => setSelectedLocation({ name: '422', type: 'co-working space' })}
            className="absolute top-[0%] left-[50%] w-[50%] h-[26%] z-20 bg-white/5 cursor-pointer flex items-center justify-center"
          >
          </div>

        </div>
      </div>

      {/* ShowRoom Popup เมื่อคลิกห้อง */}
      <ShowRoom 
        selectedLocation={selectedLocation} 
        setSelectedLocation={setSelectedLocation} 
      />

      {/* ปุ่มควบคุมชั้นลอยอยู่มุมขวาล่าง */}
      <div className="absolute bottom-6 right-4 z-30">
        <FloorControl currentFloor={4} />
      </div>
    </div>
  );
};

export default Floor_4;