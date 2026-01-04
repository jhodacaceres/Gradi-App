import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth"; // Asegúrate de tener este hook, si no, avísame.

const SettingsPage = () => {
  // Usamos el hook useAuth para obtener el usuario automáticamente
  const { user } = useAuth(); 
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estados del formulario
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");

  // 1. Cargar datos al entrar
  useEffect(() => {
    if (!user) return;

    const getProfile = async () => {
      try {
        setLoadingData(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, bio")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setBio(data.bio || "");
        } else {
          setFullName(user.user_metadata?.full_name || "");
        }
      } catch (error: any) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoadingData(false);
      }
    };

    getProfile();
  }, [user]);

  // 2. Guardar cambios
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        bio: bio,
        updated_at: new Date().toISOString(),
      };

      // --- CORRECCIÓN APLICADA: Solo un .from() ---
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (profileError) throw new Error(profileError.message);

      // Actualizar contraseña si el usuario escribió algo
      if (password.trim()) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: password,
        });
        if (pwError) throw new Error(pwError.message);
        
        // Actualizar flag en profiles si es necesario
        await supabase.from('profiles').update({ has_password: true }).eq('id', user.id);
        setPassword("");
      }

      // Actualizar caché local de autenticación
      await supabase.auth.updateUser({ data: { full_name: fullName } });

      setMessage({ type: "success", text: "¡Perfil guardado correctamente!" });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (!user && !loadingData) {
    return <div className="p-8 text-center text-gray-500">Inicia sesión para configurar tu perfil.</div>;
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Usuario</h1>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium animate-fade-in ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleUpdate} className="space-y-8">
          {/* INFORMACIÓN GENERAL */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#8b5cf6]">
              <UserIcon className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Información General</h2>
            </div>
            <div className="space-y-4 md:pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all outline-none"
                  placeholder="Tu nombre completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all outline-none resize-none"
                  placeholder="Cuéntanos algo sobre ti..." />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SEGURIDAD */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#8b5cf6]">
              <Lock className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Seguridad</h2>
            </div>
            <div className="md:pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all outline-none"
                  placeholder="Dejar en blanco para mantener la actual" autoComplete="new-password" />
                <p className="text-xs text-gray-500 mt-1">Solo llena esto si deseas cambiar tu contraseña.</p>
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="pt-4 flex justify-end md:justify-start">
            <button type="submit" disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#8b5cf6] text-white px-8 py-3 rounded-xl hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;