import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { searchAddresses } from '../services/geoService';
import { AddressSuggestion } from '../types/solar';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Tapez votre adresse...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (value.length >= 3) {
        setIsLoading(true);
        try {
          const results = await searchAddresses(value);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Erreur de recherche:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.label);
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 text-base font-medium placeholder-gray-400 shadow-soft"
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-strong max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-6 py-4 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none border-b border-gray-50 last:border-b-0 transition-colors duration-200"
            >
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {suggestion.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {suggestion.context}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};