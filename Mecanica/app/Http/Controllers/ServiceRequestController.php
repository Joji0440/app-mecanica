<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ServiceRequestController extends Controller
{
    /**
     * Display a listing of the service requests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = ServiceRequest::with(['client', 'mechanic', 'vehicle']);

            // Filtrar por rol del usuario
            if ($user->hasRole('cliente')) {
                $query->where('client_id', $user->id);
            } elseif ($user->hasRole('mecanico')) {
                $query->where('mechanic_id', $user->id);
            } elseif (!$user->hasRole('administrador')) {
                return response()->json([
                    'message' => 'No tienes permisos para ver estas solicitudes'
                ], 403);
            }

            // Aplicar filtros
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $serviceRequests = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'message' => 'Solicitudes de servicio obtenidas exitosamente',
                'data' => $serviceRequests
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener solicitudes de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created service request.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Solo clientes pueden crear solicitudes
            if (!$user->hasRole('cliente')) {
                return response()->json([
                    'message' => 'Solo los clientes pueden crear solicitudes de servicio'
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'service_type' => 'required|string',
                'urgency_level' => 'required|in:baja,media,alta,critica',
                'estimated_duration_hours' => 'required|numeric|min:0.5|max:48',
                'budget_max' => 'required|numeric|min:0',
                'is_emergency' => 'boolean',
                'preferred_date' => 'nullable|date|after:today',
                'location_address' => 'nullable|string|max:500',
                'location_notes' => 'nullable|string|max:1000',
                'vehicle_id' => 'nullable|exists:vehicles,id',
                'preferred_mechanic_id' => 'nullable|exists:users,id'
            ]);

            $validated['client_id'] = $user->id;
            $validated['status'] = 'pending';

            $serviceRequest = ServiceRequest::create($validated);
            $serviceRequest->load(['client', 'vehicle']);

            return response()->json([
                'message' => 'Solicitud de servicio creada exitosamente',
                'data' => $serviceRequest
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Datos de validación inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear solicitud de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified service request.
     */
    public function show(ServiceRequest $serviceRequest): JsonResponse
    {
        try {
            $user = Auth::user();

            // Verificar permisos
            if (!$user->hasRole('administrador') && 
                $serviceRequest->client_id !== $user->id && 
                $serviceRequest->mechanic_id !== $user->id) {
                return response()->json([
                    'message' => 'No tienes permisos para ver esta solicitud'
                ], 403);
            }

            $serviceRequest->load(['client', 'mechanic', 'vehicle']);

            return response()->json([
                'message' => 'Solicitud de servicio obtenida exitosamente',
                'data' => $serviceRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener solicitud de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified service request.
     */
    public function update(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        try {
            $user = Auth::user();

            // Solo el cliente propietario puede actualizar (y solo si está pendiente)
            if ($serviceRequest->client_id !== $user->id) {
                return response()->json([
                    'message' => 'No tienes permisos para actualizar esta solicitud'
                ], 403);
            }

            if ($serviceRequest->status !== 'pending') {
                return response()->json([
                    'message' => 'Solo se pueden actualizar solicitudes pendientes'
                ], 422);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'service_type' => 'sometimes|string',
                'urgency_level' => 'sometimes|in:baja,media,alta,critica',
                'estimated_duration_hours' => 'sometimes|numeric|min:0.5|max:48',
                'budget_max' => 'sometimes|numeric|min:0',
                'is_emergency' => 'sometimes|boolean',
                'preferred_date' => 'nullable|date|after:today',
                'location_address' => 'nullable|string|max:500',
                'location_notes' => 'nullable|string|max:1000',
                'vehicle_id' => 'nullable|exists:vehicles,id',
                'preferred_mechanic_id' => 'nullable|exists:users,id'
            ]);

            $serviceRequest->update($validated);
            $serviceRequest->load(['client', 'mechanic', 'vehicle']);

            return response()->json([
                'message' => 'Solicitud de servicio actualizada exitosamente',
                'data' => $serviceRequest
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Datos de validación inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar solicitud de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified service request.
     */
    public function destroy(ServiceRequest $serviceRequest): JsonResponse
    {
        try {
            $user = Auth::user();

            // Solo el cliente propietario puede eliminar (y solo si está pendiente)
            if ($serviceRequest->client_id !== $user->id) {
                return response()->json([
                    'message' => 'No tienes permisos para eliminar esta solicitud'
                ], 403);
            }

            if (!in_array($serviceRequest->status, ['pending', 'cancelled'])) {
                return response()->json([
                    'message' => 'Solo se pueden eliminar solicitudes pendientes o canceladas'
                ], 422);
            }

            $serviceRequest->delete();

            return response()->json([
                'message' => 'Solicitud de servicio eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar solicitud de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a service request.
     */
    public function updateStatus(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'status' => 'required|in:pending,accepted,in_progress,completed,cancelled,rejected'
            ]);

            $newStatus = $validated['status'];

            // Verificar permisos según el estado
            switch ($newStatus) {
                case 'cancelled':
                    // Solo el cliente puede cancelar
                    if ($serviceRequest->client_id !== $user->id) {
                        return response()->json([
                            'message' => 'Solo el cliente puede cancelar la solicitud'
                        ], 403);
                    }
                    break;

                case 'accepted':
                case 'rejected':
                case 'in_progress':
                case 'completed':
                    // Solo el mecánico asignado puede cambiar estos estados
                    if (!$user->hasRole('mecanico') || $serviceRequest->mechanic_id !== $user->id) {
                        return response()->json([
                            'message' => 'Solo el mecánico asignado puede cambiar este estado'
                        ], 403);
                    }
                    break;

                default:
                    return response()->json([
                        'message' => 'Estado no válido'
                    ], 422);
            }

            $serviceRequest->update(['status' => $newStatus]);
            $serviceRequest->load(['client', 'mechanic', 'vehicle']);

            return response()->json([
                'message' => 'Estado de solicitud actualizado exitosamente',
                'data' => $serviceRequest
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Datos de validación inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar estado de solicitud',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener solicitudes disponibles para mecánicos
     */
    public function getAvailableRequests(Request $request)
    {
        try {
            // Obtener solicitudes pendientes sin mecánico asignado
            $availableRequests = ServiceRequest::where('status', 'pending')
                ->whereNull('mechanic_id')
                ->with(['client', 'vehicle'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'message' => 'Solicitudes disponibles obtenidas exitosamente',
                'data' => $availableRequests
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener solicitudes disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aceptar una solicitud de servicio
     */
    public function acceptRequest(Request $request, ServiceRequest $serviceRequest)
    {
        try {
            $user = $request->user();

            // Verificar que la solicitud esté disponible
            if ($serviceRequest->status !== 'pending' || $serviceRequest->mechanic_id) {
                return response()->json([
                    'message' => 'Esta solicitud ya no está disponible'
                ], 409);
            }

            // Asignar el mecánico y cambiar el estado
            $serviceRequest->update([
                'mechanic_id' => $user->id,
                'status' => 'accepted'
            ]);

            $serviceRequest->load(['client', 'mechanic', 'vehicle']);

            return response()->json([
                'message' => 'Solicitud aceptada exitosamente',
                'data' => $serviceRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al aceptar solicitud',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechazar una solicitud de servicio
     */
    public function rejectRequest(Request $request, ServiceRequest $serviceRequest)
    {
        try {
            $user = $request->user();

            // Verificar que la solicitud esté disponible
            if ($serviceRequest->status !== 'pending') {
                return response()->json([
                    'message' => 'Esta solicitud ya no está disponible para rechazar'
                ], 409);
            }

            // Cambiar el estado a rechazado
            $serviceRequest->update([
                'status' => 'rejected'
            ]);

            $serviceRequest->load(['client', 'vehicle']);

            return response()->json([
                'message' => 'Solicitud rechazada exitosamente',
                'data' => $serviceRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al rechazar solicitud',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
