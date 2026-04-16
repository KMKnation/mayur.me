import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { SiteSettings } from "../cms/types";
import AppLink from "../routing/AppLink";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

interface NavbarProps {
  settings?: SiteSettings;
}

const Navbar = ({ settings = DEFAULT_CMS_CONTENT.settings }: NavbarProps) => {
  useEffect(() => {
    if (smoother) {
      smoother.kill();
    }
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const links = document.querySelectorAll(".header ul a");
    const clickHandlers = new Map<HTMLAnchorElement, (e: Event) => void>();
    links.forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      const handler = (e: Event) => {
        const clickEvent = e as MouseEvent;
        const targetElem = e.currentTarget as HTMLAnchorElement;
        const section = targetElem.getAttribute("data-href");
        if (!section || !section.startsWith("#")) return;
        if (window.innerWidth > 1024) {
          clickEvent.preventDefault();
          smoother.scrollTo(section, true, "top top");
        }
      };
      clickHandlers.set(element, handler);
      element.addEventListener("click", handler);
    });
    const onResize = () => {
      ScrollSmoother.refresh(true);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clickHandlers.forEach((handler, element) => {
        element.removeEventListener("click", handler);
      });
      window.removeEventListener("resize", onResize);
      smoother?.kill();
    };
  }, []);
  return (
    <>
      <div className="header">
        <AppLink href="/" className="navbar-title" data-cursor="disable">
          {settings.heroInitials}
        </AppLink>
        <a
          href={settings.profileUrl}
          className="navbar-connect"
          data-cursor="disable"
          target="_blank"
          rel="noreferrer"
        >
          {settings.linkedinHandle}
        </a>
        <ul>
          {settings.navigation
            .filter((item) => item.isVisible)
            .map((item) => (
              <li key={`${item.label}-${item.href}`}>
                {item.type === "section" ? (
                  <a data-href={item.href} href={item.href}>
                    <HoverLinks text={item.label} />
                  </a>
                ) : (
                  <AppLink href={item.href} data-cursor="disable">
                    <HoverLinks text={item.label} />
                  </AppLink>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
