
import { ReactNode } from "react";

interface MentorshipSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const MentorshipSection = ({ title, icon, children }: MentorshipSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {icon}
        {title}
      </h2>
      <div className="grid gap-4">
        {children}
      </div>
    </div>
  );
};
