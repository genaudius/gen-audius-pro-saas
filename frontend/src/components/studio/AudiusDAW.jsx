import React from 'react';

const AudiusDAW = () => {
    return (
        <div className="w-full h-full bg-[#18181A] relative flex flex-col overflow-hidden">
            <iframe 
                src="/opendaw/index.html?v=3" 
                title="openDAW Engine"
                className="w-full h-full border-none absolute inset-0"
                allow="cross-origin-isolated"
            />
        </div>
    );
};

export default AudiusDAW;
