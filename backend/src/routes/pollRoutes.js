const express = require("express");
const router = express.Router();
const pollController = require("../controllers/pollController");

router.post("/", pollController.createPoll);
router.get("/:id", pollController.getPollById);
router.post("/:id/vote", pollController.vote);
router.get("/:id/results", pollController.getResults);

module.exports = router;
