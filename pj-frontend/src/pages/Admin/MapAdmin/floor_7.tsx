import SideBar from "../../../components/SideBar";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import LogInHeader from "../../../components/LogInHeader";
import MapSpot from "../../../components/MapSpot";
import ShowAllRoom from "../../../components/ShowAllRoom";
import ShowRoom from "../../../components/ShowRoom";
import FloorControl from "../../../components/FloorControl";


const AFloor7Page = () => {
      // Search
      const [searchText, setSearchText] = useState("");
      const [searchResults, setResults] = useState<any[]>([]);
      const [isSearchLoading, setSearchLoading] = useState(false);
      const [showDropdown, setShowDropdown] = useState(false);
      const [selectedLocation, setSelectedLocation] = useState<any>(null); // เก็บทั้ง Object หรือ Place ID
      const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

      interface RoomSpot {
         placeId: string;
         top: string;
        left: string;
         width: string;
        height: string;
     }

    const floor7Rooms = [
    //700
    {
      placeId: "f7610b1a-f023-5dcf-b3e4-c8ea7b2028d4", 
      top: "0%",
      left: "50%",
      width: "16%",
      height: "17%",
    },
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

      
      useEffect(() => {
        if (!searchText.trim()) {
          setResults([]);
          setSearchLoading(false);
          return;
        }
    
        let cancelled = false;
    
        const timer = setTimeout(async () => {
          setSearchLoading(true);
    
          try {
            const response = await fetch(
              `http://localhost:3000/places?search=${encodeURIComponent(searchText)}`
            );
    
            if (!response.ok) {
              throw new Error("Search request failed");
            }
    
            const data = await response.json();
            const places = Array.isArray(data)
              ? data
              : Array.isArray(data.places)
                ? data.places
                : [];
    
            if (!cancelled) setResults(places);
          } catch (error) {
            console.error("Failed to search places:", error);
            if (!cancelled) setResults([]);
          } finally {
            if (!cancelled) setSearchLoading(false);
          }
        }, 300);
    
        return () => {
          cancelled = true;
          clearTimeout(timer);
        };
      }, [searchText]);
   
   const isHidden = Boolean(selectedLocation) || Boolean(selectedCategory);

  // 📌 ฟังก์ชันช่วยดึง place_id ออกมาจาก selectedLocation (รองรับทั้งกรณีที่เป็น String ID ตรงๆ หรือเป็น Object)
  const currentPlaceId = typeof selectedLocation === 'object' 
    ? selectedLocation?.place_id || selectedLocation?.id 
    : selectedLocation;

      return (
  // 📌 1. เพิ่ม div ครอบทั้งหมด พร้อมตั้งค่า h-screen (สูงเต็มจอ) และ flex
  <div className="flex h-screen w-full bg-[#F8F6F2] font-sans">
    
    {/* 📌 2. นำ SideBar ออกมาวางไว้ข้างนอก main */}
    <SideBar />

    {/* 📌 3. ส่วน main ขยับ margin ซ้าย (ml-64) เพื่อหลบพื้นที่ให้ SideBar */}
    {/* 📌 3. ส่วน main ขยับ margin ซ้าย (ml-64) เพื่อหลบพื้นที่ให้ SideBar */}
    <main className="ml-64 flex min-w-0 flex-1 flex-col overflow-y-auto px-8 py-6 max-w-3xl">
      
      {/* 📌 สร้าง Flex Container สำหรับจัด Header ให้อยู่ซ้าย-ขวา */}
      <div className="flex w-full items-center justify-between gap-8 mb-8">
        
        {/* ส่วนที่ 1: ฝั่งซ้าย (SearchBar + Dropdown) */}
        <div className="relative w-full max-w-md">
          <SearchBar
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Search location here"
            BackgroundColor="bg-[#EAE1D3] text-stone-700 placeholder-stone-500"
            onProfileClick={() => {}}
            onSearchClick={() => setShowDropdown(true)}
            isShowProfile={false}
          />

          {showDropdown && searchText.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-[#EAE1D3] bg-[#F4EFE9] shadow-lg">
              {isSearchLoading ? (
                <p className="p-4 text-center text-sm text-stone-500">
                  Searching...
                </p>
              ) : searchResults.length > 0 ? (
                searchResults.map((place, index) => (
                  <button
                    key={place.place_id ?? place.id ?? index}
                    type="button"
                    className="w-full border-[#EAE1D3]/50 px-4 py-3 text-left text-sm text-stone-700 transition-colors last:border-none hover:bg-[#EAE1D3] hover:no-underline focus:outline-none"
                    onClick={() => {
                      setSearchText(
                        place.place_name ?? place.name ?? ""
                      );
                      setSelectedLocation(place.place_id ?? place.id);
                      setShowDropdown(false);
                    }}
                  >
                    {place.place_name ?? place.name ?? "Unnamed place"}
                    {place.building_name && (
                      <span className="ml-2 text-xs text-stone-500">
                        ({place.building_name})
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-stone-500">
                  No results found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ส่วนที่ 2: ฝั่งขวา (User Profile) */}
        <LogInHeader />

      </div>

{/* Container สำหรับแผนที่ */}
<div className="flex w-full flex-1 items-center justify-center min-h-0">
  <div className="relative w-full max-w-5xl">
    {/* รูปแผนที่ */}
    <img
      src="/Images/floor7.jpg"
      alt="Floor 7 Map"
      className="block h-auto w-full select-none"
      draggable={false}
    />

    {/* Hotspots ต้องอยู่ภายใน container เดียวกับรูป */}
    <div className="absolute inset-0 z-20">
      {floor7Rooms.map((room, index) => (
        <MapSpot
          key={`${room.placeId}-${index}`}
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

      {/* 📌 ShowRoom Popup รายละเอียดห้องเดี่ยว (เชื่อมต่อกับ selectedLocation และมี onClose) */}
      <ShowRoom 
        placeId={currentPlaceId}
        onClose={() => setSelectedLocation(null)}
      />

      {/* ปุ่มควบคุมชั้น */}
      <div className="absolute bottom-6 right-4 z-30">
        <FloorControl currentFloor={7} isHidden={isHidden} isAdmin={true}/>
      </div>

      {/* พื้นที่สำหรับใส่เนื้อหาแผนที่ด้านล่าง */}
      
    </main>
  </div>
);
}

export default AFloor7Page;