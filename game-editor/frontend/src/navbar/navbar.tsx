import React from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';


function classNames(...classes:string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = [
    { name: 'Projects', href: '/', current: false},
    { name: 'Trainers', href: '/trainer-editor', current: false },
    { name: 'Pokemon', href: '/pokemon-editor', current: false },
    { name: 'Overworld', href: '/overworld-editor', current: false },
    { name: 'Move', href: '/move-editor', current: false },
    { name: 'Jukebox', href: '/jukebox', current: false },
    { name: 'MapViewer', href: '/map-viewer', current: false}
  ]

  return (
    <Disclosure as="nav" className="bg-blueWhale">
      {({ open }) => (
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-[8.5vh] items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
                    alt="Pokeball logo"
                  />
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => navigate(item.href)}
                        className={classNames(
                          location.pathname === item.href ? 'bg-wildBlueYonder text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium'
                        )}
                        aria-current={location.pathname === item.href ? 'page' : undefined}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </Disclosure>
  );
}