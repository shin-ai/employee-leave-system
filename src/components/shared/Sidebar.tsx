"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthStorageService } from "@/services/auth-storage";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store/app-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  CalendarDays,
  Info,
  LogOut,
  Menu,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
  badge?: number;
}

// ─── Sidebar Navigation Content ──────────────────────────────────────────────

function SidebarNavContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const store = useAppStore();

  const currentEmployee = store.employees.find((emp) => emp.id === user?.userId);
  const displayName = currentEmployee?.name || user?.email || "User";

  const pendingCount = isAdmin
    ? store.leaveRequests.filter((req) => req.status === "PENDING").length
    : 0;

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Employees",
      href: ROUTES.EMPLOYEES,
      icon: Users,
      show: isAdmin,
    },
    {
      name: "Teams",
      href: ROUTES.TEAMS,
      icon: UsersRound,
      show: isAdmin,
    },
    {
      name: "Leave Requests",
      href: ROUTES.LEAVE,
      icon: CalendarDays,
      show: true,
      badge: isAdmin ? pendingCount : undefined,
    },
    {
      name: "About",
      href: ROUTES.ABOUT,
      icon: Info,
      show: true,
    },
  ];

  const handleLogout = () => {
    AuthStorageService.logout();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 pt-6 pb-2",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
          <CalendarDays className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground transition-opacity duration-200">
            LeaveSys
          </span>
        )}
      </div>

      <Separator className="mx-4 mt-4 mb-2 opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation
          .filter((item) => item.show)
          .map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 dark:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="truncate transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
                {!collapsed && item.badge ? (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-semibold"
                  >
                    {item.badge}
                  </Badge>
                ) : null}
                {collapsed && item.badge ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-1 px-3 pb-4">
        <Separator className="mx-1 mb-3 opacity-50" />

        {/* Profile Link */}
        <Link
          href={ROUTES.PROFILE}
          onClick={onNavigate}
          title={collapsed ? "Profile" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/80 hover:text-foreground",
            collapsed && "justify-center px-2",
            pathname === "/profile" &&
              "bg-primary/10 text-primary shadow-sm shadow-primary/5 dark:bg-primary/15"
          )}
        >
          <User className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">Profile</span>}
        </Link>

        {/* Theme Toggle */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-1",
            collapsed && "justify-center px-0"
          )}
        >
          {!collapsed && (
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
          )}
          <div className={cn(!collapsed && "ml-auto")}>
            <ThemeToggle />
          </div>
        </div>

        <Separator className="mx-1 my-2 opacity-50" />

        {/* User Info */}
        {!collapsed && user && (
          <div className="rounded-xl bg-muted/50 px-3 py-2.5 dark:bg-muted/30">
            <p className="truncate text-xs font-medium text-foreground">
              {displayName}
            </p>
            <Badge
              variant="secondary"
              className="mt-1.5 h-[18px] px-1.5 text-[10px] font-semibold uppercase tracking-wider"
            >
              {isAdmin ? "Admin" : "Employee"}
            </Badge>
          </div>
        )}
        {collapsed && user && (
          <div
            className="flex items-center justify-center py-1"
            title={displayName}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase text-muted-foreground">
              {displayName.charAt(0)}
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
          className={cn(
            "w-full gap-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed ? "justify-center px-2" : "justify-start px-3"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Spacer: takes up space in the flex flow so main content shifts right */}
      <div
        className={cn(
          "hidden md:block shrink-0 transition-[width] duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
        aria-hidden="true"
      />

      {/* Fixed sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40",
          "border-r border-border/50",
          "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "md:w-[68px]" : "md:w-[260px]"
        )}
      >
        {/* Subtle gradient overlay for glassmorphism depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/20" />

        <div className="relative z-10 flex h-full flex-col">
          <SidebarNavContent collapsed={collapsed} />

          {/* Collapse toggle button */}
          <div className="border-t border-border/50 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full rounded-xl text-muted-foreground hover:text-foreground"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Mobile Sidebar ──────────────────────────────────────────────────────────

function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="sticky top-0 z-40 flex h-14 items-center px-4 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarNavContent
              collapsed={false}
              onNavigate={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// ─── Main Sidebar Export ─────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
