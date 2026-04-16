import { useEffect, useRef } from "react";

const techItems = [
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "LLM Systems",
  "Multi-Agent Orchestration",
  "Computer Vision",
  "OpenVINO",
  "RAG Pipelines",
  "Enterprise AI",
  "MLOps",
  "GenAI",
];

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const ballRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!canHover.matches) return;

    const repulsionRadius = 180;
    const maxPush = 96;

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
  }, []);

  return (
    <div className="techstack" ref={sectionRef} data-cursor="disable">
      <h2> My Techstack</h2>
      <div className="techstack-cloud">
        {techItems.map((item, index) => (
          <div
            key={item}
            className="tech-ball"
            ref={(node) => {
              ballRefs.current[index] = node;
            }}
          >
            <div className="tech-ball-inner">
              <span>{item}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
