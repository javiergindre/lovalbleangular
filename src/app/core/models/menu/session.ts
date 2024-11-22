import { Workflow } from "../workflows/workflow";

export interface Session {
  personName: string;
  userName: string;
  id: number;
  tenants: TenantItem[];
  menu: MenuItemDto[];
  workflows: Workflow[];
  tenantName: string;
  tenantCode: string;
  onLogin: undefined;
  onLogout: undefined;
  onLogoutType: number;
  isProvider: boolean;
  isSalesManager: boolean;
  isHealthSupervisor: boolean;
  defaultUrl: string;
}

export interface TenantSession {
  menu: MenuItemDto[];
  tenantName: string;
  tenantCode: string;
  onLogin: undefined;
  onLogout: undefined;
  onLogoutType: number;
}

export interface TenantItem {
  id: number;
  name: string;
  code: string;
}

export interface MenuItemDto {
  children: MenuItemDto[] | undefined;
  to: string | undefined;
  icon: string | undefined;
  title: string;
  level: number;
  description: string;
}

export interface MenuSearchResult {
  item: MenuItemDto;
  path: MenuItemDto[];
}
