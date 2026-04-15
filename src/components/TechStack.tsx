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
  return (
    <div className="techstack">
      <h2> My Techstack</h2>
      <div className="techstack-grid" data-cursor="disable">
        {techItems.map((item) => (
          <div key={item} className="techstack-chip">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
