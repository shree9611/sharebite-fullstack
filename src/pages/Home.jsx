import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Home() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["how-it-works", "core-features"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-80px 0px -35% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 100) setActiveSection("home");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = (id) =>
    `text-sm font-semibold transition ${
      activeSection === id ? "text-emerald-500" : "text-slate-600 hover:text-emerald-500"
    }`;

  return (
    <div className="overflow-x-hidden font-[Poppins] bg-white text-slate-900 scroll-smooth">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="material-symbols-outlined text-green-500">volunteer_activism</span>
            {t("ShareBite")}
          </div>

          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>

          <nav className="hidden sm:flex items-center gap-6 md:gap-8">
            <a href="#" className={navClass("home")}>
              {t("Home")}
            </a>
            <a href="#how-it-works" className={navClass("how-it-works")}>
              {t("How It Works")}
            </a>
            <a href="#core-features" className={navClass("core-features")}>
              {t("Features")}
            </a>

            <Link
              to="/account-details"
              className="rounded-full border border-emerald-500 px-5 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50"
            >
              {t("Sign Up")}
            </Link>
          </nav>
        </div>

        <div className={`sm:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-[430px] border-t border-slate-100" : "max-h-0"}`}>
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 bg-white">
            <a
              href="#"
              className={`rounded-xl px-4 py-3 text-base font-semibold ${activeSection === "home" ? "bg-emerald-50 text-emerald-600" : "text-slate-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Home")}
            </a>
            <a
              href="#how-it-works"
              className={`rounded-xl px-4 py-3 text-base font-semibold ${activeSection === "how-it-works" ? "bg-emerald-50 text-emerald-600" : "text-slate-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("How It Works")}
            </a>
            <a
              href="#core-features"
              className={`rounded-xl px-4 py-3 text-base font-semibold ${activeSection === "core-features" ? "bg-emerald-50 text-emerald-600" : "text-slate-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Features")}
            </a>

            <Link
              to="/account-details"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl border border-emerald-500 px-4 py-3 text-center text-base font-bold text-emerald-600"
            >
              {t("Sign Up")}
            </Link>
          </nav>
        </div>
      </header>

      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-sm">eco</span>
              {t("Zero Hunger Movement")}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              {t("Share Food.")} <br />
              <span className="text-emerald-500">{t("Reduce Waste.")}</span> <br />
              {t("Spread Care.")}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-xl mx-auto md:mx-0">{t("Hero Description")}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/disclaimer" className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold text-center">
                {t("Create Account")}
              </Link>
              <Link to="/login" className="border border-emerald-500 text-emerald-600 px-10 py-3 rounded-xl font-bold text-center hover:bg-emerald-50">
                {t("Login")}
              </Link>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute -z-10 inset-0 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEdynWiH_GT-Jvp44kXbCgKhpRG4ItX9EHkL1fp1Nc2G_VWw77EpQDITrNso4iETt9w-wbtOZKRomsKd6wPNMSxht95KZmlWkkwfqkXPqPe5Iq0smA3B4Wo2wYyZccx-2fY8r7qCdfJBoavmJ4I1UR9hVv85ufnnWfP9gTZPxtkpO44ps8ntpXoofh-AmVjuaalX9iiSaOHklA9K5Nb7JoH90Y29i73Zq_cQexB7APBLOG9JfyKiiJODj4FKiEO3Dn4gnSKe0DDz8E"
              alt="Share food"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("How It Works Title")}</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">{t("How It Works Subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mt-10">
            {[
              { icon: "inventory_2", title: t("List Surplus"), desc: t("List Surplus Desc"), color: "text-emerald-500" },
              { icon: "distance", title: t("Match Local"), desc: t("Match Local Desc"), color: "text-orange-500" },
              { icon: "calendar_month", title: t("Planned Feeding"), desc: t("Planned Feeding Desc"), color: "text-emerald-500" },
              { icon: "local_shipping", title: t("Fast Pickup"), desc: t("Fast Pickup Desc"), color: "text-orange-500" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-5 border border-slate-100 ${item.color}`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="core-features" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-500 font-bold tracking-widest text-[11px] uppercase">{t("Platform Features")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-3">{t("Core Technology Features")}</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">{t("Core Features Subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "category", title: t("Dynamic Categories"), desc: t("Dynamic Categories Desc"), color: "text-emerald-500", hover: "hover:border-emerald-200 hover:bg-emerald-50/40" },
              { icon: "psychology", title: t("Smart Matching"), desc: t("Smart Matching Desc"), color: "text-orange-500", hover: "hover:border-orange-200 hover:bg-orange-50/40" },
              { icon: "event_available", title: t("Planned Feeding"), desc: t("Planned Feeding Desc"), color: "text-emerald-500", hover: "hover:border-emerald-200 hover:bg-emerald-50/40" },
              { icon: "analytics", title: t("Impact Reporting"), desc: t("Impact Reporting Desc"), color: "text-orange-500", hover: "hover:border-orange-200 hover:bg-orange-50/40" },
            ].map((feature, i) => (
              <div key={i} className={`group bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm transition-all ${feature.hover}`}>
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className={`material-symbols-outlined text-2xl ${feature.color}`}>{feature.icon}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="material-symbols-outlined text-green-500">volunteer_activism</span>
                {t("ShareBite")}
              </div>
              <p className="text-sm text-slate-500 text-center sm:text-left">{t("Footer Description")}</p>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="Instagram">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-5 3.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 8.5Zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5ZM18 6.75a1 1 0 1 1-1-1 1 1 0 0 1 1 1Z" />
                  </svg>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="Facebook">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V11H8v3h2v7h3v-7h2.25l.75-3H13V9.5a.5.5 0 0 1 .5-.5Z" />
                  </svg>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="Email">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v.2l8 4.8 8-4.8V8H4Zm16 8V11l-7.4 4.44a1.2 1.2 0 0 1-1.2 0L4 11v5h16Z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>{t("Footer Copyright")}</span>
            <span>{t("Footer Tagline")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
