import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { WorkItem } from "../cms/types";
import AppLink from "../routing/AppLink";

interface WorkProps {
  items?: WorkItem[];
}

const getVariantFromPreset = (preset: string) => {
  const normalized = preset.toLowerCase();
  if (normalized.includes("agent")) return 0;
  if (normalized.includes("compiler")) return 1;
  if (normalized.includes("radar")) return 2;
  if (normalized.includes("vision")) return 3;
  return 4;
};

const Work = ({ items = DEFAULT_CMS_CONTENT.workItems }: WorkProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const projects = [...items]
    .filter((item) => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

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
    if (projects.length <= 1) return;
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide, projects.length]);

  const goToNext = useCallback(() => {
    if (projects.length <= 1) return;
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide, projects.length]);

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
                <div className="carousel-slide" key={project.id}>
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
                        {project.isViewMoreTile ? (
                          <AppLink
                            className="view-more-btn"
                            href={project.link}
                            target={project.link.startsWith("http") ? "_blank" : undefined}
                            rel={project.link.startsWith("http") ? "noreferrer" : undefined}
                            data-cursor="disable"
                          >
                            View More
                          </AppLink>
                        ) : null}
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        title={project.title}
                        category={project.category}
                        variant={getVariantFromPreset(project.animationPreset)}
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
