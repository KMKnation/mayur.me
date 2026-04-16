import AppLink from "../routing/AppLink";
import { WorkItem } from "../cms/types";
import "./styles/PublicPages.css";

interface WorkShowcasePageProps {
  items: WorkItem[];
}

const WorkShowcasePage = ({ items }: WorkShowcasePageProps) => {
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
          All <span>Work</span>
        </h1>
        <p className="public-lead">
          Dedicated work showcase with dynamic card content from CMS and
          animation motifs aligned to each project domain.
        </p>

        <section className="showcase-grid">
          {visibleItems.map((item) => {
            const preset = item.animationPreset.toLowerCase();
            const isRadar = preset.includes("radar");
            const isVision = preset.includes("vision");
            const isCompiler = preset.includes("compiler");
            const isAgents = preset.includes("agent");
            return (
              <article className="showcase-card" key={item.id}>
                <div className="showcase-scene">
                  <span
                    className={`scene-dot ${isVision ? "hot-orange" : ""}`}
                    style={{ top: "26%", left: "22%" }}
                  ></span>
                  <span
                    className={`scene-dot ${
                      isRadar || isAgents ? "hot-orange" : ""
                    }`}
                    style={{ top: "38%", left: "58%", animationDelay: "0.3s" }}
                  ></span>
                  <span
                    className={`scene-dot ${
                      isRadar || isCompiler ? "hot-red" : ""
                    }`}
                    style={{ top: "64%", left: "42%", animationDelay: "0.55s" }}
                  ></span>
                  <div className="scene-bars">
                    <span style={{ width: isCompiler ? "96%" : "88%" }}></span>
                    <span style={{ width: isAgents ? "84%" : "72%" }}></span>
                    <span style={{ width: isRadar ? "76%" : "62%" }}></span>
                  </div>
                </div>
              <div className="showcase-content">
                <p className="showcase-meta">{item.category}</p>
                <h3>{item.title}</h3>
                <p>{item.tools}</p>
                <div className="showcase-actions">
                  <AppLink
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noreferrer" : undefined}
                  >
                    Open
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

export default WorkShowcasePage;
