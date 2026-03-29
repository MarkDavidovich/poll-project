const db = require("../config/db");

const mapOption = (option) => ({
  id: option.id,
  text: option.option_text,
  votes: option.vote_count,
});

const mapResult = (option) => ({
  text: option.option_text,
  vote_count: option.vote_count,
});

const createPoll = async (req, res) => {
  const { question, options, creator_username } = req.body;
  const cleanedQuestion = question?.trim();
  const cleanedCreator = creator_username?.trim() || "Anonymous";
  const cleanedOptions = Array.isArray(options)
    ? options.map((option) => option?.trim()).filter(Boolean)
    : [];

  if (!cleanedQuestion || cleanedOptions.length < 2) {
    return res.status(400).json({ error: "Question and at least two options are required" });
  }

  try {
    const poll = await db.query(
      "INSERT INTO polls (question, creator_username) VALUES ($1, $2) RETURNING id",
      [cleanedQuestion, cleanedCreator]
    );
    const pollId = poll.rows[0].id;

    for (const text of cleanedOptions) {
      await db.query("INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2)", [pollId, text]);
    }

    res.status(201).json({ id: pollId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create poll" });
  }
};

const getPollById = async (req, res) => {
  try {
    const poll = await db.query("SELECT * FROM polls WHERE id = $1", [req.params.id]);
    if (poll.rows.length === 0) return res.status(404).json({ error: "Poll not found" });

    const options = await db.query("SELECT * FROM poll_options WHERE poll_id = $1", [req.params.id]);

    res.json({
      ...poll.rows[0],
      options: options.rows.map(mapOption),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const vote = async (req, res) => {
  const { id } = req.params;
  const { option_id, username } = req.body;
  const cleanedUsername = username?.trim();

  if (!option_id || !cleanedUsername) {
    return res.status(400).json({ error: "Option and username are required" });
  }

  try {
    await db.query("INSERT INTO votes (poll_id, option_id, username) VALUES ($1, $2, $3)", [
      id,
      option_id,
      cleanedUsername,
    ]);

    await db.query("UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = $1", [option_id]);

    res.json({ message: "Vote recorded!" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "You've already voted on this poll!" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to record vote" });
  }
};

const getResults = async (req, res) => {
  try {
    const poll = await db.query("SELECT question FROM polls WHERE id = $1", [req.params.id]);
    if (poll.rows.length === 0) return res.status(404).json({ error: "Poll not found" });

    const options = await db.query("SELECT option_text, vote_count FROM poll_options WHERE poll_id = $1", [req.params.id]);
    const totalVotes = options.rows.reduce((sum, opt) => sum + opt.vote_count, 0);

    res.json({
      question: poll.rows[0].question,
      totalVotes,
      results: options.rows.map(mapResult),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createPoll, getPollById, vote, getResults };
