interface MapSpotProps {
  Top: string; // ค่าตำแหน่ง Top ของ Hotspot (เช่น "50%")
  Left: string; // ค่าตำแหน่ง Left ของ Hotspot (เช่น "50%")
  Width: string; // ความกว้างของ Hotspot (เช่น "50%")
  Height: string; // ความสูงของ Hotspot (เช่น "26%")
  onClick: () => void; // ฟังก์ชันเมื่อคลิกที่ Hotspot
  imageSrc: string; // 📌 เพิ่ม prop สำหรับรับค่า imageSrc ของ Hotspot (ถ้ามี)
  RoomID: string; // 📌 เพิ่ม prop สำหรับรับค่า RoomID ของ Hotspot (ถ้ามี)
}

const MapSpot: React.FC<MapSpotProps> = ({ Top, Left, Width, Height, onClick, imageSrc, RoomID }) => {

    return (
        <div className="w-full h-full overflow-auto relative flex items-center justify-center pt-20 pb-20">
        <div className="relative w-full max-w-[800px] flex-shrink-0">
          
          {/* รูปภาพแผนที่ชั้น 4 */}
          <img 
            src={imageSrc} 
            className="w-full h-auto object-contain select-none pointer-events-none block"
          />

          {/* ปุ่ม Hotspot ห้อง 422 */}
          <div 
            onClick={onClick}
            className="absolute top-[0%] left-[50%] w-[50%] h-[26%] z-20 bg-white/50 cursor-pointer flex items-center justify-center"
          >
          </div>

        </div>
      </div>
    )
}

export default MapSpot;
