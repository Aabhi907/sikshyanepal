import Image from 'next/image'

export default function CommunityMedia({ url, type, compact = false }: { url?: string | null; type?: 'image' | 'video' | null; compact?: boolean }) {
  if (!url || !type) return null
  if (type === 'video') return <video src={url} controls preload="metadata" playsInline className={`w-full rounded-xl bg-black object-contain ${compact ? 'max-h-64' : 'max-h-[32rem]'}`}>Your browser does not support this video.</video>
  return <div className={`relative w-full overflow-hidden rounded-xl bg-gray-100 ${compact ? 'h-56' : 'h-[22rem] sm:h-[30rem]'}`}><Image src={url} alt="Image shared with this community post" fill sizes={compact ? '(max-width: 1024px) 100vw, 620px' : '(max-width: 768px) 100vw, 768px'} className="object-contain" /></div>
}
