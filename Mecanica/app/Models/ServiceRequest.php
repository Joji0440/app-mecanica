<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'mechanic_id',
        'vehicle_id',
        'preferred_mechanic_id',
        'title',
        'description',
        'service_type',
        'urgency_level',
        'estimated_duration_hours',
        'budget_max',
        'is_emergency',
        'preferred_date',
        'location_address',
        'location_notes',
        'status',
        'final_cost'
    ];

    protected $casts = [
        'is_emergency' => 'boolean',
        'estimated_duration_hours' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'final_cost' => 'decimal:2',
        'preferred_date' => 'date'
    ];

    // Estados permitidos
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REJECTED = 'rejected';

    // Niveles de urgencia
    public const URGENCY_LOW = 'baja';
    public const URGENCY_MEDIUM = 'media';
    public const URGENCY_HIGH = 'alta';
    public const URGENCY_CRITICAL = 'critica';

    /**
     * Relación con el cliente
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Relación con el mecánico asignado
     */
    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    /**
     * Relación con el vehículo
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relación con el mecánico preferido
     */
    public function preferredMechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'preferred_mechanic_id');
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por urgencia
     */
    public function scopeByUrgency($query, $urgency)
    {
        return $query->where('urgency_level', $urgency);
    }

    /**
     * Scope para solicitudes pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope para solicitudes de emergencia
     */
    public function scopeEmergency($query)
    {
        return $query->where('is_emergency', true);
    }

    /**
     * Verificar si la solicitud puede ser editada
     */
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verificar si la solicitud puede ser cancelada
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_ACCEPTED]);
    }

    /**
     * Obtener el color del estado para la UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_ACCEPTED => 'blue',
            self::STATUS_IN_PROGRESS => 'indigo',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELLED => 'red',
            self::STATUS_REJECTED => 'gray',
            default => 'gray'
        };
    }

    /**
     * Obtener el label del estado en español
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pendiente',
            self::STATUS_ACCEPTED => 'Aceptado',
            self::STATUS_IN_PROGRESS => 'En Progreso',
            self::STATUS_COMPLETED => 'Completado',
            self::STATUS_CANCELLED => 'Cancelado',
            self::STATUS_REJECTED => 'Rechazado',
            default => 'Desconocido'
        };
    }

    /**
     * Obtener el label de urgencia en español
     */
    public function getUrgencyLabelAttribute(): string
    {
        return match($this->urgency_level) {
            self::URGENCY_LOW => 'Baja',
            self::URGENCY_MEDIUM => 'Media',
            self::URGENCY_HIGH => 'Alta',
            self::URGENCY_CRITICAL => 'Crítica',
            default => 'Normal'
        };
    }
}
