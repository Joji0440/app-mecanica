<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Frontend de desarrollo en puerto 3000 (principal)
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://192.168.0.105:3000',
        'http://192.168.0.100:3000',
        
        // Puerto 8001 para conexiones locales
        'http://127.0.0.1:8001',
        'http://localhost:8001',
        'http://192.168.0.105:8001',
        'http://192.168.0.100:8001',
        
        // Otros puertos comunes para frontend
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://192.168.0.105:5173',
        'http://192.168.0.100:5173',
        'http://127.0.0.1:4173',
        'http://localhost:4173',
        'http://192.168.0.105:4173',
        'http://192.168.0.100:4173',
        
        // Sin puerto específico
        'http://127.0.0.1',
        'http://localhost',
        'http://192.168.0.105',
        'http://192.168.0.100',
        
        // Para debugging, permitir HTTPS también (temporal)
        'https://192.168.0.105:3000',
        'https://192.168.0.105',
        'https://localhost:3000',
        'https://127.0.0.1:3000',
        
        // Permitir temporalmente todos los orígenes para debugging
        '*',
    ],

    'allowed_origins_patterns' => [
        // Patrones para IPs locales dinámicas
        '/^https?:\/\/(192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|10\.)/i'
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
