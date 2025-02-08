from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import Settings
from ..dependencies import get_current_user
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import google.generativeai as genai
import json

router = APIRouter()
settings = Settings()

class Transaction(BaseModel):
    name: str
    category: str
    date: str
    amount: float
    type: str

class TransactionResponse(BaseModel):
    transactions: List[Transaction]
    message: str

@router.post("/upload")
async def upload_statement(
    request: Request,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    try:
        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('gemini-pro-vision')
        
        # Read and process PDF file
        contents = await file.read()
        
        # Convert PDF to text using OCR (implementation needed)
        # This is a placeholder for PDF processing logic
        statement_text = "Processed statement text"
        
        # Generate prompt for Gemini
        prompt = f"""Analyze this bank statement and extract all transactions.
        For each transaction, provide:
        - name: Transaction name/description
        - category: Category (e.g., Food, Transport, Utilities)
        - date: Date in YYYY-MM-DD format
        - amount: Transaction amount
        - type: 'Debit' or 'Credit'
        
        Return the data as a JSON array.
        Statement text: {statement_text}"""
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        transactions_data = json.loads(response.text)
        
        # Store transactions in MongoDB
        transactions_to_insert = []
        for transaction in transactions_data:
            transaction['user_id'] = current_user['sub']
            transaction['created_at'] = datetime.utcnow()
            transactions_to_insert.append(transaction)
        
        await request.app.mongodb['transactions'].insert_many(transactions_to_insert)
        
        return TransactionResponse(
            transactions=transactions_data,
            message="Statement processed successfully"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/list")
async def get_transactions(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    try:
        query = {"user_id": current_user['sub']}
        
        if start_date or end_date:
            query['date'] = {}
            if start_date:
                query['date']['$gte'] = start_date
            if end_date:
                query['date']['$lte'] = end_date
        
        transactions = await request.app.mongodb['transactions'].find(query).to_list(None)
        
        return TransactionResponse(
            transactions=transactions,
            message="Transactions retrieved successfully"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )