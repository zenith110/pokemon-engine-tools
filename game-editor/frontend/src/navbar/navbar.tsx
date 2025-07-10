import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

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

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Pokemon Game Engine Editor
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}