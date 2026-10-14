import SideBar from "../../../components/SideBar";
import SearchBar from "../../../components/SearchBar";
import { useState, useEffect } from "react";
import LogInHeader from "../../../components/LogInHeader";
import MapSpot from "../../../components/MapSpot";
import FloorControl from "../../../components/FloorControl";
import { useNavigate } from 'react-router-dom';

const AFloor4Page = () => {
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

    const floor4Rooms: RoomSpot[] = [
        //413A
        { placeId: "6371ac8c-4c35-538b-a8a7-4d8ef25b2ec8", top: "66.5%", left: "0%", width: "18%", height: "15.5%" },
        //413B
        { placeId: "cfd82f59-72fd-5c2c-9509-1e0a5870b00a", top: "49%", left: "0%", width: "18%", height: "17.5%" },
        //415A
        { placeId: "04eaa401-4c26-5a5b-9013-2e2fc1d7fca7", top: "33%", left: "33%", width: "18%", height: "18%" },
        //412
        { placeId: "e3d9ce37-7b86-5850-a7ab-546a183625b3", top: "82%", left: "16.5%", width: "17.5%", height: "18%" },
        { placeId: "e3d9ce37-7b86-5850-a7ab-546a183625b3", top: "82%", left: "5%", width: "11.5%", height: "11%" },
        //411B
        { placeId: "f260aa8f-8a15-581e-896c-936af186d5e4", top: "82%", left: "34%", width: "16.5%", height: "18%" },
        //411A
        { placeId: "61cbb908-275b-54c8-8a8c-bacb6156753c", top: "82%", left: "50.5%", width: "17.5%", height: "18%" },
        //AS LAB
        { placeId: "6254b9fb-bc95-5130-8fa6-2731b6e4049f", top: "33%", left: "17%", width: "16%", height: "18%" },
        //ธุรการ
        { placeId: "0e0b08f3-c339-5c13-8e4a-09b3cf24b0ba", top: "33%", left: "58%", width: "43%", height: "18%" },
        //ห้องอาจารย์ 1
        { placeId: "99cf118b-cd39-5c88-a7bf-2f269d20da46", top: "26%", left: "91.5%", width: "8%", height: "8%" },
        //ห้องอาจารย์ 2
        { placeId: "b41b558e-bea3-51e8-beba-7abce1454837", top: "26%", left: "17%", width: "14%", height: "8%" },
        //ห้องอาจารย์ 3
        { placeId: "cefb36e0-bd9b-5e32-8c61-55a4a7a3f628", top: "73.5%", left: "74.5%", width: "10%", height: "10%" },
        //ห้องอาจารย์ 4
        { placeId: "7cad4583-c2fd-5e36-b04b-bfa0c8190436", top: "73.5%", left: "65.5%", width: "9%", height: "10%" },
        //ห้องอาจารย์ 5
        { placeId: "957ea510-41c0-53e8-b1b1-a5705cff9094", top: "93%", left: "9%", width: "7.5%", height: "7%" },
        //ห้องอาจารย์ 6
        { placeId: "7d562899-cde4-5d43-a87a-3d3ea9d3b330", top: "93%", left: "0%", width: "9%", height: "7%" },
        //ห้องอาจารย์ 7
        { placeId: "98a93b29-8ea2-5124-b819-b549b76d8a1b", top: "82%", left: "0%", width: "5%", height: "12%" },
        //ห้องอาจารย์ 8
        { placeId: "9cfb733d-4aa7-5f75-ab74-31abe08bc89b", top: "66.5%", left: "25.5%", width: "9%", height: "8%" },
        //ห้องอาจารย์ 9
        { placeId: "da4c4c51-07c9-59b6-a335-51e51ded5ab7", top: "58.5%", left: "25.5%", width: "9%", height: "8%" },
        //422
        { placeId: "1bdc1491-ea0b-5537-b5ac-7143efebd56f", top: "0%", left: "49.5%", width: "51%", height: "26%" },
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
                            src="/Images/floor4.jpg"
                            alt="Floor 4 Map"
                            className="block h-auto w-full select-none"
                            draggable={false}
                        />

                        <div className="absolute inset-0 z-20">
                            {floor4Rooms.map((room, index) => (
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
                    <FloorControl currentFloor={4} isHidden={isHidden} isAdmin={true}/>
                </div>

            </main>
        </div>
    );
}

export default AFloor4Page;