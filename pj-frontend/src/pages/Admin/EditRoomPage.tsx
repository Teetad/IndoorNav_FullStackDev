import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, User, Image as ImageIcon, Plus } from "lucide-react";
import SideBar from "../../components/SideBar";
import LogInHeader from "../../components/LogInHeader";

interface Place {
  place_name: string;
  description: string;
}

interface Review {
  review_id: string;
  user_id: string;
  display_name: string;
  rating: number;
  comment: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

const EditRoomPage = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [editedPlaceName, setEditedPlaceName] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  const [favCount, setFavCount] = useState<number>(0);
  const [images, setImages] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!placeId) return;
      setIsLoading(true);

      try {
        const placeRes = await fetch(`http://localhost:3000/places/${placeId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          setPlace(placeData);
          setEditedPlaceName(placeData.place_name || "");
          setEditedDescription(placeData.description || "");
          setFavCount(placeData.favorite_count || placeData.fav_count || placeData.like_count || 0);
        }

        const reviewsRes = await fetch(`http://localhost:3000/places/${placeId}/reviews`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }

        // 📌 ดึงข้อมูลรูปภาพของห้องนี้
        const imagesRes = await fetch(`http://localhost:3000/places/${placeId}/images`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          if (Array.isArray(imagesData)) {
            setImages(imagesData);
          } else {
            setImages([]);
          }
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [placeId]);

  const handleUpdatePlace = async () => {
    if (!placeId) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`http://localhost:3000/places/${placeId}`, {
        method: "PUT",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place_name: editedPlaceName,
          description: editedDescription || null, 
        }),
      });

      if (response.ok) {
        alert("Successfully updated room details!");
        setPlace(prev => prev ? { ...prev, place_name: editedPlaceName, description: editedDescription } : null);
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    } catch (error) {
      console.error("Error updating place:", error);
      alert("ไม่สามารถอัปเดตข้อมูลได้ในขณะนี้");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this review?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter((r) => r.review_id !== reviewId));
      } else {
        console.error("Failed to delete review");
        alert("Failed to delete review. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // 📌 ฟังก์ชันจัดการเมื่อเลือกรูปภาพเพื่ออัปโหลด
  // 📌 ฟังก์ชันจัดการเมื่อเลือกรูปภาพเพื่ออัปโหลด (แก้ไขใหม่)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !placeId) return;

    try {
      // 1. สร้าง FormData สำหรับแนบไฟล์
      const formData = new FormData();
      formData.append("image", file); // ชื่อ "image" ต้องตรงกับ upload.single("image") ที่ฝั่ง Backend

      const response = await fetch(`http://localhost:3000/places/${placeId}/images`, {
        method: "POST",
        credentials: "include", // ส่ง Cookie ยืนยันตัวตน
        body: formData, // ส่ง FormData แทนการใช้ JSON.stringify
        // *ห้าม* ใส่ Header "Content-Type": "application/json" 
        // เพราะเบราว์เซอร์จะจัดการตั้งค่า multipart/form-data พร้อม boundary ให้เองโดยอัตโนมัติ
      });

      if (response.ok) {
        const data = await response.json();
        // 2. นำ image_url ที่ Backend ส่งกลับมา (เช่น /images/places/uploads/filename.jpg) มาอัปเดต state รูปภาพทันที
        if (data.image_url) {
          setImages((prev) => [...prev, { image_url: data.image_url }]);
        }
        alert("เพิ่มรูปภาพสำเร็จ!");
      } else {
        if (response.status === 401) {
          alert("เซสชันหมดอายุ กรุณาล็อกอินใหม่");
        } else if (response.status === 403) {
          alert("คุณไม่มีสิทธิ์ในการอัปโหลดรูปภาพ (ต้องเป็น ADMIN เท่านั้น)");
        } else {
          alert("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  

  return (
    <div className="flex h-screen bg-[#F8F6F2] font-sans">
      
      <SideBar />

      <main className="flex-1 flex flex-col ml-64 px-10 py-8 overflow-hidden relative">
        
        <div className="flex w-full items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-stone-800 hover:bg-[#EAE1D3] p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
            </button>
            
            <div className="bg-[#EAE1D3] px-8 py-2.5 rounded-2xl min-w-[250px]">
              {isLoading ? (
                <span className="text-2xl font-bold text-stone-800">Loading...</span>
              ) : (
                <input
                  type="text"
                  value={editedPlaceName}
                  onChange={(e) => setEditedPlaceName(e.target.value)}
                  className="w-full text-2xl font-bold text-stone-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                  placeholder="Room Name"
                />
              )}
            </div>
          </div>
          
          <LogInHeader />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 flex-1 min-h-0">
          
          <div className="flex flex-col h-full gap-8 min-w-0">
            
            <div className="flex flex-col flex-1 min-h-[250px]">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">Description</h2>
              {/* 📌 แก้ไข padding เป็น p-4 และขอบเป็น rounded-xl ให้บางลงตามที่คุณต้องการ */}
              <textarea
                className="flex-1 w-full bg-[#EAE1D3] rounded-2xl p-4 text-stone-700 text-lg resize-none outline-none focus:ring-2 focus:ring-[#6B8E9B] placeholder-stone-500"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="description..."
              />
            </div>

            <div className="flex flex-col shrink-0 min-w-0">
              <h2 className="text-2xl font-bold text-stone-800 mb-4">Photos</h2>
              
              <div className="flex flex-nowrap w-full gap-4 mb-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                {images.map((img: any, index: number) => {
                  // ปริ้นท์ดูค่าด้านใน Object ว่า property จริงๆ ชื่ออะไร (เช่น img.image_url หรือชื่ออื่น)
                  console.log(`รูปที่ ${index + 1}:`, img);

                  const rawUrl = img.image_url || img.url || "";
                  let imageUrl = "";
                  if (rawUrl) {
                    if (rawUrl.startsWith('http')) {
                      imageUrl = encodeURI(rawUrl);
                    } else {
                      const cleanedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
                      imageUrl = encodeURI(`http://localhost:3000${cleanedPath}`);
                    }
                  }

                  return (
                    <img 
                      key={index}
                      src={imageUrl} 
                      alt={`Room Image ${index + 1}`} 
                      className="w-40 h-28 object-cover rounded-2xl shadow-sm shrink-0 snap-center bg-white/60" 
                    />
                  );
                })}
              </div>

              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-[#DCD7D2] rounded-2xl flex flex-col items-center justify-center text-stone-500 cursor-pointer hover:bg-[#d0c9c2] transition-colors shrink-0"
                >
                  <Plus className="w-10 h-10 mb-1" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Add new</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col h-full overflow-hidden">
            
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-stone-800">Favorites</h2>
              <span className="text-stone-700 text-[17px]">{isLoading ? "..." : favCount}</span>
            </div>

            <h2 className="text-xl font-bold text-stone-800 mb-4 shrink-0">Reviews</h2>
            <div className="flex flex-col gap-6 overflow-y-auto pr-4 pb-20">
              {isLoading ? (
                <p className="text-stone-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-stone-500">No reviews found for this room.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.review_id} className="flex items-start gap-4">
                    <div className="bg-[#9A8175] text-[#F8F6F2] p-1.5 rounded-full mt-1 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <span className="font-semibold text-stone-700 text-[15px]">
                        {review.display_name || "Anonymous"}
                      </span>
                      <span className="text-stone-600 text-[15px] leading-snug">
                        {review.comment}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDeleteReview(review.review_id)}
                      className="text-[#B85C5C] hover:text-red-700 p-2 shrink-0 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        <div className="absolute bottom-8 right-10">
          <button 
            onClick={handleUpdatePlace}
            disabled={isUpdating}
            className="bg-[#5B8A66] hover:bg-[#4a7253] text-white px-8 py-3 rounded-xl font-bold text-lg tracking-wide shadow-sm transition-colors disabled:opacity-50"
          >
            {isUpdating ? "UPDATING..." : "UPDATE"}
          </button>
        </div>

      </main>
    </div>
  );
};

export default EditRoomPage;