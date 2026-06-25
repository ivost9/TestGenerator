import express from "express";
import {
  createTest,
  downloadTestPDF,
  getMyTests,
} from "../controllers/testController.js"; // <- Промени getTestPdf на downloadTestPDF тук
import { protect } from "../middleware/authMiddleware.js";

const statusRouter = express.Router(); // или router, зависи как си го кръстил

const router = express.Router();

router.post("/generate", protect, createTest);
router.get("/my-tests", protect, getMyTests);
router.get("/:id/pdf", downloadTestPDF); // <- И тук го смени на downloadTestPDF

export default router;
