import React from "react";
import type { LucideIcon } from "lucide-react";

interface ReportCardProps {
    Icon: LucideIcon; // เปลี่ยนชื่อเป็น Icon และใช้ Type ของ lucide-react
    Status: string;
    ColorClass: string; // รับเป็นคลาสเต็มๆ เช่น "bg-[#6B8E9B]"
    Count: number; // เพิ่มช่องสำหรับรับตัวเลขที่นับมาได้
}

const ReportCard: React.FC<ReportCardProps> = ({ Icon, Status, ColorClass, Count }) => {
    return ( // 📌 ต้องมี return
        <div className={`${ColorClass} text-white p-6 rounded-2xl shadow-md relative overflow-hidden`}>
            <div className="flex justify-between items-start">
                <span className="font-medium text-white/90">{Status}</span>
                <Icon className="w-6 h-6 text-white/80" /> {/* 📌 เรียกใช้ Icon Component */}
            </div>
            <p className="text-5xl font-bold mt-4">{Count}</p> {/* 📌 แสดงตัวเลขที่รับมา */}
        </div>
    );
};

export default ReportCard;