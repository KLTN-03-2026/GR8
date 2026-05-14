import api from "../api/axios";

export const sendChatbotMessage = async (sessionId, message) => {
  const response = await api.post("/chatbot/message", {
    sessionId,
    message,
  });
  return response.data.data;
};

export const fetchChatHistory = async (sessionId) => {
  const response = await api.get(`/chatbot/session/${sessionId}`);
  return response.data.data;
};

export const fetchMySession = async () => {
  const response = await api.get("/chatbot/my-session");
  return response.data.data; // { SessionID, ID, ... } hoặc null
};
