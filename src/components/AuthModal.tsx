import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  Mail,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, DocumentType } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    setCurrentUser,
    setActiveView,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state - Only Document Type & Number
  const [loginDocType, setLoginDocType] = useState<DocumentType>(currentUser?.docType || 'NIT');
  const [loginDocNumber, setLoginDocNumber] = useState(currentUser?.docNumber || '');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Register form state
  const [regDocType, setRegDocType] = useState<DocumentType>('NIT');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Bogotá D.C.');
  const [regAcceptTerms, setRegAcceptTerms] = useState(true);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanInputDoc = loginDocNumber.replace(/[^0-9a-zA-Z]/g, '').trim();

    if (!cleanInputDoc) {
      setAuthError('Por favor ingresa un número de documento válido');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${cleanInputDoc}`,
      name: loginDocType === 'NIT' ? 'Cliente Corporativo / Obra' : 'Cliente Titular',
      email: `contacto.${cleanInputDoc}@colorlink.pintuco.com`,
      role: 'cliente',
      docType: loginDocType,
      docNumber: cleanInputDoc,
      company: loginDocType === 'NIT' ? 'Empresa Registrada' : 'Particular / Residente de Obra',
      city: 'Bogotá D.C.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(newUser);
    setAuthSuccess(`¡Bienvenido! Documento ${loginDocType} ${cleanInputDoc} validado.`);
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setActiveView('dashboard');
      setAuthSuccess(null);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDocNumber.trim() || !regName.trim()) {
      setAuthError('Por favor completa los datos obligatorios del documento y nombre');
      return;
    }

    const cleanDoc = regDocNumber.replace(/[^0-9a-zA-Z]/g, '').trim();

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `contacto.${cleanDoc}@pintuco.com`,
      role: 'cliente',
      docType: regDocType,
      docNumber: cleanDoc,
      company: regCompany.trim() || (regDocType === 'NIT' ? regName.trim() : 'Cliente / Obra'),
      phone: regPhone.trim() || '+57 300 000 0000',
      city: regCity,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };

    setCurrentUser(newUser);
    setAuthSuccess(`¡Registro exitoso! Bienvenido ${newUser.name} (${newUser.docType} ${newUser.docNumber})`);
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setActiveView('dashboard');
      setAuthSuccess(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header with Pintuco branding */}
        <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#1E3A8A] text-white p-6 sm:p-7 relative shrink-0">
          <button
            id="close-auth-modal-btn"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2FAE6D] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">PINTUCO</span>
                <span className="text-xs bg-[#2FAE6D] text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  ColorLink
                </span>
              </div>
              <p className="text-xs text-slate-300">Portal de Acceso para Clientes, Empresas y Constructores</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-white/10 p-1 rounded-2xl max-w-xs">
            <button
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#1B2A6B] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Ingresar con Documento
            </button>
            <button
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#1B2A6B] shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Registrar Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 text-left space-y-5">
          {/* Notifications */}
          {authSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-800 font-medium">
              <span>{authError}</span>
            </div>
          )}

          {/* TAB 1: LOGIN ONLY WITH DOCUMENT TYPE AND NUMBER */}
          {mode === 'login' && (
            <div className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tipo de Documento */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tipo Documento:
                    </label>
                    <select
                      id="login-doctype-select"
                      value={loginDocType}
                      onChange={(e) => setLoginDocType(e.target.value as DocumentType)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 focus:border-[#1B2A6B] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-hidden transition-all cursor-pointer"
                    >
                      <option value="NIT">NIT (Empresa / Obra)</option>
                      <option value="CC">CC (Cédula Ciudadanía)</option>
                      <option value="CE">CE (Cédula Extranjería)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUT">RUT</option>
                    </select>
                  </div>

                  {/* Número de Documento */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Número de Documento:
                    </label>
                    <div className="relative">
                      <input
                        id="login-docnumber-input"
                        type="text"
                        required
                        value={loginDocNumber}
                        onChange={(e) => setLoginDocNumber(e.target.value)}
                        placeholder={loginDocType === 'NIT' ? 'ej. 900482195' : 'ej. 1020482195'}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1B2A6B] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-hidden transition-all tracking-wide"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-md border-slate-300 text-[#1B2A6B] focus:ring-[#1B2A6B]"
                    />
                    <span>Recordar este documento en este equipo</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="submit-login-doc-btn"
                  className="w-full bg-[#1B2A6B] hover:bg-[#142154] text-white py-3 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <FileCheck2 className="w-4 h-4 text-[#2FAE6D]" />
                  <span>Ingresar a Mi Portal de Proyectos</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER FORM WITH DOCUMENT */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento:</label>
                  <select
                    value={regDocType}
                    onChange={(e) => setRegDocType(e.target.value as DocumentType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="NIT">NIT (Empresa / Constructora)</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUT">RUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Documento:</label>
                  <div className="relative">
                    <input
                      id="reg-doc-number-input"
                      type="text"
                      required
                      placeholder={regDocType === 'NIT' ? 'ej. 901234567' : 'ej. 1032489012'}
                      value={regDocNumber}
                      onChange={(e) => setRegDocNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo o Contacto:</label>
                  <div className="relative">
                    <input
                      id="reg-name-input"
                      type="text"
                      required
                      placeholder="ej. Juan Carlos Pérez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Empresa u Obra:</label>
                  <div className="relative">
                    <input
                      id="reg-company-input"
                      type="text"
                      placeholder="ej. Constructora Bolívar S.A."
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico:</label>
                  <div className="relative">
                    <input
                      id="reg-email-input"
                      type="email"
                      placeholder="contacto@constructora.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp:</label>
                  <div className="relative">
                    <input
                      id="reg-phone-input"
                      type="tel"
                      placeholder="+57 310 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad de Entrega Principal:</label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Cartagena">Cartagena</option>
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={regAcceptTerms}
                  onChange={(e) => setRegAcceptTerms(e.target.checked)}
                  className="rounded-md border-slate-300 text-[#1B2A6B] mt-0.5"
                />
                <span>
                  Acepto los Términos de Servicio y la Política de Tratamiento de Datos Personales de Pintuco S.A.
                </span>
              </label>

              <button
                type="submit"
                id="submit-register-btn"
                className="w-full bg-[#2FAE6D] hover:bg-[#26975d] text-white py-3 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrarme y Acceder a ColorLink</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
