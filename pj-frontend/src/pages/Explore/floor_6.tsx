import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";
import ShowAllRoom from "../../components/ShowAllRoom";
import MapSpot from "../../components/MapSpot";
import CategoryChips from "../../components/CategoryChips";

const Floor_6 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const floor6Rooms = [
    //601
    {
      placeId: "11111111-1111-4111-8111-111111110001", 
      top: "0%",
      left: "50%",
      width: "8.5%",
      height: "17%",
    },
    //602
    {
      placeId: "11111111-1111-4111-8111-111111110002", 
      top: "0%",
      left: "58.5%",
      width: "8.5%",
      height: "17%",
    },
    //603
    {
      placeId: "11111111-1111-4111-8111-111111110003", 
      top: "33%",
      left: "66.5%",
      width: "24.5%",
      height: "17.5%",
    },
    //ห้องอเนกประสงค์ 1 620
    {
      placeId: "09ff059e-4197-51c3-9697-0163eead0c203", 
      top: "82%",
      left: "17%",
      width: "41%",
      height: "18%",
    },
    //ห้องอเนกประสงค์ 2 
    {
      placeId: "e28f78d5-1554-59a4-85b6-c0a656ef7615", 
      top: "33%",
      left: "17%",
      width: "34%",
      height: "18%",
    },
    //lab1
    {
      placeId: "31daf14a-1579-5bd0-b292-3cc4c047a43e", 
      top: "66%",
      left: "0%",
      width: "18%",
      height: "17%",
    },
    //lab2
    {
      placeId: "08f080d9-cdb3-511d-bee7-79323c9f64a9", 
      top: "49%",
      left: "0%",
      width: "18%",
      height: "17%",
    },
    //professor room
    {
      placeId: "f3054c72-3120-5d03-8184-b0ead14af751", 
      top: "0%",
      left: "71%",
      width: "20.5%",
      height: "8.5%",
    },
    {
      placeId: "f3054c72-3120-5d03-8184-b0ead14af751", 
      top: "25%",
      left: "66.5%",
      width: "17.5%",
      height: "8.5%",
    },
    {
      placeId: "f3054c72-3120-5d03-8184-b0ead14af751", 
      top: "58%",
      left: "25.5%",
      width: "9%",
      height: "17%",
    },
    {
      placeId: "f3054c72-3120-5d03-8184-b0ead14af751", 
      top: "82%",
      left: "58%",
      width: "9.5%",
      height: "17%",
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
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
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
            src="/Images/floor6.jpg" 
            alt="Floor 6 Map"
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* 📌 2. วนลูป (Map) สร้างจุด Hotspot ทุกห้องจากอาเรย์ข้างบน */}
          {floor6Rooms.map((room) => (
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
        <FloorControl currentFloor={6} isHidden={isHidden} />
      </div>

    </div>
  );
};

export default Floor_6;