
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ComponentSidebar from "@/components/ComponentSidebar";
import PropertiesSidebar from "@/components/PropertiesSidebar";
import EmailCanvas from "@/components/EmailCanvas";
import CodeView from "@/components/CodeView";
import { EmailComponent } from "@/types/email";

const Index = () => {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [codeView, setCodeView] = useState(false);
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [draggingComponentType, setDraggingComponentType] = useState<string | null>(null);
  
  const { toast } = useToast();

  // When components change, find the selected component
  const selectedComponent = selectedComponentId 
    ? components.find(comp => comp.id === selectedComponentId) || null
    : null;

  const handleComponentUpdate = (updatedComponent: EmailComponent) => {
    setComponents(components.map(comp => 
      comp.id === updatedComponent.id ? updatedComponent : comp
    ));
  };

  const handleDragStart = (type: string) => {
    setDraggingComponentType(type);
  };

  const handleDragEnd = () => {
    setDraggingComponentType(null);
  };

  const exportHtml = () => {
    // Create a CodeView instance to generate HTML
    const tempDiv = document.createElement('div');
    const codeView = document.createElement('div');
    tempDiv.appendChild(codeView);
    
    // Get HTML content
    const htmlContent = new CodeView({ components }).props.components;
    
    // Create Blob and download link
    const blob = new Blob([JSON.stringify(htmlContent)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    toast({
      title: "Template exported",
      description: "Your email template has been exported successfully.",
    });
  };

  // Add event listener for drag end
  useEffect(() => {
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        viewMode={viewMode}
        codeView={codeView}
        onViewModeChange={setViewMode}
        onCodeViewToggle={() => setCodeView(!codeView)}
        onExportHtml={exportHtml}
      />
      
      <div className="email-editor-container flex flex-1 overflow-hidden">
        <ComponentSidebar 
          collapsed={leftSidebarCollapsed} 
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          onDragStart={handleDragStart}
        />
        
        <div className="flex-1 overflow-hidden">
          {codeView ? (
            <CodeView components={components} />
          ) : (
            <EmailCanvas 
              components={components}
              viewMode={viewMode}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onUpdateComponents={setComponents}
            />
          )}
        </div>
        
        <PropertiesSidebar 
          collapsed={rightSidebarCollapsed} 
          onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          selectedComponent={selectedComponent}
          onComponentUpdate={handleComponentUpdate}
        />
      </div>
    </div>
  );
};

export default Index;
