import { dbClient } from "@db/client.js";
import { Places, ReviewLikes, Reviews, Users } from "@db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth } from "../../auth/middleware.js";

const router = Router();

// Review เก็บคะแนน/ข้อความ ส่วน ReviewLikes เก็บว่า User คนใดกด Like รีวิวใด

// อ่านรีวิวของสถานที่ ทุกคนอ่านได้โดยไม่ต้อง login
router.get("/places/:place_id/reviews", async (req, res) => {
  try {
    const placeId = typeof req.params.place_id === "string" ? req.params.place_id : "";
    if (!isUUID(placeId)) return res.status(400).json({ message: "place_id must be a valid UUID" });

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, placeId));
    if (!place) return res.status(404).json({ message: "Place not found" });

    // JOIN Users เพื่อส่งชื่อผู้รีวิวกลับไปพร้อมรีวิว
    const reviews = await dbClient.select({
      review_id: Reviews.review_id,
      user_id: Reviews.user_id,
      display_name: Users.display_name,
      rating: Reviews.rating,
      comment: Reviews.comment,
      like_count: Reviews.like_count,
      created_at: Reviews.created_at,
      updated_at: Reviews.updated_at,
    }).from(Reviews)
      .innerJoin(Users, eq(Reviews.user_id, Users.user_id))
      .where(eq(Reviews.place_id, placeId));

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("GET /places/:place_id/reviews failed:", error);
    return res.status(500).json({ message: "Unable to get reviews" });
  }
});

// ผู้ใช้ที่ login เพิ่มรีวิวได้หนึ่งครั้งต่อสถานที่
router.post("/places/:place_id/reviews", requireAuth, async (req, res) => {
  try {
    const placeId = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const { rating, comment } = req.body ?? {};
    if (!isUUID(placeId)) return res.status(400).json({ message: "place_id must be a valid UUID" });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }
    if (comment !== undefined && comment !== null &&
        (typeof comment !== "string" || comment.trim().length > 500)) {
      return res.status(400).json({ message: "comment must not exceed 500 characters" });
    }

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, placeId));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const [review] = await dbClient.insert(Reviews).values({
      user_id: res.locals.auth.sub,
      place_id: placeId,
      rating,
      comment: typeof comment === "string" ? comment.trim() || null : null,
    }).returning();
    return res.status(201).json(review);
  } catch (error: any) {
    if (error?.code === "23505" || error?.cause?.code === "23505") {
      return res.status(409).json({ message: "You already reviewed this place" });
    }
    console.error("POST /places/:place_id/reviews failed:", error);
    return res.status(500).json({ message: "Unable to create review" });
  }
});

// เจ้าของรีวิวแก้คะแนนหรือข้อความของตัวเองได้
router.put("/reviews/:review_id", requireAuth, async (req, res) => {
  try {
    const reviewId = typeof req.params.review_id === "string" ? req.params.review_id : "";
    const { rating, comment } = req.body ?? {};
    if (!isUUID(reviewId)) return res.status(400).json({ message: "review_id must be a valid UUID" });
    if (rating === undefined && comment === undefined) {
      return res.status(400).json({ message: "rating or comment is required" });
    }
    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "rating must be an integer from 1 to 5" });
    }
    if (comment !== undefined && comment !== null &&
        (typeof comment !== "string" || comment.trim().length > 500)) {
      return res.status(400).json({ message: "comment must not exceed 500 characters" });
    }

    const [existing] = await dbClient.select().from(Reviews)
      .where(eq(Reviews.review_id, reviewId));
    if (!existing) return res.status(404).json({ message: "Review not found" });
    if (existing.user_id !== res.locals.auth.sub) {
      return res.status(403).json({ message: "You can only update your own review" });
    }

    let newComment = existing.comment;
    if (comment === null) {
      newComment = null;
    } else if (typeof comment === "string") {
      newComment = comment.trim() || null;
    }

    const [review] = await dbClient.update(Reviews).set({
      rating: rating ?? existing.rating,
      comment: newComment,
      updated_at: new Date(),
    }).where(eq(Reviews.review_id, reviewId)).returning();
    return res.status(200).json(review);
  } catch (error) {
    console.error("PUT /reviews/:review_id failed:", error);
    return res.status(500).json({ message: "Unable to update review" });
  }
});

