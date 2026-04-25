import React, { createContext, useContext, useState } from 'react';
import { translations, DEFAULT_LANGUAGE } from './translations';

/**
 * Gen Audius - Language Context
 * Provides translation function `t()` and language switcher throughout the app.
 */

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(DEFAULT_LANGUAGE);

    /**
     * Translate a dot-notation key, e.g. t('hero.title1')
     * Falls back to the key itself if not found.
     */
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[lang];
        for (const k of keys) {
            value = value?.[k];
        }
        return value ?? key;
    };

    const changeLanguage = (code) => {
        if (translations[code]) setLang(code);
    };

    return (
        <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to access translations and language controls.
 * Usage:  const { t, lang, changeLanguage } = useLang();
 */
export const useLang = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
    return ctx;
};
