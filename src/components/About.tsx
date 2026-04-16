import "./styles/About.css";
import { AboutSectionContent } from "../cms/types";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";

interface AboutProps {
  content?: AboutSectionContent;
}

const About = ({ content = DEFAULT_CMS_CONTENT.sections.about }: AboutProps) => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{content.title}</h3>
        <p className="para">{content.body}</p>
      </div>
    </div>
  );
};

export default About;
