import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { castVote, getPoll, getResults } from "../utils/api";

const PollView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");
  const [voteMessageType, setVoteMessageType] = useState("");

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const data = await getPoll(id);
        if (data.error) {
          throw new Error(data.error);
        }
        setPoll(data);
      } catch (fetchError) {
        console.error("Poll fetch failed:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [id]);

  const loadResults = async () => {
    setLoading(true);
    setVoteMessage("");
    setVoteMessageType("");
    try {
      const data = await getResults(id);
      setResults(data);
      setShowingResults(true);
    } catch {
      alert("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !username.trim()) {
      return;
    }

    setVoting(true);
    setVoteMessage("");
    setVoteMessageType("");
    try {
      const response = await castVote(id, {
        option_id: selectedOption,
        username: username.trim(),
      });

      if (response.error) {
        setVoteMessage(response.error);
        setVoteMessageType("error");
      } else {
        await loadResults();
      }
    } catch {
      alert("Failed to cast vote");
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <section className="card">
        <h1 className="title">Loading...</h1>
      </section>
    );
  }

  if (!poll) {
    return (
      <section className="card">
        <h1 className="title">Poll not found</h1>
      </section>
    );
  }

  return (
    <section className="card">
      <button className="button" type="button" onClick={() => navigate("/")}>
        <ArrowLeft size={16} />
        Back to Poll Creation
      </button>

      <h1 className="title title-left">{poll.question}</h1>
      <p className="subtitle subtitle-left">
        Created by <strong>{poll.creator_username || "Anonymous"}</strong>
      </p>

      {showingResults && results ? (
        <div className="form-stack">
          <h2 className="section-title">Current Results</h2>
          {results.results.map((option) => {
            const percentage = results.totalVotes
              ? Math.round((option.vote_count / results.totalVotes) * 100)
              : 0;

            return (
              <div className="result-row" key={option.text}>
                <div className="result-meta">
                  <span>{option.text}</span>
                  <span>
                    {option.vote_count} votes ({percentage}%)
                  </span>
                </div>
                <div className="result-bar">
                  <div className="result-bar-fill" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}

          <p className="subtitle">Total Votes: {results.totalVotes}</p>
          <button className="button button-full" type="button" onClick={() => setShowingResults(false)}>
            Back to Voting
          </button>
        </div>
      ) : (
        <div className="form-stack">
          <div className="form-stack">
            {poll.options.map((option) => (
              <label
                className={`option-label ${selectedOption === option.id ? "selected" : ""}`}
                key={option.id}
              >
                <input
                  type="radio"
                  name="option"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>

          <label className="field">
            <span className="label">Enter your name to vote</span>
            <input
              className="input"
              placeholder="e.g. John Doe"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (voteMessage) {
                  setVoteMessage("");
                  setVoteMessageType("");
                }
              }}
            />
          </label>

          {voteMessage ? (
            <p className={`feedback-message ${voteMessageType === "error" ? "feedback-error" : ""}`}>
              {voteMessage}
            </p>
          ) : null}

          <div className="button-row">
            <button
              className="button button-primary button-grow"
              type="button"
              onClick={handleVote}
              disabled={!selectedOption || !username.trim() || voting}
            >
              <CheckCircle2 size={18} />
              {voting ? "Voting..." : "Cast Vote"}
            </button>
            <button className="button button-grow" type="button" onClick={loadResults}>
              <Eye size={18} />
              Results
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PollView;
