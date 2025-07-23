<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MechanicProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specializations',
        'experience_years',
        'hourly_rate',
        'travel_radius',
        'availability_schedule',
        'emergency_available',
        'is_verified',
        'rating_average',
        'total_jobs',
        'total_reviews',
        'bio',
        'certifications',
        'tools_owned',
        'minimum_service_fee',
        'accepts_weekend_jobs',
        'accepts_night_jobs',
    ];

    protected $casts = [
        'specializations' => 'array',
        'availability_schedule' => 'array',
        'certifications' => 'array',
        'tools_owned' => 'array',
        'emergency_available' => 'boolean',
        'is_verified' => 'boolean',
        'accepts_weekend_jobs' => 'boolean',
        'accepts_night_jobs' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'minimum_service_fee' => 'decimal:2',
        'rating_average' => 'decimal:2',
        'experience_years' => 'integer',
        'travel_radius' => 'integer',
        'total_jobs' => 'integer',
        'total_reviews' => 'integer',
    ];

    // ==========================================
    // RELACIONES
    // ==========================================

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    /**
     * Especialidades disponibles en el sistema
     */
    public static function getAvailableSpecializations(): array
    {
        return [
            'motor' => 'Motor y Sistema de Combustible',
            'transmision' => 'Transmisión y Embrague',
            'frenos' => 'Sistema de Frenos',
            'suspension' => 'Suspensión y Dirección',
            'electrico' => 'Sistema Eléctrico',
            'aire_acondicionado' => 'Aire Acondicionado',
            'escape' => 'Sistema de Escape',
            'refrigeracion' => 'Sistema de Refrigeración',
            'neumaticos' => 'Neumáticos y Llantas',
            'diagnostico' => 'Diagnóstico Computarizado',
            'carroceria' => 'Carrocería y Pintura',
            'emergencias' => 'Servicios de Emergencia',
        ];
    }

    /**
     * Herramientas disponibles en el sistema
     */
    public static function getAvailableTools(): array
    {
        return [
            'basicas' => 'Herramientas Básicas',
            'scanner' => 'Scanner de Diagnóstico',
            'elevador' => 'Gato Hidráulico/Elevador',
            'soldadora' => 'Equipo de Soldadura',
            'compresor' => 'Compresor de Aire',
            'multimetro' => 'Multímetro',
            'torquimetro' => 'Torquímetro',
            'grua' => 'Grúa Portátil',
            'neumatica' => 'Herramientas Neumáticas',
            'especializadas' => 'Herramientas Especializadas',
        ];
    }

    /**
     * Obtener especialidades formateadas
     */
    public function getFormattedSpecializationsAttribute(): string
    {
        if (!$this->specializations) {
            return 'Sin especialidades definidas';
        }

        $available = self::getAvailableSpecializations();
        $formatted = [];

        foreach ($this->specializations as $spec) {
            $formatted[] = $available[$spec] ?? $spec;
        }

        return implode(', ', $formatted);
    }

    /**
     * Verificar si tiene una especialización específica
     */
    public function hasSpecialization(string $specialization): bool
    {
        return in_array($specialization, $this->specializations ?? []);
    }

    /**
     * Verificar si está disponible en horario específico
     */
    public function isAvailableAt(string $day, string $time): bool
    {
        if (!$this->availability_schedule) {
            return false;
        }

        $schedule = $this->availability_schedule;
        
        if (!isset($schedule[$day])) {
            return false;
        }

        $daySchedule = $schedule[$day];
        
        if (!$daySchedule['available']) {
            return false;
        }

        return $time >= $daySchedule['start'] && $time <= $daySchedule['end'];
    }

    /**
     * Calcular la tarifa estimada para un servicio
     */
    public function calculateEstimatedRate(int $estimatedHours = 1): float
    {
        $baseRate = $this->hourly_rate ?? 0;
        $minimumFee = $this->minimum_service_fee ?? 0;
        
        $totalRate = $baseRate * $estimatedHours;
        
        return max($totalRate, $minimumFee);
    }

    /**
     * Actualizar calificación promedio
     */
    public function updateRating(float $newRating): void
    {
        $totalReviews = $this->total_reviews;
        $currentAverage = $this->rating_average;
        
        $newTotal = $totalReviews + 1;
        $newAverage = (($currentAverage * $totalReviews) + $newRating) / $newTotal;
        
        $this->update([
            'rating_average' => round($newAverage, 2),
            'total_reviews' => $newTotal,
        ]);
    }

    /**
     * Incrementar contador de trabajos completados
     */
    public function incrementJobsCompleted(): void
    {
        $this->increment('total_jobs');
    }

    /**
     * Scope para mecánicos verificados
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope para mecánicos disponibles para emergencias
     */
    public function scopeEmergencyAvailable($query)
    {
        return $query->where('emergency_available', true);
    }

    /**
     * Scope para mecánicos con especialización específica
     */
    public function scopeWithSpecialization($query, string $specialization)
    {
        return $query->whereJsonContains('specializations', $specialization);
    }

    /**
     * Scope para mecánicos en un radio específico (requiere lat/lng del usuario)
     */
    public function scopeWithinRadius($query, float $latitude, float $longitude, int $radiusKm = 10)
    {
        return $query->whereHas('user', function ($userQuery) use ($latitude, $longitude, $radiusKm) {
            $userQuery->whereRaw(
                "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?",
                [$latitude, $longitude, $latitude, $radiusKm]
            );
        });
    }
}
