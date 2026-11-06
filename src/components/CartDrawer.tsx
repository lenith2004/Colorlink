import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MessageSquare,
  Sparkles,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowLeft,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem, DocumentType, UserProfile } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartTotalCOP,
    cartItemsCount,
    setActiveView,
    setIsChatOpen,
    currentUser,
    setCurrentUser,
    isLoggedIn,
    setIsLoggedIn,
    whatsAppCommercialNumber,
    registerClient,
    registeredClients,
    allUsers,
    selectedCity,
  } = useApp();

  // Screen modes inside drawer: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration / Checkout fields
  const [docType, setDocType] = useState<DocumentType>(currentUser?.docType || 'CC');
  const [docNumber, setDocNumber] = useState<string>(currentUser?.docNumber || '');
  const [fullName, setFullName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [city, setCity] = useState<string>(currentUser?.city || selectedCity || 'Bogotá D.C.');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Success state
  const [orderCode, setOrderCode] = useState<string>('');
  const [finalOrderClient, setFinalOrderClient] = useState<UserProfile | null>(null);

  if (!isCartOpen) return null;

  // Handle proceeding from Cart to Checkout
  const handleProceedToCheckout = () => {
    setFormError(null);
    if (isLoggedIn && currentUser) {
      // Prefill with logged in user data
      setDocType(currentUser.docType || 'CC');
      setDocNumber(currentUser.docNumber || '');
      setFullName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setCity(currentUser.city || selectedCity || 'Bogotá D.C.');
      if (currentUser.address) setAddress(currentUser.address);
    }
    setStep('checkout');
  };

  // Process and finalize order with customer traceability
  const handleCompleteOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    let activeClient: UserProfile;

    if (isLoggedIn && currentUser) {
      if (!address.trim()) {
        setFormError('Por favor ingresa la dirección de entrega para coordinar el despacho.');
        return;
      }
      activeClient = {
        ...currentUser,
        address: address.trim(),
        city: city || currentUser.city,
      };
      setCurrentUser(activeClient);
    } else {
      // User is registering or logging in at checkout
      if (authMode === 'register') {
        const cleanDoc = docNumber.replace(/[^0-9a-zA-Z]/g, '').trim();
        if (!cleanDoc || !fullName.trim()) {
          setFormError('Nombre y Número de Documento son obligatorios.');
          return;
        }
        if (!phone.trim() || phone.trim().length < 7) {
          setFormError('Por favor ingresa un número de teléfono / WhatsApp válido para confirmar el despacho.');
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setFormError('Por favor ingresa un correo electrónico válido para tu factura.');
          return;
        }
        if (!address.trim()) {
          setFormError('La dirección de entrega es obligatoria para la trazabilidad y envío.');
          return;
        }

        const newUser: UserProfile = {
          id: `user-${cleanDoc}-${Date.now()}`,
          name: fullName.trim(),
          email: email.trim(),
          role: 'cliente',
          docType,
          docNumber: cleanDoc,
          company: docType === 'NIT' ? fullName.trim() : 'Particular / Obra',
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          registeredAt: new Date().toLocaleString('es-CO'),
        };

        registerClient(newUser);
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        activeClient = newUser;
      } else {
        // Quick Login
        const cleanInput = docNumber.replace(/[^0-9a-zA-Z]/g, '').trim();
        if (!cleanInput) {
          setFormError('Por favor ingresa tu número de documento o correo.');
          return;
        }
        const allKnown = [...(registeredClients || []), ...(allUsers || [])];
        const found = allKnown.find(
          (c) =>
            (c.docNumber && c.docNumber.replace(/[^0-9a-zA-Z]/g, '') === cleanInput) ||
            (c.email && c.email.toLowerCase() === docNumber.toLowerCase().trim())
        );

        if (found) {
          const updated = {
            ...found,
            address: address.trim() || found.address || 'Dirección de obra',
            city: city.trim() || found.city || 'Bogotá D.C.',
          };
          setCurrentUser(updated);
          setIsLoggedIn(true);
          activeClient = updated;
        } else {
          // Create registered profile for this document
          const newUser: UserProfile = {
            id: `user-${cleanInput}`,
            name: fullName.trim() || (docType === 'NIT' ? `Empresa NIT ${cleanInput}` : `Cliente CC ${cleanInput}`),
            email: email.trim() || `cliente.${cleanInput}@colorlink.pintuco.com`,
            role: 'cliente',
            docType,
            docNumber: cleanInput,
            company: 'Cliente Registrado',
            phone: phone.trim() || '+57 300 000 0000',
            city: city.trim(),
            address: address.trim() || 'Dirección acordada en entrega',
            registeredAt: new Date().toLocaleString('es-CO'),
          };
          registerClient(newUser);
          setCurrentUser(newUser);
          setIsLoggedIn(true);
          activeClient = newUser;
        }
      }
    }

    // Generate Official Order Code
    const code = `PED-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(code);
    setFinalOrderClient(activeClient);

    const itemsSummary = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} (${item.presentation}, Tono: ${item.colorName || 'Oficial'}) - $${(
            item.pricePerUnitCOP * item.quantity
          ).toLocaleString('es-CO')} COP`
      )
      .join('\n');

    const subtotal = Math.round(cartTotalCOP / 1.19);
    const iva = cartTotalCOP - subtotal;

    // Full WhatsApp message with customer traceability
    const message =
      `*¡Hola Pintuco ColorLink! Deseo confirmar la siguiente orden de compra:*\n\n` +
      `*Nº Pedido Oficial:* ${code}\n\n` +
      `*📋 DATOS DEL CLIENTE Y TRAZABILIDAD:*\n` +
      `• *Cliente / Razón Social:* ${activeClient.name}\n` +
      `• *Identificación:* ${activeClient.docType || 'CC'} ${activeClient.docNumber || 'Registrado'}\n` +
      `• *Celular / WhatsApp:* ${activeClient.phone || 'No indicado'}\n` +
      `• *Correo:* ${activeClient.email}\n` +
      `• *Ciudad de Despacho:* ${activeClient.city || city}\n` +
      `• *Dirección de Entrega:* ${address || activeClient.address || 'Por confirmar en llamada'}\n` +
      (deliveryNotes ? `• *Observaciones de Entrega:* ${deliveryNotes}\n` : '') +
      `• *Fecha de Registro:* ${new Date().toLocaleString('es-CO')}\n\n` +
      `*📦 DETALLE DE PRODUCTOS:*\n${itemsSummary}\n\n` +
      `*FINANCIERO:*\n` +
      `• Subtotal: $${subtotal.toLocaleString('es-CO')} COP\n` +
      `• IVA (19%): $${iva.toLocaleString('es-CO')} COP\n` +
      `• *TOTAL A PAGAR:* $${cartTotalCOP.toLocaleString('es-CO')} COP\n\n` +
      `_Solicito confirmación de reserva de lote en bodega Pintuco y coordinación de despacho oficial._`;

    const cleanPhone = whatsAppCommercialNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setStep('success');
  };

  const handleClearAndReset = () => {
    clearCart();
    setStep('cart');
    setOrderCode('');
    setFinalOrderClient(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#142154] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] flex items-center justify-center text-white shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>
                    {step === 'cart'
                      ? 'Carrito de Compras'
                      : step === 'checkout'
                      ? 'Identificación & Despacho'
                      : '¡Pedido Confirmado!'}
                  </span>
                  {cartItemsCount > 0 && step === 'cart' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {cartItemsCount} {cartItemsCount === 1 ? 'ítem' : 'ítems'}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-300">Pintuco® ColorLink Tienda Oficial</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ================================================================= */}
          {/* VISTA 1: ÉXITO TOTAL DE COMPRA */}
          {/* ================================================================= */}
          {step === 'success' ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2FAE6D] flex items-center justify-center shadow-lg ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9 stroke-3" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold rounded-full border border-emerald-200 mb-2">
                  Trazabilidad Registrada Exitosamente
                </span>
                <h4 className="text-xl font-black text-slate-900">¡Pedido Enviado a Despacho!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Se ha generado tu orden oficial y se ha enviado la notificación con tu trazabilidad al asesor comercial de Pintuco.
                </p>
              </div>

              {/* Order Ticket Card */}
              <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Código de Pedido:</span>
                  <span className="font-mono font-black text-sm text-[#1B2A6B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {orderCode}
                  </span>
                </div>
                {finalOrderClient && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cliente Titular:</span>
                      <span className="font-bold text-slate-800 text-right">{finalOrderClient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Documento:</span>
                      <span className="font-mono text-slate-700">{finalOrderClient.docType} {finalOrderClient.docNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">WhatsApp / Teléfono:</span>
                      <span className="text-slate-700">{finalOrderClient.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Entrega en:</span>
                      <span className="font-medium text-slate-800 text-right max-w-[190px] truncate">
                        {finalOrderClient.address || address}, {finalOrderClient.city || city}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Pagado / Acordado:</span>
                  <span className="text-[#2FAE6D] font-mono">${cartTotalCOP.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5 w-full max-w-sm">
                <button
                  onClick={handleClearAndReset}
                  className="w-full py-3 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  Nuevo Pedido / Vaciar Carrito
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('home');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          ) : step === 'checkout' ? (
            /* =============================================================== */
            /* VISTA 2: FORMULARIO DE CHECKOUT (REQUISITO OBLIGATORIO DE COMPRA) */
            /* =============================================================== */
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left">
              {/* Back to cart button */}
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a revisar productos</span>
              </button>

              {/* Requirement Notice Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2FAE6D] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-emerald-950">
                    Requisito de Compra & Trazabilidad Oficial
                  </h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                    Para asegurar la reserva de lote físico en bodega Pintuco, garantía de fábrica y emisión de factura con despacho a tu dirección, es necesario tener tu información registrada.
                  </p>
                </div>
              </div>

              {/* Status if already logged in */}
              {isLoggedIn && currentUser ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Cliente Identificado:</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      ✓ Sesión Activa
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-black text-slate-900 text-sm">{currentUser.name}</p>
                    <p className="text-slate-500">
                      {currentUser.docType || 'Doc'}: <span className="font-mono text-slate-700 font-semibold">{currentUser.docNumber}</span>
                    </p>
                    <p className="text-slate-500">Teléfono: <span className="text-slate-700">{currentUser.phone || 'No registrado'}</span></p>
                    <p className="text-slate-500">Correo: <span className="text-slate-700">{currentUser.email}</span></p>
                  </div>
                </div>
              ) : (
                /* Auth Switch Tabs (Register / Login) */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${
                        authMode === 'register' ? 'bg-white text-[#1B2A6B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Registrarme (Nuevo Cliente)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${
                        authMode === 'login' ? 'bg-white text-[#1B2A6B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ya Tengo Cuenta (Ingresar)
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {authMode === 'register'
                      ? 'Diligencia tus datos una sola vez para crear tu cuenta y habilitar el despacho de tu pedido.'
                      : 'Ingresa con tu documento de identidad registrado para vincular este pedido a tu historial.'}
                  </p>
                </div>
              )}

              {/* Form Error */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleCompleteOrder} className="space-y-3 text-xs">
                {(!isLoggedIn || !currentUser) && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipo Doc.</label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DocumentType)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                        >
                          <option value="CC">CC</option>
                          <option value="NIT">NIT</option>
                          <option value="CE">CE</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Número de Documento *
                        </label>
                        <input
                          type="text"
                          required
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          placeholder="Ej. 1020304050 o 900123456"
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                        />
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nombre Completo / Razón Social *
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ej. Carlos Gómez o Constructora Bolivar"
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              WhatsApp / Teléfono *
                            </label>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Ej. 310 123 4567"
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Correo Electrónico *
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="correo@ejemplo.com"
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Delivery Information (Required for everyone) */}
                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lugar de Despacho & Entrega</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej. Bogotá D.C., Medellín..."
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Calle 127 # 15-40 Apto 302"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Observaciones de Entrega (Opcional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Ej. Portería torre 2, horario de entrega en la mañana..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-[#1B2A6B]"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Ítems a Despachar:</span>
                    <span className="font-bold text-slate-800">{cartItemsCount} productos</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total a Pagar (IVA Incluido):</span>
                    <span className="text-[#2FAE6D] font-mono">${cartTotalCOP.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isLoggedIn
                      ? 'Confirmar Pedido y Despacho'
                      : authMode === 'register'
                      ? 'Registrarme y Finalizar Compra'
                      : 'Iniciar Sesión y Finalizar Compra'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : cart.length === 0 ? (
            /* =============================================================== */
            /* VISTA 3: CARRITO VACÍO */
            /* =============================================================== */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Tu carrito está vacío</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Añade galones o cuñetes desde el catálogo, prueba el <strong>Simulador de Color</strong> o realiza una <strong>Cotización de Proyecto</strong> sin necesidad de registrarte.
              </p>
              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('simulator');
                  }}
                  className="w-full py-2.5 bg-[#1B2A6B] hover:bg-[#142154] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Ir al Simulador de Color</span>
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('products');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Explorar Catálogo Técnico
                </button>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* VISTA 4: LISTA DE ÍTEMS DEL CARRITO (LIBRE NAVEGACIÓN) */
            /* =============================================================== */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: item.colorHex || '#1B2A6B' }}
                        >
                          <span className="text-[10px] text-white font-bold">{item.sku}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer shrink-0"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-semibold text-slate-700">SKU: {item.sku}</span>
                        <span>•</span>
                        <span>{item.presentation}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                          style={{ backgroundColor: item.colorHex || '#ffffff' }}
                        />
                        <span className="text-[11px] text-slate-600 font-medium">{item.colorName || 'Oficial'}</span>
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-l cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-r cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ${(item.pricePerUnitCOP * item.quantity).toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer & Checkout Action */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono">${Math.round(cartTotalCOP / 1.19).toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IVA (19% incluido)</span>
                    <span className="font-mono">
                      ${(cartTotalCOP - Math.round(cartTotalCOP / 1.19)).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Estimado</span>
                    <span className="text-[#2FAE6D] font-mono">${cartTotalCOP.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <span>Proceder a Completar Compra</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      Despacho a toda Colombia
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-slate-400 hover:text-red-500 underline cursor-pointer"
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
