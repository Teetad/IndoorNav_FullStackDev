import SideBar from "../../components/SideBar";
import SearchBar from "../../components/SearchBar";
import { useState, useEffect } from "react";

const MapAdminPage = () => {
      // Search
      const [searchText, setSearchText] = useState("");
      const [searchResults, setResults] = useState<any[]>([]);
      const [isSearchLoading, setSearchLoading] = useState(false);
      const [showDropdown, setShowDropdown] = useState(false);
      
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
    return(

      <main className="ml-64 flex min-w-0 flex-1 flex-col overflow-y-auto px-10 py-6">
            <SideBar/>
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
                      className="w-full border-b border-[#EAE1D3]/50 px-4 py-3 text-left text-sm text-stone-700 transition-colors last:border-none hover:bg-[#EAE1D3]"
                      onClick={() => {
                        setSearchText(
                          place.place_name ?? place.name ?? ""
                        );
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
        </main>
    );
}

export default MapAdminPage;