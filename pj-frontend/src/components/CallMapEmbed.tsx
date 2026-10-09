import { MapEmbed } from "../../../IndoorNav/frontend/src/components/MapView";

interface MapEmbedProps {
  start:string,
  goal:string,
  currentFloor:string
}

const CallMapEmbed: React.FC<MapEmbedProps> = ({start,goal,currentFloor}) => {
    return(
            <MapEmbed startRoom={start} goalRoom={goal} floor={currentFloor}/>
    )
}

export default CallMapEmbed;