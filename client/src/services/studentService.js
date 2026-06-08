import axiosInstance from './axiosInstance'

const registerForEvent = async (eventId) => {
  const response = await axiosInstance.post(`/student/register/${eventId}`)
  return response.data
}

const getMyEvents = async () => {
  const response = await axiosInstance.get('/student/my-events')
  return response.data
}

const studentService = {
  registerForEvent,
  getMyEvents,
}

export default studentService
