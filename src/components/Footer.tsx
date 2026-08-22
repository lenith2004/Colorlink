import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setIsRequestModalOpen, setActiveView, setIsAuthModalOpen } = useApp();

  return (
    <footer className="bg-[#142154] text-white border-t border-[#1B2A6B] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Pre-footer Callout Banner */}
        <div className="bg-gradient-to-r from-[#1B2A6B] to-[#162758] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs font-bold text-[#2FAE6D] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Ecosistema Integrado ColorLink
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              ¿Listo para cotizar y calcular los recubrimientos de tu proyecto?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Automatiza la especificación técnica, reserva stock por lote y obtén certificado de calidad.
            </p>
          </div>

          <button
            id="footer-start-request-btn"
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-[#2FAE6D] hover:bg-[#26975d] text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
          >
            <span>Iniciar Solicitud / Comprar Online</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Columns Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left text-xs text-slate-300">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2FAE6D] text-white flex items-center justify-center font-black text-base shadow-sm">
                P
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">PINTUCO <span className="text-xs bg-[#2FAE6D] px-1.5 py-0.5 rounded-sm">ColorLink</span></span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Transformando la industria de pinturas y recubrimientos mediante integración de ingeniería, inventario inteligente y calidad garantizada.
            </p>
            <div className="pt-2 flex items-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#2FAE6D]" />
              <span>Certificación ISO 9001 & ISO 14001</span>
            </div>
          </div>

          {/* Col 2: Soluciones */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Módulos ColorLink</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-[#2FAE6D] transition-colors">
                  • 1. Captura Omnicanal de Necesidad
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-[#2FAE6D] transition-colors">
                  • 2. Formulación & Solución Técnica
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-[#2FAE6D] transition-colors">
                  • 3. Abastecimiento & Trazabilidad de Stock
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-[#2FAE6D] transition-colors">
                  • 4. Servicio en Obra & Logística
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-[#2FAE6D] transition-colors">
                  • 5. Control de Calidad de Laboratorio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Líneas de Producto */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Líneas de Alto Desempeño</h4>
            <ul className="space-y-2 text-slate-300">
              <li>• Viniltex Avanzado® Antibacterial (Interiores)</li>
              <li>• Koraza® Máxima Protección (Fachadas)</li>
              <li>• Pintulux® Esmalte Anticorrosivo</li>
              <li>• Pintuco Epóxico Pisos 100% Sólidos</li>
              <li>• Aquatec® Impermeabilizante Fibratado</li>
              <li>• Pintuco Tráfico Pesado Vial</li>
            </ul>
          </div>

          {/* Col 4: Contacto & Asistencia Técnica */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Asistencia & Soporte</h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                <span>Línea Técnica Nacional: 01 8000 111 247</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                <span>soporte.colorlink@pintuco.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                <span>Centro de Distribución Central, Rionegro / Bogotá</span>
              </p>
              <p className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Atención Técnica: Lun - Sáb 7:00am - 6:00pm</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Pintuco S.A. Todos los derechos reservados. Plataforma ColorLink.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[#2FAE6D] hover:underline font-bold cursor-pointer"
            >
              Iniciar Sesión / Portal de Acceso
            </button>
            <span className="hover:text-white cursor-pointer">Términos del Servicio</span>
            <span className="hover:text-white cursor-pointer">Política de Calidad y Garantía</span>
            <span className="hover:text-white cursor-pointer">Privacidad de Datos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
