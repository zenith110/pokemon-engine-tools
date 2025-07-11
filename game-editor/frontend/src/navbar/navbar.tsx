import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useProjects } from '../contexts/ProjectContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Trainer Editor', href: '/trainer-editor' },
  { name: 'Pokemon Editor', href: '/pokemon-editor' },
  { name: 'Move Editor', href: '/move-editor' },
  { name: 'Script Editor', href: '/script-editor' },
  { name: 'Overworld Editor', href: '/overworld-editor' },
  { name: 'Map Editor', href: '/map-editor' },
  { name: 'Jukebox', href: '/jukebox' },
];

export default function Navbar() {
  const location = useLocation();
  const { hasSelectedProject, isLoading } = useProjects();

  // Filter navigation items based on project selection
  const visibleNavigation = hasSelectedProject 
    ? navigation 
    : navigation.filter(item => item.href === '/');

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
            <img
              className="h-8 w-auto"
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
              alt="Pokeball logo"
            />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? 'border-tealBlue text-white'
                      : 'border-transparent text-slate-300 hover:border-slate-700 hover:text-white',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tealBlue"></div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}