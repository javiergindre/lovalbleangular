import { NavItem } from 'src/app/layouts/full/vertical/sidebar/nav-item/nav-item';
import { MenuItemDto } from '../models/menu/session';

export function transformMenu(menu: MenuItemDto[]): NavItem[] {
  return menu.map((item) => ({
    displayName: item.title,
    iconName: item.icon,
    route: item.to,
    children: item.children ? transformMenu(item.children) : [],
  }));
}
