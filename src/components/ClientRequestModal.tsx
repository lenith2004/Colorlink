import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  MessageSquare,
  ShoppingCart,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SurfaceType, EnvironmentType, FinishType, ChannelSource } from '../types';
import { COLOR_PALETTES } from '../data/initialData';

export const ClientRequestModal: React.FC = () => {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    createPaintRequest,
    calculateRequirements,
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    setIsChatOpen,
    selectedCity,
    setSelectedRequestForDetail,
    setActiveView,
  } = useApp();

  // Form states
  const [projectName, setProjectName] = useState('Remodelación y Pintura Fachada Principal');
  const [clientName, setClientName] = useState(isLoggedIn && currentUser ? currentUser.name : '');
  const [clientCompany, setClientCompany] = useState(isLoggedIn && currentUser ? currentUser.company || 'Constructora / Obra' : '');
  const [clientEmail, setClientEmail] = useState(isLoggedIn && currentUser ? currentUser.email : '');
  const [clientPhone, setClientPhone] = useState(isLoggedIn && currentUser ? currentUser.phone || '' : '');
  const [city, setCity] = useState(selectedCity);
  const [channel, setChannel] = useState<ChannelSource>('web');

  const [surfaceType, setSurfaceType] = useState<SurfaceType>('mamposteria');
  const [areaSqMeters, setAreaSqMeters] = useState<number>(120);
  const [environment, setEnvironment] = useState<EnvironmentType>('interior');
  const [finish, setFinish] = useState<FinishType>('mate');
  const [selectedColorName, setSelectedColorName] = useState<string>('Blanco Puro');
  const [urgencyDays, setUrgencyDays] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Requerimos entrega puntual y ficha técnica de laboratorio para interventoría.');

  // Room dimension helper
  const [showRoomCalc, setShowRoomCalc] = useState(false);
  const [roomLength, setRoomLength] = useState<number>(10);
  const [roomHeight, setRoomHeight] = useState<number>(2.5);
  const [roomWalls, setRoomWalls] = useState<number>(4);

  // Gating prompt for guests
  const [guestActionRequested, setGuestActionRequested] = useState<'compra' | 'asesor' | null>(null);

  // Sync with current user on open or when login status changes
  useEffect(() => {
    if (isRequestModalOpen) {
      if (isLoggedIn && currentUser) {
        setClientName(currentUser.name);
        setClientEmail(currentUser.email);
        setClientCompany(currentUser.company || 'Particular / Obra');
        if (currentUser.phone) setClientPhone(currentUser.phone);
      }
      setCity(selectedCity);
    }
  }, [isRequestModalOpen, currentUser, isLoggedIn, selectedCity]);

  if (!isRequestModalOpen) return null;

  // Real-time calculation
  const calc = calculateRequirements(surfaceType, Number(areaSqMeters) || 1, environment, finish);
  const selectedColor = COLOR_PALETTES.find((c) => c.name === selectedColorName) || COLOR_PALETTES[0];

  const applyRoomCalc = () => {
    const totalArea = Math.round(roomLength * roomHeight * roomWalls);
    setAreaSqMeters(totalArea);
    setShowRoomCalc(false);
  };

  const handleProceedToPurchaseOrSave = (e: React.FormEvent) => {
    e.preventDefault();

    // If user is NOT logged in, gate purchase/formal order and prompt authentication
    if (!isLoggedIn) {
      setGuestActionRequested('compra');
      return;
    }

    const newReq = createPaintRequest({
      projectName: projectName.trim() || 'Proyecto de Recubrimiento Pintuco',
      clientName: clientName.trim() || currentUser.name,
      clientCompany: clientCompany.trim() || currentUser.company || 'Cliente Registrado',
      clientEmail: clientEmail.trim() || currentUser.email,
      clientPhone: clientPhone.trim() || currentUser.phone || '+57 300 000 0000',
      city,
      channel,
      surfaceType,
      areaSqMeters: Number(areaSqMeters) || 50,
      environment,
      finish,
      selectedColorName: selectedColor.name,
      selectedColorHex: selectedColor.hex,
      urgencyDays: Number(urgencyDays) || 5,
      notes,
    });

    setIsRequestModalOpen(false);
    setSelectedRequestForDetail(newReq);
    setActiveView('dashboard');
  };

  const handleSpeakWithAdvisor = () => {
    if (!isLoggedIn) {
      setGuestActionRequested('asesor');
    } else {
      setIsRequestModalOpen(false);
      setIsChatOpen(true);
    }
  };

  const openAuthFromGate = () => {
    setIsRequestModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 relative">
        {/* Guest Authentication Interstitial Dialog when attempting to buy or speak with advisor */}
        {guestActionRequested && (
          <div className="absolute inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-blue-50 text-[#1B2A6B] rounded-2xl mx-auto flex items-center justify-center shadow-inner border border-blue-200">
                <Lock className="w-8 h-8 text-[#1B2A6B]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black text-[#2FAE6D] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  {guestActionRequested === 'compra' ? 'Paso Requerido para Compra & Despacho' : 'Conexión Directa con Asesor Pintuco'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {guestActionRequested === 'compra'
                    ? 'Inicia sesión para continuar tu compra'
                    : 'Inicia sesión para hablar con tu asesor'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {guestActionRequested === 'compra'
                    ? 'Tu cotización técnica ya está lista y calculada. Para reservar el lote en bodega, aplicar descuentos comerciales y emitir la garantía, ingresa con tu documento de identidad o NIT.'
                    : 'Para que un asesor técnico oficial revise tu proyecto y te brinde atención personalizada en tiempo real, ingresa con tu documento o NIT.'}
                </p>
              </div>

              {/* Cotización preview pill */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>{calc.product.name}</span>
                  <span className="text-[#2FAE6D] font-extrabold">{calc.gallonsNeeded} Gal</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Área: {areaSqMeters} m² • {selectedColor.name}</span>
                  <span className="font-extrabold text-[#1B2A6B] text-xs">
                    ${calc.estimatedPriceCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  id="auth-gate-login-btn"
                  onClick={openAuthFromGate}
                  className="w-full bg-[#1B2A6B] hover:bg-[#142154] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Ingresar con Documento / NIT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuestActionRequested(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Continuar calculando sin iniciar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-[#142154] text-white p-5 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2FAE6D] text-white flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-extrabold text-white">
                  Cotizador Libre & Inteligente Pintuco
                </h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Cotización Abierta Sin Registro</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calcula libremente los galones, producto ideal y costo estimado para tu obra en m².
              </p>
            </div>
          </div>
          <button
            id="close-request-modal-btn"
            onClick={() => setIsRequestModalOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Banner for Unauthenticated Users */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-emerald-50 px-5 sm:px-8 py-2.5 border-b border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="text-base">✨</span>
              <p className="font-semibold">
                <strong className="text-[#1B2A6B]">Cotización en vivo 100% libre:</strong> Ajusta m², acabado y color sin restricciones. Al finalizar, podrás iniciar sesión para comprar o conectar con un asesor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setIsRequestModalOpen(false); setIsAuthModalOpen(true); }}
              className="text-[#1B2A6B] hover:text-[#2FAE6D] font-extrabold underline whitespace-nowrap text-[11px] cursor-pointer"
            >
              ¿Ya tienes cuenta? Ingresar
            </button>
          </div>
        )}

        {/* Modal Body: Two columns layout */}
        <form onSubmit={handleProceedToPurchaseOrSave} className="overflow-y-auto p-5 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Left Column: Form inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Technical Specifications First (Priority for quoting) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1B2A6B]" />
                  1. Especificaciones de la Obra y Superficie
                </h3>
                <span className="text-[11px] text-[#2FAE6D] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Cálculo Instantáneo
                </span>
              </div>

              {/* Surface Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Superficie a Recubrir *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'mamposteria', label: 'Mampostería / Muros' },
                    { id: 'drywall', label: 'Drywall / Yeso' },
                    { id: 'fachada_exterior', label: 'Fachada Exterior' },
                    { id: 'pisos_trafico', label: 'Pisos / Alto Tráfico' },
                    { id: 'metal_acero', label: 'Metal / Acero' },
                    { id: 'madera', label: 'Madera Natural' },
                    { id: 'zona_humeda', label: 'Terraza / Húmeda' },
                    { id: 'concreto', label: 'Concreto Visto' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSurfaceType(s.id as SurfaceType)}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] text-left transition-all cursor-pointer ${
                        surfaceType === s.id
                          ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area in Sq Meters + Calculator popup */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Área total en m² *</label>
                  <button
                    type="button"
                    onClick={() => setShowRoomCalc(!showRoomCalc)}
                    className="text-xs font-bold text-[#1B2A6B] hover:text-[#2FAE6D] flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showRoomCalc ? 'Cerrar Asistente' : 'Calcular por Dimensiones de Muros'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    required
                    value={areaSqMeters}
                    onChange={(e) => setAreaSqMeters(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:bg-white focus:border-[#1B2A6B] outline-hidden"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Metros Cuadrados (m²)
                  </span>
                </div>

                {/* Helper dimensions calculator */}
                {showRoomCalc && (
                  <div className="mt-2 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-2">
                    <p className="font-bold text-[#1B2A6B]">Asistente de cálculo rápido de muros:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 block">Largo (m)</label>
                        <input
                          type="number"
                          value={roomLength}
                          onChange={(e) => setRoomLength(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Alto (m)</label>
                        <input
                          type="number"
                          value={roomHeight}
                          onChange={(e) => setRoomHeight(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Muros</label>
                        <input
                          type="number"
                          value={roomWalls}
                          onChange={(e) => setRoomWalls(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={applyRoomCalc}
                      className="w-full py-1.5 bg-[#1B2A6B] text-white rounded-lg font-bold text-xs hover:bg-opacity-90 cursor-pointer"
                    >
                      Aplicar {Math.round(roomLength * roomHeight * roomWalls)} m² al proyecto
                    </button>
                  </div>
                )}
              </div>

              {/* Environment & Finish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ambiente de Exposición</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="interior">Interiores / Oficinas</option>
                    <option value="exterior">Exteriores / Fachadas</option>
                    <option value="industrial_marino">Industrial / Marino Severo</option>
                    <option value="hospitalario_aseptico">Hospitalario / Clínico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Acabado Deseado</label>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value as FinishType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="mate">Mate Antirreflejo</option>
                    <option value="satinado">Satinado Elegante</option>
                    <option value="semibrillante">Semibrillante</option>
                    <option value="brillante">Brillante Duradero</option>
                    <option value="epoxico_antideslizante">Epóxico Antideslizante</option>
                  </select>
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Color Pintuco Seleccionado:</span>
                  <span className="font-extrabold text-[#1B2A6B]">{selectedColor.name}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PALETTES.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColorName(color.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative shadow-2xs ${
                        selectedColorName === color.name
                          ? 'scale-125 border-[#1B2A6B] ring-2 ring-[#2FAE6D]'
                          : 'border-slate-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Project info & Channel source */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#1B2A6B]" />
                2. Referencia del Proyecto / Ubicación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Obra o Referencia</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej. Remodelación Fachada Principal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#1B2A6B] focus:ring-1 focus:ring-[#1B2A6B] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad de Despacho</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Pereira">Pereira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiempo de Entrega Deseado</label>
                  <select
                    value={urgencyDays}
                    onChange={(e) => setUrgencyDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value={2}>Urgente (2 días hábiles)</option>
                    <option value={5}>Estándar (5 días hábiles)</option>
                    <option value={10}>Programado (10 días hábiles)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Live Calculation Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-[#142154] text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#2FAE6D] tracking-wider">
                    Sugerencia Técnica Automatizada
                  </span>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {calc.product.name}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Material Calculation Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Total Volumen Requerido:</span>
                  <span className="text-base font-extrabold text-[#2FAE6D]">
                    {calc.gallonsNeeded} Galones
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Presentación Sugerida</span>
                    <span className="font-bold text-white">
                      {calc.suggestedBuckets > 0 && `${calc.suggestedBuckets} Cuñete(s) (5 Gal)`}
                      {calc.suggestedBuckets > 0 && calc.suggestedIndividualGallons > 0 && ' + '}
                      {calc.suggestedIndividualGallons > 0 && `${calc.suggestedIndividualGallons} Galón(es)`}
                      {calc.suggestedBuckets === 0 && calc.suggestedIndividualGallons === 0 && '1 Galón'}
                    </span>
                  </div>

                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Rendimiento Estimado</span>
                    <span className="font-bold text-white">
                      {calc.coverage} m²/gal ({calc.coats} manos)
                    </span>
                  </div>
                </div>

                {calc.primerRequiredGallons > 0 && (
                  <div className="bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/30 text-amber-200 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Se sugieren <strong>{calc.primerRequiredGallons} Gal</strong> de Sellomax/Imprimante base.</span>
                  </div>
                )}
              </div>

              {/* Estimated Price Box */}
              <div className="pt-2 border-t border-white/15">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Valor Estimado de Materiales
                </span>
                <p className="text-2xl font-black text-white">
                  ${calc.estimatedPriceCOP.toLocaleString('es-CO')}{' '}
                  <span className="text-xs font-normal text-slate-400">COP</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  * Sujeto a validación técnica y descuento comercial por volumen.
                </p>
              </div>

              {/* Action Buttons for Next Step: Purchase / Talk to Advisor */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Continue to Purchase / Order */}
                <button
                  type="submit"
                  id="submit-paint-request-btn"
                  className="w-full bg-[#2FAE6D] hover:bg-[#26975d] text-white py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Continuar con el Proceso de Compra</span>
                  {!isLoggedIn && <Lock className="w-3.5 h-3.5 ml-1 text-emerald-200" />}
                </button>

                {/* 2. Speak Directly with Technical Advisor */}
                <button
                  type="button"
                  id="modal-speak-advisor-btn"
                  onClick={handleSpeakWithAdvisor}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Hablar directamente con un Asesor</span>
                  {!isLoggedIn && <Lock className="w-3 h-3 text-slate-300 ml-1" />}
                </button>
              </div>

              {!isLoggedIn && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Se solicitará inicio de sesión al continuar la compra o abrir el chat.</span>
                </div>
              )}
            </div>

            {/* Micro reassurance */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#2FAE6D]" />
                <span>Garantía Oficial Directa Pintuco</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Al formalizar el pedido con tu sesión iniciada, se emitirá la póliza de fábrica y certificado de lote de laboratorio.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
