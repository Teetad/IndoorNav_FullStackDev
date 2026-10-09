import React, { useEffect, useState } from "react";

interface CategoryChipsProps {
  onSelectType?: (type: string) => void; // ฟังก์ชันส่งค่าหมวดหมู่ที่ถูกเลือกกลับไปหน้าหลัก (ถ้าต้องการใช้)
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ onSelectType }) => {
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ยิง API ดึงข้อมูลประเภทสถานที่เมื่อ Component โหลดครั้งแรก
  useEffect(() => {
    fetch("http://localhost:3000/places/types")
      .then((res) => res.json())
      .then((data) => {
        // สมมติว่าโครงสร้าง API ส่งมาเป็น Array ของสตริงหรืออาร์เรย์ของออบเจกต์
        // เช่น ["classroom", "co-working space", ...] หรือ [{ name: "classroom" }, ...]
        const formattedTypes = Array.isArray(data)
          ? data.map((item) => (typeof item === "string" ? item : item.name || item.type))
          : [];
        setTypes(formattedTypes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch place types:", err);
        setLoading(false);
      });
  }, []);

  const handleChipClick = (typeName: string) => {
    // ถ้ากดซ้ำที่เดิม ให้ยกเลิกการเลือก หรือจะให้เลือกค้างไว้ก็ได้ครับ
    const newSelected = selectedType === typeName ? null : typeName;
    setSelectedType(newSelected);
    
    if (onSelectType) {
      onSelectType(newSelected || "");
    }
  };

  if (loading) {
    return <div className="flex px-4 py-2 text-xs text-stone-500">Loading categories...</div>;
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-none px-1.25 py-3">
      <div className="flex gap-2.5 whitespace-nowrap">
        {types.map((typeName, index) => {
          return (
            <button
              key={index}
              onClick={() => handleChipClick(typeName)}
              className={`px-4 py-1 rounded-full text-xs font-medium shadow-sm transition-all cursor-pointer ${
                  "bg-primary-light backdrop-blur-md text-stone-700" // สีปกติแบบในรูปตัวอย่าง
              }`}
            >
              {typeName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;