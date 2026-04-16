import "./styles/Career.css";
import { CareerContent } from "../cms/types";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";

interface CareerProps {
  content?: CareerContent;
}

const Career = ({ content = DEFAULT_CMS_CONTENT.sections.career }: CareerProps) => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          {content.title} <span>{content.highlight}</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {content.items.map((item) => (
            <div className="career-info-box" key={`${item.role}-${item.duration}`}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{item.role}</h4>
                  <h5>{item.company}</h5>
                </div>
                <h3>{item.duration}</h3>
              </div>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
