import { memo } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const LaTeXRenderer = memo(function LaTeXRenderer({ children, inline = true }) {
  if (!children || typeof children !== 'string') {
    return <span>{children}</span>;
  }

  // Check if the text contains LaTeX (starts and ends with $)
  const hasLatex = children.includes('$');
  
  if (!hasLatex) {
    return <span>{children}</span>;
  }

  try {
    // Split text by $ to separate LaTeX from regular text
    const parts = children.split(/(\$[^$]+\$)/g);
    
    return (
      <span>
        {parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            // This is LaTeX - remove the $ delimiters and render
            const latex = part.slice(1, -1);
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: !inline,
              output: 'html'
            });
            
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className="katex-rendered"
              />
            );
          } else {
            // Regular text
            return <span key={index}>{part}</span>;
          }
        })}
      </span>
    );
  } catch (error) {
    console.warn('LaTeX rendering error:', error);
    return <span>{children}</span>;
  }
});

export default LaTeXRenderer;