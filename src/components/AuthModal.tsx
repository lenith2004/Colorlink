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
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  Edit3,
  Check,
  ShieldCheck,
  MapPin,
  ArrowRight,
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
    whatsAppCommercialNumber,
    setWhatsAppCommercialNumber,
    registerClient,
    getWhatsAppRegistrationUrl,
    getUserConfirmationWhatsAppUrl,
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

  // Registration confirmation & WhatsApp state
  const [registeredSuccessData, setRegisteredSuccessData] = useState<{
    user: UserProfile;
    whatsappUrl: string;
    userWhatsAppUrl: string;
    formattedMessage: string;
    userConfirmationMessage: string;
  } | null>(null);
  const [recipientChoice, setRecipientChoice] = useState<'my_phone' | 'advisor'>('my_phone');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [isEditingWhatsApp, setIsEditingWhatsApp] = useState(false);
  const [tempWhatsAppNumber, setTempWhatsAppNumber] = useState(whatsAppCommercialNumber);

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
      registeredAt: new Date().toLocaleString('es-CO'),
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
    setAuthError(null);
    setAuthSuccess(null);

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
      registeredAt: new Date().toLocaleString('es-CO'),
    };

    const registrationResult = registerClient(newUser);
    setRegisteredSuccessData(registrationResult);
  };

  const handleOpenWhatsApp = () => {
    if (!registeredSuccessData) return;
    const url =
      recipientChoice === 'my_phone'
        ? registeredSuccessData.userWhatsAppUrl
        : getWhatsAppRegistrationUrl(registeredSuccessData.user, whatsAppCommercialNumber);
    window.open(url, '_blank');
  };

  const handleCopyToClipboard = () => {
    if (!registeredSuccessData) return;
    const msg =
      recipientChoice === 'my_phone'
        ? registeredSuccessData.userConfirmationMessage
        : registeredSuccessData.formattedMessage;
    navigator.clipboard.writeText(msg);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2500);
  };

  const handleSaveWhatsAppNumber = () => {
    const clean = tempWhatsAppNumber.replace(/[^0-9]/g, '');
    if (clean) {
      setWhatsAppCommercialNumber(clean);
      setIsEditingWhatsApp(false);
    }
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

          {/* TAB 2: REGISTER FORM OR WHATSAPP NOTIFICATION DISPATCH */}
          {mode === 'register' && (
            registeredSuccessData ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                {/* Header confirmation card */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        ¡Registro Exitoso!
                      </span>
                      <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Cuenta Activa en ColorLink
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      ¡Bienvenido, {registeredSuccessData.user.name}!
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Tu usuario ha sido creado y autenticado correctamente con documento <strong>{registeredSuccessData.user.docType} {registeredSuccessData.user.docNumber}</strong>.
                    </p>
                  </div>
                </div>

                {/* Primary Action: Direct Access to Dashboard */}
                <button
                  type="button"
                  id="auth-go-to-dashboard-btn"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setActiveView('dashboard');
                    setRegisteredSuccessData(null);
                  }}
                  className="w-full bg-[#1B2A6B] hover:bg-[#142154] text-white py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-98"
                >
                  <FileCheck2 className="w-4 h-4 text-[#2FAE6D]" />
                  <span>Ingresar Directamente a Mi Portal de Proyectos</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Client summary pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Contacto</span>
                    <span className="font-extrabold text-slate-900 truncate block">{registeredSuccessData.user.name}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Empresa / Obra</span>
                    <span className="font-extrabold text-slate-900 truncate block">{registeredSuccessData.user.company}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Celular Registrado</span>
                    <span className="font-extrabold text-slate-900 block truncate">{registeredSuccessData.user.phone}</span>
                  </div>
                </div>

                {/* WhatsApp options section */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      <span>Comprobante o Asesoría por WhatsApp (Opcional)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ¿Deseas una copia en tu propio celular o contactar al asesor comercial de Pintuco?
                    </p>
                  </div>

                  {/* Recipient toggle buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="wa-recipient-my-phone-btn"
                      onClick={() => setRecipientChoice('my_phone')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        recipientChoice === 'my_phone'
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                          📱 A mi número registrado
                        </span>
                        {recipientChoice === 'my_phone' && (
                          <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-emerald-800 truncate">
                        {registeredSuccessData.user.phone || 'Mi Celular'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Guarda tu confirmación en tu WhatsApp
                      </span>
                    </button>

                    <button
                      type="button"
                      id="wa-recipient-advisor-btn"
                      onClick={() => setRecipientChoice('advisor')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        recipientChoice === 'advisor'
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                          💼 Al Asesor Pintuco
                        </span>
                        {recipientChoice === 'advisor' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-blue-900 truncate">
                        +{whatsAppCommercialNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Asesoría técnica para tu obra
                      </span>
                    </button>
                  </div>

                  {/* Message preview */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-700">
                        {recipientChoice === 'my_phone' ? 'Mensaje para tu celular:' : 'Mensaje para el Asesor Pintuco:'}
                      </span>
                      <button
                        type="button"
                        id="copy-whatsapp-message-btn"
                        onClick={handleCopyToClipboard}
                        className="text-[#1B2A6B] hover:text-blue-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedFeedback ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="max-h-24 overflow-y-auto pr-1 text-[11px] text-slate-600 font-sans">
                      {recipientChoice === 'my_phone'
                        ? registeredSuccessData.userConfirmationMessage
                        : registeredSuccessData.formattedMessage}
                    </div>
                  </div>

                  {/* WhatsApp Action Button */}
                  <button
                    type="button"
                    id="auth-send-whatsapp-btn"
                    onClick={handleOpenWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {recipientChoice === 'my_phone'
                        ? `Abrir WhatsApp para enviarme confirmación a ${registeredSuccessData.user.phone}`
                        : `Abrir WhatsApp con Asesor Pintuco (+${whatsAppCommercialNumber})`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-normal">
                    ℹ️ <strong>¿Por qué se abre WhatsApp?</strong> En navegadores web, por normas de privacidad, una página web no puede mandar mensajes silenciosos en segundo plano a números personales. Al pulsar el botón, WhatsApp se abre de forma segura en tu teléfono o PC con el texto pre-cargado.
                  </p>
                </div>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisteredSuccessData(null);
                      setRegName('');
                      setRegDocNumber('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Registrar otro cliente diferente
                  </button>
                </div>
              </div>
            ) : (
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
            )
          )}
        </div>
      </div>
    </div>
  );
};
