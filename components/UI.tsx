import React from 'react';
import { Loader2 } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = "", title }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg ${className}`}>
    {title && (
      <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-cyan-400 font-mono">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean, variant?: 'primary' | 'secondary' | 'danger' }> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = "", 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-gray-900 focus:ring-cyan-500",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1.5 font-mono">{label}</label>}
    <input 
      className={`w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono placeholder-gray-600 ${className}`}
      {...props}
    />
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1.5 font-mono">{label}</label>}
    <textarea 
      className={`w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono placeholder-gray-600 ${className}`}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]} font-mono`}>
      {children}
    </span>
  );
};