import { Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Calendar, Moon, Sun, LogIn, LayoutDashboard, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function WelcomeHeader({ auth }: { auth: any }) {
    const { url } = usePage();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-6 lg:px-8 h-16 md:h-20 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-xl bg-primary shadow-sm text-primary-foreground">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-none">
                        Roster<span className="text-primary"> SMK Mandiri</span>
                    </h1>
                    <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:block mt-1">SMK Mandiri</span>
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3 md:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full w-9 h-9 md:w-10 md:h-10 border border-border/50 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </Button>

                {url === '/informasi-jadwal' ? (
                    <Button asChild variant="outline" className="rounded-full h-9 md:h-10 text-xs md:text-sm font-bold border-border/50 bg-secondary/50 hover:bg-secondary text-foreground transition-all">
                        <Link href="/" className="flex items-center gap-2">
                            <Home size={16} className="hidden sm:inline" />
                            <span>Jadwal Utama</span>
                        </Link>
                    </Button>
                ) : (
                    <Button asChild variant="outline" className="rounded-full h-9 md:h-10 text-xs md:text-sm font-bold border-border/50 bg-secondary/50 hover:bg-secondary text-foreground transition-all">
                        <Link href="/informasi-jadwal" className="flex items-center gap-2">
                            <Calendar size={16} className="hidden sm:inline" />
                            <span>Info Jadwal</span>
                        </Link>
                    </Button>
                )}

                {auth.user ? (
                    <Button asChild className="rounded-full shadow-lg shadow-primary/20 px-4 md:px-6 h-9 md:h-10 text-xs md:text-sm font-bold transition-transform hover:scale-105 active:scale-95">
                        <Link href={dashboard()} className="flex items-center gap-2">
                            <span className="hidden sm:inline">Dashboard</span>
                            <LayoutDashboard size={16} className="sm:hidden" />
                        </Link>
                    </Button>
                ) : (
                    <Button asChild className="rounded-full shadow-lg shadow-primary/20 px-5 md:px-7 h-9 md:h-10 text-xs md:text-sm font-bold transition-transform hover:scale-105 active:scale-95">
                        <Link href={login()} className="flex items-center gap-2">
                            <span>Masuk</span>
                            <LogIn size={16} className="hidden sm:inline" />
                        </Link>
                    </Button>
                )}
            </div>
        </header>
    );
}
