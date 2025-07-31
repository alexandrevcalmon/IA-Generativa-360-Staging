import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout
      title="404 - Página não encontrada"
      subtitle="A página que você está procurando não existe"
      background="gradient"
      showSidebarTrigger={false}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </a>
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotFound;
