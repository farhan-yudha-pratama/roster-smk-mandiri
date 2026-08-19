import { Link } from '@inertiajs/react';
import { forwardRef } from 'react';

const AppLogo = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<typeof Link>>((props, ref) => {
    return (
        <Link ref={ref} href="/" className="flex items-center gap-2 group w-full" {...props}>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-transparent shrink-0">
                <img src="/ypsm.png" alt="Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-[15px]">
                    Roster SMK Mandiri
                </span>
            </div>
        </Link>
    );
});

AppLogo.displayName = 'AppLogo';
export default AppLogo;
