import SearchBar from "../components/SearchBar";
import { useState } from "react";

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
        <SearchBar value={searchQuery} onChange={handleSearchChange} BackgroundColor="primary" />
    </div>
  );
};

export default SearchPage;