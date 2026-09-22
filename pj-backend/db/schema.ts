import {
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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
  place_type: varchar("place_type", { length: 40 }),
  room_number: varchar("room_number", { length: 30 }),
  description: varchar("description", { length: 500 }),
  image_url: varchar("image_url", { length: 500 }),
  favCount: integer("fav_count").default(0).notNull(),
});
