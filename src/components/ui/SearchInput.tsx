import React, { FC } from 'react';
import { SearchIcon } from '../icons';

interface SearchInputProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

export const SearchInput: FC<SearchInputProps> = ({ placeholder, value, onChange }) => (
    <div className="relative mb-4">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-11 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
    </div>
);