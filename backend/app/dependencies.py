from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from .config import Settings

settings = Settings()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        jwks_url = f"https://{settings.auth0_domain}/.well-known/jwks.json"
        
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        
        # Implement JWKS client to fetch and validate Auth0 public keys
        # This is a simplified version - in production, you should use a proper JWKS client
        
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=settings.auth0_api_audience,
                issuer=f"https://{settings.auth0_domain}/"
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )