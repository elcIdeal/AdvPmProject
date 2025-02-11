from fastapi import APIRouter, HTTPException, Request, Depends
import google.generativeai as genai
from ..config import Settings
from ..dependencies import get_current_user
import json

router = APIRouter()
settings = Settings()

# Set up the Gemini API key
genai.configure(api_key=settings.gemini_api_key)

async def get_transaction_info(user_id: str, request: Request):
    # Fetch the transactions of the user from MongoDB
    transactions = await request.app.mongodb['transactions'].find({"user_id": user_id}).to_list(length=100)
    categorized_spending = {}
    
    for transaction in transactions:
        category = transaction["category"]
        amount = transaction["amount"]
        
        if category not in categorized_spending:
            categorized_spending[category] = 0
        categorized_spending[category] += amount
        
    # Identify the most frequent spending categories
    top_spending_categories = sorted(categorized_spending.items(), key=lambda x: x[1], reverse=True)
    print(top_spending_categories)
    
    return top_spending_categories


async def suggest_credit_cards(
    request: Request,
    current_user = Depends(get_current_user)
):
    user_id = current_user['sub']

    # Get the user's transaction information
    top_spending_categories = await get_transaction_info(user_id, request)
    
    # Fetch the credit card data
    credit_cards = await request.app.mongodb['credit_cards'].find().to_list(length=100)

    transactions_data = await request.app.mongodb['transactions'].find({"user_id": user_id}).to_list(length=100)

    # Prepare the prompt for the LLM
    transactions = "\n".join([f"- Transaction {i+1}: Date: {transactions_data[i]['transaction_date']}, Category: {transactions_data[i]['category']}, Amount: {transactions_data[i]['amount']}, Type: {transactions_data[i]['type']}" for i in range(len(transactions_data))])
    
    credit_cards_info = "\n".join([f"Card Name: {card['name']}, Provider: {card['provider']}, Cashback Categories: {json.dumps(card['cashback'])}, Annual Fee: {card['annual_fee']}, APR: {card['APR']}, Benefits: {card['benefits']}"
                                 for card in credit_cards])

    prompt = f"""
    You are a financial assistant. I will provide you with two pieces of information:
    1. A list of transactions made by a user.
    2. A list of credit cards with their details.

    Your task is to analyze the user's transactions and suggest the best credit cards based on their spending habits. For each recommendation, provide a brief explanation of why that card was suggested and which spending category or behavior influenced the suggestion.

    ### Step 1: Analyze User Transactions
    The user has the following transactions. Please categorize their spending and calculate how much they have spent in each category. Also, determine which categories they spend the most in.
    {transactions}
    The user's top spending categories are:
    {top_spending_categories}


    ### Step 2: Match Transactions to Credit Card Features
    Here are the available credit cards with their details. Your task is to suggest the best credit cards based on the following:
    - Look at the cashback categories and APR of each card.
    - Match the user's spending with the credit cards that offer the best benefits for their top spending categories.
    - Recommend cards that maximize cashback in the categories the user spends most in (e.g., dining, groceries, gas, etc.).
    - If the user spends a lot in a category that isn’t well-covered by many cards (like "Others"), suggest cards that offer decent overall cashback or other valuable benefits like travel insurance, purchase protection, or low APR.
    {credit_cards_info}

    ### Step 3: Provide Recommendations
    For each top category in the user's spending, suggest the cards that would give them the most benefit. If the user spends heavily in a category, prioritize cards that offer high cashback for that category.

    For each suggested card, provide a brief explanation of why that card was recommended. Your reasoning should be based on the user's spending behavior and the features of the card, such as cashback rates, annual fees, APR, or additional benefits.

    Provide the recommendations in the following format:

    suggestions:
    1. card_name: {{name}}, provider: {{provider}}, cashback: {{cashback}}, annual_fee: {{annual_fee}}, apr: {{apr}}, benefits: {{benefits}}, reason: {{short_reasoning_for_this_recommendation}}

    Your reasoning should highlight the categories where the user spends most, such as:
    - If the user spends heavily on dining, recommend a card with high dining cashback.
    - If the user has diverse spending across categories, suggest cards with broad cashback or versatile benefits.
    - If the user has high spending in a category like "Others," explain why the recommended card offers a good fit for that spending behavior.

    IT IS IMPORTANT THAT YOU GIVE YOUR RESPONSE ONLY IN THIS FORMAT VALID - JSON {{suggestions:  suggestions: [card_name: {{card_name}}, provider: {{provider}}, cashback: {{cashback}}, annual_fee: {{annual_fee}}, apr: {{APR}}, benefits: {{benefits}}, reason: {{short_reasoning_for_this_recommendation}}]}} I REPEAT YOUR OUPUT IS ONLY THE JSON DEFINED BEFORE, NO OTHER NOTES OR COMMENTS.
    """


    # Call the Gemini LLM API
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    
    if response and response.text:
        print(response.text.strip())
        cleaned_response = response.text.replace("```json", "").replace("```", "").strip()
        print(cleaned_response)
        return json.loads(cleaned_response)
    else:
        raise HTTPException(status_code=500, detail="Error generating credit card suggestions.")

@router.get("/suggest-credit-cards")
async def suggest_credit_cards_endpoint(
    request: Request,
    current_user = Depends(get_current_user)
):
    return await suggest_credit_cards(request, current_user)
