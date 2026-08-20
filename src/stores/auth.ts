import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref<boolean>(false)

  // Initialize from localStorage
  const savedUser = localStorage.getItem('nunox_user')
  if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    try {
      const user = JSON.parse(savedUser) as User
      currentUser.value = user
      isLoggedIn.value = true
    } catch (e) {
      console.error('Failed to parse user from localStorage', e)
      localStorage.removeItem('nunox_user')
    }
  }

  function login(user: User) {
    currentUser.value = user
    isLoggedIn.value = true
    localStorage.setItem('nunox_user', JSON.stringify(user))
  }

  function logout() {
    currentUser.value = null
    isLoggedIn.value = false
    localStorage.removeItem('nunox_user')
  }

  return {
    currentUser,
    isLoggedIn,
    login,
    logout
  }
})
