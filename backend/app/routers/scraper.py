from fastapi import APIRouter, HTTPException, status, Request, Depends
import google.generativeai as genai
from ..config import Settings
from ..dependencies import get_current_user
import json

router = APIRouter()
settings = Settings()

# Set up the Gemini API key
genai.configure(api_key=settings.gemini_api_key)

async def extract_credit_card_info(
    url, 
    provider,
    request: Request,
    current_user
):
    prompt = f"""
    You are a financial assistant. I will provide a website link that contains information about credit cards.
    Your task is to extract structured information about each credit card available on the page.
    
    Please return the response in the following format:
    - Card Name: The official name of the credit card.
    - Provider: The financial institution offering the card (e.g., Chase, Discover).
    - Cashback Categories: A clear breakdown of cashback rewards (e.g., 5% on dining, 2% on groceries).
    - Annual Fee: Any annual fee charged for the card.
    - Intro APR & Regular APR: Any introductory APR offers and the regular APR rate.
    - Other Benefits: Additional perks like travel insurance, purchase protection, lounge access, etc.

    Here is the website: {url}
    
    Please return the data in JSON format:
    {{
        "cards": [
            {{
                "provider": "{{provider}}",
                "name": "Card Name",
                "cashback": {{"dining": "5%", "groceries": "3%", "others": "1%"}},
                "annual_fee": "$95",
                "APR": "0% intro APR for 12 months, then 15.99%-22.99% variable",
                "benefits": ["Travel Insurance", "Extended Warranty"]
            }}
        ]
    }}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    try:
        if response and response.text:
            card_data = response.text.strip()

            # ✅ Find and extract JSON portion from the response
            json_start = card_data.find("{")
            json_end = card_data.rfind("}") + 1  # Get the closing brace for the last JSON object
            json_content = card_data[json_start:json_end]

            try:
                card_data = json.loads(json_content)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail=f"Error parsing JSON: {str(e)}")
            
            # Update or Insert each card into MongoDB
            for card in card_data["cards"]:
                # Check if the card already exists in the database
                existing_card = await request.app.mongodb['credit_cards'].find_one({
                    "provider": card["provider"],
                    "name": card["name"]
                })
                # print(existing_card)

                if existing_card:
                    # Update the existing card with new information
                    await request.app.mongodb['credit_cards'].update_one(
                        {"_id": existing_card["_id"]},  # Match based on unique card ID
                        {"$set": card}  # Update the card fields
                    )
                    print(f"Updated {provider} card: {card['name']}.")
                else:
                    # Insert the new card if it does not exist
                    await request.app.mongodb['credit_cards'].insert_one(card)
                    print(f"Inserted {provider} card: {card['name']}.")

            # # Insert each card into MongoDB
            # for card in card_data["cards"]:
            #     await request.app.mongodb['credit_cards'].insert_one(card)

            # print(f"Inserted {provider} card details into MongoDB.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting card info: {str(e)}")

    return response.text


@router.get("/credit-cards-info")
async def get_credit_cards(
    request: Request,
    current_user = Depends(get_current_user)
):
    card_providers = {
        "Chase": "https://creditcards.chase.com/cash-back-credit-cards",
        "Discover": "https://www.discover.com/credit-cards/cash-back/",
        "American Express": "https://www.americanexpress.com/us/credit-cards/"
    }

    for provider, url in card_providers.items():
        print(f"Fetching credit card details for {provider}...")
        await extract_credit_card_info(url, provider, request, current_user)