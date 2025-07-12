
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CollaboratorManagement } from "@/components/collaborator/CollaboratorManagement";
import { useCompanyData } from "@/hooks/useCompanyData";

const CompanyCollaborators = () => {
  const { data: companyData } = useCompanyData();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
            <p className="text-gray-600">
              Gerencie os colaboradores da {companyData?.name || 'empresa'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <CollaboratorManagement />
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaborators;

