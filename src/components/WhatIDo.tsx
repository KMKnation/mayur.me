import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { WhatIDoContent } from "../cms/types";

interface WhatIDoProps {
  content?: WhatIDoContent;
}

const WhatIDo = ({ content = DEFAULT_CMS_CONTENT.sections.whatIDo }: WhatIDoProps) => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);
  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          {content.titlePrimary.slice(0, 1)}
          <span className="hat-h2">{content.titlePrimary.slice(1)}</span>
          <div>
            {content.titleSecondary.slice(0, 1)}
            <span className="do-h2">{content.titleSecondary.slice(1)}</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          {content.cards.map((card, index) => (
            <div
              className="what-content what-noTouch"
              ref={(el) => setRef(el, index)}
              key={`${card.title}-${index}`}
            >
              <div className="what-border1">
                <svg height="100%">
                  {index === 0 ? (
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="0"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  ) : null}
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                </svg>
              </div>
              <div className="what-corner"></div>
              <div className="what-content-in">
                <h3>{card.title}</h3>
                <h4>{card.subtitle}</h4>
                <p>{card.description}</p>
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {card.skills.map((skill) => (
                    <div className="what-tags" key={`${card.title}-${skill}`}>
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="what-arrow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
