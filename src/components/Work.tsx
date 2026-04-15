import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const assetBase = import.meta.env.BASE_URL;
const SHOWCASE_URL = `${assetBase}portfolio-showcase.html`;

const projects = [
  {
    title: "Autonomous Incident Agent Team",
    category: "Multi-Agent Incident Intelligence",
    tools: "Role orchestration, escalation routing, deterministic decision paths",
    image: `${assetBase}images/placeholder.webp`,
    link: "https://github.com/KMKnation",
  },
  {
    title: "Deterministic JSON-to-Markdown Engine",
    category: "LLM Output Compiler",
    tools: "Schema alignment, low-hallucination output, UI-ready formatting",
    image: `${assetBase}images/nextBL.webp`,
    link: "https://github.com/KMKnation",
  },
  {
    title: "Adaptive Query Radar",
    category: "Emergent Signal Detection",
    tools: "Trend clustering, alert intelligence, patent-backed architecture",
    image: `${assetBase}images/radix.png`,
    link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
  },
  {
    title: "Edge Vision Sentinel",
    category: "Computer Vision on Edge",
    tools: "OCR, recognition, low-latency inference, OpenVINO optimization",
    image: `${assetBase}images/sapphire.png`,
    link: "https://www.linkedin.com/in/mayurkanojiya/",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                        </div>
                        {index === projects.length - 1 ? (
                          <a
                            className="view-more-btn"
                            href={SHOWCASE_URL}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="disable"
                          >
                            View More
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${
                  index === currentIndex ? "carousel-dot-active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
