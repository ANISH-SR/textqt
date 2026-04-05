from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import json
import pandas as pd
import duckdb
import io
from dotenv import load_dotenv
import httpx
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = FastAPI(title="TextQt API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
hydra_db = None
duckdb_conn = None
openrouter_client = None

# Authentication configuration (for Clerk)
security = HTTPBearer()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default_user"
    tenant_id: Optional[str] = "default_tenant"

class ChatResponse(BaseModel):
    response: str
    sql: Optional[str] = None
    results: Optional[List[Dict]] = None
    chart_data: Optional[Dict] = None
    memory_applied: Optional[List[str]] = None

class MemoryResponse(BaseModel):
    memories: List[Dict[str, Any]]
    total_count: int

class UploadResponse(BaseModel):
    filename: str
    rows: int
    columns: List[str]
    sample_data: List[Dict]

# Authentication helper functions for Clerk
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk JWT token and extract user info"""
    try:
        token = credentials.credentials
        
        # For Clerk, we need to verify the token with Clerk's API
        # For now, we'll decode it to get the user ID (simplified approach)
        # In production, you should verify with Clerk's JWKS endpoint
        
        # Simple token parsing - in production use proper JWT verification
        import base64
        import json
        
        # Remove "Bearer " prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
            
        # Decode the JWT payload (simplified - for production use proper verification)
        parts = token.split('.')
        if len(parts) >= 2:
            payload = parts[1]
            # Add padding if needed
            payload += '=' * (4 - len(payload) % 4)
            try:
                decoded = base64.b64decode(payload)
                payload_data = json.loads(decoded)
                
                # Extract user info from Clerk token
                user_id = payload_data.get('sub') or payload_data.get('user_id')
                if not user_id:
                    raise HTTPException(status_code=401, detail="Invalid token")
                
                return {
                    "user_id": user_id,
                    "username": payload_data.get('username', user_id),
                    "email": payload_data.get('email', '')
                }
            except Exception:
                pass
        
        raise HTTPException(status_code=401, detail="Invalid token")
        
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Initialize services
async def initialize_services():
    global hydra_db, duckdb_conn, openrouter_client
    
    # Initialize HydraDB
    try:
        from hydra_db import AsyncHydraDB
        hydra_db = AsyncHydraDB(token=os.getenv("HYDRADB_API_KEY"))
        print("HydraDB initialized successfully")
    except Exception as e:
        print(f"Failed to initialize HydraDB: {e}")
    
    # Initialize DuckDB
    try:
        db_path = os.getenv("DATABASE_PATH", "./data.duckdb")
        duckdb_conn = duckdb.connect(db_path)
        print("DuckDB initialized successfully")
    except Exception as e:
        print(f"Failed to initialize DuckDB: {e}")
    
    # Initialize OpenRouter client
    try:
        openrouter_client = httpx.AsyncClient(
            base_url="https://openrouter.ai/api/v1",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            }
        )
        print("OpenRouter client initialized successfully")
    except Exception as e:
        print(f"Failed to initialize OpenRouter: {e}")

@app.on_event("startup")
async def startup_event():
    await initialize_services()

@app.get("/")
async def root():
    return {"message": "TextQL + Memory API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "hydradb": hydra_db is not None,
            "duckdb": duckdb_conn is not None,
            "openrouter": openrouter_client is not None
        }
    }

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload CSV or JSON file and store in DuckDB"""
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported")
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse based on file type
        if file.filename.endswith('.csv'):
            # Try different encodings for CSV
            encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(io.StringIO(content.decode(encoding)))
                    print(f"Successfully decoded CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                # If all encodings fail, try with error handling
                try:
                    df = pd.read_csv(io.StringIO(content.decode('utf-8', errors='ignore')))
                    print("Used UTF-8 with error handling")
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Could not decode CSV file: {str(e)}")
                    
        elif file.filename.endswith('.json'):
            # For JSON, try UTF-8 with fallback
            try:
                df = pd.read_json(io.StringIO(content.decode('utf-8')))
            except UnicodeDecodeError:
                df = pd.read_json(io.StringIO(content.decode('utf-8', errors='ignore')))
                print("Used UTF-8 with error handling for JSON")
        
        # Clean column names
        df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('[^a-zA-Z0-9_]', '', regex=True)
        
        # Generate unique table name
        table_name = f"table_{uuid.uuid4().hex[:8]}"
        
        # Store in DuckDB
        duckdb_conn.register(table_name, df)
        
        # Return sample data
        sample_data = df.head(5).to_dict('records')
        
        return UploadResponse(
            filename=file.filename,
            rows=len(df),
            columns=list(df.columns),
            sample_data=sample_data
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Main chat endpoint with HydraDB memory and SQL generation"""
    try:
        # Step 1: Recall relevant memories from HydraDB
        memory_context = ""
        memory_applied = []
        
        if hydra_db:
            try:
                # Recall user preferences and past queries
                recall_response = await hydra_db.recall.recall_preferences(
                    query=request.message,
                    tenant_id=current_user["user_id"],  # Use Clerk user ID as tenant
                    sub_tenant_id=current_user["user_id"],  # Use Clerk user ID as sub-tenant
                    alpha=0.8,
                    recency_bias=0.1
                )
                
                if recall_response and 'memories' in recall_response:
                    memories = recall_response['memories']
                    if memories:
                        memory_context = "\n".join([mem.get('text', '') for mem in memories[:3]])
                        memory_applied = [mem.get('text', '')[:50] + '...' for mem in memories[:3]]
            except Exception as e:
                print(f"HydraDB recall failed: {e}")
        
        # Step 2: Get database schema
        schema_info = get_database_schema()
        
        # Step 3: Generate SQL using LLM
        sql_query = await generate_sql(request.message, schema_info, memory_context)
        
        # Step 4: Execute SQL
        results = execute_sql(sql_query)
        
        # Step 5: Generate response
        response_text = await generate_response(request.message, results, memory_context)
        
        # Step 6: Store interaction in HydraDB
        if hydra_db:
            try:
                await hydra_db.userMemory.add({
                    "memories": [{
                        "user_assistant_pairs": [{
                            "user": request.message,
                            "assistant": response_text
                        }]
                    }]
                }, tenant_id=current_user["user_id"], sub_tenant_id=current_user["user_id"])
            except Exception as e:
                print(f"Failed to store in HydraDB: {e}")

        # Also store in our simple memory storage
        user_id = current_user["user_id"]
        if user_id not in user_memories:
            user_memories[user_id] = []

        user_memories[user_id].append({
            "memories": [{
                "user_assistant_pairs": [{
                    "user": request.message,
                    "assistant": response_text
                }]
            }]
        })

        
        return ChatResponse(
            response=response_text,
            sql=sql_query,
            results=results,
            chart_data=format_for_chart(results) if results else None,
            memory_applied=memory_applied
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

def get_database_schema():
    """Get database schema information"""
    try:
        # Get all table names
        tables = duckdb_conn.execute("SHOW TABLES").fetchall()
        schema = {}
        
        for table in tables:
            table_name = table[0]
            # Get column information
            columns = duckdb_conn.execute(f"DESCRIBE {table_name}").fetchall()
            schema[table_name] = [
                {"name": col[0], "type": col[1]} for col in columns
            ]
        
        return schema
    except Exception as e:
        print(f"Failed to get schema: {e}")
        return {}

async def generate_sql(question: str, schema: Dict, memory_context: str = ""):
    """Generate SQL using OpenRouter LLM"""
    try:
        schema_text = json.dumps(schema, indent=2)
        
        prompt = f"""
You are a SQL expert. Generate a DuckDB SQL query to answer this question: "{question}"

Database Schema:
{schema_text}

User Context and Preferences:
{memory_context}

Important:
- Use DuckDB syntax
- Return only the SQL query, no explanations
- Use appropriate aggregations and filters
- If date filtering is needed and user prefers specific periods, apply them
- If user has preferred column names or formulas mentioned in context, use them

SQL Query:
"""
        
        response = await openrouter_client.post(
            "/chat/completions",
            json={
                "model": "microsoft/wizardlm-2-8x22b",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 1000
            }
        )
        
        if response.status_code == 200:
            sql = response.json()["choices"][0]["message"]["content"].strip()
            # Clean up the response - remove any markdown formatting
            sql = sql.replace("```sql", "").replace("```", "").strip()
            return sql
        else:
            raise Exception(f"LLM API error: {response.status_code}")
            
    except Exception as e:
        print(f"SQL generation failed: {e}")
        raise

def execute_sql(sql_query: str):
    """Execute SQL query and return results"""
    try:
        result = duckdb_conn.execute(sql_query).fetchall()
        
        # Get column names
        columns = [desc[0] for desc in duckdb_conn.description]
        
        # Convert to list of dictionaries
        rows = []
        for row in result:
            rows.append(dict(zip(columns, row)))
        
        return rows
    except Exception as e:
        print(f"SQL execution failed: {e}")
        raise

async def generate_response(question: str, results: List[Dict], memory_context: str = ""):
    """Generate natural language response from results"""
    try:
        results_text = json.dumps(results[:10], indent=2)  # Limit to first 10 results
        
        prompt = f"""
Based on the user's question and the query results, provide a helpful response:

Question: "{question}"

Results:
{results_text}

Context about user preferences:
{memory_context}

Provide a concise, helpful response. If the results show data insights, mention them. If there are errors, suggest fixes.
"""
        
        response = await openrouter_client.post(
            "/chat/completions",
            json={
                "model": "microsoft/wizardlm-2-8x22b",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 1000
            }
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        else:
            return f"Found {len(results)} results for your query."
            
    except Exception as e:
        print(f"Response generation failed: {e}")
        return f"Found {len(results)} results for your query."

def format_for_chart(results: List[Dict]):
    """Format results for chart visualization"""
    if not results:
        return None
    
    # Simple chart formatting - assumes first column is labels, second is values
    if len(results) > 0 and len(results[0]) >= 2:
        keys = list(results[0].keys())
        labels = [str(row[keys[0]]) for row in results]
        values = [float(row[keys[1]]) if isinstance(row[keys[1]], (int, float)) else 0 for row in results]
        
        return {
            "type": "bar",
            "data": {
                "labels": labels,
                "datasets": [{
                    "label": keys[1],
                    "data": values
                }]
            }
        }
    
    return None

# Simple in-memory storage for demonstration (in production, use proper database)
user_memories = {}  # {user_id: [memories]}

@app.get("/memory", response_model=MemoryResponse)
async def get_memory(current_user: dict = Depends(get_current_user)):
    """Get stored memories for a user"""
    try:
        user_id = current_user["user_id"]
        
        # Get memories from our simple storage
        memories = user_memories.get(user_id, [])
        
        # Also try HydraDB recall as backup
        if not memories and hydra_db:
            try:
                recall_response = await hydra_db.recall.recall_preferences(
                    query="recent conversations",
                    tenant_id=user_id,
                    sub_tenant_id=user_id
                )
                
                if recall_response and 'memories' in recall_response:
                    memories = recall_response['memories']
            except Exception as recall_error:
                print(f"Recall method failed: {recall_error}")
        
        return MemoryResponse(
            memories=memories,
            total_count=len(memories)
        )
        
    except Exception as e:
        print(f"Error retrieving memories: {e}")
        return MemoryResponse(
            memories=[],
            total_count=0
        )

@app.get("/tables")
async def get_tables(current_user: dict = Depends(get_current_user)):
    """Get all available tables and their schemas"""
    try:
        schema = get_database_schema()
        return {"tables": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tables: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
