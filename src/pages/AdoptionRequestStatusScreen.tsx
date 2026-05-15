import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'APROBADA' | 'RECHAZADA' | string;

type Adopter = {
  id?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
};

type Pet = {
  id?: number;
  name?: string;
  breed?: string;
  species?: string;
  size?: string;
  status?: string;
};

type AdoptionProcess = {
  id?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
};

type AdoptionRequest = {
  id: number;
  requestDate?: string;
  status?: RequestStatus;
  comments?: string;
  adopterId?: number;
  petId?: number;
  adopter?: Adopter;
  pet?: Pet;
  adoptionProcess?: AdoptionProcess;
};

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

function normalizeStatus(status?: RequestStatus): 'PENDING' | 'APPROVED' | 'REJECTED' {
  const upper = (status || 'PENDING').toUpperCase();

  if (upper === 'APPROVED' || upper === 'APROBADA') return 'APPROVED';
  if (upper === 'REJECTED' || upper === 'RECHAZADA') return 'REJECTED';

  return 'PENDING';
}

function getStatusLabel(status?: RequestStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === 'APPROVED') return 'Aprobada';
  if (normalized === 'REJECTED') return 'Rechazada';

  return 'Pendiente';
}

function getStatusPillClasses(status?: RequestStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === 'APPROVED') {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (normalized === 'REJECTED') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-orange-50 text-orange-700 border-orange-200';
}

function getStatusIcon(status?: RequestStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === 'APPROVED') return '✓';
  if (normalized === 'REJECTED') return '✕';

  return '◷';
}

function formatDate(date?: string) {
  if (!date) return 'Sin fecha';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getPetName(request?: AdoptionRequest | null) {
  return request?.pet?.name || `Mascota #${request?.petId ?? '-'}`;
}

function getPetBreed(request?: AdoptionRequest | null) {
  return request?.pet?.breed || request?.pet?.species || 'Sin raza registrada';
}

function getAdopterName(request?: AdoptionRequest | null) {
  return request?.adopter?.name || `Adoptante #${request?.adopterId ?? '-'}`;
}

function getObservation(status?: RequestStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === 'APPROVED') {
    return 'Tu solicitud fue aprobada por el shelter. Revisa los pasos siguientes del proceso de adopción.';
  }

  if (normalized === 'REJECTED') {
    return 'Tu solicitud fue rechazada. Puedes revisar otras mascotas disponibles e iniciar una nueva solicitud.';
  }

  return 'Tu solicitud está siendo revisada por el shelter. Puedes volver a consultar más tarde para ver el estado actualizado.';
}

function filterByStatus(requests: AdoptionRequest[], selectedStatus: StatusFilter) {
  if (selectedStatus === 'ALL') return requests;

  return requests.filter((request) => normalizeStatus(request.status) === selectedStatus);
}

