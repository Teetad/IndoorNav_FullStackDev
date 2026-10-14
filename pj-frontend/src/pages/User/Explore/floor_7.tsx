import { useState } from "react";
import SearchBar from "../../../components/SearchBar";
import FloorControl from "../../../components/FloorControl";
import ShowRoom from "../../../components/ShowRoom";
import ShowAllRoom from "../../../components/ShowAllRoom";
import MapSpot from "../../../components/MapSpot";
import CategoryChips from "../../../components/CategoryChips";
import { useNavigate } from 'react-router-dom';
import BottomNav from "../../../components/BottomNav";
import CallMapEmbed from "../../../components/CallMapEmbed";
import { useNavigation } from "../../../context/NavigationContext";

const Floor_7 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const floor7Rooms = [
    //700
    {
      placeId: "b45ca56e-de5d-5a53-b8e9-a444eebe590f",
      top: "0%",
      left: "50%",
      width: "16%",
      height: "17%",
    },
    //701
    {
      placeId: "1fd8d908-4a02-5cef-a596-740fde2e333f",
      top: "0%",
      left: "66%",
      width: "17%",
      height: "26%",
    },
    //702
    {
      placeId: "e1f7fea5-6fcb-52bc-a3b6-f5ff35242b6b",
      top: "0%",
      left: "83%",
      width: "17%",
      height: "26%",
    },
    //713
    {
      placeId: "cfa2a390-4143-58a4-bee3-20e498c732e8",
      top: "81%",
      left: "49%",
      width: "19%",
      height: "19%",
    },
    //718
    {
      placeId: "3397267f-fe78-50f9-8ffd-daf4bcc6b0f9",
      top: "81%",
      left: "18%",
      width: "31%",
      height: "19%",
    },
    //719
    {
      placeId: "d51c960f-4f49-533c-9c16-9ddfb3e6163c",
      top: "49%",
      left: "0%",
      width: "18%",
      height: "33%",
    },
    //720
    {
      placeId: "405192e9-6d23-53c4-986c-404a749ab1ae",
      top: "33%",
      left: "16.5%",
      width: "34%",
      height: "18%",
    },
    //712
    {
      placeId: "0329e002-03e1-5406-a352-e7d21cd8a34d",
      top: "73%",
      left: "65%",
      width: "18.5%",
      height: "10%",
    },
    {
      placeId: "5e8758d9-ea61-5ab6-8079-0dc5993c4f18",
      top: "33%",
      left: "62%",
      width: "30%",
      height: "18%",
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

   const { startNode, goalNode, isNavigating, stopNavigation } = useNavigation();
      console.log("ค่าที่ส่งไปให้แผนที่:", { startNode, goalNode });

  return (
    <div className={`absolute inset-0 w-full h-[100dvh] bg-[#F3EFEA] flex flex-col ${isHidden ? 'overflow-hidden' : 'overflow-auto'}`}>
      
      {/* SearchBar และ CategoryChips ด้านบน */}
      <div 
      className="absolute top-4 left-4 right-4 z-50 max-w-md mx-auto">
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

          <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
             <CallMapEmbed start={startNode} goal={goalNode} currentFloor="7"/>
          </div>
          
          {/* รูปภาพแผนที่เรนเดอร์ครั้งเดียวจบ ไม่มีการทับซ้อน */}
          <img 
            src="/Images/floor7.jpg?v=20261014"
            alt="Floor 7 Map"
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* 📌 2. วนลูป (Map) สร้างจุด Hotspot ทุกห้องจากอาเรย์ข้างบน */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
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

      <BottomNav></BottomNav>

    </div>
  );
};

export default Floor_7;
