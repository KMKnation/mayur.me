import "./styles/Patent.css";
import { MdArrowOutward } from "react-icons/md";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { PatentItem } from "../cms/types";
import AppLink from "../routing/AppLink";

interface PatentProps {
  items?: PatentItem[];
}

const Patent = ({ items = DEFAULT_CMS_CONTENT.patentItems }: PatentProps) => {
  const patents = [...items]
    .filter((item) => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);
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
              key={patent.id}
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
                <AppLink
                  href={patent.link}
                  target={
                    patent.link.startsWith("http") || patent.link.startsWith("mailto:")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    patent.link.startsWith("http") || patent.link.startsWith("mailto:")
                      ? "noreferrer"
                      : undefined
                  }
                >
                  {patent.isViewMoreTile ? "View More" : "View"}{" "}
                  <MdArrowOutward />
                </AppLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Patent;
