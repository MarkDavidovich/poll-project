import { useState } from "react";
import { Plus, Rocket, Trash2, Copy, Check, Share2 } from "lucide-react";
import { createPoll } from "../utils/api";

const CreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creator, setCreator] = useState("");
  const [loading, setLoading] = useState(false);
  const [pollId, setPollId] = useState(null);
  const [copied, setCopied] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, optionIndex) => optionIndex !== index));
    }
  };

  const updateOption = (index, value) => {
    const nextOptions = [...options];
    nextOptions[index] = value;
    setOptions(nextOptions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || options.some((option) => !option.trim())) {
      return;
    }

    setLoading(true);
    try {
      const result = await createPoll({
        question: question.trim(),
        options: options.map((option) => option.trim()),
        creator_username: creator.trim() || "Anonymous",
      });
      setPollId(result.id);
    } catch {
      alert("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const pollUrl = pollId ? `${window.location.origin}/poll/${pollId}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pollId) {
    return (
      <section className="card">
        <div className="success-state">
          <h1 className="title">Poll Created!</h1>
          <p className="subtitle">
            Share this link so other people can open the poll and vote.
          </p>

          <div className="share-box">
            <Share2 size={18} />
            <span className="share-link">{pollUrl}</span>
            <button className="button" type="button" onClick={copyLink}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <button
            className="button button-primary button-full"
            type="button"
            onClick={() => window.location.reload()}
          >
            Create Another Poll
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h1 className="title">Create a Poll</h1>
      <p className="subtitle">One question, a few options, then share the link.</p>

      <form onSubmit={handleSubmit} className="form-stack">
        <label className="field">
          <span className="label">Question</span>
          <input
            className="input"
            placeholder="What's on your mind?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            required
          />
        </label>

        <div className="field">
          <span className="label">Options</span>
          <div className="form-stack">
            {options.map((option, index) => (
              <div className="option-row" key={index}>
                <input
                  className="input"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  required
                />
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            className="button button-full button-dashed"
            type="button"
            onClick={addOption}
            disabled={options.length >= 10}
          >
            <Plus size={18} />
            Add Option
          </button>
        </div>

        <label className="field">
          <span className="label">Your Name (Optional)</span>
          <input
            className="input"
            placeholder="Anonymous"
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
          />
        </label>

        <button className="button button-primary button-full" type="submit" disabled={loading}>
          <Rocket size={18} />
          {loading ? "Creating..." : "Launch Poll"}
        </button>
      </form>
    </section>
  );
};

export default CreatePoll;
