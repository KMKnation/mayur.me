import { AnchorHTMLAttributes, MouseEvent, PropsWithChildren } from "react";
import { navigate, resolveHref } from "./router";

interface AppLinkProps
  extends PropsWithChildren,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
}

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

const AppLink = ({ href, children, onClick, ...props }: AppLinkProps) => {
  const resolvedHref = resolveHref(href);

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
    <a href={resolvedHref} onClick={onLinkClick} {...props}>
      {children}
    </a>
  );
};

export default AppLink;
