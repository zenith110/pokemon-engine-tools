import React from 'react';
import { Disclosure } from '@headlessui/react';
import { useNavigate, useLocation } from 'react-router-dom';
function classNames() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(Boolean).join(' ');
}
export default function NavBar() {
    var navigate = useNavigate();
    var location = useLocation();
    var navigation = [
        { name: 'Projects', href: '/', current: false },
        { name: 'Trainers', href: '/trainer-editor', current: false },
        { name: 'Pokemon', href: '/pokemon-editor', current: false },
        { name: 'Overworld', href: '/overworld-editor', current: false },
        { name: 'Move', href: '/move-editor', current: false },
        { name: 'Jukebox', href: '/jukebox', current: false },
        { name: 'MapViewer', href: '/map-viewer', current: false }
    ];
    return (React.createElement(Disclosure, { as: "nav", className: "bg-blueWhale" }, function (_a) {
        var open = _a.open;
        return (React.createElement("div", { className: "mx-auto max-w-7xl px-2 sm:px-6 lg:px-8" },
            React.createElement("div", { className: "relative flex h-[8.5vh] items-center justify-between" },
                React.createElement("div", { className: "flex flex-1 items-center justify-center sm:items-stretch sm:justify-start" },
                    React.createElement("div", { className: "flex flex-shrink-0 items-center" },
                        React.createElement("img", { className: "h-8 w-auto", src: "https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg", alt: "Pokeball logo" })),
                    React.createElement("div", { className: "hidden sm:block sm:ml-6" },
                        React.createElement("div", { className: "flex space-x-4" }, navigation.map(function (item) { return (React.createElement("button", { key: item.name, onClick: function () { return navigate(item.href); }, className: classNames(location.pathname === item.href ? 'bg-wildBlueYonder text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium'), "aria-current": location.pathname === item.href ? 'page' : undefined }, item.name)); })))))));
    }));
}
