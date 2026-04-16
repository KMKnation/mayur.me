import AppLink from "../routing/AppLink";
import { PatentItem } from "../cms/types";
import "./styles/PublicPages.css";

interface PatentShowcasePageProps {
  items: PatentItem[];
}

const PatentShowcasePage = ({ items }: PatentShowcasePageProps) => {
  const visibleItems = items.filter(
    (item) => item.isVisible && !item.isViewMoreTile
  );

  return (
    <div className="public-page">
      <main className="public-shell">
        <div className="public-topbar">
          <div className="brand">MK Portfolio</div>
          <AppLink href="/">Back to Home</AppLink>
        </div>
        <h1 className="public-headline">
          All <span>Patents</span>
        </h1>
        <p className="public-lead">
          Dedicated patent showcase with CMS-driven records and high-signal
          animated highlights.
        </p>

        <section className="showcase-grid">
          {visibleItems.map((item, index) => {
            const preset = item.animationPreset.toLowerCase();
            const isGranted = preset.includes("granted");
            const isPublication = preset.includes("publication");
            const isFocus = preset.includes("focus");
            return (
              <article className="showcase-card" key={item.id}>
                <div className="showcase-scene">
                  <span
                    className={`scene-dot ${isGranted ? "hot-orange" : ""}`}
                    style={{ top: "24%", left: "26%" }}
                  ></span>
                  <span
                    className={`scene-dot ${isPublication ? "hot-red" : ""}`}
                    style={{ top: "44%", left: "58%", animationDelay: "0.25s" }}
                  ></span>
                  <span
                    className={`scene-dot ${isFocus || index % 2 === 0 ? "hot-orange" : ""}`}
                    style={{ top: "66%", left: "40%", animationDelay: "0.5s" }}
                  ></span>
                  <div className="scene-bars">
                    <span style={{ width: isGranted ? "92%" : "88%" }}></span>
                    <span style={{ width: isPublication ? "80%" : "72%" }}></span>
                    <span style={{ width: isFocus ? "70%" : "62%" }}></span>
                  </div>
                </div>
              <div className="showcase-content">
                <p className="showcase-meta">{item.type}</p>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="showcase-actions">
                  <AppLink
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noreferrer" : undefined}
                  >
                    View
                  </AppLink>
                </div>
              </div>
            </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default PatentShowcasePage;
