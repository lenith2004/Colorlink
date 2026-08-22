import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Layers,
  ArrowRight,
  TrendingDown,
  Warehouse,
  History,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryDashboard: React.FC = () => {
  const {
    inventory,
    requests,
    traceability,
    restockProduct,
    setSelectedRequestForDetail,
    currentUser,
  } = useApp();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchInvQuery, setSearchInvQuery] = useState<string>('');
  const [restockModalItem, setRestockModalItem] = useState<any | null>(null);
  const [unitsToAdd, setUnitsToAdd] = useState<number>(20);
  const [newBatchNumber, setNewBatchNumber] = useState<string>('LOT-2026-NUEVO-01');

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesZone = selectedZone === 'all' || item.warehouseZone.toLowerCase().includes(selectedZone.toLowerCase());
    const matchesSearch =
      !searchInvQuery ||
      item.productName.toLowerCase().includes(searchInvQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchInvQuery.toLowerCase()) ||
      item.colorName.toLowerCase().includes(searchInvQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  // Calculate critical shortage alerts based on pending requests
  const shortageAlerts = requests
    .filter((r) => r.status === 'abastecimiento' || r.status === 'necesidad')
    .map((req) => {
      const invItem = inventory.find((i) => i.productId === req.recommendedProductId);
      const availableUnits = invItem ? invItem.stockUnits - invItem.reservedUnits : 0;
      const availableGallons = availableUnits * (invItem?.gallonsPerUnit || 1);
      const isShortage = availableGallons < req.gallonsNeeded;

      return {
        req,
        invItem,
        availableGallons,
        requiredGallons: req.gallonsNeeded,
        deficitGallons: req.gallonsNeeded - availableGallons,
        isShortage,
      };
    })
    .filter((item) => item.isShortage);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalItem) {
      restockProduct(restockModalItem.id, Number(unitsToAdd) || 10, newBatchNumber);
      setRestockModalItem(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5" />
            Módulo de Inventario & Centro de Distribución • {currentUser.name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Gestión de Stock, Lotes y Abastecimiento en Vivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Monitoreo en tiempo real de existencias por lote, alertas de inventario crítico y trazabilidad de despacho por solicitud.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-slate-300 block">Total Referencias</span>
            <span className="text-xl font-bold text-white">{inventory.length} SKUs</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-slate-300 block">Lotes Activos</span>
            <span className="text-xl font-bold text-[#2FAE6D]">{inventory.length + 3} Lotes</span>
          </div>
        </div>
      </div>

      {/* SHORTAGE ALERTS SECTION IF ANY */}
      {shortageAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Alerta Automática de Abastecimiento Crítico ({shortageAlerts.length} Solicitudes Afectadas)</span>
          </div>
          <p className="text-xs text-red-700">
            La demanda de materiales de las siguientes órdenes supera las existencias disponibles en bodega. Se sugiere reabastecer o asignar lote de producción entrante:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {shortageAlerts.map(({ req, invItem, availableGallons, requiredGallons, deficitGallons }) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequestForDetail(req)}
                className="bg-white p-3.5 rounded-2xl border border-red-200 shadow-2xs hover:border-red-500 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                      {req.requestNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.projectName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {req.recommendedProductName}: Requiere <strong>{requiredGallons} Gal</strong> (Disponible: {availableGallons} Gal)
                  </p>
                  <p className="text-[11px] font-extrabold text-red-600">Déficit: -{deficitGallons} Galones</p>
                </div>
                <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0">
                  Ver Orden
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrar por Zona:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="all">Todas las Bodegas</option>
            <option value="central">Bodega Central</option>
            <option value="norte">Bodega Norte</option>
            <option value="químicos">Bodega Químicos</option>
            <option value="vías">Bodega Vías</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por SKU, producto, lote..."
            value={searchInvQuery}
            onChange={(e) => setSearchInvQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* INVENTORY CARDS GRID (Formatted like Top Products as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInventory.map((item) => {
          const availableUnits = item.stockUnits - item.reservedUnits;
          const isLowStock = availableUnits <= item.minThresholdUnits;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                isLowStock ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Top SKU & Category */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {item.category}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      isLowStock
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLowStock ? 'Stock Crítico' : 'Stock Saludable'}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                  {item.productName}
                </h4>

                {/* Color & Presentation */}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-xs font-semibold text-slate-700">{item.colorName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-[#1B2A6B]">{item.presentation}</span>
                </div>
              </div>

              {/* Stock quantities breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Físico</span>
                  <span className="font-extrabold text-slate-900 text-sm">{item.stockUnits}</span>
                  <span className="text-[9px] text-slate-400 block">unid</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-600 block uppercase font-bold">Reservado</span>
                  <span className="font-extrabold text-amber-600 text-sm">{item.reservedUnits}</span>
                  <span className="text-[9px] text-slate-400 block">unid</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#2FAE6D] block uppercase font-bold">Disponible</span>
                  <span className="font-extrabold text-[#2FAE6D] text-sm">{availableUnits}</span>
                  <span className="text-[9px] text-slate-400 block">unid</span>
                </div>
              </div>

              {/* Batch & Warehouse Location */}
              <div className="text-[11px] text-slate-500 space-y-1">
                <p>📍 <strong>Ubicación:</strong> {item.warehouseZone}</p>
                <p>🏷️ <strong>Lote Activo:</strong> <span className="font-mono font-bold text-slate-700">{item.batchNumber}</span></p>
                <p>🕒 <strong>Último Movimiento:</strong> {item.lastUpdated}</p>
              </div>

              {/* Restock Button */}
              <button
                onClick={() => setRestockModalItem(item)}
                className="w-full bg-[#1B2A6B] hover:bg-[#152254] text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#2FAE6D]" />
                <span>Reabastecer / Ingresar Lote</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* TRACEABILITY LOG SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1B2A6B]" />
            <h3 className="font-bold text-base text-slate-900">
              Trazabilidad de Consumo de Inventario por Solicitud
            </h3>
          </div>
          <span className="text-xs text-slate-400">Registro histórico inmutable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Solicitud</th>
                <th className="py-3 px-4">Cliente / Obra</th>
                <th className="py-3 px-4">Producto & Presentación</th>
                <th className="py-3 px-4">Lote Asignado</th>
                <th className="py-3 px-4">Unidades</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {traceability.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#1B2A6B]">{log.requestId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.clientName}</td>
                  <td className="py-3 px-4">{log.productName} ({log.presentation})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.batchNumber}</td>
                  <td className="py-3 px-4 font-extrabold text-[#2FAE6D]">{log.unitsConsumed} Unid</td>
                  <td className="py-3 px-4 text-slate-500">{log.operator}</td>
                  <td className="py-3 px-4 text-slate-400">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-slate-900">
                Reabastecer SKU
              </h4>
              <button onClick={() => setRestockModalItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ingresando unidades a <strong>{restockModalItem.productName}</strong> ({restockModalItem.presentation}).
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unidades a Ingresar:</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={unitsToAdd}
                  onChange={(e) => setUnitsToAdd(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de Lote de Producción:</label>
                <input
                  type="text"
                  required
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2FAE6D] text-white rounded-xl text-xs font-bold"
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