export default function AdoptionRequestStatusScreen() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /*
    ID temporal antes del login final.
  */
  const currentAdopterId = 1;

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/adoption-requests`);

      if (!response.ok) {
        throw new Error('No fue posible consultar tus solicitudes de adopción.');
      }

      const data = await response.json();
      const requestList = Array.isArray(data) ? data : [];

      const myRequests = requestList.filter((request: AdoptionRequest) => {
        const requestAdopterId = request.adopterId || request.adopter?.id;
        return requestAdopterId === currentAdopterId;
      });

      setRequests(myRequests);

      if (myRequests.length > 0) {
        setSelectedRequestId(myRequests[0].id);
      } else {
        setSelectedRequestId(null);
      }
    } catch (error) {
      console.error('Error loading adoption request status:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible consultar tus solicitudes de adopción.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(
    () => filterByStatus(requests, statusFilter),
    [requests, statusFilter]
  );

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedRequestId)
      || filteredRequests[0]
      || null,
    [filteredRequests, selectedRequestId]
  );

  useEffect(() => {
    if (filteredRequests.length === 0) {
      setSelectedRequestId(null);
      return;
    }

    const selectedStillExists = filteredRequests.some((request) => request.id === selectedRequestId);

    if (!selectedStillExists) {
      setSelectedRequestId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedRequestId]);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((request) => normalizeStatus(request.status) === 'PENDING').length;
  const approvedRequests = requests.filter((request) => normalizeStatus(request.status) === 'APPROVED').length;
  const rejectedRequests = requests.filter((request) => normalizeStatus(request.status) === 'REJECTED').length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-orange-500 py-8 px-6 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            ← Volver
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-white text-4xl font-bold">Mis solicitudes de adopción</h1>
              <p className="text-white/90 mt-2 text-lg">
                Consulta el estado de tus solicitudes y revisa el avance del proceso.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-4 text-white">
              <p className="text-sm text-white/80">Total de solicitudes</p>
              <p className="text-3xl font-bold">{totalRequests}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <p className="text-gray-500 text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-orange-600">{pendingRequests}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <p className="text-gray-500 text-sm">Aprobadas</p>
            <p className="text-3xl font-bold text-green-600">{approvedRequests}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <p className="text-gray-500 text-sm">Rechazadas</p>
            <p className="text-3xl font-bold text-red-600">{rejectedRequests}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#2D3436]">Estado de solicitudes</h2>
              <p className="text-sm text-gray-500">
                Solo se muestran las solicitudes asociadas al adoptante autenticado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
              </select>

              <button
                onClick={fetchRequests}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold"
              >
                Actualizar
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Cargando tus solicitudes...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
                <p className="font-semibold">No fue posible cargar la información</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-7xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold text-[#2D3436] mb-2">Aún no tienes solicitudes registradas</h3>
              <p className="text-gray-600 mb-6">
                Cuando solicites la adopción de una mascota, podrás consultar su estado aquí.
              </p>
              <button
                onClick={() => navigate('/solicitar-adopcion')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold"
              >
                Solicitar adopción
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-2xl font-bold text-[#2D3436] mb-2">No hay solicitudes con este estado</h3>
              <p className="text-gray-600">Cambia el filtro para revisar otras solicitudes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] min-h-[520px]">
              <div className="border-r border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mascota</th>
                        <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredRequests.map((request) => {
                        const isSelected = selectedRequest?.id === request.id;

                        return (
                          <tr
                            key={request.id}
                            className={`transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="py-4 px-5">
                              <p className="font-bold text-[#2D3436]">{getPetName(request)}</p>
                              <p className="text-xs text-gray-500">{getPetBreed(request)}</p>
                            </td>
                            <td className="py-4 px-5 text-gray-600 text-sm">{formatDate(request.requestDate)}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusPillClasses(request.status)}`}>
                                {getStatusIcon(request.status)} {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <button
                                onClick={() => setSelectedRequestId(request.id)}
                                className="text-purple-700 hover:text-orange-600 font-semibold text-sm"
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="p-6 bg-white">
                {selectedRequest && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#2D3436]">Detalle de solicitud #{selectedRequest.id}</h3>
                        <p className="text-gray-500 text-sm mt-1">Información general de la solicitud seleccionada.</p>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusPillClasses(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)} {getStatusLabel(selectedRequest.status)}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="font-bold text-[#2D3436] mb-4">🐶 Información de la mascota</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Mascota</p>
                          <p className="font-semibold text-[#2D3436]">{getPetName(selectedRequest)}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Raza / especie</p>
                          <p className="font-semibold text-[#2D3436]">{getPetBreed(selectedRequest)}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Fecha de solicitud</p>
                          <p className="font-semibold text-[#2D3436]">{formatDate(selectedRequest.requestDate)}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Solicitante</p>
                          <p className="font-semibold text-[#2D3436]">{getAdopterName(selectedRequest)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h4 className="font-bold text-[#2D3436] mb-3">Motivo de adopción</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedRequest.comments || 'No se registraron comentarios para esta solicitud.'}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                      <h4 className="font-bold text-[#2D3436] mb-2">Observación</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {getObservation(selectedRequest.status)}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => {
                        const active = normalizeStatus(selectedRequest.status) === status;

                        return (
                          <div
                            key={status}
                            className={`h-2 rounded-full ${active ? 'bg-gradient-to-r from-purple-600 to-orange-500' : 'bg-gray-200'}`}
                          ></div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Pendiente</span>
                      <span>Aprobada</span>
                      <span>Rechazada</span>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
