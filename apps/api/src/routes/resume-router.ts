import { Router } from "express";
import { z } from "zod";
import { buildResumeInsight } from "../services/resume-service";

const router = Router();

const uploadSchema = z
  .object({
    resumeUrl: z.string().url().optional(),
    fileBase64: z.string().min(1).optional(),
    jobDescription: z.string().min(10),
    candidateName: z.string().default("Candidate"),
    targetRole: z.string().default("Software Engineer"),
  })
  .refine((data) => data.resumeUrl || data.fileBase64, {
    message: "Provide either a resume URL or a PDF upload",
    path: ["resumeUrl"],
  });

router.post("/resume", async (req, res, next) => {
  try {
    const payload = uploadSchema.parse(req.body);
    const result = await buildResumeInsight(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
