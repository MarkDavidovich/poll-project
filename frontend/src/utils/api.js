const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/polls";

export const createPoll = async (pollData) => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pollData),
  });
  return response.json();
};

export const getPoll = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`);
  return response.json();
};

export const castVote = async (id, voteData) => {
  const response = await fetch(`${API_BASE}/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voteData),
  });
  return response.json();
};

export const getResults = async (id) => {
  const response = await fetch(`${API_BASE}/${id}/results`);
  return response.json();
};
