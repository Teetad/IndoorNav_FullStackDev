import React, { useEffect, useState } from "react";
import { Info, Navigation, Heart, User, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ShowRoomProps {
  placeId: string | null; 
  onClose: () => void; 
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

const ShowRoom: React.FC<ShowRoomProps> = ({ placeId, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const [roomDetail, setRoomDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 📌 State สำหรับ Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");

  // 📌 State สำหรับ Favorite
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isFavLoading, setIsFavLoading] = useState<boolean>(false);

  useEffect(() => {
    if (placeId) {
      document.body.classList.add("showroom-open");
    } else {
      document.body.classList.remove("showroom-open");
      setRoomDetail(null);
      setReviews([]); 
      setIsFavorited(false); // เคลียร์สถานะ
    }
    return () => {
      document.body.classList.remove("showroom-open");
    };
  }, [placeId]);

  useEffect(() => {
    if (!placeId) return;

    const fetchPlaceAndReviews = async () => {
      setLoading(true);
      try {
        const placeRes = await fetch(`http://localhost:3000/places/${placeId}`);
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          setRoomDetail(placeData);
        }

        const reviewsRes = await fetch(`http://localhost:3000/places/${placeId}/reviews`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }

        // 📌 1. ดึงข้อมูลว่าห้องนี้ถูก Favorite โดยผู้ใช้นี้หรือยัง
        if (user) {
          const favRes = await fetch(`http://localhost:3000/favorites`, {
            method: "GET",
            credentials: "include"
          });
          if (favRes.ok) {
            const favData = await favRes.json();
            // เช็คว่าในลิสต์ Favorite มี PlaceId นี้อยู่หรือไม่
            const isFav = favData.some((fav: any) => fav.place_id === placeId || fav.id === placeId);
            setIsFavorited(isFav);
          }
        }
      } catch (err) {
        console.error("Failed to fetch details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceAndReviews();
  }, [placeId, user]);

  // 📌 2. ฟังก์ชันกดปุ่ม Favorite สลับไปมา
  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please login to save places.");
      return;
    }
    if (isFavLoading) return;
    setIsFavLoading(true);

    try {
      if (isFavorited) {
        // กรณีกดออก (Unfavorite) -> ยิง DELETE
        const res = await fetch(`http://localhost:3000/favorites/${placeId}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (res.ok) setIsFavorited(false);
      } else {
        // กรณีกดบันทึก (Favorite) -> ยิง POST
        const res = await fetch(`http://localhost:3000/favorites/${placeId}`, {
          method: "POST",
          credentials: "include"
        });
        if (res.ok) setIsFavorited(true);
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
    } finally {
      setIsFavLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/places/${placeId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, 
          place_id: placeId,
          rating: 1, 
          comment: newComment
        }),
      });

      if (response.ok) {
        const createdReview = await response.json();
        // 📌 แก้ปัญหา Anonymous โดยการนำ display_name ของคนพิมพ์ยัดกลับเข้าไปด้วย
        const newReviewToDisplay = {
          ...createdReview,
          display_name: user.name || user.name || "Your Name"
        };
        setReviews([newReviewToDisplay, ...reviews]);
        setNewComment(""); 
      } else {
        alert("Failed to submit review");
      }
    } catch (error) {
      console.error("Submit review error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 1,
          comment: editComment
        }),
      });

      if (response.ok) {
        setReviews(reviews.map(r => r.review_id === reviewId ? { ...r, comment: editComment } : r));
        setEditingReviewId(null);
      } else {
        alert("Failed to update review");
      }
    } catch (error) {
      console.error("Update review error:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include", 
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.review_id !== reviewId));
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  if (!placeId) return null;

  const minSwipeDistance = 100;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    if (distance > minSwipeDistance) {
      onClose(); 
    }
  };

  return (
    <div 
      onTouchMove={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-xs transition-opacity overscroll-none"
    >
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full max-w-md bg-primary backdrop-blur-md rounded-t-[30px] p-6 shadow-2xl flex flex-col h-[90vh] max-h-[100vh] animate-slide-up overflow-hidden"
      >
        <div className="w-12 h-1.5 bg-stone-400 rounded-full mx-auto mb-4 flex-shrink-0 cursor-grab"></div>

        <div className="flex-shrink-0 mb-4 pb-2 border-b border-stone-300/40">
          <h2 className="text-2xl font-bold text-stone-800">
            {loading ? "Loading..." : roomDetail?.place_name || "Unknown Location"}
          </h2>
          <p className="text-sm text-stone-600">{roomDetail?.place_type}</p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4 scrollbar-none pb-10">
          
          {loading ? (
            <div className="text-center py-8 text-stone-600 text-xs">Loading room details...</div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#8E796E] text-white rounded-full text-xs font-medium shadow-sm hover:opacity-95 cursor-pointer">
                  <Info className="w-4 h-4" /> Information
                </button>

                <button 
                  onClick={() => {
                    navigate(`/start-navigation?room=${roomDetail.place_name}`);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E6DFD5] text-stone-800 rounded-full text-xs font-medium shadow-sm hover:opacity-95 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" /> Start
                </button>

                {/* 📌 3. อัปเดตปุ่ม Save ให้เป็นปุ่ม Favorite ทำงานเปลี่ยนสีตามสถานะได้ */}
                <button 
                  onClick={handleToggleFavorite}
                  disabled={isFavLoading}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium shadow-sm cursor-pointer transition-colors ${
                    isFavorited 
                      ? "bg-[#8E796E] text-white hover:bg-[#7a675e]" // ปุ่มทึบ (สีน้ำตาลเข้ม)
                      : "bg-[#E6DFD5] text-stone-800 hover:opacity-95" // ปุ่มโปร่ง (สีเนื้ออ่อน)
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} /> 
                  {isFavorited ? "Liked" : "Like"}
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {roomDetail?.image_url ? (
                  <img 
                    src={roomDetail.image_url} 
                    alt={roomDetail.place_name} 
                    className="w-full h-40 object-cover rounded-2xl shadow-inner" 
                  />
                ) : (
                  <div className="w-full h-32 bg-white/60 rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-xs text-stone-400">No Image Available</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed pt-2">
                {roomDetail?.description || "No description available for this place."}
              </p>

              <div className="mt-8 pt-4">
                <h3 className="text-lg font-bold text-stone-800 mb-4">Reviews</h3>

                <div className="flex items-start gap-3 mb-8">
                  <div className="bg-[#9A8175] text-white p-1.5 rounded-full mt-1 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="font-semibold text-stone-700 text-[14px]">
                      {user?.name || "Your Name"}
                    </span>
                    
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <input 
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-[14px] text-stone-700 placeholder-stone-500 p-0 focus:ring-0"
                        placeholder="write your review here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmitReview();
                        }}
                      />
                      <button 
                        onClick={handleSubmitReview}
                        disabled={isSubmitting || !newComment.trim()}
                        className="text-[#5B8A66] font-medium text-[14px] hover:opacity-80 transition-opacity disabled:opacity-50 px-2"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {reviews.length === 0 ? (
                    <p className="text-stone-500 text-sm">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.review_id} className="flex items-start gap-3">
                        <div className="bg-[#9A8175] text-white p-1.5 rounded-full mt-1 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-semibold text-stone-700 text-[14px]">
                            {review.display_name || "Anonymous"}
                          </p>

                          {editingReviewId === review.review_id ? (
                            <div className="flex flex-col gap-2 mt-1">
                              <input
                                autoFocus
                                type="text"
                                className="w-full bg-white/60 rounded px-2 py-1 text-[14px] text-stone-700 outline-none border border-stone-300"
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                              />
                              <div className="flex gap-3">
                                <button onClick={() => handleUpdateReview(review.review_id)} className="text-[#5B8A66] text-xs font-semibold hover:underline">Save</button>
                                <button onClick={() => setEditingReviewId(null)} className="text-stone-500 text-xs font-semibold hover:underline">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-stone-600 text-[14px] leading-snug">
                                {review.comment}
                              </p>
                              
                              {user && user.id === review.user_id && (
                                <div className="flex items-center gap-3 mt-1.5">
                                  <button 
                                    onClick={() => {
                                      setEditingReviewId(review.review_id);
                                      setEditComment(review.comment);
                                    }}
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-[#C29053] hover:opacity-80" />
                                  </button>
                                  <button onClick={() => handleDeleteReview(review.review_id)}>
                                    <Trash2 className="w-3.5 h-3.5 text-[#B85C5C] hover:opacity-80" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowRoom;