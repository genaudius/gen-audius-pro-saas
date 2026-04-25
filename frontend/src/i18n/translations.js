/**
 * Gen Audius - Sistema de Traducción / Translation System
 * Español (es) por defecto | English (en) segundo idioma
 */

export const translations = {
    es: {
        // --- Navegación ---
        nav: {
            home: "HOME",
            generate: "GENERATE",
            studio: "STUDIO",
            library: "LIBRARY",
            login: "LOGIN",
            aiMusicCreator: "AI Music Creator",
        },

        // --- Hero Section ---
        hero: {
            title1: "La Revolución Musical",
            title2: "Está en Tus Manos",
            subtitle:
                "Crea hits con calidad de estudio usando solo un prompt o tus líricas. Impulsado por IA de última generación y el ADN de los Grandes de la Música.",
            placeholder: "Escribe tu hit aquí... (ej: Bachata con piano melancólico)",
            createBtn: "CREAR",
        },

        // --- Módulo de Creación ---
        create: {
            sectionLabel: "Fase 2 // Studio Engine",
            sectionTitle: "Produce tu Hit Real",
            welcomeMsg:
                "¡Bienvenido al Estudio Gen Audius! ¿Qué género vamos a producir hoy?",
            genreTitle: "1. GÉNERO MUSICAL",
            voiceTitle: "2. IDENTIDAD VOCAL",
            // Botones de voz — solo M y F visualmente
            voiceMale: "Masculino",
            voiceFemale: "Femenino",
            voiceMaleBtn: "M",
            voiceFemalBtn: "F",
            promptPlaceholder: "Describe tu canción... estilo, letra, BPM, mood...",
            generateBtn: "GENERAR",
            generating: "Generando...",
            aiBadge: "Gen Audius AI",
        },

        // --- Géneros musicales ---
        genres: {
            bachata: "Bachata ADN",
            reggaeton: "Reggaetón",
            trap: "Trap Latino",
            salsa: "Salsa Dura",
            amapiano: "Amapiano",
        },

        // --- Pricing ---
        pricing: {
            freeTitle: "Estudio Gratis",
            freeSubtitle: "Prueba la potencia de la IA musical.",
            freeFeat1: "3 Canciones por día",
            freeFeat2: "Calidad MP3",
            freeBtn: "REGÍSTRATE",
            proTitle: "Gen Audius Pro",
            proTag: "ULTRA",
            proSubtitle: "Poder total para productores.",
            proFeat1: "Generaciones Ilimitadas",
            proFeat2: "Exportación MIDI y Stems",
            proFeat3: "Modelos RVC Exclusivos",
            proBtn: "GO PRO NOW",
        },

        // --- Studio DAW ---
        studio: {
            activeProject: 'Active Project',
            consoleTitle: "Studio A Console",
            timelineTitle: "Timeline de Estructura",
            masterOutput: "MASTER OUTPUT: ON",
            listenBtn: "Escuchar Arreglo",
            voiceMale: "MAESTRO VOCAL (M)",
            voiceFemale: "VOZ FEMENINA (F)",
            masterFx: "Master FX Engine",
            saveBtn: "Guardar",
            exportBtn: "EXPORT MASTER",
            sliders: {
                timbre: "Timbre (Voz)",
                punch: "Punch (Beat)",
                energia: "Energía (BPM)",
                brillo: "Brillo (EQ)",
            },
        },

        // --- Admin Panel ---
        admin: {
            title: "Sistema Stitch Engine",
            subtitle: "Monitor de IA Musical en Tiempo Real",
        },

        // --- Footer ---
        footer: {
            copyright: "GEN AUDIUS © 2026",
            tagline: "La tecnología al servicio del sentimiento musical.",
        },

        // --- Legal & FAQ ---
        legal: {
            tosTitle: "Términos de Servicio: Gen Audius Pro",
            privacyTitle: "Política de Privacidad: Gen Audius Pro",
            acceptTerms: "Acepto los Términos y Condiciones",
            tosContent: `1. El Servicio: GEN AUDIUS LLC opera Gen Audius Pro. Al usar el servicio, aceptas estos términos.
2. Elegibilidad: Debes tener al menos 13 años. Eres responsable de la seguridad de tu cuenta.
3. Propiedad Intelectual: Los usuarios en planes de pago obtienen derechos comerciales sobre las composiciones. Otorgas una licencia de marketing a Gen Audius.
4. Clonado de Voz: El usuario garantiza poseer los derechos de la voz subida.
5. Créditos y Suscripciones: Los créditos no son reembolsables una vez usados. Cancelación disponible en cualquier momento.`,
            privacyContent: `1. Información que Recopilamos: Correo, datos de facturación (Stripe), archivos de audio y prompts.
2. Uso de Datos: Procesar pagos, entrenar modelos privados y optimizar el sistema.
3. Seguridad: Tus datos están cifrados. Puedes solicitar la eliminación total en cualquier momento.`
        },
        faq: {
            title: "Centro de Ayuda Gen Audius Pro",
            items: [
                {
                    q: "¿Cómo funciona el sistema de créditos?",
                    a: "$10 USD equivalen a 100 créditos. Cada generación consume una cantidad fija. Sin cargos ocultos."
                },
                {
                    q: "¿Qué incluye la suscripción mensual?",
                    a: "Acceso prioritario, créditos mensuales, almacenamiento ilimitado y herramientas avanzadas de Vocal Cloning y Mastering Pro."
                },
                {
                    q: "¿Soy el dueño de la música que genero?",
                    a: "¡Absolutamente! En los planes de pago, conservas el 100% de los derechos comerciales para Spotify, Apple Music, etc."
                },
                {
                    q: "¿Qué es el 'Vocal Cloning'?",
                    a: "Sube una muestra de tu voz y nuestra IA creará tu ADN vocal para que el sistema cante exactamente como tú."
                },
                {
                    q: "¿Cómo funciona la monetización?",
                    a: "Si compartes tu música en nuestra plataforma y genera reproducciones, acumularás ganancias retirables vía Stripe."
                },
                {
                    q: "¿Qué pasa si una generación falla?",
                    a: "Seguro de Créditos: Si ocurre un error técnico, los créditos se reembolsan automáticamente al instante."
                },
                {
                    q: "¿El mastering es profesional?",
                    a: "Sí. Algoritmos de nivel industrial optimizados para Bachata, Reggaetón, Trap y Amapiano, listos para radio (-14 LUFS)."
                }
            ]
        },
        profile: {
            title: "Mi Perfil",
            subtitle: "Administra tu identidad de artista y configuraciones globales.",
            artistInfo: "Información de Artista",
            security: "Seguridad & Verificación",
            integrations: "Redes & Integraciones",
            updateBtn: "Actualizar Perfil Pro",
            username: "Nombre de Usuario",
            artistType: "Tipo de Perfil Musical",
            bio: "Bio / Descripción Pública",
            verified: "Cuenta verificada correctamente.",
            pending: "Pendiente de verificación.",
            verifyBtn: "Verificar ahora",
            changePass: "Cambiar Contraseña",
            twoFactor: "Autenticación 2FA",
        }
    },

    en: {
        // --- Navigation ---
        nav: {
            home: "HOME",
            generate: "GENERATE",
            studio: "STUDIO",
            library: "LIBRARY",
            login: "LOGIN",
            aiMusicCreator: "AI Music Creator",
        },

        // --- Hero Section ---
        hero: {
            title1: "The Musical Revolution",
            title2: "Is In Your Hands",
            subtitle:
                "Create studio-quality hits using just a prompt or your lyrics. Powered by next-gen AI and the DNA of Music's Greatest Masters.",
            placeholder:
                "Write your hit here... (e.g. Bachata with melancholic piano)",
            createBtn: "CREATE",
        },

        // --- Creation Module ---
        create: {
            sectionLabel: "Phase 2 // Studio Engine",
            sectionTitle: "Produce Your Real Hit",
            welcomeMsg:
                "Welcome to Gen Audius Studio! What genre are we producing today?",
            genreTitle: "1. MUSICAL GENRE",
            voiceTitle: "2. VOCAL IDENTITY",
            // Voice buttons — M and F only visually
            voiceMale: "Male",
            voiceFemale: "Female",
            voiceMaleBtn: "M",
            voiceFemalBtn: "F",
            promptPlaceholder:
                "Describe your song... style, lyrics, BPM, mood...",
            generateBtn: "GENERATE",
            generating: "Generating...",
            aiBadge: "Gen Audius AI",
        },

        // --- Musical Genres ---
        genres: {
            bachata: "Bachata DNA",
            reggaeton: "Reggaeton",
            trap: "Latin Trap",
            salsa: "Hard Salsa",
            amapiano: "Amapiano",
        },

        // --- Pricing ---
        pricing: {
            freeTitle: "Free Studio",
            freeSubtitle: "Try the power of musical AI.",
            freeFeat1: "3 Songs per day",
            freeFeat2: "MP3 Quality",
            freeBtn: "SIGN UP",
            proTitle: "Gen Audius Pro",
            proTag: "ULTRA",
            proSubtitle: "Total power for producers.",
            proFeat1: "Unlimited Generations",
            proFeat2: "MIDI & Stems Export",
            proFeat3: "Exclusive RVC Models",
            proBtn: "GO PRO NOW",
        },

        // --- Studio DAW ---
        studio: {
            activeProject: "Active Project",
            consoleTitle: "Studio A Console",
            timelineTitle: "Structure Timeline",
            masterOutput: "MASTER OUTPUT: ON",
            listenBtn: "Listen to Arrangement",
            voiceMale: "MASTER VOCAL (M)",
            voiceFemale: "FEMALE VOICE (F)",
            masterFx: "Master FX Engine",
            saveBtn: "Save",
            exportBtn: "EXPORT MASTER",
            sliders: {
                timbre: "Timbre (Voice)",
                punch: "Punch (Beat)",
                energia: "Energy (BPM)",
                brillo: "Brightness (EQ)",
            },
        },

        // --- Admin Panel ---
        admin: {
            title: "Stitch Engine System",
            subtitle: "Real-Time AI Music Monitor",
        },

        // --- Footer ---
        footer: {
            copyright: "GEN AUDIUS © 2026",
            tagline: "Technology at the service of musical feeling.",
        },

        // --- Legal & FAQ ---
        legal: {
            tosTitle: "Terms of Service: Gen Audius Pro",
            privacyTitle: "Privacy Policy: Gen Audius Pro",
            acceptTerms: "I accept the Terms and Conditions",
            tosContent: `1. The Service: GEN AUDIUS LLC operates Gen Audius Pro. By using the service, you agree to these terms.
2. Eligibility: You must be at least 13 years old. You are responsible for your account security.
3. Intellectual Property: Paid plan users get commercial rights. You grant Gen Audius a marketing license.
4. Vocal Cloning: User guarantees they own the rights to uploaded voices.
5. Credits & Subscriptions: Credits are non-refundable once used. Cancel anytime.`,
            privacyContent: `1. Data We Collect: Email, billing data (Stripe), audio files, and prompts.
2. Data Use: Process payments, train private models, and optimize the system.
3. Security: Your data is encrypted. You can request total deletion at any time.`
        },
        faq: {
            title: "Gen Audius Pro Help Center",
            items: [
                {
                    q: "How does the credit system work?",
                    a: "$10 USD equals 100 credits. Each generation consumes a fixed amount. No hidden fees."
                },
                {
                    q: "What's included in the monthly subscription?",
                    a: "Priority access, monthly credits, unlimited storage, and advanced Vocal Cloning & Mastering Pro tools."
                },
                {
                    q: "Do I own the music I generate?",
                    a: "Absolutely! In paid plans, you keep 100% commercial rights for Spotify, Apple Music, etc."
                },
                {
                    q: "What is 'Vocal Cloning'?",
                    a: "Upload a voice sample and our AI creates your vocal DNA so the system sings exactly like you."
                },
                {
                    q: "How does monetization work?",
                    a: "Share your music on our platform and earn revenue withdrawable via Stripe."
                },
                {
                    q: "What happens if a generation fails?",
                    a: "Credit Insurance: If a technical error occurs, credits are automatically refunded instantly."
                },
                {
                    q: "Is the mastering professional?",
                    a: "Yes. Industry-level algorithms optimized for Bachata, Reggaeton, Trap, and Amapiano, radio-ready (-14 LUFS)."
                }
            ]
        },
        profile: {
            title: "My Profile",
            subtitle: "Manage your artist identity and global settings.",
            artistInfo: "Artist Information",
            security: "Security & Verification",
            integrations: "Social & Integrations",
            updateBtn: "Update Pro Profile",
            username: "Username",
            artistType: "Musical Profile Type",
            bio: "Bio / Public Description",
            verified: "Account verified successfully.",
            pending: "Pending verification.",
            verifyBtn: "Verify now",
            changePass: "Change Password",
            twoFactor: "2FA Authentication",
        }
    },
};

// Idiomas disponibles
export const LANGUAGES = [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇺🇸" },
];

export const DEFAULT_LANGUAGE = "es";
