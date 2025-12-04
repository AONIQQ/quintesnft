import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MintHero from "@/components/mint/MintHero";
import MintPanel from "@/components/mint/MintPanel";
import AboutSection from "@/components/sections/AboutSection";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden bg-black">
      {/* Grid Background */}
      <div className="quintes-grid-bg" />

      {/* Radial Glow */}
      <div className="quintes-radial-glow" />

      {/* Decorative Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-10" viewBox="0 0 600 600" fill="none">
          <path d="M0 600L600 0" stroke="#AAA9AC" strokeWidth="1" />
          <path d="M100 600L600 100" stroke="#AAA9AC" strokeWidth="1" />
          <path d="M200 600L600 200" stroke="#AAA9AC" strokeWidth="1" />
        </svg>
        <svg className="absolute -bottom-20 -left-20 w-[600px] h-[600px] opacity-10" viewBox="0 0 600 600" fill="none">
          <path d="M0 0L600 600" stroke="#AAA9AC" strokeWidth="1" />
          <path d="M0 100L500 600" stroke="#AAA9AC" strokeWidth="1" />
          <path d="M0 200L400 600" stroke="#AAA9AC" strokeWidth="1" />
        </svg>
      </div>

      <Header />

      {/* Hero + Mint Section */}
      <section className="flex-1 w-full max-w-7xl px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="order-2 lg:order-1">
          <MintHero />
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <MintPanel />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-quintes-border/30 to-transparent" />

      {/* About Section */}
      <AboutSection />

      {/* Divider */}
      <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-quintes-border/30 to-transparent" />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
