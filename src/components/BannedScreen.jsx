import { motion } from "framer-motion";
import { AlertTriangle, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BannedScreen({ reason = "Violação dos termos de uso", onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem("bomPiteuToken");
    localStorage.removeItem("bomPiteuUser");
    sessionStorage.clear();
    if (onLogout) onLogout();
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Conta Banida</h2>
          <p className="text-white/80 text-sm mt-1">A sua conta foi suspensa</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm leading-relaxed">
              <strong>Motivo do banimento:</strong><br />
              {reason}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Esta ação foi tomada devido a uma violação dos nossos Termos de Uso. Se acredita que foi um engano, pode contactar o suporte.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.open("mailto:suporte@bompiteu.com", "_blank")}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contactar suporte
              </Button>
              <Button
                onClick={() => window.open("/terms", "_blank")}
                variant="outline"
                className="w-full border-gray-200 text-gray-500"
              >
                <Shield className="h-4 w-4 mr-2" />
                Ler Termos de Uso
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold"
            >
              Sair da conta
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Bom Piteu · Todos os direitos reservados
          </p>
        </div>
      </motion.div>
    </div>
  );
}