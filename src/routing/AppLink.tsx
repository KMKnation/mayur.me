import { AnchorHTMLAttributes, MouseEvent, PropsWithChildren } from "react";
import { navigate } from "./router";

interface AppLinkProps
  extends PropsWithChildren,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
}

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

const AppLink = ({ href, children, onClick, ...props }: AppLinkProps) => {
  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      isModifiedEvent(event) ||
      props.target === "_blank" ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("#")
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={onLinkClick} {...props}>
      {children}
    </a>
  );
};

export default AppLink;

