import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// schema เปรียบเหมือนพิมพ์เขียวฐานข้อมูล แต่การแก้ไฟล์นี้ยังไม่เปลี่ยน DB จริง
// หลังแก้ต้องสร้าง migration และรัน pnpm db:migrate เสมอ

export const Users = pgTable("users", {
  // user_id เป็น ID ภายในระบบ ส่วน oauth_subject เป็น ID ที่ CPE OAuth ส่งมา
  user_id: uuid("user_id").primaryKey().defaultRandom(),
  oauth_subject: varchar("oauth_subject", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  display_name: varchar("display_name", { length: 120 }),
  // ผู้ใช้ที่ login ครั้งแรกเป็น USER จนกว่าจะถูกกำหนดเป็น ADMIN/DEVELOPER
  role: varchar("role", { length: 20 }).default("USER").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const Buildings = pgTable("buildings", {
  building_id: uuid("building_id").primaryKey().defaultRandom(),
  building_name: varchar("building_name", { length: 120 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
});

export const Floors = pgTable(
  "floors",
  {
    floor_id: uuid("floor_id").primaryKey().defaultRandom(),
    building_id: uuid("building_id")
      .references(() => Buildings.building_id, { onDelete: "cascade" })
      .notNull(),
    floor_number: integer("floor_number").notNull(),
    floor_plan_image: varchar("floor_plan_image", { length: 500 }),
  },
  (table) => [
    uniqueIndex("floors_building_floor_number_unique").on(
      table.building_id,
      table.floor_number,
    ),
  ],
);

export const Places = pgTable("places", {
  place_id: uuid("place_id").primaryKey().defaultRandom(),
  floor_id: uuid("floor_id")
    .references(() => Floors.floor_id, { onDelete: "cascade" })
    .notNull(),
  place_name: varchar("place_name", { length: 120 }).notNull(),
  // null หมายถึงยังไม่ทราบประเภท เช่น ห้อง 712
  place_type: varchar("place_type", { length: 40 }),
  room_number: varchar("room_number", { length: 30 }),
  // UNKNOWN ใช้เมื่อยังไม่ได้ตรวจสอบสถานะจริงของห้อง
  room_status: varchar("room_status", { length: 20 }).default("UNKNOWN").notNull(),
  capacity: integer("capacity"),
  opening_time: varchar("opening_time", { length: 5 }),
  closing_time: varchar("closing_time", { length: 5 }),
  description: varchar("description", { length: 500 }),
  image_url: varchar("image_url", { length: 500 }),
  favCount: integer("fav_count").default(0).notNull(),
});

// หนึ่งสถานที่มีรูปได้หลายรูป เรียงด้วย display_order
export const PlaceImages = pgTable(
  "place_images",
  {
    image_id: uuid("image_id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .references(() => Places.place_id, { onDelete: "cascade" })
      .notNull(),
    image_url: varchar("image_url", { length: 500 }).notNull(),
    caption: varchar("caption", { length: 200 }),
    display_order: integer("display_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("place_images_place_url_unique").on(table.place_id, table.image_url),
  ],
);

// ตารางเชื่อม User กับสถานที่ที่กด Favorite
export const Favorites = pgTable(
  "favorites",
  {
    favorite_id: uuid("favorite_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .references(() => Users.user_id, { onDelete: "cascade" })
      .notNull(),
    place_id: uuid("place_id")
      .references(() => Places.place_id, { onDelete: "cascade" })
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorites_user_place_unique").on(table.user_id, table.place_id),
  ],
);

// รีวิวสถานที่ ผู้ใช้หนึ่งคนเขียนได้หนึ่งรีวิวต่อสถานที่
export const Reviews = pgTable(
  "reviews",
  {
    review_id: uuid("review_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .references(() => Users.user_id, { onDelete: "cascade" })
      .notNull(),
    place_id: uuid("place_id")
      .references(() => Places.place_id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    comment: varchar("comment", { length: 500 }),
    like_count: integer("like_count").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_user_place_unique").on(table.user_id, table.place_id),
  ],
);

// เก็บว่า User คนไหนกด Like รีวิวใด
export const ReviewLikes = pgTable(
  "review_likes",
  {
    review_like_id: uuid("review_like_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .references(() => Users.user_id, { onDelete: "cascade" })
      .notNull(),
    review_id: uuid("review_id")
      .references(() => Reviews.review_id, { onDelete: "cascade" })
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("review_likes_user_review_unique").on(table.user_id, table.review_id),
  ],
);

// ปัญหาที่ผู้ใช้แจ้งเกี่ยวกับสถานที่
export const Reports = pgTable("reports", {
  report_id: uuid("report_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => Users.user_id, { onDelete: "cascade" })
    .notNull(),
  place_id: uuid("place_id")
    .references(() => Places.place_id, { onDelete: "cascade" })
    .notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  admin_note: varchar("admin_note", { length: 500 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// หนึ่งสถานที่มีได้หลายคำค้น; ลบสถานที่แล้วคำค้นถูกลบตามด้วย
export const PlaceKeywords = pgTable(
  "place_keywords",
  {
    keyword_id: uuid("keyword_id").primaryKey().defaultRandom(),
    place_id: uuid("place_id")
      .references(() => Places.place_id, { onDelete: "cascade" })
      .notNull(),
    keyword: varchar("keyword", { length: 100 }).notNull(),
  },
  (table) => [
    // ป้องกันคำค้นเดียวกันซ้ำในสถานที่เดียวกัน
    uniqueIndex("place_keywords_place_keyword_unique").on(
      table.place_id,
      table.keyword,
    ),
  ],
);
