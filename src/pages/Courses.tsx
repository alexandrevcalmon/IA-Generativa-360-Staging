
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Clock,
  Users,
  Star,
  Play,
  Award,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useState } from "react";

const Courses = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const courses = [
    {
      id: 1,
      title: "Fundamentos de IA Generativa",
      description: "Aprenda os conceitos básicos da Inteligência Artificial Generativa e suas aplicações práticas.",
      instructor: "Dr. Maria Silva",
      duration: "4h 30min",
      students: 1250,
      rating: 4.9,
      level: "Iniciante",
      category: "IA Generativa",
      thumbnail: "/api/placeholder/300/180",
      progress: 0,
      price: "Incluído",
      tags: ["IA", "Machine Learning", "Básico"]
    },
    {
      id: 2,
      title: "Prompt Engineering Avançado",
      description: "Domine técnicas avançadas de prompt engineering para ChatGPT, Claude e outras IAs.",
      instructor: "Prof. João Santos",
      duration: "6h 15min",
      students: 890,
      rating: 4.8,
      level: "Avançado",
      category: "Técnicas",
      thumbnail: "/api/placeholder/300/180",
      progress: 75,
      price: "Incluído",
      tags: ["Prompts", "ChatGPT", "Avançado"]
    },
    {
      id: 3,
      title: "Saúde Mental no Ambiente Corporativo",
      description: "Estratégias para manter o bem-estar mental no trabalho e lidar com o estresse.",
      instructor: "Dra. Ana Costa",
      duration: "3h 45min",
      students: 2100,
      rating: 4.7,
      level: "Todos os níveis",
      category: "Bem-estar",
      thumbnail: "/api/placeholder/300/180",
      progress: 0,
      price: "Incluído",
      tags: ["Saúde Mental", "Bem-estar", "Corporativo"]
    },
    {
      id: 4,
      title: "IA para Desenvolvedores",
      description: "Integre IA em suas aplicações usando APIs modernas e ferramentas de desenvolvimento.",
      instructor: "Tech Team",
      duration: "8h 20min",
      students: 650,
      rating: 4.9,
      level: "Intermediário",
      category: "Desenvolvimento",
      thumbnail: "/api/placeholder/300/180",
      progress: 25,
      price: "Incluído",
      tags: ["Desenvolvimento", "APIs", "Programação"]
    },
    {
      id: 5,
      title: "Ética em IA e Responsabilidade",
      description: "Entenda os aspectos éticos do uso de IA e como implementar práticas responsáveis.",
      instructor: "Prof. Carlos Lima",
      duration: "2h 50min",
      students: 430,
      rating: 4.6,
      level: "Todos os níveis",
      category: "Ética",
      thumbnail: "/api/placeholder/300/180",
      progress: 100,
      price: "Incluído",
      tags: ["Ética", "Responsabilidade", "Governança"]
    },
    {
      id: 6,
      title: "Automação com IA Generativa",
      description: "Automatize tarefas do dia a dia usando ferramentas de IA generativa.",
      instructor: "Equipe Automação",
      duration: "5h 10min",
      students: 780,
      rating: 4.8,
      level: "Intermediário",
      category: "Automação",
      thumbnail: "/api/placeholder/300/180",
      progress: 0,
      price: "Incluído",
      tags: ["Automação", "Produtividade", "Ferramentas"]
    }
  ];

  const categories = ["Todos", "IA Generativa", "Técnicas", "Bem-estar", "Desenvolvimento", "Ética", "Automação"];
  const levels = ["Todos os níveis", "Iniciante", "Intermediário", "Avançado"];

  const CourseCard = ({ course, isListView = false }: { course: any, isListView?: boolean }) => (
    <Card className={`hover-lift transition-all duration-200 ${isListView ? 'flex flex-row' : ''}`}>
      <div className={`${isListView ? 'w-48 flex-shrink-0' : 'w-full'}`}>
        <div className={`relative ${isListView ? 'h-32' : 'h-48'} bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg ${isListView ? 'rounded-l-lg rounded-tr-none' : ''} flex items-center justify-center`}>
          <Play className="h-12 w-12 text-white" />
          {course.progress > 0 && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              {course.progress === 100 ? 'Concluído' : `${course.progress}%`}
            </Badge>
          )}
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''}`}>
        <CardHeader className={isListView ? 'pb-2' : ''}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`${isListView ? 'text-lg' : 'text-xl'} mb-2`}>
                {course.title}
              </CardTitle>
              <CardDescription className={`${isListView ? 'line-clamp-2' : 'line-clamp-3'} mb-3`}>
                {course.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {course.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className={isListView ? 'pt-0' : ''}>
          <div className={`${isListView ? 'flex items-center justify-between' : 'space-y-3'}`}>
            <div className={`${isListView ? 'flex items-center space-x-4 text-sm' : 'space-y-2 text-sm'}`}>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {course.students.toLocaleString()}
              </div>
              <div className="flex items-center text-gray-600">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </div>
            </div>
            
            <div className={`${isListView ? 'flex items-center space-x-3' : 'flex justify-between items-center'}`}>
              <div className={`${isListView ? 'text-right' : ''}`}>
                <Badge variant="outline" className="mb-2">
                  {course.level}
                </Badge>
                <p className="text-xs text-gray-600">{course.instructor}</p>
              </div>
              
              <Button className="ai-gradient text-white">
                {course.progress > 0 ? 'Continuar' : 'Começar'}
              </Button>
            </div>
          </div>
          
          {course.progress > 0 && course.progress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );

  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Catálogo de Cursos</h1>
                  <p className="text-gray-600">Explore nossa biblioteca completa de conhecimento</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar cursos, instrutores ou tópicos..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Select defaultValue="Todos">
                        <SelectTrigger className="w-48">
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
                        <SelectTrigger className="w-48">
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
                      
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Tabs */}
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
                  <TabsTrigger value="completed">Concluídos</TabsTrigger>
                  <TabsTrigger value="bookmarked">Favoritos</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {courses.length} cursos disponíveis
                    </h2>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mais Recentes</SelectItem>
                        <SelectItem value="popular">Mais Populares</SelectItem>
                        <SelectItem value="rating">Melhor Avaliados</SelectItem>
                        <SelectItem value="duration">Duração</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                    {courses.map(course => (
                      <CourseCard key={course.id} course={course} isListView={viewMode === 'list'} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      2 cursos em andamento
                    </h2>
                  </div>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                    {courses.filter(course => course.progress > 0 && course.progress < 100).map(course => (
                      <CourseCard key={course.id} course={course} isListView={viewMode === 'list'} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      1 curso concluído
                    </h2>
                  </div>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                    {courses.filter(course => course.progress === 100).map(course => (
                      <CourseCard key={course.id} course={course} isListView={viewMode === 'list'} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="bookmarked" className="space-y-6">
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum curso favoritado ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Marque cursos como favoritos para acessá-los rapidamente
                    </p>
                    <Button variant="outline">
                      Explorar Cursos
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Courses;
