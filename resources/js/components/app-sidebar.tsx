import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users, Book, DoorOpen, UserCircle, CalendarDays, Clock, Shirt } from 'lucide-react';
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

const dashboardItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    }
];

const masterDataItems: NavItem[] = [
    {
        title: 'Mata Pelajaran',
        href: '/subjects',
        icon: Book,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Master Seragam',
        href: '/master-uniforms',
        icon: Shirt,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Master Hari',
        href: '/master-days',
        icon: CalendarDays,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Alokasi Waktu',
        href: '/time-allocations',
        icon: Clock,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Master Kelas',
        href: '/classes',
        icon: LayoutGrid,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Master Ruangan',
        href: '/classrooms',
        icon: DoorOpen,
        roles: ['SUPERADMIN'],
    },
    {
        title: 'Wali Kelas',
        href: '/homeroom-teachers',
        icon: UserCircle,
        roles: ['SUPERADMIN'],
    },
];

const transaksionalItems: NavItem[] = [
    {
        title: 'Jadwal Pelajaran',
        href: '/roster-schedules',
        icon: CalendarDays,
        roles: ['SUPERADMIN'],
    },
];

const systemItems: NavItem[] = [
    {
        title: 'Manajemen Pengguna',
        href: '/users',
        icon: Users,
        roles: ['SUPERADMIN'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repositori',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Dokumentasi',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    // Ambil array role name dari user yang sedang login
    const userRoleNames = auth?.user?.roles?.map((r: any) => r.name) || [];

    // Filter setiap grup sesuai role
    const filterByRole = (items: NavItem[]) => {
        return items.filter((item) => {
            if (!item.roles || item.roles.length === 0) return true;
            return item.roles.some((role) => userRoleNames.includes(role));
        });
    };

    const filteredDashboardItems = filterByRole(dashboardItems);
    const filteredMasterItems = filterByRole(masterDataItems);
    const filteredTransaksiItems = filterByRole(transaksionalItems);
    const filteredSystemItems = filterByRole(systemItems);

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
                <NavMain items={filteredDashboardItems} label="Utama" />
                {filteredMasterItems.length > 0 && <NavMain items={filteredMasterItems} label="Master Data" />}
                {filteredTransaksiItems.length > 0 && <NavMain items={filteredTransaksiItems} label="Transaksional" />}
                {filteredSystemItems.length > 0 && <NavMain items={filteredSystemItems} label="Sistem" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
