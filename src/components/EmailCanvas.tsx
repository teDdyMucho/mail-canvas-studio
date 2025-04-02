
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types/email";
import EmailComponentRenderer from "./EmailComponentRenderer";

interface EmailCanvasProps {
  components: EmailComponent[];
  viewMode: 'desktop' | 'mobile';
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponents: (components: EmailComponent[]) => void;
}

const EmailCanvas = ({ 
  components, 
  viewMode, 
  selectedComponentId,
  onSelectComponent,
  onUpdateComponents
}: EmailCanvasProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const componentType = e.dataTransfer.getData('componentType');
    const componentContent = e.dataTransfer.getData('componentContent') || '';
    
    // If it's a new component being added from the sidebar
    if (componentType && !e.dataTransfer.getData('componentId')) {
      const newComponent = createNewComponent(componentType, componentContent);
      const updatedComponents = [...components];
      updatedComponents.splice(dropIndex, 0, newComponent);
      onUpdateComponents(updatedComponents);
      onSelectComponent(newComponent.id);
      return;
    }
    
    // If it's an existing component being reordered
    const draggedComponentId = e.dataTransfer.getData('componentId');
    if (draggedComponentId) {
      const dragIndex = components.findIndex(comp => comp.id === draggedComponentId);
      if (dragIndex === -1) return;
      
      const updatedComponents = [...components];
      const [removed] = updatedComponents.splice(dragIndex, 1);
      
      // Adjust dropIndex if needed (when moving a component down)
      const adjustedDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      updatedComponents.splice(adjustedDropIndex, 0, removed);
      
      onUpdateComponents(updatedComponents);
    }
  };

  const handleComponentDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('componentId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const createNewComponent = (type: string, content: string = ''): EmailComponent => {
    const baseComponent = {
      id: `component-${Date.now()}`,
      type: type as EmailComponent['type'],
      content: content || getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    
    switch (type) {
      case 'button':
        return {
          ...baseComponent,
          url: "#",
          styles: {
            ...baseComponent.styles,
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            paddingY: 10,
            paddingX: 20,
            borderRadius: 4,
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
          }
        };
      case 'image':
        return {
          ...baseComponent,
          src: "https://placehold.co/600x200",
          alt: "Placeholder image",
          styles: {
            ...baseComponent.styles,
            width: '100%',
          }
        };
      case 'columns':
        return {
          ...baseComponent,
          columns: [
            {
              id: `column-${Date.now()}-1`,
              components: [],
              styles: { width: '50%', padding: '10px' }
            },
            {
              id: `column-${Date.now()}-2`,
              components: [],
              styles: { width: '50%', padding: '10px' }
            }
          ],
          styles: {
            ...baseComponent.styles,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }
        };
      default:
        return baseComponent;
    }
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text':
        return 'Add your text here';
      case 'button':
        return 'Click me';
      default:
        return '';
    }
  };

  const getDefaultStyles = (type: string): Record<string, any> => {
    const baseStyles = {
      padding: '10px',
    };
    
    switch (type) {
      case 'text':
        return {
          ...baseStyles,
          fontSize: '16px',
          color: '#333333',
          lineHeight: '1.5',
        };
      case 'container':
        return {
          ...baseStyles,
          backgroundColor: '#FFFFFF',
          width: '100%',
          paddingY: 20,
          paddingX: 20,
        };
      case 'divider':
        return {
          borderTop: '1px solid #EEEEEE',
          margin: '20px 0',
          borderColor: '#EEEEEE',
          borderWidth: 1,
          borderStyle: 'solid',
        };
      case 'spacer':
        return {
          height: 20,
        };
      default:
        return baseStyles;
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const componentType = e.dataTransfer.getData('componentType');
    const componentContent = e.dataTransfer.getData('componentContent') || '';
    
    if (componentType && !e.dataTransfer.getData('componentId')) {
      const newComponent = createNewComponent(componentType, componentContent);
      onUpdateComponents([...components, newComponent]);
      onSelectComponent(newComponent.id);
    }
  };

  const handleComponentClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectComponent(id);
  };

  const handleCanvasClick = () => {
    onSelectComponent(null);
  };

  return (
    <div 
      className={cn(
        "email-canvas flex-1 overflow-auto",
        "flex flex-col items-center p-8"
      )}
      onClick={handleCanvasClick}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <div 
        className={cn(
          "bg-white shadow-md min-h-[400px] w-full max-w-3xl mx-auto overflow-hidden transition-all duration-300",
          viewMode === 'mobile' ? "max-w-sm" : "max-w-3xl"
        )}
      >
        {components.length === 0 ? (
          <div className="h-full flex items-center justify-center p-10 text-center text-muted-foreground border-2 border-dashed">
            <div>
              <p className="mb-2">Drag and drop components here</p>
              <p className="text-sm">Or click on components in the sidebar</p>
            </div>
          </div>
        ) : (
          components.map((component, index) => (
            <div 
              key={component.id}
              className={cn(
                "relative",
                selectedComponentId === component.id && "email-component",
                dragOverIndex === index && "component-dragging-over",
              )}
              onClick={(e) => handleComponentClick(e, component.id)}
              draggable
              onDragStart={(e) => handleComponentDragStart(e, component.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <EmailComponentRenderer component={component} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailCanvas;
