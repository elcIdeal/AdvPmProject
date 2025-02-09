from fastapi import APIRouter, HTTPException, status, Request, Depends
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

class InsightResponse(BaseModel):
    unnecessary_spending: List[dict]
    recommendations: List[str]
    cash_flow_analysis: dict
    anomalies: List[dict]
    message: str

@router.get("/insights")
async def get_insights(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    try:
        # Fetch user's transactions
        query = {"user_id": current_user['sub']}
        if start_date or end_date:
            query['date'] = {}
            if start_date:
                query['date']['$gte'] = start_date
            if end_date:
                query['date']['$lte'] = end_date
        
        transactions = await request.app.mongodb['transactions'].find(query).to_list(None)
        
        if not transactions:
            return InsightResponse(
                unnecessary_spending=[],
                recommendations=[],
                cash_flow_analysis={},
                anomalies=[],
                message="No transactions found for analysis"
            )
        
        # Configure Gemini API
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # transaction_data = [transaction.dict() for transaction in transaction_request.transactions]
        print(transactions)

        # Generate prompt for analysis
        prompt = f"""
        You are a financial advisor analyzing a user's spending and financial behaviors. Review the following transactions and provide insights in the following format:
        1. Unnecessary Spending:
        - Identify recurring subscriptions or services that are rarely or never used.
        - Highlight high-cost categories where the user may be overspending.
        - Provide suggestions to reduce spending in these areas, such as alternative services or cost-cutting measures.

        2. Recommendations:
        - Provide specific recommendations to help the user save money, such as budget adjustments or more cost-effective alternatives.
        - Suggest lifestyle or subscription changes based on spending patterns.
        - Recommend financial products (like credit cards, loans) that fit the user's financial profile and spending habits.

        3. Cash Flow Analysis:
        - Analyze the user's monthly income vs. total spending and identify trends or forecasts for future months.
        - Evaluate their savings potential and suggest improvements to increase savings over time.
        - Provide insights into income sources (if available) and categorize them (e.g., salary, side business).

        4. Anomalies:
        - Detect any unusual or outlier spending patterns (e.g., large, one-time purchases or unusual increases in a specific category).
        - Suggest areas where the user might save based on anomalies in their spending behavior.

        Please return the analysis in the following JSON format. Make sure each field follows the exact structure:
        {{
            "unnecessary_spending": [
                {{
                    "description": "Description of the unnecessary spending",
                    "amount": "Amount spent",
                    "suggestion": "Suggestion to reduce this spending"
                }}
            ],
            "recommendations": ["Recommendation 1", "Recommendation 2"],
            "cash_flow_analysis": {{
                "monthly_income": "Total monthly income",
                "total_spent": "Total amount spent",
                "savings_potential": "Potential savings amount",
                "cash_flow_trends": ["Trend 1", "Trend 2"]
            }},
            "anomalies": [
                {{
                    "description": "Description of the anomaly",
                    "amount": "Amount involved",
                    "suggestion": "Suggestion to address this anomaly"
                }}
            ],
            "message": "Analysis summary"
        }}

        Transactions: {transactions}
        """
        
        # Get insights from Gemini
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Clean and parse the JSON response
        cleaned_response = text_response.replace("```json", "").replace("```", "").strip()
        insights = json.loads(cleaned_response)
        
        # Validate and ensure proper data structure
        validated_insights = {
            "unnecessary_spending": [
                item if isinstance(item, dict) else {"description": str(item), "amount": "N/A", "suggestion": "N/A"}
                for item in insights.get('unnecessary_spending', [])
            ],
            "recommendations": insights.get('recommendations', []),
            "cash_flow_analysis": insights.get('cash_flow_analysis', {
                "monthly_income": "0",
                "total_spent": "0",
                "savings_potential": "0",
                "cash_flow_trends": []
            }),
            "anomalies": [
                item if isinstance(item, dict) else {"description": str(item), "amount": "N/A", "suggestion": "N/A"}
                for item in insights.get('anomalies', [])
            ],
            "message": insights.get('message', 'Analysis completed successfully')
        }
        
        return InsightResponse(**validated_insights)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get("/summary")
async def get_summary(
    request: Request,
    current_user = Depends(get_current_user)
):
    try:
        # Get total spending by category
        pipeline = [
            {"$match": {"user_id": current_user['sub']}},
            {"$group": {
                "_id": "$category",
                "total": {"$sum": "$amount"},
                "count": {"$sum": 1}
            }}
        ]
        
        categories = await request.app.mongodb['transactions'].aggregate(pipeline).to_list(None)
        
        # Get monthly totals
        pipeline = [
            {"$match": {"user_id": current_user['sub']}},
            {"$group": {
                "_id": {"$substr": ["$date", 0, 7]},
                "total": {"$sum": "$amount"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        monthly = await request.app.mongodb['transactions'].aggregate(pipeline).to_list(None)
        
        return {
            "categories": categories,
            "monthly": monthly,
            "message": "Summary generated successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )