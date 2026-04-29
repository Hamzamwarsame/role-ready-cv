import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: 14 March 2026</p>

        <div className="flex flex-col gap-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Acceptance of terms</h2>
            <p>
              By creating an account or using CV Tailor ("the Service"), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Description of service</h2>
            <p>
              CV Tailor is an AI-powered tool that helps you tailor your CV to specific job descriptions.
              The Service uses large language models to restructure and rewrite CV content based on
              the materials you provide. The Service does not guarantee employment outcomes or
              interview success.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Your account</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must not share your account with others or use another person's account.</li>
              <li>You must be at least 16 years old to use the Service.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>Use the Service to create CVs containing false or fabricated information that you then present as genuine to employers.</li>
              <li>Attempt to reverse engineer, scrape, or abuse the Service or its underlying API.</li>
              <li>Use automated tools to make excessive requests to the Service.</li>
              <li>Upload content that infringes third-party intellectual property rights.</li>
              <li>Use the Service for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. AI-generated content</h2>
            <p className="mb-3">
              The Service uses AI to generate CV content based solely on the information you provide.
              The AI is designed not to fabricate qualifications, experience, or facts not present
              in your original CV. However:
            </p>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>You are solely responsible for reviewing all AI-generated content before submitting it to any employer.</li>
              <li>You must ensure that your final CV is accurate and truthful.</li>
              <li>We do not accept liability for errors, omissions, or inaccuracies in AI-generated output.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Intellectual property</h2>
            <p>
              You retain ownership of the CV content and job descriptions you provide. By using the
              Service, you grant us a limited licence to process and store this content for the
              purpose of providing the Service. We do not claim ownership of your content and will
              not use it for any purpose beyond operating the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Limitation of liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. To the fullest extent
              permitted by law, CV Tailor shall not be liable for any indirect, incidental, special,
              or consequential damages arising from your use of the Service, including but not limited
              to loss of employment opportunities or reliance on AI-generated output.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Service availability</h2>
            <p>
              We do not guarantee uninterrupted access to the Service. We may modify, suspend, or
              discontinue the Service at any time without notice. We are not liable for any
              disruption or loss of data resulting from downtime.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Termination</h2>
            <p>
              You may delete your account at any time by contacting us. We may suspend or terminate
              your account if you breach these Terms. Upon termination, your stored CVs and tailoring
              history will be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. Updated terms will be posted on this page
              with a revised date. Continued use of the Service after changes constitutes your
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Governing law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">12. Contact</h2>
            <p>
              For any questions regarding these Terms, please contact us at{" "}
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
