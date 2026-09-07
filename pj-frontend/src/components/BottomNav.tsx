import {
  MapPin,
  Bookmark,
  Flag
} from "lucide-react";

const BottomNav = () => {
  return (
    <div className="grid grid-cols-3 place-items-center gap-4 fixed bottom-0 left-0 w-full h-16 bg-secondary border-secondary">
      <span className="flex flex-col items-center">
        <MapPin className="h-6 w-6"/>
        <p className="text-xs">Explore</p>
      </span>
      <span className="flex flex-col items-center">
        <Bookmark className="h-6 w-6"/>
        <p className="text-xs">You</p>
      </span>
      <span className="flex flex-col items-center">
        <Flag className="h-6 w-6"/>
        <p className="text-xs">Reports</p>
      </span>
    </div>
  );
};

export default BottomNav;