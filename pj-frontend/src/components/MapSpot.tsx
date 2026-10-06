interface MapSpotProps {
  Top: string;
  Left: string;
  Width: string;
  Height: string;
  onClick: () => void;
  placeId: string;
}

const MapSpot: React.FC<MapSpotProps> = ({ Top, Left, Width, Height, onClick, placeId }) => {
    return (
        <div 
      onClick={onClick}
      style={{
        top: Top,
        left: Left,
        width: Width,
        height: Height,
      }}
      className="absolute z-20 bg-red-500/65 hover:bg-red-500/40 cursor-pointer rounded-lg transition-colors flex items-center justify-center"
    >
    </div>
    );
};

export default MapSpot;