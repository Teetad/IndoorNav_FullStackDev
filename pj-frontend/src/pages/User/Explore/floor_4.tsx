import { useState } from "react";
import SearchBar from "../../../components/SearchBar";
import FloorControl from "../../../components/FloorControl";
import ShowRoom from "../../../components/ShowRoom";
import ShowAllRoom from "../../../components/ShowAllRoom";
import MapSpot from "../../../components/MapSpot";
import CategoryChips from "../../../components/CategoryChips";
import BottomNav from "../../../components/BottomNav";
import { useNavigate } from 'react-router-dom';
// import { MapEmbed } from "../../../IndoorNav/frontend/src/components/MapView";

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
      left: "16.5%",
      width: "17.5%",
      height: "18%",
    },
    {
      placeId: "e3d9ce37-7b86-5850-a7ab-546a183625b3", 
      top: "82%",
      left: "5%",
      width: "11.5%",
      height: "11%",
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
    //ห้องอาจารย์ 1
    {
      placeId: "99cf118b-cd39-5c88-a7bf-2f269d20da46", 
      top: "26%",
      left: "91.5%",
      width: "8%",
      height: "8%",
    },
    //ห้องอาจารย์ 2
    {
      placeId: "b41b558e-bea3-51e8-beba-7abce1454837", 
      top: "26%",
      left: "17%",
      width: "14%",
      height: "8%",
    },
    //ห้องอาจารย์ 3
    {
      placeId: "cefb36e0-bd9b-5e32-8c61-55a4a7a3f628", 
      top: "73.5%",
      left: "74.5%",
      width: "10%",
      height: "10%",
    },
    //ห้องอาจารย์ 4
    {
      placeId: "7cad4583-c2fd-5e36-b04b-bfa0c8190436", 
      top: "73.5%",
      left: "65.5%",
      width: "9%",
      height: "10%",
    },
    //ห้องอาจารย์ 5
    {
      placeId: "957ea510-41c0-53e8-b1b1-a5705cff9094", 
      top: "93%",
      left: "9%",
      width: "7.5%",
      height: "7%",
    },
    //ห้องอาจารย์ 6
    {
      placeId: "7d562899-cde4-5d43-a87a-3d3ea9d3b330", 
      top: "93%",
      left: "0%",
      width: "9%",
      height: "7%",
    },
    //ห้องอาจารย์ 7
    {
      placeId: "98a93b29-8ea2-5124-b819-b549b76d8a1b", 
      top: "82%",
      left: "0%",
      width: "5%",
      height: "12%",
    },
    //ห้องอาจารย์ 8
    {
      placeId: "9cfb733d-4aa7-5f75-ab74-31abe08bc89b", 
      top: "66.5%",
      left: "25.5%",
      width: "9%",
      height: "8%",
    },
    //ห้องอาจารย์ 9
    {
      placeId: "da4c4c51-07c9-59b6-a335-51e51ded5ab7",  
      top: "58.5%",
      left: "25.5%",
      width: "9%",
      height: "8%",
    },
  
  ];

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
          value=""
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

      <BottomNav></BottomNav>

    </div>
  );
};

export default Floor_4;