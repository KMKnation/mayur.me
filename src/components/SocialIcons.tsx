import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { MdEmail, MdOutlineDescription } from "react-icons/md";
import "./styles/SocialIcons.css";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { SiteSettings, SocialLink } from "../cms/types";
import AppLink from "../routing/AppLink";

interface SocialIconsProps {
  links?: SocialLink[];
  settings?: SiteSettings;
}

const iconForPlatform = (platform: SocialLink["platform"]) => {
  switch (platform) {
    case "github":
      return <FaGithub />;
    case "linkedin":
      return <FaLinkedinIn />;
    case "email":
      return <MdEmail />;
    default:
      return <MdOutlineDescription />;
  }
};

const SocialIcons = ({
  links = DEFAULT_CMS_CONTENT.socialLinks,
  settings = DEFAULT_CMS_CONTENT.settings,
}: SocialIconsProps) => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement | null;
    if (!social) return;
    const cleanups: Array<() => void> = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      const getRect = () => elem.getBoundingClientRect();
      const initialRect = getRect();
      let mouseX = initialRect.width / 2;
      let mouseY = initialRect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        frame = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = getRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);

      updatePosition();

      cleanups.push(() => {
        document.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(frame);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {links
          .filter((link) => link.isVisible)
          .map((link) => (
            <span key={link.id}>
              <AppLink
                href={link.url}
                target={link.url.startsWith("http") || link.url.startsWith("mailto:") ? "_blank" : undefined}
                rel={link.url.startsWith("http") || link.url.startsWith("mailto:") ? "noreferrer" : undefined}
              >
                {iconForPlatform(link.platform)}
              </AppLink>
            </span>
          ))}
      </div>
      <AppLink
        className="resume-button"
        href={settings.resumeUrl}
        target="_blank"
        rel="noreferrer"
      >
        <HoverLinks text={settings.resumeLabel} />
        <span>
          <MdOutlineDescription />
        </span>
      </AppLink>
    </div>
  );
};

export default SocialIcons;
