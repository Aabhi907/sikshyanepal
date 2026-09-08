export const dynamic = 'force-dynamic'

import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Calendar,
  GraduationCap,
  ExternalLink,
  BadgeCheck,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import ReviewForm from "@/components/colleges/ReviewForm";
import ReviewResponseForm from "@/components/colleges/ReviewResponseForm";
import ApplyNowButton from "@/components/colleges/ApplyNowButton";
import SaveCollegeButton from "@/components/colleges/SaveCollegeButton";
import AdUnit from "@/components/ads/AdUnit";
import type { College, CollegeProgram, Review, News } from "@/types";
import VerificationBadge from "@/components/institutions/VerificationBadge";
import ReportCorrectionForm from "@/components/institutions/ReportCorrectionForm";
import AdmissionCard from "@/components/admissions/AdmissionCard";
import ShareButton from "@/components/ui/ShareButton";
import type { Admission } from "@/types";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, SITE_URL } from "@/lib/seo";

// Affiliation → gradient config
const AFFIL_COVER: Record<string, { gradient: string; pattern: string }> = {
  "Tribhuvan University": {
    gradient: "from-blue-700 via-blue-600 to-indigo-700",
    pattern: "bg-blue-500/10",
  },
  "Kathmandu University": {
    gradient: "from-emerald-700 via-emerald-600 to-teal-700",
    pattern: "bg-emerald-500/10",
  },
  "Pokhara University": {
    gradient: "from-orange-600 via-amber-500 to-yellow-600",
    pattern: "bg-orange-500/10",
  },
  "Purbanchal University": {
    gradient: "from-purple-700 via-purple-600 to-violet-700",
    pattern: "bg-purple-500/10",
  },
};
const DEFAULT_COVER = {
  gradient: "from-slate-700 via-slate-600 to-slate-800",
  pattern: "bg-slate-500/10",
};

function getCoverStyle(affiliation: string | null | undefined) {
  if (!affiliation) return DEFAULT_COVER;
  for (const [key, val] of Object.entries(AFFIL_COVER)) {
    if (affiliation.includes(key.split(" ")[0])) return val; // match by first word e.g. "Tribhuvan"
  }
  return DEFAULT_COVER;
}

const BASE_URL = SITE_URL;

