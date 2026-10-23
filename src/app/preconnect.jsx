'use client'
import ReactDOM from 'react-dom'

export function Preconnect() {
  // ReactDOM.preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
  // fonts.gstatic.com removed: next/font/google self-hosts Poppins at build time,
  // so the browser never contacts Google font servers at runtime.
  ReactDOM.preconnect('https://assets.sdlindia.com')
  return null
}
