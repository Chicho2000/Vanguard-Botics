import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import {
  Users, Loader2, AlertCircle, LayoutDashboard, Map, Settings, LogOut,
  Search, Plus, Trash2, Edit2, Shield, Calendar, Phone, Mail, Check, X
} from "lucide-react";
import VanguardCarIcon from "../components/ui/VanguardCarIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Dock from "@/components/ui/Dock";
import type { DockItemData } from "@/components/ui/Dock";

interface UserItem {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: "ADMIN" | "CLIENTE" | "INVITADO";
  createdAt: string;
  vehicles?: {
    licensePlate: string;
    brand: string | null;
    model: string | null;
    color: string | null;
  }[];
}

export const UsuariosAdmin: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "CLIENTE" | "INVITADO">("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "CLIENTE" | "INVITADO">("CLIENTE");
  const [formPatente, setFormPatente] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formColor, setFormColor] = useState("");

  // Delete Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("admin-active");
    return () => {
      document.documentElement.classList.remove("admin-active");
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar la base de datos de usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const clientes = users.filter((u) => u.role === "CLIENTE").length;
    const invitados = users.filter((u) => u.role === "INVITADO").length;

    return { total, admins, clientes, invitados };
  }, [users]);

  // Navigate actions
  const dockItems: DockItemData[] = [
    { icon: <LayoutDashboard size={18} className="text-[#00f0ff]" />, label: 'Dashboard', onClick: () => navigate("/admin") },
    { icon: <Map size={18} className="text-[#00f0ff]" />, label: 'Mapa', onClick: () => navigate("/admin/mapa") },
    { icon: <Users size={18} className="text-[#00f0ff]" />, label: 'Usuarios', onClick: () => navigate("/admin/usuarios") },
    { icon: <Settings size={18} className="text-[#00f0ff]" />, label: 'Config', onClick: () => navigate("/admin/configuracion") },
    { icon: <LogOut size={18} className="text-[#f43f5e]" />, label: 'Salir', onClick: logout },
  ];

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormRole("CLIENTE");
    setFormPatente("");
    setFormBrand("");
    setFormModel("");
    setFormColor("");
    setError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (targetUser: UserItem) => {
    setEditingUser(targetUser);
    setFormName(targetUser.name);
    setFormEmail(targetUser.email);
    setFormPassword(""); // Password empty by default on edit
    setFormPhone(targetUser.phone || "");
    setFormRole(targetUser.role);
    setFormPatente(targetUser.vehicles?.[0]?.licensePlate || "");
    setFormBrand(targetUser.vehicles?.[0]?.brand || "");
    setFormModel(targetUser.vehicles?.[0]?.model || "");
    setFormColor(targetUser.vehicles?.[0]?.color || "");
    setError("");
    setIsModalOpen(true);
  };

  // Submit form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formName || (!editingUser && !formPassword)) {
      setError("Por favor completa los campos requeridos.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      const payload: any = {
        email: formEmail.toLowerCase(),
        name: formName,
        phone: formPhone || null,
        role: formRole,
        patente: formPatente || null,
        brand: formBrand || null,
        model: formModel || null,
        color: formColor || null,
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (editingUser) {
        // Update user
        await adminService.updateUser(editingUser.id, payload);
        setSuccessMessage(`Usuario '${formName}' actualizado correctamente`);
      } else {
        // Create user
        await adminService.createUser(payload);
        setSuccessMessage(`Usuario '${formName}' registrado con éxito`);
      }

      setIsModalOpen(false);
      loadUsers();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "Error al guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (targetUser: UserItem) => {
    setUserToDelete(targetUser);
    setIsDeleteOpen(true);
  };

  // Execute deletion
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      setError("");
      await adminService.deleteUser(userToDelete.id);
      setSuccessMessage(`Usuario '${userToDelete.name}' eliminado con éxito`);
      setIsDeleteOpen(false);
      setUserToDelete(null);
      loadUsers();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "Error al eliminar el usuario");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
          <span className="text-xs font-semibold text-[#8892a4] uppercase tracking-[0.2em] animate-pulse font-mono">
            Sincronizando Usuarios...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e8ecf1] flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-66 border-r border-border bg-background/80 backdrop-blur-md hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 p-2 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <VanguardCarIcon className="text-[#00f0ff] drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]" size={20} />
          </div>
          <span className="font-black text-base uppercase tracking-[0.2em] bg-gradient-to-r from-[#00f0ff] to-cyan-300 bg-clip-text text-transparent">Vanguard</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/mapa")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Map className="w-4.5 h-4.5" />
            Mapa Cochera
          </button>
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-bold text-sm shadow-[0_0_12px_rgba(0,240,255,0.08)] text-left cursor-pointer"
          >
            <Users className="w-4.5 h-4.5" />
            Usuarios
          </button>
          <button
            onClick={() => navigate("/admin/configuracion")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5" />
            Configuración
          </button>
        </nav>

        {/* User profile footer inside Sidebar */}
        <div className="p-4 border-t border-border bg-background/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="w-9 h-9 border border-border">
              <AvatarFallback className="bg-[#00f0ff]/10 text-[#00f0ff] font-bold text-xs uppercase font-mono">
                {currentUser?.nombre ? currentUser.nombre.slice(0, 2) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-[#e8ecf1] truncate">{currentUser?.nombre}</p>
              <p className="text-[10px] text-[#8892a4] truncate mt-0.5 font-mono">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full h-10 flex items-center justify-center gap-2 px-3 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-950/20 transition duration-300 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        
        {/* Header bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/60 backdrop-blur-md z-10">
          <div>
            <h1 className="text-lg font-black uppercase tracking-[0.15em] text-[#e8ecf1]">Administración de Usuarios</h1>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-auto p-8 pb-24 space-y-6">
          
          {/* Messages Alert Banners */}
          {error && !isModalOpen && !isDeleteOpen && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold select-none shadow-md shadow-rose-950/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold select-none shadow-md shadow-emerald-950/20">
              <Check className="w-5 h-5 flex-shrink-0 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Metrics KPIs Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/40 border-border shadow-md select-none hover:border-[#00f0ff]/20 transition duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Total Registros</p>
                  <p className="text-2xl font-black font-mono text-[#00f0ff]">{stats.total}</p>
                </div>
                <div className="p-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-md">
                  <Users className="w-5 h-5 text-[#00f0ff] drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border shadow-md select-none hover:border-rose-500/20 transition duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Administradores</p>
                  <p className="text-2xl font-black font-mono text-rose-400">{stats.admins}</p>
                </div>
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
                  <Shield className="w-5 h-5 text-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border shadow-md select-none hover:border-indigo-500/20 transition duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Clientes</p>
                  <p className="text-2xl font-black font-mono text-[#818cf8]">{stats.clientes}</p>
                </div>
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                  <VanguardCarIcon className="text-[#818cf8] drop-shadow-[0_0_4px_rgba(129,140,248,0.4)]" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border shadow-md select-none hover:border-amber-500/20 transition duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Invitados</p>
                  <p className="text-2xl font-black font-mono text-amber-400">{stats.invitados}</p>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <Users className="w-5 h-5 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action and Filter Controls Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/25 p-4 border border-border">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none placeholder:text-muted-foreground/30 font-mono"
                />
              </div>

              {/* Role filter tab switcher */}
              <div className="flex border border-border bg-card/40 p-1 select-none w-full sm:w-auto overflow-x-auto">
                {(["ALL", "ADMIN", "CLIENTE", "INVITADO"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3.5 py-1.5 font-bold text-[10px] uppercase tracking-wider transition duration-200 cursor-pointer ${
                      roleFilter === role
                        ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-inner"
                        : "text-[#8892a4] hover:text-[#e8ecf1]"
                    }`}
                  >
                    {role === "ALL" ? "Todos" : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Action Button */}
            <button
              onClick={handleOpenCreate}
              className="h-10 px-5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-xs uppercase tracking-widest transition duration-300 shadow-[0_0_12px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus size={15} />
              Agregar Usuario
            </button>
          </div>

          {/* Main User Database Table Card */}
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-background/25 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8892a4] select-none">
                      <th className="py-4 px-6">Identidad</th>
                      <th className="py-4 px-6">Contacto</th>
                      <th className="py-4 px-6">Vehículo</th>
                      <th className="py-4 px-6">Rol</th>
                      <th className="py-4 px-6 hidden lg:table-cell">Fecha Registro</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs font-semibold text-[#8892a4] font-mono uppercase tracking-widest">
                          No se encontraron usuarios coincidentes
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((item) => (
                        <tr key={item.id} className="hover:bg-secondary/20 transition duration-150">
                          {/* Identity column */}
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-border/80">
                                <AvatarFallback className="bg-card font-mono text-xs text-[#8892a4] uppercase font-bold">
                                  {item.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-extrabold text-[#e8ecf1] tracking-wide">{item.name}</p>
                                <span className="text-[10px] font-mono text-[#8892a4] flex items-center gap-1 mt-0.5">
                                  <Mail size={10} className="text-[#00f0ff]/55" />
                                  {item.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact details */}
                          <td className="py-3 px-6 text-xs font-semibold text-[#e8ecf1]">
                            {item.phone ? (
                              <span className="flex items-center gap-1.5 font-mono">
                                <Phone size={11} className="text-[#00f0ff]/55" />
                                {item.phone}
                              </span>
                            ) : (
                              <span className="text-[#8892a4]/40 font-mono">—</span>
                            )}
                          </td>

                          {/* Vehicle Column */}
                          <td className="py-3 px-6">
                            {item.vehicles && item.vehicles.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {item.vehicles.map((v, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 border border-[#00f0ff]/20 w-fit">
                                    <VanguardCarIcon size={12} className="opacity-70" />
                                    {v.licensePlate}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#8892a4]/40 font-mono text-[10px]">—</span>
                            )}
                          </td>

                          {/* Role badges */}
                          <td className="py-3 px-6">
                            {item.role === "ADMIN" && (
                              <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-bold tracking-wider rounded-none font-mono">
                                ADMIN
                              </Badge>
                            )}
                            {item.role === "CLIENTE" && (
                              <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-bold tracking-wider rounded-none font-mono">
                                CLIENTE
                              </Badge>
                            )}
                            {item.role === "INVITADO" && (
                              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold tracking-wider rounded-none font-mono">
                                INVITADO
                              </Badge>
                            )}
                          </td>

                          {/* Date of creation */}
                          <td className="py-3 px-6 hidden lg:table-cell text-[10px] font-mono text-[#8892a4]">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-[#8892a4]/50" />
                              {new Date(item.createdAt).toLocaleDateString("es-AR", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </td>

                          {/* Action columns */}
                          <td className="py-3 px-6 text-right select-none">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Action */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 border border-border bg-card/40 text-[#8892a4] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition duration-300 cursor-pointer"
                                title="Editar Datos"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Action (prevent self-deletion) */}
                              <button
                                onClick={() => handleOpenDelete(item)}
                                disabled={currentUser?.userId === item.id}
                                className={`p-2 border border-border bg-card/40 transition duration-300 cursor-pointer ${
                                  currentUser?.userId === item.id
                                    ? "opacity-25 pointer-events-none"
                                    : "text-[#8892a4] hover:text-rose-400 hover:border-rose-400/50"
                                }`}
                                title="Eliminar Registro"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Floating Dock Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <div className="pointer-events-auto">
            <Dock
              items={dockItems}
              panelHeight={68}
              baseItemSize={46}
              magnification={72}
            />
          </div>
        </div>
      </main>

      {/* Cyberpunk translucent modal for CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0c12]/95 border border-[#00f0ff]/40 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.15)] max-w-md w-full relative backdrop-blur-md">
            
            {/* Glowing Accent Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f0ff] to-cyan-400"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background/30">
              <span className="text-xs font-black uppercase tracking-[0.2em] font-mono text-[#00f0ff]">
                {editingUser ? "Modificar Registro" : "Crear Nuevo Usuario"}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8892a4] hover:text-[#e8ecf1] transition duration-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold select-none font-mono">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                  placeholder="ej. Juan Pérez"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                  placeholder="ej. juan@gmail.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">
                    Contraseña {editingUser ? "(Opcional)" : "*"}
                  </label>
                  {editingUser && (
                    <span className="text-[9px] text-[#8892a4]/50 font-mono uppercase font-semibold">Vacío para no alterar</span>
                  )}
                </div>
                <input
                  type="password"
                  required={!editingUser}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                  placeholder="ej. 11 0000 0000"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Rol en el Sistema *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[#0a0c12] border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono cursor-pointer"
                >
                  <option value="CLIENTE">CLIENTE (Abonado)</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
                  <option value="INVITADO">INVITADO (Temporal)</option>
                </select>
              </div>

              {/* Vehicle Section Header */}
              <div className="pt-2 border-t border-border/20">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono text-[#00f0ff]">Vehículo Asociado (Opcional)</span>
              </div>

              {/* License Plate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Patente</label>
                  <input
                    type="text"
                    value={formPatente}
                    onChange={(e) => setFormPatente(e.target.value.toUpperCase())}
                    className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono uppercase"
                    placeholder="ej. AB123CD"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Marca</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                    placeholder="ej. Toyota"
                  />
                </div>
              </div>

              {/* Model and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Modelo</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                    placeholder="ej. Corolla"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-wider font-mono">Color</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full h-10 px-3 bg-[#05070a]/60 border border-border text-[#e8ecf1] font-semibold text-xs transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                    placeholder="ej. Blanco"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40 select-none">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-5 border border-border text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/40 font-bold text-[10px] uppercase tracking-wider transition duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-[10px] uppercase tracking-wider transition duration-300 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_18px_rgba(0,240,255,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Registrar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cyberpunk warning modal for DELETE CONFIRMATION */}
      {isDeleteOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0c12]/95 border border-rose-500/50 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(244,63,94,0.15)] max-w-sm w-full relative backdrop-blur-md">
            
            {/* Glowing Accent Top Line (rose color) */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-rose-400"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-rose-500/5">
              <span className="text-xs font-black uppercase tracking-[0.2em] font-mono text-rose-400 animate-pulse">
                ¿Confirmar Remoción?
              </span>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="text-[#8892a4] hover:text-[#e8ecf1] transition duration-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-[#8892a4] leading-relaxed">
                Estás a punto de eliminar de forma permanente la cuenta de:
              </p>
              <div className="p-3.5 bg-rose-950/10 border border-rose-500/20 text-rose-400 font-mono text-xs rounded-none">
                <p className="font-extrabold">{userToDelete.name}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{userToDelete.email}</p>
              </div>
              <p className="text-[10px] text-rose-400/70 font-mono italic leading-relaxed">
                * Esta operación no se puede deshacer y revocará todo acceso activo de forma instantánea.
              </p>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border/40 select-none">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="h-10 px-5 border border-border text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/40 font-bold text-[10px] uppercase tracking-wider transition duration-200 cursor-pointer"
                >
                  Conservar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-10 px-5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-[10px] uppercase tracking-wider transition duration-300 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_18px_rgba(244,63,94,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar permanentemente
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
