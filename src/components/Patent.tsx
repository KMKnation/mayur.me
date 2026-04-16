import "./styles/Patent.css";
import { MdArrowOutward } from "react-icons/md";

const PATENT_SHOWCASE_URL = `${import.meta.env.BASE_URL}patent-showcase.html`;

interface PatentItem {
  title: string;
  type: string;
  summary: string;
  meta: string;
  link: string;
  isViewMoreTile?: boolean;
}

const patents = [
  {
    title: "US Patent 12,461,979",
    type: "Granted Patent",
    summary:
      "Adaptive query intelligence for enterprise support operations, focused on identifying emergent incident patterns and response signals.",
    meta: "Granted: November 4, 2025",
    link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
  },
  {
    title: "Publication 20250278444",
    type: "Patent Publication",
    summary:
      "Published technical disclosure covering adaptive detection architecture, clustering, and operational escalation intelligence.",
    meta: "Publication ID: 20250278444",
    link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
  },
  {
    title: "Query Radar Patent Domain",
    type: "Innovation Focus",
    summary:
      "Core domain includes real-time signal extraction from support queries, anomaly surfacing, and enterprise-scale response orchestration.",
    meta: "Area: AI + Enterprise Support Intelligence",
    link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
  },
  {
    title: "Explore Full Patent Portfolio",
    type: "View More",
    summary:
      "Open the dedicated patent page for the complete timeline, domains, and deeper innovation notes.",
    meta: "Patent Library",
    link: PATENT_SHOWCASE_URL,
    isViewMoreTile: true,
  },
] satisfies PatentItem[];

const Patent = () => {
  return (
    <section className="patent-section" id="patents">
      <div className="patent-container section-container">
        <h2>
          Patent <span>Work</span>
        </h2>
        <div className="patent-grid" data-cursor="disable">
          {patents.map((patent) => (
            <article
              className={`patent-card ${
                patent.isViewMoreTile ? "patent-card-viewmore" : ""
              }`}
              key={patent.title}
            >
              {patent.isViewMoreTile ? (
                <div className="patent-viewmore-scene" aria-hidden="true">
                  <span className="patent-viewmore-ring patent-viewmore-ring-1"></span>
                  <span className="patent-viewmore-ring patent-viewmore-ring-2"></span>
                  <span className="patent-viewmore-core"></span>
                  <span className="patent-viewmore-pulse"></span>
                </div>
              ) : null}
              <p className="patent-type">{patent.type}</p>
              <h3>{patent.title}</h3>
              <p className="patent-summary">{patent.summary}</p>
              <div className="patent-footer">
                <span>{patent.meta}</span>
                <a href={patent.link} target="_blank" rel="noreferrer">
                  {patent.isViewMoreTile ? "View More" : "View"}{" "}
                  <MdArrowOutward />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Patent;
