import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";
import ShowAllRoom from "../../components/ShowAllRoom";
import MapSpot from "../../components/MapSpot";
import CategoryChips from "../../components/CategoryChips";
import { useNavigate } from 'react-router-dom';

const Floor_7 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const floor7Rooms = [
    //701
    {
      placeId: "078de9fb-e9a1-5f05-b757-b6e8b2acae5c", 
      top: "0%",
      left: "66%",
      width: "17%",
      height: "26%",
    },
    //702
    {
      placeId: "f6a95c6c-be33-5381-9f62-012edc5fb151", 
      top: "0%",
      left: "83%",
      width: "17%",
      height: "26%",
    },
    //713
    {
      placeId: "bc427080-3b42-5e7e-b3f1-b042287ba47c", 
      top: "81%",
      left: "49%",
      width: "19%",
      height: "19%",
    },
    //718
    {
      placeId: "259aed8f-4ebe-56d6-8c56-d7772ca59470", 
      top: "81%",
      left: "18%",
      width: "31%",
      height: "19%",
    },
    //719
    {
      placeId: "0954520a-4653-577b-84bd-a433a5f7495f", 
      top: "49%",
      left: "0%",
      width: "18%",
      height: "33%",
    },
    //720
    {
      placeId: "3b33d6d1-2cde-52b0-bed7-6141163572a0", 
      top: "33%",
      left: "16.5%",
      width: "34%",
      height: "18%",
    },
    //712
    {
      placeId: "77d8e8f0-15a0-55aa-baf9-48fb27cae256", 
      top: "73%",
      left: "65%",
      width: "18.5%",
      height: "10%",
    },

    
    
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = () => {
    console.log('Profile icon clicked!');
  };

  const handleSearch = () => {
    console.log('Search clicked!');
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
      onClick={() => navigate('/search')}
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
            src="/Images/floor7.jpg" 
            alt="Floor 7 Map"
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* 📌 2. วนลูป (Map) สร้างจุด Hotspot ทุกห้องจากอาเรย์ข้างบน */}
          {floor7Rooms.map((room) => (
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
        <FloorControl currentFloor={7} isHidden={isHidden} />
      </div>

    </div>
  );
};

export default Floor_7;