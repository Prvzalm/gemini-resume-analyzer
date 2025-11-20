import { Router } from "express";
import { z } from "zod";
import { rankCandidates, scoreResumeText } from "../services/resume-service";

const router = Router();

const scoreSchema = z.object({
  resumeText: z.string().min(50),
  jobDescription: z.string().min(50),
});

router.post("/score", async (req, res, next) => {
  try {
    const payload = scoreSchema.parse(req.body);
    const score = await scoreResumeText(payload);
    res.json(score);
  } catch (error) {
    next(error);
  }
});

const rankSchema = z.object({
  jobDescription: z.string().min(50),
  candidates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      resumeText: z.string().min(50),
    })
  ),
});

router.post("/rankings", async (req, res, next) => {
  try {
    const payload = rankSchema.parse(req.body);
    const ranking = await rankCandidates(payload);
    res.json(ranking);
  } catch (error) {
    next(error);
  }
});

export default router;
