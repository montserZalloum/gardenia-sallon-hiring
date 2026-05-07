import Link from "next/link";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import { formatDateAr } from "@/lib/format";
import { HeroEffects } from "@/components/public/hero-effects";
import { HeroPetals } from "@/components/public/hero-petals";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchActiveJobs() {
  await ensureIndexes();
  const db = await getDb();
  const today = startOfTodayInSalonTZ();
  const docs = await db
    .collection<Job>("jobs")
    .find({
      published: { $ne: false },
      $or: [
        { expiryDate: null },
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: today } },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => ({
    id: d._id.toString(),
    title: d.title,
    expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
  }));
}

const MARQUEE_TERMS = [
  "تسريحُ الشَّعر",
  "العنايةُ بالبشرة",
  "العنايةُ بالأظافر",
  "تجفيفٌ وتصفيف",
  "صبغةُ الشَّعر",
  "أهلاً بكِ",
];

function splitTitleAccent(title: string) {
  // Highlight the last word as the italic accent.
  const trimmed = title.trim();
  const idx = trimmed.lastIndexOf(" ");
  if (idx === -1) return { lead: "", accent: trimmed };
  return {
    lead: trimmed.slice(0, idx),
    accent: trimmed.slice(idx + 1),
  };
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default async function HomePage() {
  const jobs = await fetchActiveJobs();
  const marqueeRow = [...MARQUEE_TERMS, ...MARQUEE_TERMS];

  return (
    <div className="gd-page">
      <HeroEffects />

      {/* ============== HEADER ============== */}
      <header className="gd-header" id="gd-header">
        <div className="gd-container gd-header-inner">
          <Link className="gd-wordmark" href="/">
            Gardenia<span className="star">✦</span>
          </Link>
        </div>
      </header>

      {/* ============== HERO ============== */}
      <section className="gd-hero" id="hero">
        <div className="gd-hero-blob" id="gd-blob" />
        <HeroPetals />

        <div className="gd-marquee" aria-hidden="true">
          <div className="gd-marquee-track">
            {marqueeRow.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        <div className="gd-container">
          <div className="gd-hero-eyebrow">انضمّي إلى عائلة Gardenia</div>

          <h1 className="gd-hero-title" id="gd-title">
            <span className="line">
              <span className="word">نبحث</span>
            </span>
            <span className="line">
              <span className="word">عن مواهب</span>
            </span>
            <span className="line">
              <span className="word">تشبه </span>
              <em className="italic-accent">روحَ المكان.</em>
            </span>
          </h1>

          <div className="gd-hero-flower" aria-hidden="true">
            <svg
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g transform="translate(60 60)">
                <ellipse rx="6" ry="22" />
                <ellipse rx="6" ry="22" transform="rotate(30)" />
                <ellipse rx="6" ry="22" transform="rotate(60)" />
                <ellipse rx="6" ry="22" transform="rotate(90)" />
                <ellipse rx="6" ry="22" transform="rotate(120)" />
                <ellipse rx="6" ry="22" transform="rotate(150)" />
                <circle r="4" fill="currentColor" stroke="none" />
              </g>
            </svg>
          </div>

          <div className="gd-hero-scissors" aria-hidden="true">
            <svg
              viewBox="0 0 120 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g transform="translate(60 60)">
                {/* pivot */}
                <circle r="2.4" fill="currentColor" stroke="none" />
                {/* upper blade */}
                <path d="M 0 0 L 50 -10" />
                {/* lower blade */}
                <path d="M 0 0 L 50 10" />
                {/* upper handle ring */}
                <circle cx="-22" cy="-18" r="12" />
                <path d="M 0 0 L -12 -10" />
                {/* lower handle ring */}
                <circle cx="-22" cy="18" r="12" />
                <path d="M 0 0 L -12 10" />
              </g>
            </svg>
          </div>

          <div className="gd-hero-foot">
            <p className="gd-hero-lede">
              تصفّحي الوظائف المتاحة، واختاري ما <em>يناسبكِ</em>.
              <br />
              كل تقديم يصل مباشرةً لصاحبة الصالون.
            </p>
          </div>
        </div>
      </section>

      {/* ============== VACANCIES ============== */}
      <section className="gd-vac-section" id="vacancies">
        <div className="gd-container">
          <div className="gd-vac-head">
            <h2 className="gd-vac-title">
              نوظِّف.
              <br />
              <em>أحضري موهبتكِ.</em>
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="gd-vac-empty">
              <h3>لا توجد وظائف شاغرة حالياً</h3>
              <p>تابعينا قريباً — ننشر الفرص الجديدة هنا أوّلاً.</p>
            </div>
          ) : (
            <div className="gd-vac-list">
              {jobs.map((job, i) => {
                const { lead, accent } = splitTitleAccent(job.title);
                return (
                  <Link
                    key={job.id}
                    className="gd-vac-row"
                    href={`/jobs/${job.id}`}
                  >
                    <span className="gd-vac-num">{pad2(i + 1)}</span>
                    <span className="gd-vac-role">
                      {lead ? `${lead} ` : ""}
                      <em>{accent}</em>
                    </span>
                    <span className="gd-vac-meta-text">
                      {job.expiryDate
                        ? `حتى ${formatDateAr(job.expiryDate)}`
                        : "التقديم مفتوح"}
                    </span>
                    <span className="gd-vac-arrow">
                      تقديم
                      <svg
                        viewBox="0 0 22 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      >
                        <line x1="0" y1="7" x2="20" y2="7" />
                        <polyline points="14,1 20,7 14,13" />
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="gd-footer" id="contact">
        <div className="gd-container">
          <div className="gd-footer-grid">
            <div>
              <div className="gd-footer-mark">
                Gardenia
                <span
                  style={{
                    color: "var(--gd-clay)",
                    fontSize: 18,
                    verticalAlign: "top",
                    marginInlineStart: 8,
                  }}
                >
                  ✦
                </span>
              </div>
              <p className="gd-footer-tag">
                صالونٌ صغير، اهتمامٌ كبير — للشعر والبشرة والأظافر، وكوبٍ من
                المنعش.
              </p>
            </div>
          </div>
          <div className="gd-footer-bottom">
            <span>© {new Date().getFullYear()} Gardenia · جميع الحقوق محفوظة</span>
            <span>صُنِع بحبّ.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
