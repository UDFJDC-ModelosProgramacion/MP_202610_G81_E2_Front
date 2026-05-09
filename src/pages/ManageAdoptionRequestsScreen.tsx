import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

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

type AdoptionRequest = {
  id: number;
  requestDate?: string;
  status?: RequestStatus;
  comments?: string;
  adopterId?: number;
  petId?: number;
  adopter?: Adopter;
  pet?: Pet;
};

function normalizeStatus(status?: RequestStatus) {
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

function getStatusClasses(status?: RequestStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === 'APPROVED') {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (normalized === 'REJECTED') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-orange-50 text-orange-700 border-orange-200';
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

function getAdopterName(request?: AdoptionRequest) {
  return request?.adopter?.name || `Adoptante #${request?.adopterId ?? '-'}`;
}

function getAdopterEmail(request?: AdoptionRequest) {
  return request?.adopter?.email || 'correo no disponible';
}

function getPetName(request?: AdoptionRequest) {
  return request?.pet?.name || `Mascota #${request?.petId ?? '-'}`;
}

export default function ManageAdoptionRequestsScreen() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/adoption-requests`);

        if (!response.ok) {
          throw new Error('No fue posible cargar las solicitudes de adopción.');
        }

        const data = await response.json();
        const requestList = Array.isArray(data) ? data : [];

        setRequests(requestList);

        const firstPending = requestList.find(
          (request: AdoptionRequest) => normalizeStatus(request.status) === 'PENDING'
        );

        if (firstPending) {
          setSelectedRequestId(firstPending.id);
        } else if (requestList.length > 0) {
          setSelectedRequestId(requestList[0].id);
        }
      } catch (error) {
        console.error('Error loading adoption requests:', error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar las solicitudes de adopción.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const pendingCount = requests.filter(
    (request) => normalizeStatus(request.status) === 'PENDING'
  ).length;

  const updateRequestStatus = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/adoption-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          requestDate: selectedRequest.requestDate || new Date().toISOString().split('T')[0],
          status: newStatus,
          comments: selectedRequest.comments || '',
          adopterId: selectedRequest.adopterId || selectedRequest.adopter?.id,
          petId: selectedRequest.petId || selectedRequest.pet?.id
        })
      });

      if (!response.ok) {
        throw new Error('No fue posible actualizar la solicitud seleccionada.');
      }

      const updatedRequest = await response.json();

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                ...updatedRequest,
                status: updatedRequest.status || newStatus,
                adopter: updatedRequest.adopter || request.adopter,
                pet: updatedRequest.pet || request.pet
              }
            : request
        )
      );

      setSuccessMessage(
        newStatus === 'APPROVED'
          ? 'Solicitud aprobada correctamente.'
          : 'Solicitud rechazada correctamente.'
      );
    } catch (error) {
      console.error('Error updating adoption request:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la solicitud seleccionada.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedStatus = normalizeStatus(selectedRequest?.status);
  const isSelectedPending = selectedStatus === 'PENDING';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-500 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold">Solicitudes de Adopción</h1>
          <p className="text-white/90 mt-2">
            Revisa las solicitudes pendientes y decide si aprobar o rechazar cada proceso.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-semibold">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-[#2D3436] font-semibold">
            Cargando solicitudes de adopción...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-7xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">No hay solicitudes registradas</h2>
            <p className="text-gray-600">Cuando los adoptantes envíen solicitudes, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-5 border-b border-[#DCDDE1]">
                <h2 className="text-xl font-bold text-[#2D3436]">Lista de solicitudes ({requests.length})</h2>
                <p className="text-sm text-gray-500 mt-1">Pendientes por revisar: {pendingCount}</p>
              </div>

              <div className="max-h-[680px] overflow-y-auto p-4 space-y-4">
                {requests.map((request) => {
                  const isSelected = request.id === selectedRequestId;
                  const normalizedStatus = normalizeStatus(request.status);
                  const requestIsPending = normalizedStatus === 'PENDING';

                  return (
                    <article
                      key={request.id}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 shadow-md bg-purple-50/40'
                          : 'border-[#DCDDE1] bg-white hover:border-purple-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        setSelectedRequestId(request.id);
                        setSuccessMessage('');
                        setErrorMessage('');
                      }}
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className="text-purple-700 font-bold">#{String(request.id).padStart(3, '0')}</h3>
                        <span className={`text-xs font-semibold border px-2 py-1 rounded-full ${getStatusClasses(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>

                      <div className="text-sm text-[#2D3436] space-y-1 mb-4">
                        <p>👤 {getAdopterName(request)}</p>
                        <p>✉️ {getAdopterEmail(request)}</p>
                        <p>🐶 {getPetName(request)}</p>
                        <p>📅 {formatDate(request.requestDate)}</p>
                      </div>

                      <button
                        type="button"
                        className="w-full mb-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Ver detalle
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!requestIsPending || isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRequestId(request.id);
                            updateRequestStatus('APPROVED');
                          }}
                          className="py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          disabled={!requestIsPending || isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRequestId(request.id);
                            updateRequestStatus('REJECTED');
                          }}
                          className="py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Rechazar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>

            <section className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-8">
              {selectedRequest ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2D3436]">
                        Detalle de Solicitud #{String(selectedRequest.id).padStart(3, '0')}
                      </h2>
                      <p className="text-gray-500 mt-1">Información completa del adoptante y la mascota solicitada.</p>
                    </div>
                    <span className={`w-fit text-sm font-semibold border px-3 py-1 rounded-full ${getStatusClasses(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-6 mb-6 border border-purple-100">
                    <h3 className="text-[#2D3436] font-bold mb-4">👤 Información del Adoptante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Nombre completo</p>
                        <p className="text-[#2D3436] font-bold">{getAdopterName(selectedRequest)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Correo electrónico</p>
                        <p className="text-[#2D3436] font-bold">{getAdopterEmail(selectedRequest)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Fecha de solicitud</p>
                        <p className="text-[#2D3436] font-bold">{formatDate(selectedRequest.requestDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Mascota solicitada</p>
                        <p className="text-[#2D3436] font-bold">🐾 {getPetName(selectedRequest)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#2D3436] font-bold mb-3">💬 Motivo de Adopción</h3>
                    <div className="border border-[#DCDDE1] rounded-xl p-5 text-gray-700 leading-relaxed bg-white">
                      {selectedRequest.comments || 'El adoptante no agregó comentarios a esta solicitud.'}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#2D3436] font-bold mb-3">Estado de la Solicitud</h3>
                    <div className={`border px-4 py-3 rounded-lg font-semibold ${getStatusClasses(selectedRequest.status)}`}>
                      {selectedStatus === 'PENDING' && '⏳ Esta solicitud está pendiente de revisión'}
                      {selectedStatus === 'APPROVED' && '✅ Esta solicitud ya fue aprobada'}
                      {selectedStatus === 'REJECTED' && '❌ Esta solicitud ya fue rechazada'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#DCDDE1] pt-6">
                    <button
                      type="button"
                      disabled={!isSelectedPending || isUpdating}
                      onClick={() => updateRequestStatus('APPROVED')}
                      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Procesando...' : '✅ Aprobar Solicitud'}
                    </button>
                    <button
                      type="button"
                      disabled={!isSelectedPending || isUpdating}
                      onClick={() => updateRequestStatus('REJECTED')}
                      className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Procesando...' : '❌ Rechazar Solicitud'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center text-gray-500">
                  <div className="text-7xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold text-[#2D3436] mb-2">Selecciona una solicitud</h2>
                  <p>El detalle aparecerá en esta sección.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
