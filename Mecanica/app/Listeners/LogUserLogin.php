<?php
namespace App\Listeners;

use App\Events\UserLoggedIn;
use Illuminate\Support\Facades\Log;

class LogUserLogin
{
    /**
     * Handle the event.
     */
    public function handle(UserLoggedIn $event)
    {
        Log::info('User logged in: ' . $event->user->email);
    }
}
