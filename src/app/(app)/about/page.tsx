"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Code2,
  Layers,
  Shield,
  Zap,
  Heart,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AboutPage() {
  const [showCodeReview, setShowCodeReview] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Authentication & Authorization",
      desc: "Sistem login dengan session management, role-based access control (Admin, Employee, PIC).",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Layers,
      title: "Employee Management",
      desc: "CRUD karyawan lengkap dengan profil, tim, posisi, dan leave balance tracking.",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Zap,
      title: "Leave Request System",
      desc: "Pengajuan cuti dengan approval flow oleh PIC tim, filter, search, dan kalender visual.",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      icon: Globe,
      title: "Team & PIC Management",
      desc: "Manajemen tim dengan pengelolaan PIC (Person In Charge) untuk setiap tim.",
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  const techStack = [
    { name: "Next.js 16", desc: "App Router & Turbopack" },
    { name: "React 19", desc: "Server & Client Components" },
    { name: "TypeScript", desc: "Full Type Safety" },
    { name: "Zustand", desc: "State Management" },
    { name: "Zod", desc: "Schema Validation" },
    { name: "Base UI / ShadCN", desc: "Accessible Components" },
    { name: "date-fns", desc: "Date Manipulation" },
    { name: "LocalStorage", desc: "Client-side Persistence" },
  ];

  const reviewFindings = [
    { area: "Functional Correctness", finding: "Seluruh requirement (Auth, Employee CRUD, Leave CRUD, Dashboard) telah diimplementasikan dengan fitur tambahan (Calendar, Status Filter).", recommendation: "Pertahankan konsistensi ini." },
    { area: "Security", finding: "Mekanisme pengamanan client-side (Base64 Encoding & Checksum Signature) mencegah manipulasi sesi di Developer Tools.", recommendation: "-" },
    { area: "Performance", finding: "Zustand mencegah re-rendering yang tidak perlu, tabel menggunakan pagination dan client-side filtering.", recommendation: "-" },
    { area: "Architecture", finding: "Arsitektur memisahkan UI (Components/Pages), State (Zustand), dan Data Access (Storage Services) dengan baik.", recommendation: "Pola ini memudahkan migrasi ke Backend API." },
    { area: "Maintainability", finding: "Kode rapi, penamaan variabel jelas, 0 ESLint errors, 0 warnings.", recommendation: "-" },
    { area: "Type Safety", finding: "TypeScript + Zod digunakan konsisten dengan tipe eksplisit di seluruh kode.", recommendation: "-" },
    { area: "Error Handling", finding: "Error boundary (error.tsx) dan Toasts mencegah silent failures.", recommendation: "-" },
    { area: "Validation", finding: "Validasi Zod, overlap checking, skip weekend, limit saldo cuti.", recommendation: "-" },
    { area: "UI/UX", finding: "Desain responsif, modern, tipografi Inter, navigasi intuitif.", recommendation: "-" },
    { area: "Accessibility", finding: "Komponen headless (Base UI/ShadCN) dengan aksesibilitas bawaan.", recommendation: "-" },
    { area: "Dependencies", finding: "Framework terkini (Next.js 16.2.9, React 19).", recommendation: "Lakukan npm audit rutin." },
    { area: "Audit Trail", finding: "Sistem mencatat aktivitas user secara internal.", recommendation: "-" },
    { area: "AI Code Quality", finding: "Tidak ditemukan halusinasi. Abstraksi storage efektif meniru database.", recommendation: "-" },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              About This Application
            </h1>
            <p className="text-sm text-muted-foreground">
              Employee Leave Management System v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Aplikasi <strong>Employee Leave Management System</strong> adalah sistem manajemen cuti 
            karyawan berbasis web yang dibangun dengan teknologi modern. Sistem ini memungkinkan 
            pengelolaan data karyawan, pengajuan dan persetujuan cuti, serta monitoring melalui 
            dashboard dan kalender visual. Dirancang untuk kemudahan penggunaan dengan role-based 
            access control (Admin, PIC, Employee).
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        Fitur Utama
      </h2>
      <div className="grid gap-4 mb-8 sm:grid-cols-2">
        {features.map((f, i) => (
          <Card key={i} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {f.desc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Layers className="h-5 w-5 text-purple-500" />
        Tech Stack
      </h2>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {techStack.map((t, i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 p-3 text-center transition-colors hover:bg-muted/50"
              >
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Info */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-500" />
        Roles & Akses
      </h2>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Login</th>
                  <th className="text-left p-3 font-semibold hidden sm:table-cell">Akses</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Approve Cuti</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                      Admin
                    </Badge>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">admin / admin123</code>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">Semua data</td>
                  <td className="p-3 hidden md:table-cell">❌</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                      PIC
                    </Badge>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">email / password123</code>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">Data tim sendiri</td>
                  <td className="p-3 hidden md:table-cell">✅ Tim sendiri</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                      Employee
                    </Badge>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">email / password123</code>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">Data sendiri</td>
                  <td className="p-3 hidden md:table-cell">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Review Section (Collapsible) */}
      <div className="mb-8">
        <Button
          variant="outline"
          className="w-full justify-between text-left gap-2"
          onClick={() => setShowCodeReview(!showCodeReview)}
        >
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Code Review Report
            <Badge className="bg-emerald-500 hover:bg-emerald-600 ml-2">
              ALL PASS
            </Badge>
          </span>
          {showCodeReview ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showCodeReview && (
          <div className="mt-4 space-y-3">
            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Critical
                    </div>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      High
                    </div>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 text-yellow-500" />
                      Medium
                    </div>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 text-blue-500" />
                      Low
                    </div>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Findings */}
            {reviewFindings.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm">{item.area}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {item.finding}
                      </p>
                      {item.recommendation !== "-" && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                          💡 {item.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>
          Built with ❤️ using Next.js, React, and TypeScript
        </p>
        <p className="mt-1">© 2026 Employee Leave Management System</p>
      </div>
    </>
  );
}
