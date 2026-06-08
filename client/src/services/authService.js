import axiosInstance from './axiosInstance'

const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData)
  return response.data
}

const login = async (userData) => {
  const response = await axiosInstance.post('/auth/login', userData)
  return response.data
}

const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgotpassword', { email })
  return response.data
}

const resetPassword = async (token, password) => {
  const response = await axiosInstance.put(`/auth/resetpassword/${token}`, { password })
  return response.data
}

const authService = {
  register,
  login,
  forgotPassword,
  resetPassword,
}

export default authService
