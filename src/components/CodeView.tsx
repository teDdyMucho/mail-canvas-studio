
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailComponent } from "@/types/email";

interface CodeViewProps {
  components: EmailComponent[];
}

const CodeView = ({ components }: CodeViewProps) => {
  const [html, setHtml] = useState("");
  
  useEffect(() => {
    const generatedHtml = generateHtml(components);
    setHtml(generatedHtml);
  }, [components]);

  const generateHtml = (components: EmailComponent[]): string => {
    // Email template wrapper
    const emailWrapper = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    img { max-width: 100%; }
    .wrapper { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="wrapper">
${componentsToHtml(components, 4)}
  </div>
</body>
</html>`.trim();
    
    return emailWrapper;
  };

  const componentsToHtml = (components: EmailComponent[], indentation: number = 0): string => {
    const indent = ' '.repeat(indentation);
    
    return components.map(component => {
      switch (component.type) {
        case 'text':
          return `${indent}<div style="${styleObjectToString(component.styles)}">${component.content}</div>`;
          
        case 'button':
          return `${indent}<div style="text-align: ${component.styles.textAlign || 'center'}; width: 100%;">
${indent}  <a href="${component.url || '#'}" style="${styleObjectToString(component.styles)}">${component.content}</a>
${indent}</div>`;
          
        case 'image':
          return `${indent}<div style="text-align: ${component.styles.textAlign || 'center'};">
${indent}  <img src="${component.src || ''}" alt="${component.alt || ''}" style="${styleObjectToString(component.styles)}">
${indent}</div>`;
          
        case 'container':
          return `${indent}<div style="${styleObjectToString(component.styles)}">${component.content}</div>`;
          
        case 'columns':
          if (!component.columns) return '';
          
          return `${indent}<div style="${styleObjectToString(component.styles)}">
${component.columns.map(column => 
  `${indent}  <div style="${styleObjectToString(column.styles)}">
${column.components.length ? componentsToHtml(column.components, indentation + 4) : ''}
${indent}  </div>`
).join('\n')}
${indent}</div>`;
          
        case 'divider':
          return `${indent}<hr style="${styleObjectToString(component.styles)}">`;
          
        case 'spacer':
          return `${indent}<div style="${styleObjectToString(component.styles)}"></div>`;
          
        default:
          return '';
      }
    }).join('\n');
  };

  const styleObjectToString = (styles: Record<string, any>): string => {
    const styleEntries = Object.entries(styles);
    let cssString = '';
    
    // Handle special padding properties
    if (styles.paddingX !== undefined) {
      cssString += `padding-left: ${styles.paddingX}px; padding-right: ${styles.paddingX}px; `;
    }
    
    if (styles.paddingY !== undefined) {
      cssString += `padding-top: ${styles.paddingY}px; padding-bottom: ${styles.paddingY}px; `;
    }
    
    // Add all other styles
    styleEntries.forEach(([key, value]) => {
      if (key !== 'paddingX' && key !== 'paddingY') {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        // Add px unit to numeric values if needed
        let cssValue = value;
        if (typeof value === 'number' && !['fontWeight', 'lineHeight', 'opacity', 'zIndex'].includes(key)) {
          cssValue = `${value}px`;
        }
        
        cssString += `${cssKey}: ${cssValue}; `;
      }
    });
    
    return cssString;
  };

  return (
    <ScrollArea className="h-full">
      <pre className="p-4 m-0 text-sm font-mono bg-muted/40">
        <code>{html}</code>
      </pre>
    </ScrollArea>
  );
};

export default CodeView;
