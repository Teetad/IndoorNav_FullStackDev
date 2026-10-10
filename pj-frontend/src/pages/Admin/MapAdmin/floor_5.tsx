import SideBar from "../../../components/SideBar";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import LogInHeader from "../../../components/LogInHeader";
import MapSpot from "../../../components/MapSpot";
import FloorControl from "../../../components/FloorControl";
import { useNavigate } from 'react-router-dom';

const AFloor5Page = () => {
    const navigate = useNavigate();
    // Search
    const [searchText, setSearchText] = useState("");
    const [searchResults, setResults] = useState<any[]>([]);
    const [isSearchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any>(null); 
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    interface RoomSpot {
        placeId: string;
        top: string;
        left: string;
        width: string;
        height: string;
    }

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

    const handleRoomClick = (place_id: string) => {
        // 📌 สั่งเปลี่ยนหน้าไปที่ /editroom/ตามด้วยไอดีห้อง
        navigate(`/editroom/${place_id}`);
    };

    return (
        <div className="flex h-screen w-full bg-[#F8F6F2] font-sans">
            <SideBar />

            <main className="ml-64 flex min-w-0 flex-1 flex-col overflow-y-auto px-8 py-6 max-w-3xl">
                <div className="flex w-full items-center justify-between gap-8 mb-8">
                    
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
                                                // 📌 1. เมื่อคลิกที่ผลการค้นหา ให้เรียก handleRoomClick เพื่อพาไปหน้า editroom ทันที
                                                const clickedId = place.place_id ?? place.id;
                                                if(clickedId) {
                                                    handleRoomClick(clickedId);
                                                }
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

                    <LogInHeader />

                </div>

                <div className="flex w-full flex-1 items-center justify-center min-h-0">
                    <div className="relative w-full max-w-5xl">
                        <img
                            src="/Images/floor5.jpg"
                            alt="Floor 5 Map"
                            className="block h-auto w-full select-none"
                            draggable={false}
                        />

                        <div className="absolute inset-0 z-20">
                            {floor5Rooms.map((room, index) => (
                                <MapSpot
                                    key={`${room.placeId}-${index}`}
                                    Top={room.top}
                                    Left={room.left}
                                    Width={room.width}
                                    Height={room.height}
                                    // 📌 2. เมื่อคลิกที่ห้องบนแผนที่ ให้เรียก handleRoomClick เช่นกัน
                                    onClick={() => handleRoomClick(room.placeId)}
                                    placeId={room.placeId}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-4 z-30">
                    <FloorControl currentFloor={5} isHidden={isHidden} isAdmin={true}/>
                </div>

            </main>
        </div>
    );
}

export default AFloor5Page;