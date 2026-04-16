import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import Patent from "./Patent";
import setSplitText from "./utils/splitText";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { PublicCmsData } from "../cms/types";

const TechStack = lazy(() => import("./TechStack"));

interface MainContainerProps extends PropsWithChildren {
  cmsData?: PublicCmsData;
}

const MainContainer = ({
  children,
  cmsData = DEFAULT_CMS_CONTENT,
}: MainContainerProps) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  const sectionVisibility = {
    ...DEFAULT_CMS_CONTENT.settings.sectionVisibility,
    ...(cmsData.settings.sectionVisibility ?? {}),
  };

  return (
    <div className="container-main">
      <Cursor />
      <Navbar settings={cmsData.settings} />
      <SocialIcons links={cmsData.socialLinks} settings={cmsData.settings} />
      {isDesktopView && sectionVisibility.landing ? children : null}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            {sectionVisibility.landing ? (
              <Landing content={cmsData.sections.hero}>
                {!isDesktopView ? children : null}
              </Landing>
            ) : null}
            {sectionVisibility.about ? (
              <About content={cmsData.sections.about} />
            ) : null}
            {sectionVisibility.whatIDo ? (
              <WhatIDo content={cmsData.sections.whatIDo} />
            ) : null}
            {sectionVisibility.career ? (
              <Career content={cmsData.sections.career} />
            ) : null}
            {sectionVisibility.work ? <Work items={cmsData.workItems} /> : null}
            {sectionVisibility.patents ? (
              <Patent items={cmsData.patentItems} />
            ) : null}
            {isDesktopView && sectionVisibility.techstack ? (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack
                  items={cmsData.techItems}
                  animationSettings={cmsData.settings.animationSettings}
                />
              </Suspense>
            ) : null}
            {sectionVisibility.contact ? (
              <Contact
                contactInfo={cmsData.sections.contact}
                socialLinks={cmsData.socialLinks}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
