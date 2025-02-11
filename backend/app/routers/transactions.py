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
import hashlib
from bson import ObjectId


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

class Challenge(BaseModel):
    name: str
    target_amount: float
    category: str
    start_date: str
    end_date: str
    status: str


@router.post("/upload")
async def upload_statement(
    request: Request,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    try:
        # Get active challenges for the user
        active_challenges = await request.app.mongodb['challenges'].find({
            'user_id': current_user['sub'],
            'status': 'Active'
        }).to_list(None)

        prev_transactions_data = await request.app.mongodb['transactions'].find({
            'user_id': current_user['sub'],
        }).to_list(None)

        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Read and parse CSV file
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))
        
        # Convert CSV data to formatted text for Gemini
        transactions_list = []
        for _, row in df.iterrows():
            transaction_str = f"Date: {row['Trans. Date']}, Description: {row['Description']}, Amount: {row['Amount']-30}"
            transactions_list.append(transaction_str)
        
        statement_text = "\n".join(transactions_list)

        # Prepare challenges text for Gemini
        challenges_text = ""
        if active_challenges:
            challenges_text = "\n\nActive Challenges:\n"
            for challenge in active_challenges:
                challenges_text += f"-Challenge ID:{str(challenge['_id'])} with Challenge Name: {challenge['name']}: Save {challenge['target_amount']} in {challenge['category']} category\n"

        # Prepare previous transactions text for Gemini
        prev_transactions_text= ""
        if active_challenges and len(active_challenges) != 0:
            prev_transactions_text = "\n\nPrevious Transactions:\n"
            for transaction in prev_transactions_data:
                print(transaction)
                prev_transactions_text += f"-Transaction ID:{str(transaction['_id'])} with Transaction Category: {transaction['category']} and Transaction Amount: {transaction['amount']}\n"
        
        print(prev_transactions_text)

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

        prompt2 = f"""Analyze the following bank statement transactions from the statement text and extract relevant financial details. 
        Give me three easy challenges so that the user can save money in the next month (Target should not be too high keep it less than 50$), return the following fields in JSON format:

        1.⁠Challenge Name: Give me a name for the challenge.
        2.⁠Challenge Target Amount: Give me a target amount for the challenge.
        3.⁠Challenge Category: Give me a category for the challenge.
        4.⁠Challenge Start Date: Give me a start date for the challenge.
        5.⁠Challenge End Date: Give me an end date for the challenge.
        6.⁠Challenge Status: Active(always)


        Return the output as a JSON array where each object follows this structure:

        [
            {{
                "name": "Challenge Name",
                "target_amount": XX.XX,
                "category": "Category Name",
                "start_date": "YYYY-MM-DD",
                "end_date": "YYYY-MM-DD",
                "status": "Active"
            }}
        ]
        Statement text: {statement_text}"""

        
        prompt3 = f"""Analyze the following bank statement transactions from the statement text and provide details about the challenges 
        provided to the user last month. 

        For each challenge, return the following fields in JSON format:

        1.⁠ ⁠Challenge ID: The unique identifier of the challenge.
        2.⁠ ⁠Name: The name of the challenge.
        3.⁠ ⁠Target Amount: The target amount the user set for the challenge.
        4.⁠ ⁠Category: The category of the challenge.
        7.⁠ ⁠Status: The status of the challenge (Failed or Completed).

        These are the active challenges of the user, if any:
        {challenges_text}

        If there are active challenges, analyze each transaction to see if it contributes to any of the challenges based on the category and date range. Add a 'challenges' field to each transaction that lists the challenge IDs it contributes to.

        Return the output as a JSON array where each object follows this structure:

        [
            {{
                "id": "Challenge ID",
                "name": "Challenge Name",
                "target_amount": XX.XX,
                "category": "Category Name",
                "status": "Challenge Status"
            }}
        ]

        This the bank statement of the user
        Statement text:{statement_text}

        This is the output of the previous trnascations from the user. Use this to compare it with the latest statement and decide whether he completed the challenge or not.
        Output: {prev_transactions_text}
        
        Note: Dont not give anyother information apart from JSON because this is being parsed directly
        """
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        text_response = response.text
        transactions_data = json.loads(text_response.replace("```json", "").replace("```", "").strip())

        if(active_challenges and len(active_challenges) != 0):
            response_ch = model.generate_content(prompt3)
            text_response_ch = response_ch.text
            challenges_data = json.loads(text_response_ch.replace("```json", "").replace("```", "").strip())
            # Update challenges status based on transactions
            for challenge in challenges_data:
                challenge_id = challenge['id']
                #Update the status in db
                await request.app.mongodb['challenges'].update_one(
                    {'_id': ObjectId(challenge_id)},
                    {'$set': {'status': challenge['status']}}
                )

        response2 = model.generate_content(prompt2)
        text_response2 = response2.text
        new_challenges_data = json.loads(text_response2.replace("```json", "").replace("```", "").strip())
        # Insert new challenges into the database
        for new_challenge in new_challenges_data:
            new_challenge['user_id'] = current_user['sub']
            new_challenge['created_at'] = datetime.utcnow()
            await request.app.mongodb['challenges'].insert_one(new_challenge)

        # Generate hash and prepare transactions for insertion
        transactions_to_insert = []
        for transaction in transactions_data:
            # Generate hash based on transaction details
            hash_input = f"{transaction['transaction_date']}{transaction['amount']}{transaction['type']}"
            transaction_hash = hashlib.md5(hash_input.encode()).hexdigest()
            
            # Add hash and user_id to transaction
            transaction['hash'] = transaction_hash
            transaction['user_id'] = current_user['sub']
            transaction['created_at'] = datetime.utcnow()
            transactions_to_insert.append(transaction)
        
        # Check for duplicates
        unique_transactions = []
        for transaction in transactions_to_insert:
            existing_transaction = await request.app.mongodb['transactions'].find_one({
                'hash': transaction['hash'],
                'user_id': current_user['sub']
            })
            
            if not existing_transaction:
                unique_transactions.append(transaction)
        
        if not unique_transactions:
            return TransactionResponse(
                transactions=[],
                message="All transactions are duplicates"
            )
        
        try:
            if unique_transactions:
                await request.app.mongodb['transactions'].insert_many(unique_transactions)
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store transactions in database"
            )
        
        return TransactionResponse(
            transactions=unique_transactions,
            message=f"Successfully processed {len(unique_transactions)} new transactions. {len(transactions_to_insert) - len(unique_transactions)} duplicates were skipped."
        )
    
    except Exception as e:
        print(f"Exception: {str(e)}")
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

@router.get("/fetchchlngs")
async def fetch_challenges(
    request: Request,
    current_user = Depends(get_current_user)
):
    try:
        challenges = await request.app.mongodb['challenges'].find({
            'user_id': current_user['sub'],
        }).to_list(None)
        
        # Convert ObjectId to string for JSON serialization
        serialized_challenges = []
        for challenge in challenges:
            challenge['_id'] = str(challenge['_id'])
            serialized_challenges.append(challenge)
            
        return {
            'challenges': serialized_challenges,
            'message': 'Challenges retrieved successfully'
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )