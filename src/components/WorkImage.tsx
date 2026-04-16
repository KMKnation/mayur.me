import { MdArrowOutward } from "react-icons/md";

interface Props {
  title: string;
  category: string;
  variant: number;
  link?: string;
}

const renderScene = (variant: number) => {
  switch (variant) {
    case 0:
      return (
        <div className="work-scene scene-agents" aria-hidden="true">
          <span className="agent-node agent-node-1"></span>
          <span className="agent-node agent-node-2"></span>
          <span className="agent-node agent-node-3"></span>
          <span className="agent-node agent-node-4"></span>
          <span className="agent-node agent-node-5"></span>
          <span className="agent-link agent-link-1"></span>
          <span className="agent-link agent-link-2"></span>
          <span className="agent-link agent-link-3"></span>
          <span className="agent-link agent-link-4"></span>
          <span className="agent-pulse"></span>
          <div className="agent-badge">Escalation Route</div>
        </div>
      );
    case 1:
      return (
        <div className="work-scene scene-compiler" aria-hidden="true">
          <div className="json-stack">
            <span className="json-line json-line-1">{"{ agents: [...] }"}</span>
            <span className="json-line json-line-2">{"{ status: OK }"}</span>
            <span className="json-line json-line-3">{"{ risk: low }"}</span>
          </div>
          <span className="compiler-arrow"></span>
          <div className="markdown-stack">
            <span className="md-line md-line-1"></span>
            <span className="md-line md-line-2"></span>
            <span className="md-line md-line-3"></span>
            <span className="md-line md-line-4"></span>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="work-scene scene-radar" aria-hidden="true">
          <span className="radar-ring radar-ring-1"></span>
          <span className="radar-ring radar-ring-2"></span>
          <span className="radar-ring radar-ring-3"></span>
          <span className="radar-sweep"></span>
          <span className="radar-blip radar-blip-1"></span>
          <span className="radar-blip radar-blip-2"></span>
          <span className="radar-blip radar-blip-3"></span>
          <span className="radar-blip radar-blip-4"></span>
        </div>
      );
    case 3:
      return (
        <div className="work-scene scene-vision" aria-hidden="true">
          <div className="vision-frame">
            <span className="scan-line"></span>
            <span className="vision-box vision-box-1"></span>
            <span className="vision-box vision-box-2"></span>
            <span className="vision-box vision-box-3"></span>
          </div>
          <div className="vision-text">
            <span className="vision-row vision-row-1"></span>
            <span className="vision-row vision-row-2"></span>
            <span className="vision-row vision-row-3"></span>
          </div>
        </div>
      );
    default:
      return (
        <div className="work-scene scene-viewmore" aria-hidden="true">
          <div className="viewmore-ring viewmore-ring-1"></div>
          <div className="viewmore-ring viewmore-ring-2"></div>
          <div className="viewmore-core"></div>
          <div className="viewmore-arrow">→</div>
          <div className="viewmore-label">Open Full Case Studies</div>
          <div className="viewmore-trail">
            <span className="viewmore-dot viewmore-dot-1"></span>
            <span className="viewmore-dot viewmore-dot-2"></span>
            <span className="viewmore-dot viewmore-dot-3"></span>
          </div>
        </div>
      );
  }
};

const WorkImage = (props: Props) => {
  const bannerLabel = `${props.title} - ${props.category}`;
  return (
    <div className="work-image" data-variant={props.variant}>
      <a
        className="work-image-in work-3d-banner"
        href={props.link}
        target="_blank"
        rel="noreferrer"
        data-cursor={"disable"}
        aria-label={bannerLabel}
      >
        {props.link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}
        {renderScene(props.variant)}

        <div className="work-3d-panel">
          <p className="work-3d-subtitle">{props.category}</p>
          <h5>{props.title}</h5>
        </div>
      </a>
    </div>
  );
};

export default WorkImage;
