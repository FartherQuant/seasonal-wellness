/**
 * 城市选择存储
 */

const CITY_KEY = 'selected_city'

export function getSelectedCity(): string | null {
  return localStorage.getItem(CITY_KEY)
}

export function setSelectedCity(city: string) {
  localStorage.setItem(CITY_KEY, city)
}

export function clearSelectedCity() {
  localStorage.removeItem(CITY_KEY)
}
