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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';

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
    whatsAppCommercialNumber,
  } = useApp();

  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [orderCode, setOrderCode] = useState<string>('');

  if (!isCartOpen) return null;

  const handleCheckoutWhatsApp = () => {
    const code = `PED-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(code);

    const itemsSummary = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} (${item.presentation}, Tono: ${item.colorName}) - $${(
            item.pricePerUnitCOP * item.quantity
          ).toLocaleString('es-CO')} COP`
      )
      .join('\n');

    const message =
      `*¡Hola Pintuco ColorLink! Deseo confirmar la siguiente orden de compra:*\n\n` +
      `*Nº Pedido:* ${code}\n` +
      `*Cliente:* ${currentUser?.name || 'Cliente Web'}\n` +
      `*Documento:* ${currentUser?.docNumber || 'Por definir'}\n\n` +
      `*Detalle de Productos:*\n${itemsSummary}\n\n` +
      `*TOTAL A PAGAR:* $${cartTotalCOP.toLocaleString('es-CO')} COP\n\n` +
      `_Solicito confirmación de disponibilidad en bodega y despacho._`;

    const cleanPhone = whatsAppCommercialNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setCheckoutSuccess(true);
  };

  const handleClear = () => {
    clearCart();
    setCheckoutSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#142154] to-[#1B2A6B] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] flex items-center justify-center text-white shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>Carrito de Compras</span>
                  {cartItemsCount > 0 && (
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

          {/* Checkout Success Screen */}
          {checkoutSuccess ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2FAE6D] flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8 stroke-3" />
              </div>
              <h4 className="text-xl font-black text-slate-900">¡Pedido Enviado a Despacho!</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Hemos generado el código <strong className="text-slate-900 font-mono">{orderCode}</strong>. El asesor comercial confirmará tu lote reservado en bodega.
              </p>
              <div className="pt-4 flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={handleClear}
                  className="w-full py-3 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty State */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Tu carrito está vacío</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Añade galones o cuñetes desde el catálogo, o pide a <strong>PintuBot</strong> que calcule la cantidad exacta y los agregue automáticamente.
              </p>
              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="w-full py-2.5 bg-[#1B2A6B] hover:bg-[#142154] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Pedir a PintuBot que calcule</span>
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
            /* Items List */
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
                        <span className="text-[11px] text-slate-600 font-medium">{item.colorName}</span>
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

              {/* Order Footer & Checkout */}
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
                    onClick={handleCheckoutWhatsApp}
                    className="w-full py-3 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Confirmar Pedido por WhatsApp</span>
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
