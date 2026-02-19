// Landing.jsx (FULL FILE) — FUNCTIONAL UPGRADES ONLY
// ✅ Landing topbar Sign In + Sign Up now open auth modal (login/register tabs)
// ✅ Login/Register inside modal navigates to /welcome (same flow as your pages)
// ⚠️ No other logic changed.

import LandingAuthModal from "../components/LandingAuthModal";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import clsx from "clsx";
import {
  ChevronDown,
  Search,
  Grid3X3,
  X,
  ArrowLeft,
  ArrowRight,
  Video,
  MessageSquare,
  PhoneCall,
  Presentation,
  Clipboard,
  Users,
  Shield,
  Building2,
  Headphones,
} from "lucide-react";

export default function Landing() {
  const nav = useNavigate();
  const rowRef = useRef(null);

  // ✅ Auth modal
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"

  const [openMenu, setOpenMenu] = useState(null);

  // existing
  const [pricingOpen, setPricingOpen] = useState(false);

  // ✅ new: search modal
  const [searchOpen, setSearchOpen] = useState(false);

  // ✅ new: report modal
  const [reportModal, setReportModal] = useState({ open: false, title: "", cta: "", topic: "" });

  // ✅ new: contact form submission modal
  const [contactModal, setContactModal] = useState({ open: false, loading: false, data: null, error: "" });

  /* close menus */
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setPricingOpen(false);
        setSearchOpen(false);
        setAuthOpen(false);
        setReportModal((p) => ({ ...p, open: false }));
        setContactModal((p) => ({ ...p, open: false }));
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  function scrollRow(dir) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  /* ---------- MENUS ---------- */

  const productsMenu = useMemo(
    () => [
      { title: "Meetings", desc: "Video meetings", icon: <Video />, onClick: () => openAuth("login") },
      { title: "Team Chat", desc: "Messaging UI", icon: <MessageSquare />, onClick: () => alert("Chat demo") },
      { title: "Phone", desc: "VoIP demo", icon: <PhoneCall />, onClick: () => alert("Phone demo") },
      { title: "Whiteboard", desc: "Collaboration", icon: <Clipboard />, onClick: () => alert("Whiteboard") },
      { title: "Webinars", desc: "Events UI", icon: <Presentation />, onClick: () => alert("Webinar") },
      { title: "Security", desc: "Compliance UI", icon: <Shield />, onClick: () => alert("Security") },
    ],
    [] // openAuth declared below (function hoisting works fine)
  );

  const solutionsMenu = useMemo(
    () => [
      { title: "Teams", desc: "Collaboration", icon: <Users />, onClick: () => alert("Teams") },
      { title: "Support", desc: "Customer support", icon: <Headphones />, onClick: () => alert("Support") },
      { title: "Enterprise", desc: "Admin tools", icon: <Building2 />, onClick: () => alert("Enterprise") },
    ],
    []
  );

  /* ---------- HERO TILES ---------- */
  const heroTiles = useMemo(
    () => [
      { tag: "Contact Center", title: "Customer support", img: "/tiles/download.jfif" },
      { tag: "Meetings", title: "Team sync", img: "/tiles/meeting.jfif" },
      { tag: "AI Companion", title: "Action items", img: "/tiles/ai.jfif" },
      { tag: "Team Chat", title: "Channels", img: "/tiles/teamssss.jfif" },
      { tag: "Clips", title: "Short updates", img: "/tiles/clipss.png" },
    ],
    []
  );

  // ✅ open auth modal
  function openAuth(tab) {
    setOpenMenu(null);
    setPricingOpen(false);
    setSearchOpen(false);
    setAuthTab(tab);
    setAuthOpen(true);
  }

  // ✅ Report modal opener (keeps your cards unchanged visually)
  function openReport({ title, cta, topic }) {
    setReportModal({ open: true, title, cta, topic });
  }

  // ✅ Contact Sales submit handler (fetch “helpful” info from open API)
  async function handleContactSubmit(payload) {
    setContactModal({ open: true, loading: true, data: null, error: "" });

    try {
      // open API: RestCountries (country info)
      const countryName = payload.country || "India";
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=false`);
      const json = await res.json();
      const c = Array.isArray(json) ? json[0] : null;

      const countryInfo = c
        ? {
            name: c?.name?.common || countryName,
            region: c?.region || "",
            capital: c?.capital?.[0] || "",
            callingCode:
              (c?.idd?.root && c?.idd?.suffixes?.[0] ? `${c.idd.root}${c.idd.suffixes[0]}` : "") || "",
            timezones: c?.timezones?.slice?.(0, 2) || [],
            flag: c?.flags?.svg || c?.flags?.png || "",
          }
        : null;

      // “Rep” suggestion (local mapping)
      const reps = [
        { region: "Asia", name: "Aarav Mehta", email: "apac-sales@zoom-demo.example", phone: "+91 00000 00000" },
        { region: "Europe", name: "Sofia Müller", email: "emea-sales@zoom-demo.example", phone: "+44 0000 000000" },
        { region: "Americas", name: "Jordan Smith", email: "na-sales@zoom-demo.example", phone: "+1 000 000 0000" },
        { region: "Africa", name: "Amina Diallo", email: "africa-sales@zoom-demo.example", phone: "+27 00 000 0000" },
        { region: "Oceania", name: "Noah Williams", email: "anz-sales@zoom-demo.example", phone: "+61 0 0000 0000" },
      ];

      const region = countryInfo?.region || "Asia";
      const rep =
        reps.find((r) => r.region.toLowerCase() === region.toLowerCase()) ||
        reps.find((r) => r.region === "Asia") ||
        reps[0];

      const nextSteps = [
        "We’ll contact you within 1–2 business days.",
        "If you want faster help, use the phone/email below.",
        "We can recommend a plan based on your employee count and inquiry type.",
      ];

      setContactModal({
        open: true,
        loading: false,
        error: "",
        data: {
          payload,
          countryInfo,
          rep,
          nextSteps,
        },
      });
    } catch (e) {
      setContactModal({
        open: true,
        loading: false,
        data: null,
        error: "Couldn’t fetch country info right now. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#07103A] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#07103A]/90 backdrop-blur border-b border-white/10">
        {/* FULL WIDTH HEADER WRAPPER */}
        <div className="w-full px-[clamp(16px,4vw,64px)]">
          <div className="h-16 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-8">
              <button onClick={() => window.scrollTo({ top: 0 })} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 grid place-items-center">
                  <Video className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">Zoom</span>
              </button>

              <nav className="hidden lg:flex gap-6 text-sm font-semibold text-white/90">
                <NavDrop
                  label="Products"
                  open={openMenu === "products"}
                  onClick={() => setOpenMenu(openMenu === "products" ? null : "products")}
                />
                <NavDrop
                  label="Solutions"
                  open={openMenu === "solutions"}
                  onClick={() => setOpenMenu(openMenu === "solutions" ? null : "solutions")}
                />
                <button onClick={() => setPricingOpen(true)} className="hover:text-white/80">
                  Pricing
                </button>
              </nav>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              {/* ✅ functional search */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* ✅ open login modal */}
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => openAuth("login")}
              >
                Sign In
              </Button>

              <Button
                variant="secondary"
                className="bg-white text-[#07103A] hover:bg-white/90"
                onClick={() => {
                  const el = document.getElementById("contact-sales");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Contact Sales
              </Button>

              {/* ✅ open register modal */}
              <Button
                className="bg-blue-600 hover:bg-blue-500"
                onClick={() => openAuth("register")}
              >
                Sign Up Free
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* DROPDOWNS */}
        {openMenu === "products" && <MegaMenu items={productsMenu} />}
        {openMenu === "solutions" && <MegaMenu items={solutionsMenu} />}
      </header>

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#07103A] via-[#1B49B6] to-[#7B78D8]" />

        <div className="relative w-full px-[clamp(16px,4vw,64px)] pt-16">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.06] tracking-tight">
              Find out what’s possible
              <br />
              when work connects
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/80 max-w-3xl mx-auto">
              Connect, collaborate, and achieve goals with beautiful UI and real-time experiences.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Button className="h-12 px-6 rounded-xl bg-[#08103A] border border-white/10 hover:bg-[#0A1448]">
                Explore products
              </Button>
              <Button
                className="h-12 px-6 rounded-xl bg-white text-[#07103A] hover:bg-white/90"
                onClick={() => setPricingOpen(true)}
              >
                Find your plan
              </Button>
            </div>
          </div>

          <div className="mt-16 relative">
            <ArrowBtn dir={-1} click={() => scrollRow(-1)} />
            <ArrowBtn dir={1} click={() => scrollRow(1)} />

            <div ref={rowRef} className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x [&::-webkit-scrollbar]:hidden">
              {heroTiles.map((t) => (
                <HeroImageTile key={t.tag} {...t} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FULL-WIDTH “ONE PLATFORM …” SECTION (NO SEARCH BAR) */}
      <section className="bg-white text-[#07103A]">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(48px,8vw,96px)]">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm font-semibold text-blue-600">Zoom Workplace</div>

              <h2 className="mt-4 text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.02]">
                One platform for
                <br />
                limitless human
                <br />
                connection
              </h2>

              <p className="mt-6 text-lg text-[#07103A]/70 max-w-xl">
                Drive impact with AI Companion, reimagine teamwork, strengthen customer relationships, and enable seamless experiences
                with a single platform.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <Button
                  className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => setPricingOpen(true)}
                >
                  Explore plans
                </Button>
                <button
                  type="button"
                  className="text-blue-600 font-semibold hover:opacity-80 inline-flex items-center gap-2"
                  onClick={() => openAuth("register")}
                >
                  Try for free <span aria-hidden>↗</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[36px] bg-blue-600/10 blur-2xl" />
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.20)] border border-black/10">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
                  alt="Team collaborating"
                  className="w-full h-[360px] sm:h-[460px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FULL-WIDTH REPORT CARDS SECTION */}
      <section className="bg-[#F4F7FF] text-[#07103A]">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(48px,7vw,88px)]">
          <div className="grid lg:grid-cols-3 gap-8">
            <ReportCard
              badge="zoom"
              title="Gartner® Magic Quadrant™"
              subtitle="Portfolio UI card"
              cta="Read the report"
              headline="A Leader in the Magic Quadrant™ for UCaaS, Worldwide 2025. 6th year in a row!"
              tone="tone1"
              onOpen={() => openReport({ title: "Gartner® Magic Quadrant™", cta: "Read the report", topic: "Gartner" })}
            />
            <ReportCard
              badge="zoom"
              title="Magic Quadrant™ for CCaaS"
              subtitle="Portfolio UI card"
              cta="Explore the report"
              headline="Recognized in the 2025 Magic Quadrant™ for CCaaS"
              tone="tone2"
              onOpen={() =>
                openReport({ title: "Magic Quadrant™ for CCaaS", cta: "Explore the report", topic: "Magic_Quadrant" })
              }
            />
            <ReportCard
              badge="zoom"
              title="The Forrester Wave™"
              subtitle="Portfolio UI card"
              cta="Read Forrester report"
              headline="Named a leader in The Forrester Wave™: UCaaS 2025"
              tone="tone3"
              onOpen={() =>
                openReport({ title: "The Forrester Wave™", cta: "Read Forrester report", topic: "Forrester_Research" })
              }
            />
          </div>
        </div>
      </section>

      {/* ✅ FULL-WIDTH QUOTE SECTION (ratings in ONE LINE) */}
      <section className="bg-white text-[#07103A]">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(56px,8vw,120px)]">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-start justify-center gap-16 flex-wrap md:flex-nowrap mb-16">
              <RatingBlockZoom score="4.5/5" sub="out of 7.9k+ reviews" brand="Gartner Peer Insights" />
              <div className="hidden md:block h-24 w-px bg-black/15 mt-3" />
              <RatingBlockZoom score="4.6/5" sub="out of 54.9k+ reviews" brand="G2" />
              <div className="hidden md:block h-24 w-px bg-black/15 mt-3" />
              <RatingBlockZoom score="8.5/10" sub="out of 5.8k+ reviews" brand="TrustRadius" />
            </div>

            <p className="text-3xl sm:text-5xl font-extrabold leading-[1.12] tracking-tight text-[#0B1B4A]">
              “Zoom Workplace turns my brainwaves into polished gems. From meetings, I can create Clips, Notes, Docs, or even
              whiteboards faster than you can say, ‘transcript.’”
            </p>

            <div className="mt-10 text-lg font-semibold text-[#07103A]">Marquesa Pettway</div>
            <div className="text-[#07103A]/70">Founder</div>
          </div>
        </div>
      </section>

      {/* ✅ CUSTOMER STORIES / COMPANIES SECTION */}
      <section className="bg-white text-[#07103A]">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(56px,8vw,120px)]">
          <div className="w-full">
            <h2 className="text-center text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0B1B4A]">
              Companies are achieving more
              <br />
              with Zoom
            </h2>

            <div className="mt-14 grid lg:grid-cols-[280px_1fr] gap-10 items-center">
              <div className="flex justify-center lg:justify-start gap-6">
                {[
                  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=700&q=80",
                  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
                  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=700&q=80",
                ].map((src, idx) => (
                  <div
                    key={idx}
                    className="h-[420px] w-[84px] sm:w-[92px] rounded-[26px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.14)] border border-black/10"
                  >
                    <img src={src} alt="story" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="relative rounded-[34px] overflow-hidden border border-black/10 shadow-[0_35px_110px_rgba(0,0,0,0.18)]">
                <img
                  src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1800&q=80"
                  alt="Customer story"
                  className="h-[420px] sm:h-[480px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between">
                  <div>
                    <div className="text-white/85 font-semibold text-sm">Customer story</div>
                    <h3 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white leading-[1.05] max-w-2xl">
                      A connected, collaborative workforce drives innovation
                    </h3>

                    <p className="mt-6 text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
                      “Zoom helps teams move faster with reliable meetings, messaging, and modern collaboration — across office,
                      remote, and hybrid work.”
                    </p>

                    <div className="mt-4 text-white/85 text-sm">
                      <span className="font-semibold">— Nikita Steals</span>, VP Tech Talent Acquisition
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="h-14 w-14 rounded-full bg-white/90 hover:bg-white grid place-items-center shadow-md"
                      aria-label="Open story"
                    >
                      <span className="text-xl">↗</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10" />
          </div>
        </div>
      </section>

      {/* ✅ CONTACT SALES FORM SECTION — JUST ABOVE FOOTER (NOW FUNCTIONAL) */}
      <ContactSalesSection onSubmit={handleContactSubmit} />

      {/* ✅ FULL-WIDTH “SEE WHAT ZOOM CAN DO …” */}
      <section className="bg-white text-[#07103A]">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(40px,6vw,72px)]">
          <div className="min-h-[52vh] flex items-start justify-center pt-10 sm:pt-14">
            <div className="text-center max-w-4xl">
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0B1B4A]">
                See what Zoom can do
                <br />
                for your business
              </h2>

              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => openAuth("register")}
                >
                  Get started today
                </Button>

                <Button
                  type="button"
                  className="h-12 px-7 rounded-xl bg-white text-[#07103A] border border-black/15 shadow-sm hover:bg-black/[0.03]"
                  onClick={() => setPricingOpen(true)}
                >
                  Find your plan
                </Button>
              </div>

              <p className="mt-10 text-sm text-[#07103A]/60">
                <span className="font-semibold text-[#07103A]">Zoom AI Companion</span> is available with eligible paid Zoom Workplace
                plans. May not be available for all regions or industry verticals.{" "}
                <span className="underline cursor-pointer" onClick={() => setSearchOpen(true)}>
                  Learn more.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#07103A] text-white border-t border-white/10">
        <div className="w-full px-[clamp(16px,4vw,64px)] py-14">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-1">
              <div className="text-3xl font-extrabold tracking-tight">zoom</div>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Download Center</div>
                  <div className="text-sm text-white/70">Get the most out of Zoom</div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <select className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white">
                  <option className="text-black">English</option>
                </select>
                <select className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white">
                  <option className="text-black">US Dollar $</option>
                </select>
              </div>
            </div>

            <FooterCol
              title="About"
              items={["Zoom Blog", "Customers", "Our Team", "Careers", "Integrations", "Partners", "Investors", "Press"]}
            />
            <FooterCol
              title="Download"
              items={[
                "Zoom Workplace App",
                "Zoom Rooms App",
                "Zoom Rooms Controller",
                "Browser Extension",
                "Outlook Plug-in",
                "iPhone/iPad App",
                "Android App",
              ]}
            />
            <FooterCol
              title="Sales"
              items={["1.888.799.9666", "Contact Sales", "Plans & Pricing", "Request a Demo", "Webinars and Events"]}
            />
            <FooterCol
              title="Support"
              items={[
                "Test Zoom",
                "Account",
                "Support Center",
                "Learning Center",
                "Zoom Community",
                "Technical Content Library",
                "Feedback",
                "Contact Us",
                "Accessibility",
              ]}
            />
          </div>

          <div className="mt-12 text-xs text-white/60">
            Privacy, Security, Legal Policies, and Modern Slavery Act Transparency Statement
          </div>
        </div>
      </footer>

      {/* ✅ Pricing modal upgraded */}
      {pricingOpen && <PricingModal close={() => setPricingOpen(false)} nav={nav} />}

      {/* ✅ Search modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* ✅ Report modal */}
      {reportModal.open && (
        <ReportModal
          title={reportModal.title}
          cta={reportModal.cta}
          topic={reportModal.topic}
          onClose={() => setReportModal((p) => ({ ...p, open: false }))}
        />
      )}

      {/* ✅ Contact result modal */}
      {contactModal.open && (
        <ContactResultModal
          state={contactModal}
          onClose={() => setContactModal((p) => ({ ...p, open: false }))}
        />
      )}

      {/* ✅ AUTH MODAL (LOGIN / REGISTER POPUP) */}
      <LandingAuthModal
        open={authOpen}
        tab={authTab}
        onClose={() => setAuthOpen(false)}
        onTabChange={(t) => setAuthTab(t)}
        onSuccess={() => {
          setAuthOpen(false);
          nav("/welcome");
        }}
      />
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function NavDrop({ label, open, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-white/80">
      {label}
      <ChevronDown className={clsx("h-4 transition", open && "rotate-180")} />
    </button>
  );
}

function MegaMenu({ items }) {
  return (
    <div className="absolute left-0 right-0 top-full bg-[#07103A] border-b border-white/10 p-6">
      <div className="grid md:grid-cols-3 gap-4 w-full max-w-7xl mx-auto">
        {items.map((i) => (
          <button key={i.title} onClick={i.onClick} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center">{i.icon}</div>
              <div>
                <div className="font-semibold">{i.title}</div>
                <div className="text-sm text-white/70">{i.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArrowBtn({ dir, click }) {
  return (
    <button
      onClick={click}
      className={clsx(
        "hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 border border-white/15 hover:bg-white/15",
        dir === 1 ? "right-2" : "left-2"
      )}
    >
      {dir === 1 ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
    </button>
  );
}

function HeroImageTile({ tag, title, img }) {
  return (
    <div className="snap-start w-[320px] h-[250px] rounded-[28px] overflow-hidden relative group shrink-0 shadow-2xl border border-white/10">
      <img src={img} alt={tag} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative h-full p-6 flex flex-col text-white">
        <div className="flex justify-between">
          <span className="font-semibold">{tag}</span>
          <div className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="mt-auto">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-white/80">Click to open demo</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- PRICING ---------- */
/* ✅ Zoom-like pricing modal: left nav + plan cards; “Buy now” routes to /login */
function PricingModal({ close, nav }) {
  const [active, setActive] = useState("Meetings");

  const leftItems = [
    "Meetings",
    "Team Chat",
    "Mail",
    "Calendar",
    "AI Companion",
    "Phone",
    "Scheduler",
    "Docs",
    "Whiteboard",
    "Clips",
  ];

  const plans = [
    { name: "Basic", price: "Free", desc: "Best for trying Zoom.", popular: false, cta: "Sign up" },
    { name: "Pro", price: "₹1,147", desc: "Best for personal use or small teams.", popular: true, cta: "Buy now" },
    { name: "Business", price: "₹1,666", desc: "Best for larger teams.", popular: false, cta: "Buy now" },
    { name: "Enterprise", price: "Talk to us", desc: "For large organizations.", popular: false, cta: "Contact sales" },
  ];

  function handlePlanClick(p) {
    if (p.name === "Enterprise") {
      const el = document.getElementById("contact-sales");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      close();
      return;
    }
    nav("/login"); // kept exactly as you had it
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55">
      <div className="absolute inset-x-0 top-8 mx-auto w-[min(1200px,calc(100vw-32px))] bg-white text-[#07103A] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="text-2xl font-extrabold">Pricing</div>
          <button onClick={close} className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black/[0.04]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="border-r border-black/10 p-6">
            <div className="text-sm font-semibold text-[#07103A]/70 mb-4">Explore pricing</div>

            <div className="rounded-2xl bg-[#0B5CFF]/10 p-2">
              {leftItems.map((it) => (
                <button
                  key={it}
                  onClick={() => setActive(it)}
                  className={clsx(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold",
                    active === it ? "bg-[#0B5CFF] text-white" : "hover:bg-black/[0.04] text-[#07103A]"
                  )}
                >
                  {it}
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs text-[#07103A]/55">
              Tip: Choose a product on the left, then compare plans on the right.
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <div className="flex gap-6 min-w-[920px]">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={clsx(
                    "w-[260px] rounded-3xl border bg-white p-6",
                    p.popular ? "border-blue-600 ring-2 ring-blue-600/20" : "border-black/10"
                  )}
                >
                  {p.popular && (
                    <div className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full mb-4 inline-flex">
                      Most Popular
                    </div>
                  )}

                  <div className="text-sm font-semibold text-[#07103A]/60">Workplace</div>
                  <h3 className="font-extrabold text-3xl mt-2">{p.name}</h3>
                  <p className="mt-2 text-sm text-[#07103A]/65">{p.desc}</p>

                  <p className="text-4xl font-extrabold mt-6">{p.price}</p>

                  <button
                    onClick={() => handlePlanClick(p)}
                    className={clsx(
                      "mt-8 w-full py-3 rounded-xl font-semibold",
                      p.popular ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-[#0B5CFF]/10 hover:bg-[#0B5CFF]/15 text-[#07103A]"
                    )}
                  >
                    {p.cta}
                  </button>

                  <div className="mt-6 text-xs text-[#07103A]/55">
                    Selected product: <span className="font-semibold">{active}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-[#07103A]/55">
              Prices shown are sample UI values. Click “Buy now” to continue to login/signup flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- REPORT CARDS ---------- */
function ReportCard({ badge, title, subtitle, cta, headline, tone, onOpen }) {
  const toneClass =
    tone === "tone1"
      ? "bg-[radial-gradient(110px_110px_at_10%_20%,rgba(255,255,255,0.28),transparent_60%),radial-gradient(180px_180px_at_85%_10%,rgba(255,255,255,0.18),transparent_60%),linear-gradient(135deg,#1D4ED8,#7C3AED)]"
      : tone === "tone2"
      ? "bg-[radial-gradient(110px_110px_at_10%_20%,rgba(255,255,255,0.25),transparent_60%),radial-gradient(180px_180px_at_85%_10%,rgba(255,255,255,0.16),transparent_60%),linear-gradient(135deg,#2563EB,#4F46E5)]"
      : "bg-[radial-gradient(110px_110px_at_10%_20%,rgba(255,255,255,0.24),transparent_60%),radial-gradient(180px_180px_at_85%_10%,rgba(255,255,255,0.15),transparent_60%),linear-gradient(135deg,#0EA5E9,#22C55E)]";

  return (
    <div className="rounded-[32px] border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-6">
        <div className="rounded-[22px] overflow-hidden border border-white/30 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          <div className={clsx("p-6 text-white min-h-[190px] flex flex-col", toneClass)}>
            <div className="text-sm font-semibold opacity-90">{badge}</div>
            <div className="mt-6 text-2xl font-extrabold leading-tight">{title}</div>
            <div className="mt-2 text-sm opacity-85">{subtitle}</div>
            <button
              type="button"
              className="mt-auto inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white/15 border border-white/20 text-sm font-semibold hover:bg-white/20 w-fit"
              onClick={onOpen}
            >
              {cta}
            </button>
          </div>
        </div>

        <div className="mt-6 text-2xl font-extrabold leading-tight">{headline}</div>

        <Button className="mt-6 h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white" onClick={onOpen}>
          {cta}
        </Button>
      </div>
    </div>
  );
}

/* ---------- QUOTE / RATINGS ---------- */
function RatingBlockZoom({ score, sub, brand }) {
  return (
    <div className="text-center min-w-[220px]">
      <div className="text-4xl font-extrabold text-[#0B1B4A]">{score}</div>

      <div className="mt-3 flex items-center justify-center gap-2 text-black/70 text-lg leading-none">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span className="opacity-20">★</span>
      </div>

      <div className="mt-2 text-sm text-[#07103A]/55">{sub}</div>
      <div className="mt-4 font-semibold text-[#07103A]">{brand}</div>
    </div>
  );
}

/* ---------- CONTACT SALES (FUNCTIONAL) ---------- */
function ContactSalesSection({ onSubmit }) {
  const [form, setForm] = useState({
    email: "",
    inquiry: "",
    country: "India",
    employees: "",
  });

  return (
    <section id="contact-sales" className="bg-white text-[#07103A]">
      <div className="w-full px-[clamp(16px,4vw,64px)] py-[clamp(56px,8vw,110px)]">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight">Contact Sales</h2>
            <p className="mt-6 text-lg text-[#07103A]/70 max-w-xl">
              Zoom keeps you and your team connected wherever you are, so you can get more done, together.
            </p>

            <p className="mt-6 text-lg text-[#07103A]/70 max-w-xl">
              Fill out the form to get in touch with one of our representatives.
            </p>

            <div className="mt-10">
              <div className="text-2xl font-extrabold">Questions? Give us a call</div>
              <div className="mt-4 max-w-sm">
                <label className="text-sm font-semibold text-[#07103A]/70">Select your country</label>
                <select
                  className="mt-2 w-full h-12 rounded-xl border border-black/10 px-4 bg-white"
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] overflow-hidden border border-black/10 shadow-[0_25px_70px_rgba(0,0,0,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1600&q=80"
                alt="Support team"
                className="w-full h-[320px] object-cover"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.12)] p-6 sm:p-10 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Tell us a bit about
                <br />
                yourself
              </div>
              <div className="text-sm text-[#07103A]/60">
                <span className="text-pink-600 font-semibold">*</span> Required Information
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <Field
                label="Email"
                required
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <SelectField
                label="Nature of inquiry"
                required
                value={form.inquiry}
                onChange={(e) => setForm((p) => ({ ...p, inquiry: e.target.value }))}
                options={["Pricing", "Product Demo", "Enterprise", "Support"]}
              />
              <SelectField
                label="Country"
                required
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                options={["India", "United States", "United Kingdom", "Canada", "Australia"]}
              />
              <SelectField
                label="Employee Count"
                required
                value={form.employees}
                onChange={(e) => setForm((p) => ({ ...p, employees: e.target.value }))}
                options={["1-10", "11-50", "51-200", "201-1000", "1000+"]}
              />
            </div>

            <div className="mt-10 flex justify-end">
              <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white" onClick={() => onSubmit(form)}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, required, placeholder, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#07103A]/70">
        {label} {required && <span className="text-pink-600">*</span>}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full h-12 rounded-xl border border-black/10 px-4 outline-none focus:ring-2 focus:ring-blue-600/20"
      />
    </div>
  );
}

function SelectField({ label, required, options, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#07103A]/70">
        {label} {required && <span className="text-pink-600">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full h-12 rounded-xl border border-black/10 px-4 bg-white outline-none focus:ring-2 focus:ring-blue-600/20"
      >
        <option value="">-- Select an option --</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="font-semibold mb-4">{title}</div>
      <ul className="space-y-3 text-sm text-white/75">
        {items.map((it) => (
          <li key={it} className="hover:text-white cursor-pointer">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- SEARCH MODAL (FUNCTIONAL via Wikipedia OpenSearch) ---------- */
function SearchModal({ onClose }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!q.trim()) {
        setItems([]);
        setErr("");
        return;
      }

      setLoading(true);
      setErr("");
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=${encodeURIComponent(
          q
        )}&limit=8&namespace=0&format=json`;

        const res = await fetch(url);
        const json = await res.json();

        if (!alive) return;

        const titles = json?.[1] || [];
        const descs = json?.[2] || [];
        const links = json?.[3] || [];

        const mapped = titles.map((t, i) => ({
          title: t,
          desc: descs[i] || "",
          link: links[i] || "",
        }));

        setItems(mapped);
      } catch {
        setErr("Search failed");
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="fixed inset-0 z-[60] bg-white">
      <div className="sticky top-0 z-[61] bg-white border-b border-black/10">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full border border-black/15 hover:bg-black/[0.04] grid place-items-center text-lg"
            aria-label="Back"
          >
            ←
          </button>

          <div className="flex-1 relative">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Zoom"
              className="w-full h-11 rounded-full border border-black/15 bg-white px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-600/20 text-[#07103A] placeholder:text-[#07103A]/45"
            />

            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-black/[0.05] grid place-items-center text-[#07103A]/70"
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            onClick={() => {
              const el = document.activeElement;
              if (el && el.blur) el.blur();
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading && <div className="text-sm text-[#07103A]/60">Searching…</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <a
              key={it.link || it.title}
              href={it.link}
              target="_blank"
              rel="noreferrer"
              className="block p-5 rounded-2xl border border-black/10 hover:bg-black/[0.03] transition bg-white"
            >
              <div className="font-semibold text-[#0B1B4A]">{it.title}</div>
              <div className="text-sm text-[#07103A]/60 mt-1">{it.desc || "Open result"}</div>
            </a>
          ))}
        </div>

        {!loading && q && items.length === 0 && !err && (
          <div className="text-center text-[#07103A]/60 mt-20">No results found</div>
        )}
      </div>
    </div>
  );
}

/* ---------- CONTACT RESULT MODAL ---------- */
function ContactResultModal({ state, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white text-[#07103A] shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="text-xl font-extrabold">Thanks — we got your request</div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black/[0.04]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {state.loading && <div className="text-sm text-[#07103A]/70">Submitting…</div>}
          {state.error && <div className="text-sm text-red-600">{state.error}</div>}

          {!state.loading && !state.error && state.data && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/10 p-5">
                <div className="font-semibold">Your details</div>
                <div className="mt-2 text-sm text-[#07103A]/75">
                  Email: <span className="font-semibold">{state.data.payload.email || "—"}</span>
                  <br />
                  Inquiry: <span className="font-semibold">{state.data.payload.inquiry || "—"}</span>
                  <br />
                  Country: <span className="font-semibold">{state.data.payload.country || "—"}</span>
                  <br />
                  Employees: <span className="font-semibold">{state.data.payload.employees || "—"}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-black/10 p-5">
                  <div className="font-semibold">Suggested sales contact</div>
                  <div className="mt-2 text-sm text-[#07103A]/75">
                    Rep: <span className="font-semibold">{state.data.rep.name}</span>
                    <br />
                    Email: <span className="font-semibold">{state.data.rep.email}</span>
                    <br />
                    Phone: <span className="font-semibold">{state.data.rep.phone}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 p-5">
                  <div className="font-semibold">Country info</div>
                  <div className="mt-2 text-sm text-[#07103A]/75">
                    {state.data.countryInfo ? (
                      <>
                        {state.data.countryInfo.flag && (
                          <img
                            src={state.data.countryInfo.flag}
                            alt="flag"
                            className="h-6 w-auto rounded-sm mb-3 border border-black/10"
                          />
                        )}
                        Name: <span className="font-semibold">{state.data.countryInfo.name}</span>
                        <br />
                        Region: <span className="font-semibold">{state.data.countryInfo.region || "—"}</span>
                        <br />
                        Capital: <span className="font-semibold">{state.data.countryInfo.capital || "—"}</span>
                        <br />
                        Calling code: <span className="font-semibold">{state.data.countryInfo.callingCode || "—"}</span>
                      </>
                    ) : (
                      <>No country details available.</>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0B5CFF]/10 p-5">
                <div className="font-semibold">Next steps</div>
                <ul className="mt-2 text-sm text-[#07103A]/75 list-disc pl-5 space-y-1">
                  {state.data.nextSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <Button className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white" onClick={onClose}>
                  Done
                </Button>
              </div>

              <div className="text-xs text-[#07103A]/55">Uses public RestCountries API to enrich country details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* NOTE:
  You already have ReportModal in your original file (not shown in your paste end).
  Keep it as-is. Same for any remaining components below in your project.
*/
