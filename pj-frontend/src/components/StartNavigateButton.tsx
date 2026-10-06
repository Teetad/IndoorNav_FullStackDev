import React from "react";

interface StartNavigateButtonProps {
  startLocation: string;
  destination: string;
  onNavigate?: () => void; // ฟังก์ชันเมื่อกดเริ่มนำทาง
}

const StartNavigateButton: React.FC<StartNavigateButtonProps> = ({
  startLocation,
  destination,
  onNavigate,
}) => {
  return (
    <div className="w-full max-w-md mx-auto pt-4 pb-6">
      <button
        onClick={onNavigate}
        className="w-full py-3.5 bg-[#D5DCE2] hover:bg-[#C5CCD2] text-stone-700 font-semibold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center text-base"
      >
        Start Navigate
      </button>
    </div>
  );
};

export default StartNavigateButton;