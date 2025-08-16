import React, { FC, useState, useRef, useEffect } from 'react';
import { SearchIcon } from '../icons';

interface EnhancedSearchProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    suggestions?: string[];
    onSuggestionSelect?: (suggestion: string) => void;
}

export const EnhancedSearch: FC<EnhancedSearchProps> = ({ 
    placeholder, 
    value, 
    onChange, 
    suggestions = [],
    onSuggestionSelect 
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = suggestions
        .filter(suggestion => 
            suggestion.toLowerCase().includes(value.toLowerCase()) && 
            suggestion.toLowerCase() !== value.toLowerCase()
        )
        .slice(0, 5);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current && 
                !suggestionsRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        onSuggestionSelect?.(suggestion);
        setShowSuggestions(false);
        inputRef.current?.blur();
    };

    const clearSearch = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className="relative mb-6">
            <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full bg-white dark:bg-gray-800 border-2 rounded-2xl py-4 pl-12 pr-12 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-lg ${
                        isFocused 
                            ? 'border-red-500 dark:border-red-400 shadow-red-500/20 dark:shadow-red-400/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                />
                
                {/* Icône de recherche */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className={`w-5 h-5 transition-colors duration-200 ${
                        isFocused ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                </div>

                {/* Bouton clear */}
                {value && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                <SearchIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800 dark:text-gray-200">{suggestion}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};