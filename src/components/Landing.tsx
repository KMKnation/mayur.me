import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { HeroSectionContent } from "../cms/types";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";

interface LandingProps extends PropsWithChildren {
  content?: HeroSectionContent;
}

const Landing = ({ children, content = DEFAULT_CMS_CONTENT.sections.hero }: LandingProps) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>{content.greeting}</h2>
            <h1>
              {content.firstName}
              <br />
              <span>{content.lastName}</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>{content.rolePrefix}</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{content.rolePrimary}</div>
              <div className="landing-h2-2">{content.roleSecondary}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">{content.taglinePrimary}</div>
              <div className="landing-h2-info-1">{content.taglineSecondary}</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
