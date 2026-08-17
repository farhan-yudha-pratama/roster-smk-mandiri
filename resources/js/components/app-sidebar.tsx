import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users, Book, DoorOpen, UserCircle, CalendarDays } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    /* 
    Contoh penggunaan seperti referensi Anda:
    Anda bisa menambahkan item lain di sini jika route-nya sudah ada.
    */
    {
        title: 'Manajemen Pengguna',
        href: '/users',
        icon: Users,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Subjects',
        href: '/subjects',
        icon: Book,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Classes',
        href: '/classes',
        icon: LayoutGrid,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Classrooms',
        href: '/classrooms',
        icon: DoorOpen,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Homeroom Teachers',
        href: '/homeroom-teachers',
        icon: UserCircle,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Roster Schedules',
        href: '/roster-schedules',
        icon: CalendarDays,
        roles: ['SUPERADMIN'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    // Ambil array role name dari user yang sedang login
    const userRoleNames = auth?.user?.roles?.map((r: any) => r.name) || [];

    // Filter mainNavItems sesuai role
    const filteredNavItems = mainNavItems.filter((item) => {
        // Jika tidak ada 'roles' yang didefinisikan di item, berarti semua orang bisa akses (misal Dashboard)
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        // Jika ada 'roles', cek apakah user saat ini memiliki salah satu role yang diizinkan
        return item.roles.some((role) => userRoleNames.includes(role));
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
