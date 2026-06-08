import axiosInstance from './axiosInstance'

const getEvents = async () => {
  const response = await axiosInstance.get('/events')
  return response.data
}

const getEventById = async (id) => {
  const response = await axiosInstance.get(`/events/${id}`)
  return response.data
}

const createEvent = async (eventData) => {
  const response = await axiosInstance.post('/events', eventData)
  return response.data
}

const updateEvent = async (id, eventData) => {
  const response = await axiosInstance.put(`/events/${id}`, eventData)
  return response.data
}

const deleteEvent = async (id) => {
  const response = await axiosInstance.delete(`/events/${id}`)
  return response.data
}

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
}

export default eventService
