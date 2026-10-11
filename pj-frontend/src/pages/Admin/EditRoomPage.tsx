
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, User, Plus, X } from "lucide-react";
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

interface PlaceImage {
  image_id: string;
  place_id?: string;
  image_url: string;
  caption?: string | null;
  display_order?: number;
}

const API_URL = "http://localhost:3000";

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
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // โหลดข้อมูลห้อง รีวิว และรูปภาพ
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!placeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [placeRes, reviewsRes, imagesRes] = await Promise.all([
          fetch(`${API_URL}/places/${placeId}`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/places/${placeId}/reviews`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/places/${placeId}/images`, {
            credentials: "include",
          }),
        ]);

        if (placeRes.ok) {
          const placeData = await placeRes.json();

          setPlace(placeData);
          setEditedPlaceName(placeData.place_name || "");
          setEditedDescription(placeData.description || "");

          setFavCount(
            placeData.favorite_count ??
              placeData.fav_count ??
              placeData.favCount ??
              placeData.like_count ??
              0
          );
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }

        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          setImages(Array.isArray(imagesData) ? imagesData : []);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
        alert("ไม่สามารถโหลดข้อมูลห้องได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [placeId]);

  // บันทึกชื่อและรายละเอียดห้อง
  const handleUpdatePlace = async () => {
    if (!placeId) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`${API_URL}/places/${placeId}`, {
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

        setPlace((prev) =>
          prev
            ? {
                ...prev,
                place_name: editedPlaceName,
                description: editedDescription,
              }
            : null
        );
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    } catch (error) {
      console.error("Error updating place:", error);
      alert("ไม่สามารถอัปเดตข้อมูลได้ในขณะนี้");
    } finally {
      setIsUpdating(false);
    }
  };

  // ลบรูปภาพจาก PlaceImages
  const handleDeleteImage = async (imageId: string) => {
    if (!placeId || !imageId) return;

    if (deletingImageIds.includes(imageId)) return;

    if (!window.confirm("Are you sure to delete this image?")) {
      return;
    }

    setDeletingImageIds((prev) => [...prev, imageId]);

    try {
      const response = await fetch(
        `${API_URL}/places/${placeId}/images/${imageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setImages((prev) =>
          prev.filter((img) => img.image_id !== imageId)
        );

        alert("Successfully deleted this image!");
      } else {
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          alert("เซสชันหมดอายุ กรุณาล็อกอินใหม่");
        } else if (response.status === 403) {
          alert("คุณไม่มีสิทธิ์ลบรูปภาพนี้");
        } else {
          alert(data.message || "ไม่สามารถลบรูปภาพได้");
        }
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setDeletingImageIds((prev) =>
        prev.filter((id) => id !== imageId)
      );
    }
  };

  // อัปโหลดรูปภาพใหม่
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !placeId) return;

    // ตรวจสอบชนิดและขนาดไฟล์เบื้องต้น
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("กรุณาเลือกไฟล์ JPG, PNG หรือ WebP");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดรูปภาพต้องไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/places/${placeId}/images`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          alert("เซสชันหมดอายุ กรุณาล็อกอินใหม่");
        } else if (response.status === 403) {
          alert("คุณไม่มีสิทธิ์อัปโหลดรูปภาพ");
        } else {
          alert(data.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        }

        return;
      }

      // โหลดรายการจาก Database อีกครั้ง เพื่อให้ทุกภาพมี image_id
      const imagesRes = await fetch(
        `${API_URL}/places/${placeId}/images`,
        {
          credentials: "include",
        }
      );

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setImages(Array.isArray(imagesData) ? imagesData : []);
        alert("Successfully upoaded an image!");
      } else {
        alert("อัปโหลดสำเร็จ แต่ไม่สามารถโหลดรายการรูปภาพใหม่ได้");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("ไม่สามารถอัปโหลดรูปภาพได้ในขณะนี้");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // แปลง URL ที่เก็บใน Database เป็น URL สำหรับแสดงรูป
  const getImageUrl = (rawUrl: string) => {
    if (!rawUrl) return "";

    if (/^https?:\/\//i.test(rawUrl)) {
      return encodeURI(rawUrl);
    }

    const cleanedPath = rawUrl.startsWith("/")
      ? rawUrl
      : `/${rawUrl}`;

    return encodeURI(`${API_URL}${cleanedPath}`);
  };

  // ลบรีวิว
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.filter((review) => review.review_id !== reviewId)
        );
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Failed to delete review. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
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
                <span className="text-2xl font-bold text-stone-800">
                  Loading...
                </span>
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
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                Description
              </h2>

              <textarea
                className="flex-1 w-full bg-[#EAE1D3] rounded-2xl p-4 text-stone-700 text-lg resize-none outline-none focus:ring-2 focus:ring-[#6B8E9B] placeholder-stone-500"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="description..."
              />
            </div>

            <div className="flex flex-col shrink-0 min-w-0">
              <h2 className="text-2xl font-bold text-stone-800 mb-4">
                Photos
              </h2>

              <div className="flex flex-nowrap w-full gap-4 mb-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                {images.map((img) => {
                  const imageUrl = getImageUrl(img.image_url);
                  const isDeleting = deletingImageIds.includes(img.image_id);

                  return (
                    <div
                      key={img.image_id || img.image_url}
                      className="relative w-40 h-28 shrink-0 snap-center group"
                    >
                      <img
                        src={imageUrl}
                        alt={img.caption || "Room Image"}
                        className="w-full h-full object-cover rounded-2xl shadow-sm bg-white/60"
                      />

                      {img.image_id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.image_id)}
                          disabled={isDeleting}
                          title="Delete image"
                          aria-label="Delete image"
                          className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}

                {!isLoading && images.length === 0 && (
                  <p className="text-stone-500 text-sm">
                    No images here!
                  </p>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-32 h-32 bg-[#DCD7D2] rounded-2xl flex flex-col items-center justify-center text-stone-500 cursor-pointer hover:bg-[#d0c9c2] transition-colors shrink-0 disabled:opacity-50"
              >
                <Plus className="w-10 h-10 mb-1" strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Add new"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-stone-800">
                Favorites
              </h2>
              <span className="text-stone-700 text-[17px]">
                {isLoading ? "..." : favCount}
              </span>
            </div>

            <h2 className="text-xl font-bold text-stone-800 mb-4 shrink-0">
              Reviews
            </h2>

            <div className="flex flex-col gap-6 overflow-y-auto pr-4 pb-20">
              {isLoading ? (
                <p className="text-stone-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-stone-500">
                  No reviews found for this room.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="flex items-start gap-4"
                  >
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