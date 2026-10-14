import { API_BASE_URL } from "../../../config/api";
import SideBar from "../../../components/SideBar";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import LogInHeader from "../../../components/LogInHeader";
import MapSpot from "../../../components/MapSpot";
import FloorControl from "../../../components/FloorControl";
import { useNavigate } from 'react-router-dom';

const AFloor7Page = () => {
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
    //711
    {
      placeId: "5e8758d9-ea61-5ab6-8079-0dc5993c4f18",
      top: "33%",
      left: "62%",
      width: "30%",
      height: "18%",
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
                            src="/Images/floor7.jpg?v=20261014"
                            alt="Floor 7 Map"
                            className="block h-auto w-full select-none"
                            draggable={false}
                        />

                        <div className="absolute inset-0 z-20">
                            {floor7Rooms.map((room, index) => (
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
                    <FloorControl currentFloor={7} isHidden={isHidden} isAdmin={true}/>
                </div>

            </main>
        </div>
    );
}

export default AFloor7Page;
