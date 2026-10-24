import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  BarChart3,
  DollarSign,
  Globe,
  MessageSquare,
  Store,
  Database,
  RefreshCw,
  Table,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WORKFLOW_STAGES } from '../../data/initialData';

export const GlobalAnalyticsDashboard: React.FC = () => {
  const {
    requests,
    inventory,
    products,
    registeredClients,
    supabaseStatus,
    refreshFromSupabase,
    setSelectedRequestForDetail,
  } = useApp();

  const totalRequests = requests.length;
  const completedRequests = requests.filter((r) => r.status === 'completado').length;
  const inProgressRequests = totalRequests - completedRequests;

  const totalVolumeGallons = requests.reduce((acc, curr) => acc + curr.gallonsNeeded, 0);
  const totalQuotedCOP = requests.reduce(
    (acc, curr) => acc + (curr.technicalEvaluation?.quotedTotalCOP || curr.estimatedPriceCOP),
    0
  );

  // Channel distribution
  const webCount = requests.filter((r) => r.channel === 'web').length;
  const waCount = requests.filter((r) => r.channel === 'whatsapp').length;
  const storeCount = requests.filter((r) => r.channel === 'tienda').length;

  // Critical stock items
  const criticalStockItems = inventory.filter(
    (i) => i.stockUnits - i.reservedUnits <= i.minThresholdUnits
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d163a] via-[#1B2A6B] to-[#142154] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2FAE6D] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Dashboard General • Ecosistema Digital ColorLink
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Métricas Globales de Operación Pintuco
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Integración de KPIs comerciales, tiempos de formulación técnica, disponibilidad de stock y cumplimiento de calidad.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-300 block">Ecosistema</span>
            <span className="text-base font-extrabold text-[#2FAE6D]">100% Online</span>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Tiempo de Respuesta</span>
            <Clock className="w-4 h-4 text-[#1B2A6B]" />
          </div>
          <p className="text-2xl font-black text-slate-900">28.4 min</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> -70% vs flujo tradicional
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Volumen en Gestión</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalVolumeGallons} Gal</p>
          <span className="text-[11px] text-slate-500 font-medium">
            En {totalRequests} proyectos activos
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Valor Total Cotizado</span>
            <DollarSign className="w-4 h-4 text-[#2FAE6D]" />
          </div>
          <p className="text-2xl font-black text-[#1B2A6B]">
            ${(totalQuotedCOP / 1000000).toFixed(1)}M{' '}
            <span className="text-xs font-normal text-slate-400">COP</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-bold">
            92% tasa de aprobación
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Alertas de Inventario</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600">
            {criticalStockItems.length} SKUs
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            Bajo umbral mínimo
          </span>
        </div>
      </div>

      {/* Middle Section: Pipeline breakdown & Channel distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Distribución de Solicitudes por Fase del Ecosistema
            </h3>
            <span className="text-xs font-bold text-[#1B2A6B]">{requests.length} Total</span>
          </div>

          <div className="space-y-3 pt-2">
            {WORKFLOW_STAGES.map((stg) => {
              const count = requests.filter((r) => {
                if (stg.id === 'calidad') return r.status === 'calidad' || r.status === 'completado';
                return r.status === stg.id;
              }).length;
              const percentage = Math.round((count / Math.max(1, totalRequests)) * 100);

              return (
                <div key={stg.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">
                      Fase {stg.number}: {stg.title}
                    </span>
                    <span className="text-slate-900 font-extrabold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(8, percentage)}%`,
                        backgroundColor: stg.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel origin breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Ingreso Omnicanal de Necesidades
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-700" />
                <div>
                  <p className="font-bold text-slate-900">Portal Web & Calculadora IA</p>
                  <p className="text-[10px] text-slate-500">Formulario directo de cliente</p>
                </div>
              </div>
              <span className="text-base font-black text-blue-900">{webCount}</span>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="font-bold text-slate-900">Asistente WhatsApp Business</p>
                  <p className="text-[10px] text-slate-500">Captura conversacional</p>
                </div>
              </div>
              <span className="text-base font-black text-emerald-900">{waCount}</span>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-amber-700" />
                <div>
                  <p className="font-bold text-slate-900">Tiendas y Mostradores Pintuco</p>
                  <p className="text-[10px] text-slate-500">Puntos de venta directos</p>
                </div>
              </div>
              <span className="text-base font-black text-amber-900">{storeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase 9 Tables Sync Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2FAE6D] flex items-center justify-center font-bold border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Base de Datos Supabase (PostgreSQL)
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    supabaseStatus.connected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {supabaseStatus.connected ? 'Conectado Live' : 'Modo Local / Caché'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lectura y escritura en las 9 tablas normalizadas con nombres y columnas en mayúsculas.
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshFromSupabase()}
            disabled={supabaseStatus.isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>{supabaseStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar Tablas'}</span>
          </button>
        </div>

        {/* 9 Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              name: 'USUARIO',
              desc: 'Clientes y usuarios operativos',
              columns: 'USUARIO_ID, NOMBRE, IDENTIFICACION, CORREO, TELEFONO, TIPO_CLIENTE',
              count: registeredClients.length,
            },
            {
              name: 'PROYECTO',
              desc: 'Expediente central de obras y etapas',
              columns: 'PROYECTO_ID, USUARIO_ID, CIUDAD, TIPO_PROYECTO, AREA_M2, ESTADO_PROYECTO',
              count: requests.length,
            },
            {
              name: 'PRODUCTO',
              desc: 'Catálogo de pinturas Pintuco',
              columns: 'ID_DE_PRODUCTO, SKU, NOMBRE_PRODUCTO, TIPO_PRODUCTO, PRECIO_UNITARIO',
              count: products.length,
            },
            {
              name: 'COTIZACION_DETALLE',
              desc: 'Renglones y costos por proyecto',
              columns: 'COTIZACION_DETALLE_ID, PROYECTO_ID, ID_DE_PRODUCTO, CANTIDAD_REQUERIDA',
              count: requests.filter((r) => r.technicalEvaluation).length,
            },
            {
              name: 'ESPECIFICACION_TECNICA',
              desc: 'Superficie, ambiente y galones',
              columns: 'ID_ESPECIFICADO, PROYECTO_ID, TIPO_SUPERFICIE, AMBIENTE, COLOR',
              count: requests.length,
            },
            {
              name: 'AREA',
              desc: 'Zonas y áreas específicas en m²',
              columns: 'AREA_ID, ID_ESPECIFICADO, DESCRIPCION, MEDIDA_M2',
              count: requests.length,
            },
            {
              name: 'INVENTARIO',
              desc: 'Existencias y lotes por centro',
              columns: 'ID_DE_INVENTARIO, ID_DE_PRODUCTO, CENTRO_DISTRIBUCION, STOCK_DISPONIBLE',
              count: inventory.length,
            },
            {
              name: 'SERVICIO_APLICACION',
              desc: 'Contratista asignado y fechas',
              columns: 'SERVICIOS_ID, PROYECTO_ID, CONTRATISTA_ASIGNADO, ESTADO_SERVICIO',
              count: requests.filter((r) => r.servicePostSale).length,
            },
            {
              name: 'EVIDENCIA',
              desc: 'Inspecciones y control de calidad',
              columns: 'EVIDENCIA_ID, PROYECTO_ID, ETAPA_OBRA, DESCRIPCION, FOTOS_URL',
              count: requests.filter((r) => r.qualityChecklist).length,
            },
          ].map((table) => (
            <div
              key={table.name}
              className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-[#1B2A6B]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#1B2A6B]">
                    {table.name}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200">
                    {table.count} registros
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1">
                  {table.desc}
                </p>
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-2 truncate" title={table.columns}>
                {table.columns}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
