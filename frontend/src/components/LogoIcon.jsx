import React from 'react';

/**
 * LogoIcon - Versión Minimalista Oficial
 * Usa el activo icon.png de la carpeta brand.
 */
const LogoIcon = ({ className = "w-10 h-10" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <img 
                src="/assets/brand/icon.png" 
                alt="Gen Audius Icon" 
                className="w-full h-full object-contain"
            />
        </div>
    );
};

export default LogoIcon;
