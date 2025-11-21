import express from "express";
import { ReadingsController } from "../controllers/readingsController.js";

const router = express.Router();

// Base routes
router.get("/", ReadingsController.list);
router.post("/", ReadingsController.create);

// Analysis routes
router.get("/analysis", ReadingsController.listWithDifference);
router.get("/statistics", ReadingsController.getStatistics);
router.get("/top", ReadingsController.getTopByDifference);
router.get("/range", ReadingsController.getByDateRange);

// Single item routes
router.get("/latest", ReadingsController.latest);

export default router;