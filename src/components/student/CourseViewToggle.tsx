
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
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
