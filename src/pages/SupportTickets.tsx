import React from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCompanyData } from '@/hooks/useCompanyData';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import { PageLayout } from '@/components/PageLayout';

export default function SupportTickets() {
  const { userRole } = useAuth();
  const { data: company } = useCompanyData();

  console.log('🔍 SupportTickets - userRole:', userRole, 'company:', company);

  // Se ainda está carregando, mostrar loading
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  const companyId = company?.id;

  return (
    <PageLayout
      title="Central de Suporte"
      subtitle="Gerencie seus chamados de suporte e obtenha ajuda quando precisar"
      background="dark"
    >
      <SupportTicketList 
        userRole={userRole as 'company' | 'producer'} 
        companyId={companyId}
      />
    </PageLayout>
  );
} 
