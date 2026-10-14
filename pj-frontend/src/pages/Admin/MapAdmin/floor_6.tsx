import { API_BASE_URL } from "../../../config/api";
import SideBar from "../../../components/SideBar";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import LogInHeader from "../../../components/LogInHeader";
import MapSpot from "../../../components/MapSpot";
import FloorControl from "../../../components/FloorControl";
import { useNavigate } from 'react-router-dom';

const AFloor6Page = () => {
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

    const floor6Rooms = [
    //lab3
    {
      placeId: "95106e89-f702-5c61-9378-d320e93be8c4",
      top: "0%",
      left: "50%",
      width: "8.5%",
      height: "17%",
    },
    //lab4
    {
      placeId: "95737465-2ec6-5f47-87dc-e4bf79b6de9b",
      top: "0%",
      left: "58.5%",
      width: "8.5%",
      height: "17%",
    },
    //603
    {
      placeId: "a4693d8e-22ff-50e1-a239-f6ffa3df281c",
      top: "33%",
      left: "66.5%",
      width: "24.5%",
      height: "17.5%",
    },
    //ห้องอเนกประสงค์ 1 620
    {
      placeId: "22ea5c9b-3aa8-5dce-9ac5-7a82de23f03b",
      top: "82%",
      left: "17%",
      width: "41%",
      height: "18%",
    },
    //ห้องอเนกประสงค์ 2 
    {
      placeId: "da32120f-f303-5b65-bd77-80651eee0e88",
      top: "33%",
      left: "17%",
      width: "34%",
      height: "18%",
    },
    //lab1
    {
      placeId: "10904390-6922-537a-a853-be67622acc4c",
      top: "66%",
      left: "0%",
      width: "18%",
      height: "17%",
    },
    //lab2
    {
      placeId: "10faa704-f1ec-54bd-bc59-bb613d3b4567",
      top: "49%",
      left: "0%",
      width: "18%",
      height: "17%",
    },
    //professor room
    {
      placeId: "b13b78d8-cd3f-5522-9406-4dd7a5cee5bd",
      top: "0%",
      left: "71%",
      width: "20.5%",
      height: "8.5%",
    },
    {
      placeId: "b13b78d8-cd3f-5522-9406-4dd7a5cee5bd",
      top: "25%",
      left: "66.5%",
      width: "17.5%",
      height: "8.5%",
    },
    //8
    {
      placeId: "124d8b87-939a-5b2c-848a-bdc73b561169",
      top: "58%",
      left: "25.5%",
      width: "9%",
      height: "8.5%",
    },
    //9
    {
      placeId: "c5aa05bf-1dd9-5625-b79d-340fb33a134c",
      top: "66.5%",
      left: "25.5%",
      width: "9%",
      height: "8.5%",
    },
    {
      placeId: "4606eeb5-96d2-5c36-bc59-f6278e46b393",
      top: "82%",
      left: "58%",
      width: "9.5%",
      height: "17%",
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
                    `${API_BASE_URL}/places?search=${encodeURIComponent(searchText)}`
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
                            src="/Images/floor6.jpg"
                            alt="Floor 6 Map"
                            className="block h-auto w-full select-none"
                            draggable={false}
                        />

                        <div className="absolute inset-0 z-20">
                            {floor6Rooms.map((room, index) => (
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
                    <FloorControl currentFloor={6} isHidden={isHidden} isAdmin={true}/>
                </div>

            </main>
        </div>
    );
}

export default AFloor6Page;
