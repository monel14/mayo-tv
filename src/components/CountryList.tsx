import React, { FC } from 'react';
import { EmptyStateIcon } from './icons';

interface CountryListProps {
    countries: string[];
    onSelect: (country: string) => void;
}

export const CountryList: FC<CountryListProps> = ({ countries, onSelect }) => (
    <div className="space-y-3 animate-fade-in">
        {countries.length > 0 ? countries.map(country => (
            <button
                key={country}
                onClick={() => onSelect(country)}
                className="category-item bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3.5 px-4 rounded-lg border-b-4 border-red-800 text-center block w-full transition-transform duration-200 transform hover:scale-[1.03] active:scale-[0.98] active:border-b-2"
            >
                {country.toUpperCase()}
            </button>
        )) : (
            <div className="text-center text-gray-500 mt-12 animate-fade-in">
                <EmptyStateIcon className="mx-auto text-gray-400" />
                <p className="mt-4 text-lg">Aucun pays trouvé.</p>
                <p className="text-sm">Essayez de modifier votre recherche.</p>
            </div>
        )}
    </div>
);