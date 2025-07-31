
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
    <Card className="relative overflow-hidden bg-slate-900/20 backdrop-blur-xl border-0 shadow-lg !bg-slate-900/20">
      <CardContent className="p-8">
        <div className="flex flex-col gap-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Buscar cursos, instrutores ou tópicos..."
                className="pl-12 h-14 bg-slate-600/40 border-0 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-emerald-500/20 !bg-slate-600/40 !border-0 !text-slate-100 text-base"
              />
            </div>
          </div>
                      <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="Todos">
                <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-600/40 border-0 text-slate-100 focus:border-emerald-500/50 focus:ring-emerald-500/20 !bg-slate-600/40 !border-0 !text-slate-100">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-600 border-0 !bg-slate-600 !border-0">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-slate-100 hover:bg-slate-500 !text-slate-100">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select defaultValue="Todos os níveis">
                <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-600/40 border-0 text-slate-100 focus:border-emerald-500/50 focus:ring-500/20 !bg-slate-600/40 !border-0 !text-slate-100">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent className="bg-slate-600 border-0 !bg-slate-600 !border-0">
                  {levels.map(level => (
                    <SelectItem key={level} value={level} className="text-slate-100 hover:bg-slate-500 !text-slate-100">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
            <Button className="w-full sm:w-auto h-12 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 font-medium">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
