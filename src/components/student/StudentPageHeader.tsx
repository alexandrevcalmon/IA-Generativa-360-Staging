
import { SidebarTrigger } from '@/components/ui/sidebar';

interface StudentPageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const StudentPageHeader = ({ title, subtitle, children }: StudentPageHeaderProps) => {
  return (
    <div className="bg-white border-b p-4 md:p-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="flex md:hidden" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {children && (
              <div className="flex items-center gap-2">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
