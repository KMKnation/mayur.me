import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Project Lead Development</h4>
                <h5>Oracle AI and ML</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Leading AI and ML delivery with a focus on enterprise LLM
              systems, multi-agent architecture, and production-grade execution.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior Application Engineer</h4>
                <h5>Oracle</h5>
              </div>
              <h3>2021–23</h3>
            </div>
            <p>
              Built and scaled enterprise applications while driving AI-ready
              architecture, platform reliability, and cross-functional delivery.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Engineer</h4>
                <h5>Hidden Brains InfoTech</h5>
              </div>
              <h3>2018–21</h3>
            </div>
            <p>
              Developed full-stack solutions and contributed to production
              deployments across business-critical software projects.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer</h4>
                <h5>iView Labs</h5>
              </div>
              <h3>2016–18</h3>
            </div>
            <p>
              Started my engineering journey building web applications and core
              backend features with strong execution discipline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