// เจ้าของลบรีวิวตัวเองได้ และ Admin ลบรีวิวที่ไม่เหมาะสมได้
router.delete("/reviews/:review_id", requireAuth, async (req, res) => {
  try {
    const reviewId = typeof req.params.review_id === "string" ? req.params.review_id : "";
    if (!isUUID(reviewId)) return res.status(400).json({ message: "review_id must be a valid UUID" });

    const [existing] = await dbClient.select().from(Reviews)
      .where(eq(Reviews.review_id, reviewId));
    if (!existing) return res.status(404).json({ message: "Review not found" });
    const isOwner = existing.user_id === res.locals.auth.sub;
    const isAdmin = res.locals.auth.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You cannot delete this review" });
    }

    const [review] = await dbClient.delete(Reviews)
      .where(eq(Reviews.review_id, reviewId)).returning();
    return res.status(200).json({ message: "Review deleted", data: review });
  } catch (error) {
    console.error("DELETE /reviews/:review_id failed:", error);
    return res.status(500).json({ message: "Unable to delete review" });
  }
});

// กด Like รีวิวเดิมซ้ำจะไม่เพิ่มจำนวนซ้ำ
router.post("/reviews/:review_id/likes", requireAuth, async (req, res) => {
  try {
    const reviewId = typeof req.params.review_id === "string" ? req.params.review_id : "";
    if (!isUUID(reviewId)) return res.status(400).json({ message: "review_id must be a valid UUID" });

    const [review] = await dbClient.select({ id: Reviews.review_id }).from(Reviews)
      .where(eq(Reviews.review_id, reviewId));
    if (!review) return res.status(404).json({ message: "Review not found" });

    // transaction ทำให้การเพิ่ม Like และเพิ่มตัวนับสำเร็จหรือยกเลิกพร้อมกัน
    const like = await dbClient.transaction(async tx => {
      const [created] = await tx.insert(ReviewLikes).values({
        user_id: res.locals.auth.sub,
        review_id: reviewId,
      }).onConflictDoNothing().returning();
      if (!created) return null;

      await tx.update(Reviews).set({ like_count: sql`${Reviews.like_count} + 1` })
        .where(eq(Reviews.review_id, reviewId));
      return created;
    });

    if (!like) return res.status(200).json({ message: "Review is already liked" });
    return res.status(201).json(like);
  } catch (error) {
    console.error("POST /reviews/:review_id/likes failed:", error);
    return res.status(500).json({ message: "Unable to like review" });
  }
});

router.delete("/reviews/:review_id/likes", requireAuth, async (req, res) => {
  try {
    const reviewId = typeof req.params.review_id === "string" ? req.params.review_id : "";
    if (!isUUID(reviewId)) return res.status(400).json({ message: "review_id must be a valid UUID" });

    const like = await dbClient.transaction(async tx => {
      const [deleted] = await tx.delete(ReviewLikes).where(and(
        eq(ReviewLikes.user_id, res.locals.auth.sub),
        eq(ReviewLikes.review_id, reviewId),
      )).returning();
      if (!deleted) return null;

      await tx.update(Reviews).set({
        like_count: sql`greatest(${Reviews.like_count} - 1, 0)`,
      }).where(eq(Reviews.review_id, reviewId));
      return deleted;
    });

    if (!like) return res.status(404).json({ message: "Review like not found" });
    return res.status(200).json({ message: "Review like removed", data: like });
  } catch (error) {
    console.error("DELETE /reviews/:review_id/likes failed:", error);
    return res.status(500).json({ message: "Unable to remove review like" });
  }
});

export default router;
