'use client'
export default function CookieSettingsButton(){return <button onClick={()=>window.dispatchEvent(new Event('sn-open-cookie-settings'))} className="hover:text-white transition-colors duration-150">Cookie settings</button>}
