import axios from 'axios';

const EVENTS_URL = 'http://localhost:3001/api/events';
const PARTICIPANTS_URL = 'http://localhost:3002/api/participants';
const REGISTRATIONS_URL = 'http://localhost:3003/api/registrations';

// --- Events API ---
export const fetchEvents = async (params = {}) => {
  const response = await axios.get(EVENTS_URL, { params });
  return response.data;
};

export const createEventApi = async (eventData) => {
  const response = await axios.post(EVENTS_URL, eventData);
  return response.data;
};

export const updateEventApi = async (id, eventData) => {
  const response = await axios.put(`${EVENTS_URL}/${id}`, eventData);
  return response.data;
};

export const deleteEventApi = async (id) => {
  const response = await axios.delete(`${EVENTS_URL}/${id}`);
  return response.data;
};

// --- Participants API ---
export const fetchParticipants = async (params = {}) => {
  const response = await axios.get(PARTICIPANTS_URL, { params });
  return response.data;
};

export const createParticipantApi = async (participantData) => {
  const response = await axios.post(PARTICIPANTS_URL, participantData);
  return response.data;
};

export const updateParticipantApi = async (id, participantData) => {
  const response = await axios.put(`${PARTICIPANTS_URL}/${id}`, participantData);
  return response.data;
};

export const deleteParticipantApi = async (id) => {
  const response = await axios.delete(`${PARTICIPANTS_URL}/${id}`);
  return response.data;
};

// --- Registrations API ---
export const registerParticipantApi = async (data) => {
  const response = await axios.post(REGISTRATIONS_URL, data);
  return response.data;
};

export const deleteRegistrationApi = async (id) => {
  const response = await axios.delete(`${REGISTRATIONS_URL}/${id}`);
  return response.data;
};

export const fetchEventRegistrationsApi = async (eventId) => {
  const response = await axios.get(`${REGISTRATIONS_URL}/event/${eventId}`);
  return response.data;
};

export const fetchStatsApi = async () => {
  const response = await axios.get(`${REGISTRATIONS_URL}/stats`);
  return response.data;
};
