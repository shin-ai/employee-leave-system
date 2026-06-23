"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import type { EmployeeFormData } from "@/types/employee";

export function useEmployees() {
  const store = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    if (!store.isLoaded) {
      store.loadData();
    }
  }, [store]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return store.employees;
    const q = searchQuery.toLowerCase();
    return store.employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.team.toLowerCase().includes(q)
    );
  }, [store.employees, searchQuery]);

  const createEmployee = async (data: EmployeeFormData) => {
    return await store.addEmployee(data);
  };

  const updateEmployee = async (id: string, data: EmployeeFormData) => {
    return await store.updateEmployee(id, data);
  };

  const deleteEmployee = async (id: string) => {
    return await store.deleteEmployee(id);
  };

  return {
    employees: filteredEmployees,
    isLoading: !isClient || !store.isLoaded,
    searchQuery,
    setSearchQuery,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees: store.loadData,
  };
}
