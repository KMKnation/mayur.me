import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { DEFAULT_CMS_CONTENT } from "../cms/defaultContent";
import { clampAnimationSettings } from "../cms/animation";
import { AnimationSettings, TechItem } from "../cms/types";

interface TechStackProps {
  items?: TechItem[];
  animationSettings?: AnimationSettings;
}

const TechStack = ({
  items = DEFAULT_CMS_CONTENT.techItems,
  animationSettings = DEFAULT_CMS_CONTENT.settings.animationSettings,
}: TechStackProps) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const ballRefs = useRef<Array<HTMLDivElement | null>>([]);
  const normalizedAnimation = useMemo(
    () => clampAnimationSettings(animationSettings),
    [animationSettings]
  );
  const techItems = items
    .filter((item) => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!canHover.matches) return;

    const repulsionRadius = normalizedAnimation.cursorRepulsionRadius;
    const maxPush = normalizedAnimation.cursorRepulsionStrength;

    const resetRepulsion = () => {
      ballRefs.current.forEach((ball) => {
        if (!ball) return;
        ball.style.setProperty("--repel-x", "0px");
        ball.style.setProperty("--repel-y", "0px");
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const pointerX = event.clientX;
      const pointerY = event.clientY;

      ballRefs.current.forEach((ball) => {
        if (!ball) return;
        const ballRect = ball.getBoundingClientRect();
        const centerX = ballRect.left + ballRect.width / 2;
        const centerY = ballRect.top + ballRect.height / 2;
        const deltaX = centerX - pointerX;
        const deltaY = centerY - pointerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance >= repulsionRadius || distance === 0) {
          ball.style.setProperty("--repel-x", "0px");
          ball.style.setProperty("--repel-y", "0px");
          return;
        }

        const normalizedDistance = Math.max(distance, 18);
        const force = Math.pow(
          (repulsionRadius - normalizedDistance) / repulsionRadius,
          1.25
        );
        const escapeX = (deltaX / normalizedDistance) * maxPush * force;
        const escapeY = (deltaY / normalizedDistance) * maxPush * force;

        ball.style.setProperty("--repel-x", `${escapeX.toFixed(2)}px`);
        ball.style.setProperty("--repel-y", `${escapeY.toFixed(2)}px`);
      });
    };

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", resetRepulsion);
    section.addEventListener("pointercancel", resetRepulsion);

    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", resetRepulsion);
      section.removeEventListener("pointercancel", resetRepulsion);
      resetRepulsion();
    };
  }, [
    normalizedAnimation.cursorRepulsionRadius,
    normalizedAnimation.cursorRepulsionStrength,
  ]);

  const getBallStyle = (index: number): CSSProperties =>
    ({
      "--duration": `${Math.max(
        3.2,
        12 - normalizedAnimation.techBallFloatSpeed + (index % 4) * 0.65
      ).toFixed(2)}s`,
      "--float-y": `${Math.max(
        4,
        normalizedAnimation.techBallIntensity + ((index % 3) - 1) * 2.2
      ).toFixed(2)}px`,
      "--delay": `${(index % 5) * 0.22}s`,
    }) as CSSProperties;

  return (
    <div className="techstack" ref={sectionRef} data-cursor="disable">
      <h2> My Techstack</h2>
      <div className="techstack-cloud">
        {techItems.map((item, index) => (
          <div
            key={item.id}
            className="tech-ball"
            ref={(node) => {
              ballRefs.current[index] = node;
            }}
            style={getBallStyle(index)}
          >
            <div className="tech-ball-inner">
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
