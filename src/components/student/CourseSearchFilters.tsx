
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface CourseSearchFiltersProps {
  categories: string[];
  levels: string[];
}

export const CourseSearchFilters = ({ categories, levels }: CourseSearchFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar cursos, instrutores ou tópicos..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue="Todos">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select defaultValue="Todos os níveis">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
