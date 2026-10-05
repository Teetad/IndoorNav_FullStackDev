import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FloorControl from "../../components/FloorControl";
import ShowRoom from "../../components/ShowRoom";
import ShowAllRoom from "../../components/ShowAllRoom";
import MapSpot from "../../components/MapSpot";
import CategoryChips from "../../components/CategoryChips";
import { useNavigate } from 'react-router-dom';

const Floor_4 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  interface RoomSpot {
  placeId: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

  const floor4Rooms: RoomSpot[] = [
    //413A
    {
      placeId: "6371ac8c-4c35-538b-a8a7-4d8ef25b2ec8", 
      top: "66.5%",
      left: "0%",
      width: "18%",
      height: "15.5%"
    },
    //413B
    {
      placeId: "cfd82f59-72fd-5c2c-9509-1e0a5870b00a", 
      top: "49%",
      left: "0%",
      width: "18%",
      height: "17.5%",
    },
    //415A
    {
      placeId: "04eaa401-4c26-5a5b-9013-2e2fc1d7fca7", 
      top: "33%",
      left: "33%",
      width: "18%",
      height: "18%",
    },
    //412
    {
      placeId: "e3d9ce37-7b86-5850-a7ab-546a183625b3", 
      top: "82%",
      left: "0%",
      width: "34%",
      height: "18%",
    },
    //411B
    {
      placeId: "f260aa8f-8a15-581e-896c-936af186d5e4", 
      top: "82%",
      left: "34%",
      width: "16.5%",
      height: "18%",
    },
    //411A
    {
      placeId: "61cbb908-275b-54c8-8a8c-bacb6156753c", 
      top: "82%",
      left: "50.5%",
      width: "17.5%",
      height: "18%",
    },
    //AS LAB
    {
      placeId: "6254b9fb-bc95-5130-8fa6-2731b6e4049f", 
      top: "33%",
      left: "17%",
      width: "16%",
      height: "18%",
    },
    //ธุรการ
    {
      placeId: "0e0b08f3-c339-5c13-8e4a-09b3cf24b0ba", 
      top: "33%",
      left: "58%",
      width: "43%",
      height: "18%",
    },
    //ห้องอาจารย์
    {
      placeId: "b41b558e-bea3-51e8-beba-7abce1454837", 
      top: "26%",
      left: "91.5%",
      width: "8%",
      height: "8%",
    },
    {
      placeId: "b41b558e-bea3-51e8-beba-7abce1454837", 
      top: "26%",
      left: "17%",
      width: "14%",
      height: "8%",
    },
    {
      placeId: "b41b558e-bea3-51e8-beba-7abce1454837", 
      top: "58%",
      left: "25.5%",
      width: "9%",
      height: "17%",
    },
    {
      placeId: "b41b558e-bea3-51e8-beba-7abce1454837", 
      top: "73.5%",
      left: "65.5%",
      width: "19%",
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
            src="/Images/floor4.jpg" 
            alt="Floor 4 Map"
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* 📌 2. วนลูป (Map) สร้างจุด Hotspot ทุกห้องจากอาเรย์ข้างบน */}
          {floor4Rooms.map((room) => (
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
        <FloorControl currentFloor={4} isHidden={isHidden} />
      </div>

    </div>
  );
};

export default Floor_4;