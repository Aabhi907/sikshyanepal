export const dynamic = 'force-dynamic'

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
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
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import ReviewForm from "@/components/colleges/ReviewForm";
import ApplyNowButton from "@/components/colleges/ApplyNowButton";
import AdUnit from "@/components/ads/AdUnit";
import type { College, CollegeProgram, Review } from "@/types";
import VerificationBadge from "@/components/institutions/VerificationBadge";
import ReportCorrectionForm from "@/components/institutions/ReportCorrectionForm";

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

const BASE_URL = "https://sikshyanepal.vercel.app";

async function getCollege(slug: string) {
  const supabase = createServerSupabaseClient();
  const { data: college } = await supabase
    .from("colleges")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!college) return null;

  // Start of this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [programsRes, reviewsRes, scholarshipsRes, leadsRes] = await Promise.all([
    supabase
      .from("college_programs")
      .select("*, program:programs(*)")
      .eq("college_id", college.id),
    supabase
      .from("reviews")
      .select("*")
      .eq("college_id", college.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("scholarships").select("*").eq("college_id", college.id),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("college_id", college.id)
      .gte("created_at", monthStart),
  ]);

  return {
    college: college as College,
    programs: (programsRes.data || []) as CollegeProgram[],
    reviews: (reviewsRes.data || []) as Review[],
    scholarships: scholarshipsRes.data || [],
    leadsCount: leadsRes.count || 0,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCollege(params.slug);
  if (!data) return { title: "College Not Found" };
  const { college } = data;
  return {
    title: `${college.name} | SikshyaNepal`,
    description:
      college.description ||
      `Learn about ${college.name} - programs, fees, reviews, scholarships and more.`,
    openGraph: {
      title: `${college.name} | SikshyaNepal`,
      description:
        college.description ||
        `Learn about ${college.name} - programs, fees, reviews and more.`,
      url: `${BASE_URL}/colleges/${college.slug}`,
      images: college.cover_url ? [{ url: college.cover_url }] : [],
    },
    alternates: { canonical: `${BASE_URL}/colleges/${college.slug}` },
  };
}

export default async function CollegeProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCollege(params.slug);
  if (!data) notFound();

  const { college, programs, reviews, scholarships, leadsCount } = data;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    description: college.description,
    url: college.website || `${BASE_URL}/colleges/${college.slug}`,
    logo: college.logo_url,
    image: college.cover_url,
    address: {
      "@type": "PostalAddress",
      addressLocality: college.location,
      addressCountry: "NP",
    },
    telephone: college.phone,
    email: college.email,
    foundingDate: college.established_year?.toString(),
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Script
        id="college-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              <p className="text-gray-600 leading-relaxed">
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
                <a href={college.source_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-blue-600">
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
            ) : (
              <p className="text-sm text-gray-500">No programs listed yet.</p>
            )}
          </div>

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
                          {review.student_name}
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
                <dd className="font-medium text-gray-800">{programs.length}</dd>
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
              leadsCount={leadsCount}
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
