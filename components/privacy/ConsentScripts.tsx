'use client'
import Script from 'next/script'
import { useEffect,useState } from 'react'
import { CONSENT_KEY,ConsentChoice } from './CookieConsent'
export default function ConsentScripts(){const[marketing,setMarketing]=useState(false);useEffect(()=>{const read=(choice?:ConsentChoice)=>{if(choice)return setMarketing(choice.marketing);try{setMarketing(Boolean(JSON.parse(localStorage.getItem(CONSENT_KEY)||'{}').marketing))}catch{setMarketing(false)}};read();const changed=(event:Event)=>read((event as CustomEvent<ConsentChoice>).detail);window.addEventListener('sn-consent-changed',changed);return()=>window.removeEventListener('sn-consent-changed',changed)},[]);const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;return marketing&&client?<Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} crossOrigin="anonymous" strategy="afterInteractive"/>:null}
