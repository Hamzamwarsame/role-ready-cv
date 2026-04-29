import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#120A06] text-white">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#120A06]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F97316] to-[#F43F5E] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CV Tailor</span>
          </Link>
          <Link
            href="/tailor"
            className="text-sm font-medium text-white bg-[#EA580C] hover:bg-[#C2410C] transition-colors rounded-lg px-4 py-2"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: 14 March 2026</p>

        <div className="flex flex-col gap-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Who we are</h2>
            <p>
              CV Tailor ("we", "us", "our") is an AI-powered CV tailoring service. This Privacy Policy
              explains how we collect, use, and protect your personal information when you use our website
              and application at cvtailor.com.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Information we collect</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li><span className="text-white font-medium">Account information:</span> Your email address and a hashed version of your password when you register.</li>
              <li><span className="text-white font-medium">CV content:</span> The CV text you upload or paste into the application.</li>
              <li><span className="text-white font-medium">Job descriptions:</span> Job description text you provide when running a tailoring session.</li>
              <li><span className="text-white font-medium">Tailoring results:</span> The AI-generated output from each tailoring session, stored so you can access your history.</li>
              <li><span className="text-white font-medium">Usage data:</span> Standard server logs including IP addresses and request timestamps, used for security and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. How we use your information</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>To provide the CV tailoring service, including sending your CV and job description to OpenAI's API to generate tailored output.</li>
              <li>To store your CVs and tailoring history so you can access them across sessions.</li>
              <li>To authenticate your account and keep your data secure.</li>
              <li>To enforce rate limits and protect against abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Third-party services</h2>
            <p className="mb-3">
              We use <span className="text-white font-medium">OpenAI</span> to process your CV and job description text.
              When you trigger a tailoring session, your CV text and the job description are sent to OpenAI's API.
              OpenAI's data handling is governed by their{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#FF9F4A] hover:text-[#FFBE7A] underline">
                Privacy Policy
              </a>.
              We do not use your data to train AI models.
            </p>
            <p>
              Our database is hosted on a third-party cloud provider. Your data is stored securely with
              encryption at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Data retention</h2>
            <p>
              Your account data, CVs, and tailoring history are retained for as long as your account is
              active. You can delete individual CVs (and all associated tailoring runs) from within the
              application. To request full account deletion, contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Data security</h2>
            <p>
              Passwords are hashed using bcrypt and never stored in plain text. All communication between
              your browser and our servers uses HTTPS. Access tokens expire after 7 days. We apply
              rate limiting to prevent abuse.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Your rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Object to or restrict certain processing of your data.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at the email address below.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              We do not use tracking cookies. Authentication state is stored in your browser's
              local storage and is not shared with any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated date. Continued use of the service after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or how your data is handled,
              please contact us at{" "}
              <a href="mailto:admincvtailor@gmail.com" className="text-[#FF9F4A] hover:text-[#FFBE7A] underline">
                admincvtailor@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#F97316] to-[#F43F5E] flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-medium text-white/40">CV Tailor</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <span suppressHydrationWarning>© {new Date().getFullYear()} CV Tailor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
