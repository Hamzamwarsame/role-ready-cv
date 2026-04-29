"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  History,
  FileDown,
  ArrowRight,
  Zap,
  Bot,
} from "lucide-react";
import { isAuthenticated } from "./lib/auth";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "GPT-4 rewrites your summary and bullet points to match each job description — without inventing qualifications.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Ethical by Design",
    description:
      "Every suggestion is grounded in your real experience. Skill gaps are flagged as warnings, never fabricated.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: History,
    title: "Full Version History",
    description:
      "Every tailoring session is saved. Browse past runs, compare results, and never lose a previous version.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: FileDown,
    title: "DOCX Export",
    description:
      "Download any tailored CV as a formatted Word document in one click, ready for submission.",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Paste a job description, click Tailor Now, and see AI-generated suggestions in seconds.",
    gradient: "from-indigo-600 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Keyword Intelligence",
    description:
      "Matched keywords are surfaced visually, helping you understand how well your CV aligns with the role.",
    gradient: "from-fuchsia-500 to-violet-600",
  },
];

const steps = [
  { step: "01", title: "Store your CV", body: "Paste your base CV once. It is stored securely and never overwritten." },
  { step: "02", title: "Paste a job description", body: "Drop in any job listing. Our AI reads and understands the requirements." },
  { step: "03", title: "Get tailored suggestions", body: "Receive a rewritten summary, bullet points, and a keyword match report." },
  { step: "04", title: "Export and apply", body: "Download a polished DOCX file and submit with confidence." },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-full bg-[#120A06] text-white overflow-auto">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#120A06]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CV Tailor</span>
            <span className="text-[10px] font-medium text-[#FF9F4A] bg-[#EA580C]/10 border border-[#EA580C]/20 rounded-full px-2 py-0.5 ml-1">
              AI
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#EA580C] hover:bg-[#C2410C] transition-colors rounded-lg px-4 py-2"
          >
            Launch App
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#EA580C]/15 blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#F43F5E]/12 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#F97316]/10 blur-[80px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#FF9F4A] bg-[#EA580C]/10 border border-[#EA580C]/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
            AI-Powered · Fast · Free to use
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Tailor your CV to{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #F97316 0%, #FB7185 100%)' }}>
              every job
            </span>
            <br />
            with AI.
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed">
            Stop sending the same CV everywhere. Let AI reshape your experience
            to match each job description — ethically, transparently, and in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]"
            style={{ background: 'linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)' }}
            >
              Start Tailoring
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all bg-white/5 hover:bg-white/10"
            >
              How it works
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {["No fabricated skills", "Full version history", "DOCX export", "Keyword matching"].map((item) => (
              <span key={item} className="text-xs text-white/35 border border-white/8 rounded-full px-3 py-1">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9F4A] mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to stand out</h2>
            <p className="text-white/40 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
              A complete system for CV tailoring — built for job seekers who value authenticity and want results.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group relative rounded-2xl bg-white/4 border border-white/8 p-6 hover:bg-white/6 hover:border-white/15 transition-all overflow-hidden">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#EA580C]/5 to-transparent pointer-events-none" />
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} mb-4 shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9F4A] mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Four steps to a tailored CV</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="rounded-2xl bg-white/4 border border-white/8 p-6 flex gap-4">
                <span className="text-2xl font-bold text-white/10 font-mono shrink-0 leading-none mt-0.5">{s.step}</span>
                <div>
                  <h3 className="font-semibold text-sm text-white mb-1.5">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to tailor your CV?</h2>
          <p className="text-white/40 text-sm">Create a free account and start tailoring in minutes.</p>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]"
            style={{ background: 'linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)' }}
          >
            <Sparkles className="w-4 h-4" />
            Start Tailoring for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F97316,#F43F5E)' }}>
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
