import React from "react";
import { useCompanyData } from "@/hooks/useCompanyData";
import { CollaboratorManagement } from "@/components/collaborator/CollaboratorManagement";

const CompanyCollaborators: React.FC = () => {
  const { data: companyData } = useCompanyData();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Colaboradores
          </h1>
          <p className="text-gray-400 mt-2">
            Gerencie os colaboradores da {companyData?.name || 'empresa'}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <CollaboratorManagement />
        </div>
      </div>
    </div>
  );
};

export default CompanyCollaborators;
