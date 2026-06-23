"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchemaType } from "@/validators/auth-validator";
import { AuthStorageService } from "@/services/auth-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ROUTES } from "@/constants";
import {
  LogIn,
  Eye,
  EyeOff,
  CalendarDays,
  AlertCircle,
  BarChart3,
  Shield,
  Users,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const success = await AuthStorageService.login(data);

      if (success) {
        router.replace(ROUTES.DASHBOARD);
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute -top-[30%] -right-[15%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/15 to-violet-500/10 blur-3xl animate-pulse [animation-duration:8s]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-500/10 to-primary/15 blur-3xl animate-pulse [animation-duration:12s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse [animation-duration:10s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center p-16 relative">
        <div className="max-w-lg space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 shadow-xl shadow-primary/30 ring-1 ring-white/10">
              <CalendarDays className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-foreground">
                LeaveSys
              </span>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Management Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-foreground">
              Kelola cuti
              <br />
              karyawan{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-blue-500 bg-clip-text text-transparent">
                dengan mudah.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Ajukan, pantau, dan kelola permintaan cuti tim Anda dalam satu platform yang terintegrasi.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: BarChart3, title: "Dashboard Real-time", desc: "Statistik cuti langsung", color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400" },
              { icon: Shield, title: "Approval Workflow", desc: "Proses terstruktur", color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
              { icon: CalendarDays, title: "Kalender Tim", desc: "Jadwal cuti visual", color: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400" },
              { icon: Users, title: "Team Management", desc: "Kelola tim & PIC", color: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-card/70 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-2">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "< 1s", label: "Response" },
              { value: "256-bit", label: "Encryption" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-border/60 to-transparent" />

      {/* Right panel — login form */}
      <div className="flex w-full lg:w-[45%] items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 shadow-lg shadow-primary/25">
                <CalendarDays className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  LeaveSys
                </span>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Management Platform</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-violet-500" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary">Welcome Back</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Masuk ke akun
              <br />
              <span className="text-muted-foreground font-bold">Anda</span>
            </h2>
            <p className="text-muted-foreground text-sm pt-1">
              Masukkan email dan password untuk melanjutkan
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 shadow-2xl shadow-black/5 backdrop-blur-xl ring-1 ring-white/5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="nama@perusahaan.com"
                            type="text"
                            className="h-12 rounded-xl border-border/60 bg-background/50 pl-4 text-sm transition-all duration-200 focus-visible:shadow-lg focus-visible:shadow-primary/10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Password
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="••••••••••"
                            type={showPassword ? "text" : "password"}
                            className="h-12 rounded-xl border-border/60 bg-background/50 pl-4 pr-12 text-sm transition-all duration-200 focus-visible:shadow-lg focus-visible:shadow-primary/10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Sembunyikan" : "Tampilkan"} password
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary via-primary to-violet-600 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:opacity-60"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Masuk
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Sesi otomatis berakhir setelah 2 jam</span>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/60">
            Employee Leave Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Desktop theme toggle */}
      <div className="hidden lg:block fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
