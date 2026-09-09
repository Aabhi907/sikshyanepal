import PolicyPage from '@/components/community/PolicyPage'

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Legal & trust" title="Privacy policy" intro="We collect only the information needed to run SikshyaNepal, protect students and meet legal obligations.">
    <h2>Accounts and public names</h2><p>Community participation requires Google authentication. Other users see only your chosen public name. SikshyaNepal&apos;s authorised administrators can link that name to the authenticated account, including its email and account identifier, for moderation, security and lawful requests.</p>
    <h2>Security information</h2><p>For abuse prevention we may record account ID, action type, date and time, and a one-way fingerprint derived from limited request information such as IP address and browser user-agent. The raw IP is not stored in the community tables. Security events are scheduled to expire after 180 days unless longer preservation is reasonably required for an active safety investigation, dispute or legal duty.</p>
    <h2>How information is used</h2><ul><li>Provide accounts, saved tools and community features.</li><li>Detect spam, repeated abuse and attempts to evade restrictions.</li><li>Review reports, enforce rules, protect users and respond to valid legal process.</li></ul>
    <h2>Sharing and deletion</h2><p>We do not publish your Google identity or sell it. Information may be disclosed when legally required or necessary to address an immediate safety threat. You may request account or content deletion at privacy@sikshyanepal.com; some minimal records may be retained where law or an active investigation requires it.</p>
    <h2>Children</h2><p>Students should not publish personal contact or location information. A parent or guardian may contact safety@sikshyanepal.com about a child&apos;s data or safety concern.</p>
  </PolicyPage>
}
