
export interface EmailColumn {
  id: string;
  components: EmailComponent[];
  styles: Record<string, any>;
}

export interface EmailComponent {
  id: string;
  type: 'text' | 'button' | 'image' | 'container' | 'columns' | 'divider' | 'spacer';
  content?: string;
  styles: Record<string, any>;
  
  // Additional properties based on component type
  url?: string;       // For button
  src?: string;       // For image
  alt?: string;       // For image
  columns?: EmailColumn[]; // For columns
}
