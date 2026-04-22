import { Router } from "express";
import { simulate, footprintDiffController } from "./controllers";

const router = Router();

// POST /simulate — accepts { xdr, network } and returns footprint + cost
router.post("/simulate", simulate);

// POST /footprint/diff — accepts { before, after } and returns added/removed ledger keys
router.post("/footprint/diff", footprintDiffController);

export default router;
