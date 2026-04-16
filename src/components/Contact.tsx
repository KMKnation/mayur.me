import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { ContactInfo, SocialLink } from "../cms/types";
import AppLink from "../routing/AppLink";

interface ContactProps {
  contactInfo?: ContactInfo;
  socialLinks?: SocialLink[];
}

const Contact = ({
  contactInfo = DEFAULT_CMS_CONTENT.sections.contact,
  socialLinks = DEFAULT_CMS_CONTENT.socialLinks,
}: ContactProps) => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>{contactInfo.title}</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>{contactInfo.connectTitle}</h4>
            {contactInfo.connectLinks.map((item) => (
              <p key={item.href}>
                <AppLink
                  href={item.href}
                  target={item.href.startsWith("http") || item.href.startsWith("mailto:") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") || item.href.startsWith("mailto:") ? "noreferrer" : undefined}
                  data-cursor="disable"
                >
                  {item.label}
                </AppLink>
              </p>
            ))}
            <h4>{contactInfo.educationTitle}</h4>
            {contactInfo.educationLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="contact-box">
            <h4>{contactInfo.socialTitle}</h4>
            {socialLinks
              .filter((item) => item.isVisible)
              .map((item) => (
                <AppLink
                  key={item.id}
                  href={item.url}
                  target={item.url.startsWith("http") || item.url.startsWith("mailto:") ? "_blank" : undefined}
                  rel={item.url.startsWith("http") || item.url.startsWith("mailto:") ? "noreferrer" : undefined}
                  data-cursor="disable"
                  className="contact-social"
                >
                  {item.label} <MdArrowOutward />
                </AppLink>
              ))}
          </div>
          <div className="contact-box">
            <h2>
              {contactInfo.footerTitle} <br /> by{" "}
              <span>{contactInfo.footerHighlight}</span>
            </h2>
            <h5>
              <MdCopyright /> {contactInfo.copyrightText}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
