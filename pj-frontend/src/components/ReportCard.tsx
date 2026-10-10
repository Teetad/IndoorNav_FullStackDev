import React, { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface ReportCardProps {
    Icon: LucideIcon;
    Status: string;
    ColorClass: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ Icon, Status, ColorClass }) => {
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCount = async () => {
            setIsLoading(true);
            try {
                // 1. แปลงคำจาก Props (Status) ให้ตรงกับ Path ของ API
                let apiPath = "";
                const statusLower = Status.toLowerCase();

                if (statusLower === "pending") {
                    apiPath = "pending";
                } else if (statusLower === "received") {
                    apiPath = "received";
                } else if (statusLower === "resolved") {
                    apiPath = "resolved";
                }
                // หมายเหตุ: ถ้า Status เป็น "New Reports" หรือ "All reports" apiPath จะเป็นค่าว่าง "" อัตโนมัติ

                // 2. ประกอบร่าง URL
                // ถ้า apiPath มีค่า ให้เอาไปต่อท้าย / แต่ถ้าไม่มีให้ดึง /reports เฉยๆ (จะได้ครบทั้งหมด)
                const endpoint = apiPath 
                    ? `http://localhost:3000/reports/${apiPath}` 
                    : `http://localhost:3000/reports`;

                // 3. ยิง API
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", 
                });

                if (response.ok) {
                    const data = await response.json();
                    setCount(data.length); // นับจำนวนที่ API ส่งมา
                } else {
                    console.error("Failed to fetch report count for:", Status);
                }
            } catch (error) {
                console.error("Error fetching report count:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCount();
    }, [Status]);

    return (
        <div className={`${ColorClass} text-white p-6 rounded-2xl shadow-md relative overflow-hidden`}>
            <div className="flex justify-between items-start">
                <span className="font-medium text-white/90">{Status}</span>
                <Icon className="w-6 h-6 text-white/80" />
            </div>
            {/* แสดง ... ตอนกำลังโหลดข้อมูล */}
            <p className="text-5xl font-bold mt-4">
                {isLoading ? "..." : count}
            </p>
        </div>
    );
};

export default ReportCard;