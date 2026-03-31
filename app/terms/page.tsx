import Link from "next/link";

const sections = [
  {
    title: "Overview",
    body: "These Terms & Conditions govern your use of Virsa Marketplace. By creating an account or using our services, you agree to these terms.",
  },
  {
    title: "Account Eligibility",
    body: "You must provide accurate information and keep your account secure. You are responsible for all activity under your account.",
  },
  {
    title: "Orders and Payments",
    body: "Prices, fees, and taxes are shown at checkout. Orders are subject to acceptance and availability. We may cancel orders that violate these terms.",
  },
  {
    title: "User Content",
    body: "You retain ownership of your content but grant Virsa a license to display it in connection with the marketplace.",
  },
  {
    title: "Prohibited Use",
    body: "Do not misuse the platform, attempt unauthorized access, or violate applicable laws. Accounts involved in fraud or abuse may be suspended.",
  },
  {
    title: "Limitation of Liability",
    body: "Virsa is provided on an as-is basis. To the maximum extent permitted by law, Virsa is not liable for indirect or consequential damages.",
  },
  {
    title: "Changes",
    body: "We may update these terms periodically. Continued use of the platform means you accept the updated terms.",
  },
];

export const metadata = {
  title: "Terms & Conditions | Virsa Marketplace",
  description: "Terms & Conditions for using Virsa Marketplace.",
};

export default function TermsPage() {
  return (
    <div className="min-h-[70vh] bg-virsa-light/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[28px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Terms & Conditions
              </h1>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Effective: March 31, 2026
              </span>
            </div>

            <p className="text-gray-600 mt-4">
              Please read these terms carefully. If you do not agree, do not use the
              platform.
            </p>

            <div className="mt-8 space-y-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Questions? Contact support@virsasharedbypakistan.com
              </p>
              <Link
                href="/register"
                className="text-sm font-bold text-virsa-primary hover:underline"
              >
                Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
