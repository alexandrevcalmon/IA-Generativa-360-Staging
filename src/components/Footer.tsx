
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/4e37cba3-373f-4630-ac8b-6fdea4e6d0e8.png" 
                alt="Calmon Academy" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400">
              Transformando carreiras através da educação corporativa.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/courses" className="hover:text-calmon-400 transition-colors">Cursos</Link></li>
              <li><Link to="/community" className="hover:text-calmon-400 transition-colors">Comunidade</Link></li>
              <li><Link to="/analytics" className="hover:text-calmon-400 transition-colors">Analytics</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-calmon-400 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Calmon Academy. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
