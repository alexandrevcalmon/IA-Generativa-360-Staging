
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface CourseViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const CourseViewToggle = ({ viewMode, onViewModeChange }: CourseViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        className={`h-10 px-3 transition-all duration-300 ${
          viewMode === 'grid' 
            ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-xl' 
            : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/80 hover:text-white'
        }`}
        size="sm"
        onClick={() => onViewModeChange('grid')}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        className={`h-10 px-3 transition-all duration-300 ${
          viewMode === 'list' 
            ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-xl' 
            : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/80 hover:text-white'
        }`}
        size="sm"
        onClick={() => onViewModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
