import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";
import ShowAllRoom from "../../components/ShowAllRoom";
import MapSpot from "../../components/MapSpot";
import CategoryChips from "../../components/CategoryChips";
import { useNavigate } from 'react-router-dom';
import BottomNav from "../../components/BottomNav";

const Floor_5 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const floor5Rooms = [
    //501
    {
      placeId: "1bfacf39-7a8b-501d-a253-b59cfaeb8e92", 
      top: "0%",
      left: "66.5%",
      width: "17%",
      height: "26%",
    },
    //502
    {
      placeId: "b0bfb141-001e-5f85-a678-d143b14c0a14", 
      top: "0%",
      left: "83%",
      width: "17%",
      height: "26%",
    },
    //518
    {
      placeId: "37496701-2811-5ee5-b2d7-22e8d6bc36de", 
      top: "49%",
      left: "0%",
      width: "18.5%",
      height: "33%",
    },
    //521
    {
      placeId: "44e76102-45d9-542b-8892-6c5cad63a9f7", 
      top: "33%",
      left: "17%",
      width: "34%",
      height: "18%",
    },
    //516
    {
      placeId: "3b8b6c84-f057-52a2-988d-51ebeace341b", 
      top: "82%",
      left: "34%",
      width: "34%",
      height: "18%",
    },
    //OASIS
    {
      placeId: "efdbd80c-dbf3-5314-a354-8d1287280c00", 
      top: "82%",
      left: "0%",
      width: "34%",
      height: "18%",
    },
    //ห้องอาจารย์ 558
    {
      placeId: "7300f9fe-54df-5f4b-a752-24c5be7335bd", 
      top: "26%",
      left: "17%",
      width: "14%",
      height: "7%",
    },
    //ห้องอาจารย์ 559
    {
      placeId: "3ccd574c-4ca6-5ae1-b1ef-220df54709d0", 
      top: "26%",
      left: "91%",
      width: "8.5%",
      height: "7%",
    },
    //ห้องอาจารย์ 503
    {
      placeId: "7300f9fe-54df-5f4b-a752-24c5be7335bd", 
      top: "33%",
      left: "89%",
      width: "11%",
      height: "8%",
    },
    //ห้องอาจารย์ 504
    {
      placeId: "5124fde5-d8e5-5416-82cc-6029bf3081b2", 
      top: "43.5%",
      left: "82.5%",
      width: "9%",
      height: "7%",
    },
    //ห้องอาจารย์ 505
    {
      placeId: "529dd120-3c13-5ec3-918c-305d73e2fc61", 
      top: "43.5%",
      left: "91.5%",
      width: "9%",
      height: "7%",
    },
    //ห้องอาจารย์ 508
    {
      placeId: "359f2bb1-e7f0-548c-8e7e-36b3fb3939dd", 
      top: "33%",
      left: "62.5%",
      width: "9%",
      height: "9%",
    },
    //ห้องอาจารย์ 509
    {
      placeId: "69c869e7-1545-5b09-994b-5aff29636513", 
      top: "42%",
      left: "62.5%",
      width: "9%",
      height: "9%",
    },
    //ห้องอาจารย์ 510
    {
      placeId: "c523c466-d5e4-51cb-a053-1f2c89e36baa", 
      top: "49%",
      left: "75%",
      width: "9%",
      height: "8.5%",
    },
    //ห้องอาจารย์ 514
    {
      placeId: "e6023be6-643e-550e-9bd7-28ae7bd8a67d", 
      top: "73%",
      left: "75%",
      width: "9%",
      height: "10.5%",
    },
    //ห้องอาจารย์ 515
    {
      placeId: "e6023be6-643e-550e-9bd7-28ae7bd8a67d", 
      top: "73%",
      left: "66%",
      width: "9%",
      height: "10.5%",
    },
    //ห้องอาจารย์ 519
    {
      placeId: "38cb93a4-4a98-5a34-b1e7-94f8f10a65eb", 
      top: "58%",
      left: "25.5%",
      width: "9%",
      height: "8.5%",
    },
    //ห้องอาจารย์ 520
    {
      placeId: "71c4795d-64c3-56c9-99de-31df574f72e1", 
      top: "66%",
      left: "25.5%",
      width: "9%",
      height: "8.5%",
    },
    
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = () => {
    navigate('/login');
  };

    const handleSearch = () => {
    navigate('/search')
  };

  const isHidden = Boolean(selectedLocation) || Boolean(selectedCategory);

  // 📌 ฟังก์ชันช่วยดึง place_id ออกมาจาก selectedLocation (รองรับทั้งกรณีที่เป็น String ID ตรงๆ หรือเป็น Object)
  const currentPlaceId = typeof selectedLocation === 'object' 
    ? selectedLocation?.place_id || selectedLocation?.id 
    : selectedLocation;

  return (
    <div className={`absolute inset-0 w-full h-[100dvh] bg-[#F3EFEA] flex flex-col ${isHidden ? 'overflow-hidden' : 'overflow-auto'}`}>
      
      {/* SearchBar และ CategoryChips ด้านบน */}
      <div 
      className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search location here"
          BackgroundColor="bg-primary-light backdrop-blur-md shadow-md" 
          onProfileClick={handleProfileClick}
          onSearchClick={handleSearch}
        />
        <CategoryChips 
          onSelectType={(category) => {
            if (category) {
              setSelectedCategory(category);
            } 
          }}
        />
      </div>

      <div className="w-full h-full overflow-auto relative flex items-center justify-center pt-20 pb-20">
        <div className="relative w-full max-w-[800px] flex-shrink-0">
          
          {/* รูปภาพแผนที่เรนเดอร์ครั้งเดียวจบ ไม่มีการทับซ้อน */}
          <img 
            src="/Images/floor5.jpg" 
            alt="Floor 5 Map"
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* 📌 2. วนลูป (Map) สร้างจุด Hotspot ทุกห้องจากอาเรย์ข้างบน */}
          {floor5Rooms.map((room) => (
            <MapSpot 
              key={room.placeId}
              Top={room.top} 
              Left={room.left} 
              Width={room.width} 
              Height={room.height} 
              onClick={() => setSelectedLocation(room.placeId)} 
              placeId={room.placeId}
            />
          ))}

        </div>
      </div>

      {/* Popup แสดงรายชื่อสถานที่ตาม Category */}
      <ShowAllRoom 
        selectedType={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onSelectLocation={(place) => {
          setSelectedCategory(null);
          setSelectedLocation(place); // ส่ง object สถานที่ (ที่มี place_id) เข้าไป
        }}
      />

      {/* 📌 ShowRoom Popup รายละเอียดห้องเดี่ยว (เชื่อมต่อกับ selectedLocation และมี onClose) */}
      <ShowRoom 
        placeId={currentPlaceId}
        onClose={() => setSelectedLocation(null)}
      />

      {/* ปุ่มควบคุมชั้น */}
      <div className="absolute bottom-6 right-4 z-30">
        <FloorControl currentFloor={5} isHidden={isHidden} />
      </div>

      <BottomNav/>

    </div>
  );
};

export default Floor_5;