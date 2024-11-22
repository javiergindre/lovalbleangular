export type UserRole = 'provider' | 'non-provider';

export interface TabOption {
  label: string;
  value: string;
  isFinal : boolean;
  visibleTo: UserRole[];
  addConfirm?: {
    [key in UserRole]?: boolean;
  };
  addActions?: {
    [key in UserRole]?: boolean;
  };
  setActivities?: {
    [key in UserRole]?: {
      id: number;
      name: string;
      isActive: boolean;
    }[]; 
  };
  addSignature?: {
    [key in UserRole]?: boolean;
  };
  addDownload?: {
    [key in UserRole]?: boolean;
  };
  addView?: {
    [key in UserRole]?: boolean;
  };
  addCustomColumn?: {
    [key in UserRole]?: {
      type: 'icon' | 'text';
      content: string;
      action?: (element: any) => void;
      condition?: (element: any) => boolean; // Nuevo campo
    };
  };
}
