import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const AddReportPage: React.FC = () => {
  const navigate = useNavigate();

  // State สำหรับค้นหาสถานที่
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State สำหรับข้อมูล Report
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ยิง API ค้นหาสถานที่อัตโนมัติเมื่อพิมพ์
  useEffect(() => {
    if (!placeQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`http://localhost:3000/places?search=${encodeURIComponent(placeQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data.places || [];
          setResults(list);
        })
        .catch((err) => {
          console.error("Failed to fetch search results:", err);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [placeQuery]);

  // ฟังก์ชันสำหรับส่ง Report ไปยัง API
  const handleSendReport = async () => {
    if (!selectedPlaceId) {
      alert("Please select a location.");
      return;
    }
    if (!description.trim() || description.length > 500) {
      alert("Description must be between 1 and 500 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/places/${selectedPlaceId}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include" เพื่อแนบ Cookie (Session) ยืนยันตัวตน User ปัจจุบันอัตโนมัติ
        credentials: "include", 
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        // ส่งสำเร็จ กลับไปหน้าก่อนหน้า (ReportPage)
        navigate(-1);
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message}`);
      }
    } catch (error) {
      console.error("Failed to send report:", error);
      alert("Unable to send report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EBE1] relative pb-24">
      
      {/* 📌 Header */}
      <div className="w-full pt-12 pb-4 border-b border-[#D6CFC8] flex justify-center items-center shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-4 text-grey-700 p-1 cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="text-2xl font-medium text-grey-700">Add new Report</h1>
      </div>

      {/* 📌 Section: Report Location (แปลงจาก Report category ให้ค้นหา place_id ได้) */}
      <div className="py-5 px-6 border-b border-[#D6CFC8] relative">
        <h2 className="font-bold text-grey-700 mb-3 text-lg">Report location</h2>
        
        <div className="relative py-5">
          <input
            type="text"
            value={placeQuery}
            onChange={(e) => {
              setPlaceQuery(e.target.value);
              setIsSearching(true);
              setSelectedPlaceId(""); // รีเซ็ต ID หากมีการแก้ไขชื่อเพื่อบังคับให้เลือกใหม่
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Search location "
            className="w-full px-4 py-2.5 bg-secondary backdrop-blur-md rounded-xl outline-none text-sm text-grey-700 shadow-sm"
          />

          {/* Dropdown ผลลัพธ์การค้นหา (ทับลงมาด้านล่าง) */}
          {isSearching && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-[#D6CFC8] rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
              {results.map((place) => (
                <div
                  key={place.place_id}
                  onClick={() => {
                    setPlaceQuery(place.place_name);
                    setSelectedPlaceId(place.place_id);
                    setIsSearching(false);
                  }}
                  className="px-4 py-3 hover:bg-stone-200/60 cursor-pointer text-sm text-grey-700 border-b border-[#D6CFC8]/50 last:border-none"
                >
                  {place.place_name} <span className="text-[11px] text-stone-500">({place.building_name})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📌 Section: Description */}
      <div className="py-5 px-6 border-b border-[#D6CFC8]">
        <h2 className="font-bold text-grey-700 mb-2 text-lg">Description</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="fill your description here..."
          className="w-full bg-transparent resize-none outline-none text-grey-700 placeholder:text-stone-400/80 text-[15px]"
          rows={5}
        ></textarea>
      </div>

      {/* 📌 Section: Photos (UI ตามภาพ) */}
      {/* <div className="py-5 px-6">
        <h2 className="font-bold text-grey-700 mb-3 text-lg">Photos</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#E2E8EC] text-grey-700 rounded-full text-sm font-medium shadow-sm hover:bg-[#D3DBE2] transition-colors cursor-pointer">
          <ImageIcon className="w-4 h-4" /> Upload photos
        </button>
      </div> */}

      {/* 📌 Button: Send Report */}
      <div className="absolute bottom-6 w-full px-6 left-0 flex justify-center">
        <button 
          onClick={handleSendReport}
          // ปุ่มจะกดได้ก็ต่อเมื่อ เลือกสถานที่แล้ว + พิมพ์คำอธิบายแล้ว + ไม่ได้กำลังโหลดอยู่
          disabled={!selectedPlaceId || !description.trim() || isSubmitting}
          className={`w-full py-3.5 text-[17px] font-medium rounded-[14px] shadow-sm transition-colors ${
            !selectedPlaceId || !description.trim() || isSubmitting
              ? "bg-[#E2E8EC]/50 text-grey-700/50 cursor-not-allowed"
              : "bg-[#E2E8EC]/90 text-grey-700 cursor-pointer hover:bg-white/90"
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Report"}
        </button>
      </div>

    </div>
  );
};

export default AddReportPage;