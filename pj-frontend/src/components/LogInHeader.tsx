import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";

const LogInHeader = () => {
    const { user } = useAuth();
    return (
       <div className="flex shrink-0 items-center gap-3 rounded-full bg-[#EAE1D3] px-4 py-2 font-medium text-stone-800 shadow-sm">
                   <div className="rounded-full bg-[#8E796E] p-1.5 text-[#F3EFEA]">
                     <User className="h-5 w-5" />
                   </div>
                   <span>{user?.name || "Admin"}</span>
                 </div>
    );
};

export default LogInHeader;