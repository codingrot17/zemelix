import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-background px-4 py-4 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} Zemelix E-commerce. All rights reserved.
    </footer>
  );
}
