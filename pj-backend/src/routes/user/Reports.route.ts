import { dbClient } from "@db/client.js";
import { Places, Reports, Users } from "@db/schema.js";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { validate as isUUID } from "uuid";
import { requireAuth, requireRole } from "../../auth/middleware.js";

const router = Router();
const reportStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

function isReportStatus(value: unknown): value is typeof reportStatuses[number] {
  return typeof value === "string" && reportStatuses.includes(value as typeof reportStatuses[number]);
}

// User แจ้งปัญหาของสถานที่
router.post("/places/:place_id/reports", requireAuth, async (req, res) => {
  try {
    const placeId = typeof req.params.place_id === "string" ? req.params.place_id : "";
    const { description } = req.body ?? {};
    if (!isUUID(placeId)) return res.status(400).json({ message: "place_id must be a valid UUID" });
    if (typeof description !== "string" || !description.trim() || description.trim().length > 500) {
      return res.status(400).json({ message: "description must be 1-500 characters" });
    }

    const [place] = await dbClient.select({ id: Places.place_id }).from(Places)
      .where(eq(Places.place_id, placeId));
    if (!place) return res.status(404).json({ message: "Place not found" });

    const [report] = await dbClient.insert(Reports).values({
      user_id: res.locals.auth.sub,
      place_id: placeId,
      description: description.trim(),
    }).returning();
    return res.status(201).json(report);
  } catch (error) {
    console.error("POST /places/:place_id/reports failed:", error);
    return res.status(500).json({ message: "Unable to create report" });
  }
});

// User อ่าน Report ของตัวเอง
router.get("/reports/me", requireAuth, async (_req, res) => {
  try {
    const reports = await dbClient.select({
      report_id: Reports.report_id,
      place_id: Reports.place_id,
      place_name: Places.place_name,
      description: Reports.description,
      status: Reports.status,
      admin_note: Reports.admin_note,
      created_at: Reports.created_at,
      updated_at: Reports.updated_at,
    }).from(Reports)
      .innerJoin(Places, eq(Reports.place_id, Places.place_id))
      .where(eq(Reports.user_id, res.locals.auth.sub));
    return res.status(200).json(reports);
  } catch (error) {
    console.error("GET /reports/me failed:", error);
    return res.status(500).json({ message: "Unable to get your reports" });
  }
});

// Admin อ่าน Report ทั้งหมด
router.get("/reports", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    const reports = await dbClient.select({
      report_id: Reports.report_id,
      user_id: Reports.user_id,
      user_email: Users.email,
      place_id: Reports.place_id,
      place_name: Places.place_name,
      description: Reports.description,
      status: Reports.status,
      admin_note: Reports.admin_note,
      created_at: Reports.created_at,
      updated_at: Reports.updated_at,
    }).from(Reports)
      .innerJoin(Users, eq(Reports.user_id, Users.user_id))
      .innerJoin(Places, eq(Reports.place_id, Places.place_id));
    return res.status(200).json(reports);
  } catch (error) {
    console.error("GET /reports failed:", error);
    return res.status(500).json({ message: "Unable to get reports" });
  }
});

// Admin เปลี่ยนสถานะและใส่หมายเหตุได้
router.put("/reports/:report_id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const reportId = typeof req.params.report_id === "string" ? req.params.report_id : "";
    const { status, admin_note } = req.body ?? {};
    if (!isUUID(reportId)) return res.status(400).json({ message: "report_id must be a valid UUID" });
    if (!isReportStatus(status)) {
      return res.status(400).json({ message: "status must be PENDING, IN_PROGRESS, or RESOLVED" });
    }
    if (admin_note !== undefined && admin_note !== null &&
        (typeof admin_note !== "string" || admin_note.trim().length > 500)) {
      return res.status(400).json({ message: "admin_note must not exceed 500 characters" });
    }

    const [report] = await dbClient.update(Reports).set({
      status,
      admin_note: typeof admin_note === "string" ? admin_note.trim() || null : null,
      updated_at: new Date(),
    }).where(eq(Reports.report_id, reportId)).returning();
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.status(200).json(report);
  } catch (error) {
    console.error("PUT /reports/:report_id/status failed:", error);
    return res.status(500).json({ message: "Unable to update report" });
  }
});

// Admin ลบ Report ที่สร้างผิดหรือไม่ต้องการเก็บแล้ว
router.delete("/reports/:report_id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const reportId = typeof req.params.report_id === "string" ? req.params.report_id : "";
    if (!isUUID(reportId)) return res.status(400).json({ message: "report_id must be a valid UUID" });

    const [report] = await dbClient.delete(Reports)
      .where(eq(Reports.report_id, reportId)).returning();
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.status(200).json({ message: "Report deleted", data: report });
  } catch (error) {
    console.error("DELETE /reports/:report_id failed:", error);
    return res.status(500).json({ message: "Unable to delete report" });
  }
});

export default router;
