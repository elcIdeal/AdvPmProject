from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import Settings
from ..dependencies import get_current_user
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import google.generativeai as genai
import json
import csv
from io import StringIO
import pandas as pd

router = APIRouter()
settings = Settings()

class Transaction(BaseModel):
    transaction_date: str
    category: str
    amount: float
    type: str

class TransactionResponse(BaseModel):
    transactions: List[Transaction]
    message: str


@router.post("/upload")
async def upload_statement(
    request: Request,
    file: UploadFile = File(...),
    # current_user = Depends(get_current_user)
):
    try:
        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Read and parse CSV file
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))
        # print(df.head())
        
        # Convert CSV data to formatted text for Gemini
        transactions_list = []
        for _, row in df.iterrows():
            transaction_str = f"Date: {row['Trans. Date']}, Description: {row['Description']}, Amount: {row['Amount']}"
            transactions_list.append(transaction_str)
        
        statement_text = "\n".join(transactions_list)

        # Generate prompt for Gemini
        prompt = f"""Analyze the following bank statement transactions from the statement text and extract relevant financial details. 
        For each transaction, return the following fields in JSON format:

        1.⁠ ⁠Transaction Date: Extract the date when the transaction was made.
        2.⁠ ⁠Category: Determine the category of the transaction based on its description. 
        Use the following categories:
        - Groceries (e.g., FOOD LION, COSTCO, WALMART)
        - Dining (e.g., Restaurants, Cafes, Fast Food, Starbucks)
        - Shopping (e.g., Amazon, Online stores, Retail purchases)
        - Health & Wellness (e.g., Pharmacies, Herbal stores, Clinics)
        - Entertainment (e.g., Movies, Games, Subscriptions)
        - Travel & Transport (e.g., Uber, Gas stations, Airlines)
        - Bills & Utilities (e.g., Electricity, Internet, Water bills)
        - Income (e.g., Salary, Cashback, Statement Credit)
        - Others (If the description does not fit any category)

        3.⁠ ⁠Amount: The exact transaction amount.
        4.⁠ ⁠Type: Determine if the transaction is a Credit (positive amount) or Debit (negative amount).

        Return the output as a JSON array where each object follows this structure:

        [
            {{
                "transaction_date": "YYYY-MM-DD",
                "category": "Category Name",
                "amount": XX.XX,
                "type": "Credit/Debit"
            }}
        ]
        Statement text: {statement_text}"""
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        text_response = response.text
        # print(text_response)
        transactions_data = json.loads(text_response.replace("```json", "").replace("```", "").strip())
        # print(transactions_data)

        # Store transactions in MongoDB
        # transactions_to_insert = []
        # for transaction in transactions_data:
        #     transaction['user_id'] = current_user['sub']
        #     transaction['created_at'] = datetime.utcnow()
        #     transactions_to_insert.append(transaction)
        
        # await request.app.mongodb['transactions'].insert_many(transactions_to_insert)
        
        return TransactionResponse(
            transactions=transactions_data,
            message="Statement processed successfully"
        )
    
    except Exception as e:
        print(f"Exception : {str(e)}")
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