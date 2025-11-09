"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BookOpenCheck, Home, User, ShoppingBag, Heart, Settings, Star } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpenCheck className="size-6 text-primary" />
            <span className="font-bold font-headline">Learn & Shop</span>
          </Link>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip={{ children: "Home" }}
            >
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/user"}
              tooltip={{ children: "User Dashboard" }}
            >
              <Link href="/dashboard/user">
                <User />
                <span>User Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/wishlist"}
              tooltip={{ children: "My Wishlist" }}
            >
              <Link href="/dashboard/wishlist">
                <Heart />
                <span>My Wishlist</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/user/reviews")}
              tooltip={{ children: "My Reviews" }}
            >
              <Link href="/dashboard/user/reviews">
                <Star />
                <span>My Reviews</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/user/settings")}
              tooltip={{ children: "Profile Settings" }}
            >
              <Link href="/dashboard/user/settings">
                <Settings />
                <span>Profile Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/vendor"}
              tooltip={{ children: "Vendor Dashboard" }}
            >
              <Link href="/dashboard/vendor">
                <ShoppingBag />
                <span>Vendor Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
