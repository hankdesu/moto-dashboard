export const CookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax; Secure`
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=; Max-Age=0; Path=/;`
  },
}
