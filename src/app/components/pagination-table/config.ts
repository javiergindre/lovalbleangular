export interface ColumnConfig {
  name: string;
  displayName: string;
  type: 'text' | 'image' | 'custom' | 'date' | 'view';
  customHeaderClasses?: string;
  customClasses?: string;
  format?: (element: any) => string;
  imageConfig?: {
    imagePath: string;
    title: string;
    subtitle: string;
  };
}
