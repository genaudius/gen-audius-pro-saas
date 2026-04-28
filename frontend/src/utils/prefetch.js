/**
 * Idle Prefetch — pre-warms likely-next route chunks after initial load.
 * Uses requestIdleCallback so it never competes with user interaction.
 * Result: when the user clicks "Studio" or opens Login, the chunk is already cached.
 */

const prefetchTargets = [
    () => import('../components/StudioLayout'),
    () => import('../components/v3/PageCreatorV3'),
    () => import('../components/v3/PageExplore'),
    () => import('../components/v3/PageLibrary'),
    () => import('../components/v3/PagePlans'),
];

export function startIdlePrefetch() {
    if (typeof window === 'undefined') return;

    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));

    // Wait for full window load + a small buffer, then warm chunks one by one
    const kickoff = () => {
        let i = 0;
        const next = () => {
            if (i >= prefetchTargets.length) return;
            const target = prefetchTargets[i++];
            ric(() => {
                target().catch(() => { /* swallow — prefetch is best-effort */ });
                next();
            }, { timeout: 4000 });
        };
        next();
    };

    if (document.readyState === 'complete') {
        ric(kickoff, { timeout: 2000 });
    } else {
        window.addEventListener('load', () => ric(kickoff, { timeout: 2000 }), { once: true });
    }
}
