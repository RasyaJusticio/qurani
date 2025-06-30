// Update the import path if the file exists at a different location, for example:
import { cn } from "@/lib/utils";
import { IS_IN_IFRAME } from "../../constants/global";
import React from "react";

type AppLayoutProps = {
    children?: React.ReactNode;
    className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
    return <main className={cn(IS_IN_IFRAME && "mt-[70px]", className)}>
        {children}
    </main>
};

export default AppLayout;