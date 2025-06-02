import React from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Pagination({ links, className }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className={`flex items-center justify-between ${className}`}>
            <div>
                {links[0].url && (
                    <button
                        onClick={() => Inertia.visit(links[0].url)}
                        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
                    >
                        &laquo; Pertama
                    </button>
                )}
            </div>

            <div className="flex space-x-1">
                {links.slice(1, -1).map((link, index) => (
                    <button
                        key={index}
                        onClick={() => Inertia.visit(link.url)}
                        className={`px-3 py-1 border rounded ${
                            link.active
                                ? 'bg-emerald-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            <div>
                {links[links.length - 1].url && (
                    <button
                        onClick={() => Inertia.visit(links[links.length - 1].url)}
                        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
                    >
                        Terakhir &raquo;
                    </button>
                )}
            </div>
        </div>
    );
}
