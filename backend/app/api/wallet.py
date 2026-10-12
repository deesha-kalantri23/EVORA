"""
Wallet API endpoints for EVORA.
Provides persistent wallet balance management, top-ups, and transaction auditing in SQLite.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.database.database import get_wallet_data, record_wallet_transaction

router = APIRouter(prefix="/wallet", tags=["Wallet & Payments"])

class TopupRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR to add to wallet")
    method: str = Field("UPI", description="Payment method: UPI, RuPay, NetBanking")

class DebitRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR to deduct from wallet")
    description: str = Field(..., description="Reason/station for debit")
    booking_id: Optional[str] = Field(None, description="Associated booking ID")

@router.get("")
def get_user_wallet():
    """Retrieve current wallet balance and full transaction history."""
    data = get_wallet_data()
    return {
        "status": "success",
        "balance_inr": data["balance_inr"],
        "currency": "INR",
        "transactions_count": len(data["transactions"]),
        "transactions": data["transactions"],
        "data_label": "Dynamic SQLite Wallet Ledger"
    }

@router.post("/topup")
def topup_wallet(req: TopupRequest):
    """Add funds to EVORA wallet."""
    tx = record_wallet_transaction(
        amount=req.amount,
        transaction_type="credit",
        description=f"Wallet Top-up via {req.method} (Demo Payment Gateway)"
    )
    return {
        "status": "success",
        "message": f"Successfully recharged ₹{req.amount:,.2f}",
        "balance_inr": tx["new_balance_inr"],
        "transaction": tx
    }

@router.post("/debit")
def debit_wallet(req: DebitRequest):
    """Debit funds for charging slot reservation or session."""
    wallet = get_wallet_data()
    if wallet["balance_inr"] < req.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient wallet balance (Available: ₹{wallet['balance_inr']:,.2f}, Required: ₹{req.amount:,.2f})"
        )

    tx = record_wallet_transaction(
        amount=req.amount,
        transaction_type="debit",
        description=req.description,
        reference_id=req.booking_id
    )
    return {
        "status": "success",
        "message": f"Deducted ₹{req.amount:,.2f}",
        "balance_inr": tx["new_balance_inr"],
        "transaction": tx
    }
