import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings2, GraduationCap, Layers, Save, EyeOff, Loader2 } from 'lucide-react';
import { update as updateGeneral } from '@/routes/general';
import Heading from '@/components/heading';

interface Props {
    grades: string[];
    majors: string[];
    settings: Record<string, boolean>;
}

export default function GeneralSettings({ grades, majors, settings }: Props) {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        ...settings
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(updateGeneral().url, {
            preserveScroll: true,
        });
    };

    const handleCheckboxChange = (key: string, checked: boolean | string) => {
        setData(key, checked === true);
    };

    return (
        <>
            <Head title="General Settings" />
            <div className="space-y-6">

                <Heading
                    variant="small"
                    title="Pengaturan Umum"
                    description="Kelola preferensi dan pengaturan visibilitas sistem."
                />

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-muted shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <EyeOff className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Sembunyikan Jadwal (Hide Roster)</CardTitle>
                                    <CardDescription className="mt-1">
                                        Pilih tingkat kelas atau jurusan yang ingin disembunyikan dari halaman publik dan dashboard.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-8">

                            {/* Tingkatan Kelas Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Tingkatan Kelas</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {grades.map((grade) => {
                                        const key = `hide_roster_grade_${grade.toLowerCase()}`;
                                        const isChecked = data[key] || false;
                                        return (
                                            <Label
                                                key={grade}
                                                htmlFor={key}
                                                className={`flex items-start space-x-3.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out hover:bg-muted/50 ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted bg-transparent'}`}
                                            >
                                                <Checkbox
                                                    id={key}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleCheckboxChange(key, checked)}
                                                    className="mt-1 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <span className="font-semibold text-[15px] leading-none">{grade}</span>
                                                </div>
                                            </Label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="h-px bg-border/60 w-full" />

                            {/* Jurusan Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Layers className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Berdasarkan Jurusan</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {majors.map((major) => {
                                        const key = `hide_roster_major_${major.toLowerCase().replace(/ /g, '_')}`;
                                        const isChecked = data[key] || false;
                                        return (
                                            <Label
                                                key={major}
                                                htmlFor={key}
                                                className={`flex items-start space-x-3.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out hover:bg-muted/50 ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted bg-transparent'}`}
                                            >
                                                <Checkbox
                                                    id={key}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleCheckboxChange(key, checked)}
                                                    className="mt-1 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <span className="font-semibold text-[15px] leading-none">{major}</span>
                                                </div>
                                            </Label>
                                        );
                                    })}
                                </div>
                            </div>

                        </CardContent>

                        <div className="bg-muted/30 px-6 py-4 border-t flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Perubahan akan langsung diterapkan ke seluruh sistem setelah disimpan.
                            </p>
                            <div className="flex items-center gap-3">
                                {recentlySuccessful && (
                                    <span className="text-sm font-medium text-green-600 animate-in fade-in slide-in-from-right-4 duration-300">
                                        Berhasil disimpan!
                                    </span>
                                )}
                                <Button disabled={processing} type="submit" className="gap-2">
                                    {processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </>
    );
}

GeneralSettings.layout = {
    breadcrumbs: [
        {
            title: 'General settings',
            href: updateGeneral().url,
        },
    ],
};
