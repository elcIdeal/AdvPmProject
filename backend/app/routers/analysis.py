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
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate prompt for analysis
        prompt = f"""Analyze these transactions and provide insights in the following format:
        1. Unnecessary Spending:
           - Identify recurring subscriptions and flag those that haven't been used lately
           - Spot high-cost categories and suggest alternatives
        2. Recommendations:
           - Specific suggestions to cut costs
           - Budget adjustments
           - Alternative service providers
        3. Cash Flow Analysis:
           - Monthly income vs. spending
           - Trends and forecasts
        4. Anomalies:
           - Unusual spending patterns
           - Potential areas for savings
        
        Return the analysis as a JSON object with these sections.
        Transactions: {json.dumps(transactions)}"""
        
        # Get insights from Gemini
        response = model.generate_content(prompt)
        insights = json.loads(response.text)
        
        return InsightResponse(
            unnecessary_spending=insights.get('unnecessary_spending', []),
            recommendations=insights.get('recommendations', []),
            cash_flow_analysis=insights.get('cash_flow_analysis', {}),
            anomalies=insights.get('anomalies', []),
            message="Analysis completed successfully"
        )
    
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