const getCollege = cache(async function getCollege(slug: string) {
  const supabase = createServerSupabaseClient();
  const { data: college } = await supabase
    .from("colleges")
    .select("*")
    .eq("slug", slug)
    .or("status.eq.active,status.is.null")
    .single();

  if (!college) return null;

  const [programsRes, reviewsRes, scholarshipsRes, admissionsRes, newsRes] = await Promise.all([
    supabase
      .from("college_programs")
      .select("*, program:programs(*)")
      .eq("college_id", college.id),
    supabase
      .from("reviews")
      .select("*, review_responses(*)")
      .eq("college_id", college.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("scholarships").select("*").eq("college_id", college.id),
    supabase
      .from("admissions")
      .select("*, college:colleges(id,name,slug,location)")
      .eq("college_id", college.id)
      .eq("status", "published")
      .order("application_deadline", { ascending: true })
      .limit(4),
    supabase.from("news").select("id,title,slug,published_date,content_category").eq("college_id", college.id).eq("status", "published").order("published_date", { ascending: false }).limit(5),
  ]);

  return {
    college: college as College,
    programs: (programsRes.data || []) as CollegeProgram[],
    reviews: (reviewsRes.data || []) as Review[],
    scholarships: scholarshipsRes.data || [],
    admissions: (admissionsRes.data || []) as Admission[],
    news: (newsRes.data || []) as News[],
  };
})

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCollege(params.slug);
  if (!data) return { title: "College Not Found" };
  const { college } = data;
  return {
    title: `${college.name}: Programs, Admissions and Verified Details`,
    description:
      college.description ||
      `Explore ${college.name} programs, affiliation, location, admissions, scholarships and verified college updates. Check original sources before applying.`,
    openGraph: {
      title: `${college.name} | SikshyaNepal`,
      description:
        college.description ||
        `Learn about ${college.name} - programs, fees, reviews and more.`,
      url: `${BASE_URL}/colleges/${college.slug}`,
      images: college.cover_url ? [{ url: college.cover_url }] : [],
    },
    alternates: { canonical: `${BASE_URL}/colleges/${college.slug}` },
    robots: { index: college.status !== 'pending_review', follow: true, googleBot: { index: college.status !== 'pending_review', follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  };
}

export default async function CollegeProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCollege(params.slug);
  if (!data) notFound();

  const { college, programs, reviews, scholarships, admissions, news } = data;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;
  const linkedProgramNames = programs.map(item => item.program?.name).filter((name): name is string => Boolean(name));
  const fallbackProgramNames = (college.programs_offered || '').split(';').map(name => name.trim()).filter(Boolean);
  const programNames = linkedProgramNames.length ? linkedProgramNames : fallbackProgramNames;
  const levelNames = (college.education_levels || []).map(level => ({ plus_two: '+2', bachelor: 'Bachelor', master: 'Master', mphil: 'MPhil', phd: 'PhD', diploma: 'Diploma', certificate: 'Certificate' }[level] || level));
  const place = [college.local_level, college.district, college.province].filter(Boolean).join(', ') || college.location;
  const facts = [
    place ? { question: `Where is ${college.name} located?`, answer: `${college.name} is listed in ${place}, Nepal. Check the official contact page before travelling to the campus.` } : null,
    college.affiliation ? { question: `Which university is ${college.name} affiliated with?`, answer: `${college.name} is listed as affiliated with ${college.affiliation}. Students should confirm the affiliation for their specific programme and intake.` } : null,
    levelNames.length ? { question: `What study levels does ${college.name} offer?`, answer: `The profile currently lists ${levelNames.join(', ')} study options. Programme availability can change between admission cycles.` } : null,
    programNames.length ? { question: `What can I study at ${college.name}?`, answer: `Listed programmes include ${programNames.slice(0, 6).join(', ')}${programNames.length > 6 ? ` and ${programNames.length - 6} more` : ''}. Open the programme section and verify the current intake with the college.` } : null,
    { question: `How can I verify information about ${college.name}?`, answer: college.source_name ? `This profile was checked against ${college.source_name}. Use the visible source link and last-verified date, then confirm changing details such as fees, seats and deadlines with the college.` : `Use the college's official website and contact details to confirm programmes, fees, seats and deadlines before applying.` },
  ].filter((fact): fact is { question: string; answer: string } => Boolean(fact));

  const pageUrl = absoluteUrl(`/colleges/${college.slug}`)
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    {
      "@type": "CollegeOrUniversity", "@id": `${pageUrl}#college`, name: college.name,
      description: college.description || undefined, url: pageUrl, logo: college.logo_url || undefined,
      image: college.cover_url || undefined,
      address: { "@type": "PostalAddress", streetAddress: college.address || undefined, addressLocality: college.local_level || college.location, addressRegion: college.province || undefined, addressCountry: "NP" },
      telephone: college.phone || undefined, email: college.email || undefined,
      foundingDate: college.established_year?.toString(), sameAs: college.website ? [college.website] : undefined,
      hasOfferCatalog: programNames.length ? { '@type': 'OfferCatalog', name: `Programs at ${college.name}`, itemListElement: programNames.slice(0, 20).map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Course', name, provider: { '@id': `${pageUrl}#college` } } })) } : undefined,
      ...(avgRating && { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviews.length, bestRating: "5", worstRating: "1" } }),
    },
    { "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: `${college.name} college profile`, mainEntity: { "@id": `${pageUrl}#college` }, dateModified: college.last_verified_at || college.created_at, citation: college.source_url || undefined, isPartOf: { "@id": `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name: college.name, path: `/colleges/${college.slug}` }]),
    { '@type': 'FAQPage', '@id': `${pageUrl}#questions`, mainEntity: facts.map(fact => ({ '@type': 'Question', name: fact.question, acceptedAnswer: { '@type': 'Answer', text: fact.answer } })) },
  ] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={jsonLd} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/colleges" className="hover:text-blue-600">
          Colleges
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{college.name}</span>
      </nav>

      {/* Hero */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 shadow-card">
        {/* Cover — real image if available, else a beautiful gradient */}
        <div
          className={`h-[200px] relative overflow-hidden mb-12 bg-gradient-to-br ${getCoverStyle(college.affiliation).gradient}`}
        >
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={`${college.name} cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <>
              {/* Dot-grid texture overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              {/* Affiliation label top-left — no name duplication */}
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-semibold tracking-wide backdrop-blur-sm">
                  {college.affiliation ?? "College"}
                </span>
              </div>
            </>
          )}

          {college.is_featured && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-white shadow-sm">
                ★ Featured College
              </span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          {/* Logo — circle avatar floating over cover */}
          {(() => {
            const aff = college.affiliation ?? ''
            const avatarGradient = aff.includes('Tribhuvan')
              ? 'from-blue-500 to-blue-700'
              : aff.includes('Kathmandu')
              ? 'from-emerald-500 to-emerald-700'
              : aff.includes('Pokhara')
              ? 'from-amber-400 to-orange-600'
              : aff.includes('Purbanchal')
              ? 'from-purple-500 to-purple-700'
              : 'from-[#1847c4] to-blue-800'
            return (
              <div className="w-16 h-16 -mt-8 ml-6 mb-4 rounded-full ring-4 ring-white shadow-md flex-shrink-0 overflow-hidden relative">
                {college.logo_url ? (
                  <Image
                    src={college.logo_url}
                    alt={`${college.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full bg-white"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}>
                    <span className="text-white font-bold text-2xl">{college.name.charAt(0)}</span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Name + meta — sits fully inside the white card, no overlap */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-ink leading-tight">
              {college.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2"><SaveCollegeButton collegeId={college.id} /><ShareButton title={`${college.name} | SikshyaNepal`} /></div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <VerificationBadge status={college.verification_status} />
              {college.affiliation && (
                <Badge variant="blue">{college.affiliation}</Badge>
              )}
              {college.established_year && (
                <span className="flex items-center gap-1 text-xs text-ink-secondary">
                  <Calendar className="w-3.5 h-3.5" /> Est.{" "}
                  {college.established_year}
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1 text-xs text-ink-secondary font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {avgRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {college.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> {college.location}
              </span>
            )}
            {college.phone && (
              <a
                href={`tel:${college.phone}`}
                className="flex items-center gap-1.5 hover:text-blue-600"
              >
                <Phone className="w-4 h-4 text-gray-400" /> {college.phone}
              </a>
            )}
            {college.email && (
              <a
                href={`mailto:${college.email}`}
                className="flex items-center gap-1.5 hover:text-blue-600"
              >
                <Mail className="w-4 h-4 text-gray-400" /> {college.email}
              </a>
            )}
            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-600"
              >
                <Globe className="w-4 h-4 text-gray-400" /> Official Website{" "}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {college.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                {college.description}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Source and verification</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {college.source_name
                    ? `Checked against ${college.source_name}.`
                    : 'A primary source has not yet been documented for this profile.'}
                </p>
              </div>
              <VerificationBadge status={college.verification_status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
              {college.last_verified_at && (
                <span className="text-gray-500">
                  Last verified {new Date(college.last_verified_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {college.source_url && (
                <a href={college.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-600">
                  Open source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <ReportCorrectionForm entityType="college" entityId={college.id} entityName={college.name} />
            </div>
          </div>

          {/* Programs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Programs Offered
              </h2>
            </div>
            {programs.length > 0 ? (
              <div className="space-y-3">
                {[...programs]
                  // +2 programs float to the top
                  .sort((a, b) => {
                    const aIs2 = a.program?.degree_level === '+2'
                    const bIs2 = b.program?.degree_level === '+2'
                    if (aIs2 && !bIs2) return -1
                    if (!aIs2 && bIs2) return  1
                    return 0
                  })
                  .map((cp) => {
                    const isPlus2 = cp.program?.degree_level === '+2'
                    return (
                      <div
                        key={cp.program_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {cp.program?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Show +2 badge for intermediate programs, faculty badge otherwise */}
                            {isPlus2
                              ? <Badge variant="blue">+2</Badge>
                              : <Badge variant="gray">{cp.program?.faculty}</Badge>
                            }
                            <span className="text-xs text-gray-500">
                              {isPlus2 ? '2 Years (+2)' : cp.program?.duration}
                            </span>
                            {cp.scholarship_available && (
                              <Badge variant="green">Scholarship Available</Badge>
                            )}
                          </div>
                        </div>
                        {cp.fee && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              NPR {cp.fee.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">per year</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            ) : college.programs_offered ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {college.programs_offered.split(';').map((program) => program.trim()).filter(Boolean).map((program) => (
                    <div key={program} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700">
                      {program}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-gray-500">
                  Program list is from the college research pack. Confirm current intakes and eligibility on the official website before applying.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No programs listed yet.</p>
            )}
          </div>

          {admissions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div><h2 className="text-lg font-semibold text-gray-900">Admissions open</h2><p className="mt-1 text-sm text-gray-500">Verified opportunities and deadlines from this college.</p></div>
                <Link href={`/admissions?q=${encodeURIComponent(college.name)}`} className="text-sm font-semibold text-blue-600">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">{admissions.map((admission) => <AdmissionCard key={admission.id} admission={admission} />)}</div>
            </div>
          )}

          {news.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6" aria-labelledby="college-news-heading">
              <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="college-news-heading" className="text-lg font-semibold text-gray-900">Latest updates from {college.name}</h2><p className="mt-1 text-sm text-gray-500">Admissions, results, achievements and campus events with original sources.</p></div><Link href={`/news?q=${encodeURIComponent(college.name)}`} className="whitespace-nowrap text-sm font-semibold text-blue-600">All updates</Link></div>
              <div className="divide-y divide-gray-100">{news.map(article => <Link key={article.id} href={`/news/${article.slug}`} className="group flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{article.content_category?.replaceAll('_', ' ') || 'College news'}</p><h3 className="mt-1 text-sm font-semibold text-gray-800 group-hover:text-blue-700">{article.title}</h3></div><span className="text-xs text-gray-400">{new Date(article.published_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span></Link>)}</div>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-6" aria-labelledby="student-questions-heading">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Quick answers</p>
            <h2 id="student-questions-heading" className="mt-2 text-lg font-semibold text-gray-900">Questions students ask about {college.name}</h2>
            <div className="mt-5 divide-y divide-gray-100">{facts.map(fact => <details key={fact.question} className="group py-4 first:pt-0 last:pb-0"><summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900 marker:hidden">{fact.question}<span className="float-right text-blue-600 group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{fact.answer}</p></details>)}</div>
          </section>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Student Reviews
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          <span className="inline-flex items-center gap-1">{review.student_name}{review.verification_status === 'verified' && <><BadgeCheck className="h-3.5 w-3.5 text-blue-600" /><span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Verified student</span></>}</span>
                        </p>
                        {review.program && (
                          <p className="text-xs text-gray-500">
                            {review.program} {review.year && `• ${review.year}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {review.review_text}
                    </p>
                    {(review as Review & { review_responses?: { id: string; response_text: string; status: string; created_at: string }[] }).review_responses?.filter(response => response.status === 'published').map(response => <div key={response.id} className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Institution response</p><p className="mt-1 leading-6">{response.response_text}</p></div>)}
                    {Object.entries({ Teaching: review.teaching_rating, Facilities: review.facilities_rating, Administration: review.administration_rating, Value: review.value_rating, Placement: review.placement_rating, Attendance: review.attendance_rating, Safety: review.safety_rating, Internships: review.internship_support_rating }).some(([, value]) => value != null) && <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">{Object.entries({ Teaching: review.teaching_rating, Facilities: review.facilities_rating, Administration: review.administration_rating, Value: review.value_rating, Placement: review.placement_rating, Attendance: review.attendance_rating, Safety: review.safety_rating, Internships: review.internship_support_rating }).filter(([, value]) => value != null).map(([label, value]) => <span key={label} className="rounded-full bg-gray-100 px-2 py-1">{label} {value}/5</span>)}{review.hidden_costs_reported && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">Student reported unclear costs</span>}</div>}
                    {review.hostel_transport_note && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600"><strong>Student note:</strong> {review.hostel_transport_note}</p>}
                    <ReviewResponseForm reviewId={review.id} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* Write a Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Write a Review
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share your experience to help other students
            </p>
            <ReviewForm collegeId={college.id} collegeName={college.name} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              {college.affiliation && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Affiliation</dt>
                  <dd className="font-medium text-gray-800 text-right">
                    {college.affiliation}
                  </dd>
                </div>
              )}
              {college.established_year && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Established</dt>
                  <dd className="font-medium text-gray-800">
                    {college.established_year}
                  </dd>
                </div>
              )}
              {college.location && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-800">
                    {college.location}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Programs Offered</dt>
                <dd className="font-medium text-gray-800">
                  {programs.length || (college.programs_offered ? college.programs_offered.split(';').filter(Boolean).length : 0)}
                </dd>
              </div>
            </dl>
            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Visit Official Website <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Apply Now CTA */}
            <ApplyNowButton
              collegeName={college.name}
              collegeId={college.id}
              isFeatured={college.is_featured}
              programs={programs
                .map(cp => cp.program?.name)
                .filter((n): n is string => !!n)
                .map(name => ({ name }))}
            />
          </div>

          {/* Ad — below Quick Info */}
          <AdUnit
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? ''}
            format="rectangle"
            className="flex justify-center"
          />

          {/* Scholarships */}
          {scholarships.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Scholarships</h3>
              <div className="space-y-3">
                {scholarships.map(
                  (s: {
                    id: string;
                    title: string;
                    amount?: number | null;
                    deadline?: string | null;
                  }) => (
                    <div
                      key={s.id}
                      className="p-3 bg-green-50 rounded-lg border border-green-100"
                    >
                      <p className="font-medium text-gray-800 text-sm">
                        {s.title}
                      </p>
                      {s.amount && (
                        <p className="text-xs text-green-700 mt-1">
                          Up to NPR {s.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Compare CTA */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
            <h3 className="font-semibold text-blue-900 mb-2">
              Compare Colleges
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Compare {college.name} with other colleges side-by-side.
            </p>
            <Link
              href={`/compare?college1=${college.slug}`}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Compare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
