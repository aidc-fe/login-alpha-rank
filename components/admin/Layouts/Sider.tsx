'use client'

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from 'next/navigation'

export type SiderItem = {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
};

export interface SiderProps {
  items?: SiderItem[];
}

const Sider: React.FC<SiderProps> = ({ items }) => {
  const pathname = usePathname();
  
  const activeClass = (key: string) => {
    if (key === "/" && pathname !== "/") {
      return "";
    }

    if (pathname.includes(key)) {
      return "!bg-slate-100 text-slate-700";
    }

    return "";
  };

  const getMenuItemIcon = (menuItem: SiderItem) => {
    if (pathname.includes(menuItem.key)) {
      return menuItem.activeIcon || menuItem.icon;
    }
    return menuItem.icon || <span />;
  };

  return (
    <aside
      className={cn(
        "w-64 max-w-64 min-w-64 bg-white font-semibold border-r border-[rgba(0, 0, 0, .1)] fixed top-20 left-0 bottom-0"
      )}
    >
      <div className="max-h-full h-full flex flex-col justify-between">
        <div className="w-[254px] flex-1 overflow-hidden hover:overflow-auto sider-bar">
          <div className="w-[248px] h-full pt-5 pl-4 pr-2.5">
            {items?.map((route) => (
              <Link
                key={route.key}
                className={cn(
                  "flex items-center gap-3 cursor-pointer h-10 text-sm leading-10 pl-5 rounded-lg mb-1 transition-all duration-300 text-second hover:bg-neutral-100",
                  activeClass(route.key)
                )}
                href={route.key}
              >
                {getMenuItemIcon(route)} {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sider;
