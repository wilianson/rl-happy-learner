import { InlineMath, BlockMath } from "react-katex";

/** Render text with **bold** and $inline math$ markdown into React nodes */
function renderRichText(text: string): React.ReactNode[] {
  // Split by bold (**text**) or inline math ($math$)
  const parts = text.split(/(\*\*[^*]+\*\*|\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={i} math={part.slice(1, -1)} />;
    }
    return <span key={i}>{part}</span>;
  });
}

interface TheorySectionProps {
  algorithm: AlgorithmInfo;
}

export default function TheorySection({ algorithm }: TheorySectionProps) {
  const { theory } = algorithm;

  return (
    <section className="theory-section" id="theory-section">
      <div className="theory-header">
        <span className="theory-icon" style={{ background: 'transparent', border: 'none', overflow: 'hidden', borderRadius: '50%' }}>
          <img src="/assets/happy_4.png" alt="Happy studying" style={{ width: '56px', height: '56px', objectFit: 'cover', transform: 'scale(1.2)', mixBlendMode: 'multiply' }} />
        </span>
        <div>
          <h2 className="theory-title">{theory.title}</h2>
          <p className="theory-env">
            Entorno: <strong>{algorithm.envLabel}</strong>
          </p>
        </div>
      </div>

      <p className="theory-description">{algorithm.description}</p>

      <div className="theory-cards">
        {theory.sections.map((section, i) => (
          <div key={i} className="theory-card">
            <h3 className="theory-card-heading">{section.heading}</h3>
            <p className="theory-card-text">{renderRichText(section.text)}</p>
            {section.equation && (
              <div className="theory-equation">
                <BlockMath math={section.equation} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
