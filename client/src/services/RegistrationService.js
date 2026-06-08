import axiosInstance from './axiosInstance'

const registerForEvent = async (registrationData) => {
  const config = registrationData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {}
  
  const response = await axiosInstance.post('/registrations', registrationData, config)
  return response.data
}

const getMyRegistrations = async () => {
  const response = await axiosInstance.get('/registrations/my')
  return response.data
}

export default {
  registerForEvent,
  getMyRegistrations
}
