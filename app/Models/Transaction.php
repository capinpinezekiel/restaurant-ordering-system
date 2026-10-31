<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model {
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount_paid',
        'received_by',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
    ];

    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }

    public function receivedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'received_by');
    }
}