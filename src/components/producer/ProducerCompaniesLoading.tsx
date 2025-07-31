
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export function ProducerCompaniesLoading() {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h1>
              <p className="text-gray-600">Carregando empresas...</p>
            </div>
          </div>
          <Button disabled className="bg-gradient-to-r from-calmon-500 to-calmon-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6 bg-gray-50 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-10 w-full lg:col-span-1" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
