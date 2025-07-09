
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/4e37cba3-373f-4630-ac8b-6fdea4e6d0e8.png" 
              alt="Calmon Academy" 
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
