from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from tempfile import NamedTemporaryFile
import shutil
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from datetime import datetime
import numpy as np
from sklearn.preprocessing import StandardScaler
from collections import defaultdict

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",  # Allow your frontend to access
    "http://127.0.0.1:3000",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# 🔴 HOTSPOTS USING KMEANS + CRIME TYPE COLOR CODING (AGGREGATED BY STATE)
# -------------------------------------------------------------------
@app.post("/hotspots-ml")
async def extract_hotspots(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Please upload a valid CSV file"}

    with NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        df = pd.read_csv(tmp_path)
        df.columns = df.columns.astype(str).str.strip()

        # Identify required columns based on user's CSV header
        state_col = [col for col in df.columns if "state" in col.lower() or "uts" in col.lower()][0]
        lat_col = [col for col in df.columns if "lat" in col.lower()][0]
        lon_col = [col for col in df.columns if "lon" in col.lower()][0]
        year_cols = sorted([col for col in df.columns if col.strip().isdigit()])
        rate_col = [col for col in df.columns if "rate" in col.lower()][0]
        crime_type_col = [col for col in df.columns if "type of crimes" in col.lower()][0]

        # Clean numeric columns before aggregation (remove non-numeric, keep dots, then convert)
        # This handles potential '-' or '.' or other non-numeric strings in numeric columns
        for col in year_cols + [rate_col, lat_col, lon_col]:
            df[col] = df[col].astype(str).replace(to_replace=r'[^0-9\.]+', value='', regex=True)
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # --- Aggregation Logic --- 
        aggregated_data = defaultdict(lambda: {
            'latitude': None,
            'longitude': None,
            'rate_of_crime': 0.0, 
            'crime_type_counts': defaultdict(int),
            'total_crime_years': defaultdict(int)
        })
        
        state_unique_info = {} 

        for _, row in df.iterrows():
            state = row[state_col]
            
            # Store unique lat/lon/rate for the state (take the first one encountered if multiple rows per state)
            if state not in state_unique_info:
                state_unique_info[state] = {
                    'latitude': row[lat_col],
                    'longitude': row[lon_col],
                    'rate_of_crime': row[rate_col]
                }
            
            crime_type = row[crime_type_col]

            # Aggregate crime counts by type and by year for each state
            for year_col in year_cols:
                count = int(row[year_col])
                aggregated_data[state]['crime_type_counts'][crime_type] += count
                aggregated_data[state]['total_crime_years'][year_col] += count
        
        # Prepare aggregated data for DataFrame and KMeans
        processed_states_list = []
        for state_name, data in aggregated_data.items():
            # Get the top crime type based on total counts for the state across all categories
            top_crime_for_state = max(data['crime_type_counts'], key=data['crime_type_counts'].get) if data['crime_type_counts'] else "Other"

            state_entry = {
                "state": state_name,
                "latitude": state_unique_info[state_name]['latitude'],
                "longitude": state_unique_info[state_name]['longitude'],
                "top_crime": top_crime_for_state,
                "rate_of_crime": state_unique_info[state_name]['rate_of_crime'] # Using the first encountered rate for the state
            }
            # Add year-wise total crime data for the state
            for year_col in year_cols:
                state_entry[year_col] = data['total_crime_years'][year_col]
            
            processed_states_list.append(state_entry)
        
        df_processed_states = pd.DataFrame(processed_states_list)

        # Features for clustering (use total crime per year for each state)
        features_for_kmeans = df_processed_states[year_cols].apply(pd.to_numeric, errors="coerce").fillna(0)
        
        # Scale features for KMeans
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features_for_kmeans)

        # KMeans clustering
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        df_processed_states["cluster"] = kmeans.fit_predict(features_scaled)

        # Map cluster to risk level
        cluster_totals = kmeans.cluster_centers_.sum(axis=1)
        sorted_clusters = np.argsort(cluster_totals)
        cluster_to_risk = {
            sorted_clusters[0]: "Low",
            sorted_clusters[1]: "Medium",
            sorted_clusters[2]: "High"
        }

        # Define crime color map - now includes more types and matches frontend preference
        crime_colors = {
            "Theft": "Red",
            "Assault": "Blue",
            "Burglary": "Yellow", 
            "Vandalism": "Green", 
            "Harassment": "Purple", 
            "Fraud": "Orange",
            "Murder": "DarkRed", # New specific color for Murder
            "Crime against Children": "Purple", 
            "Crime against SCs": "Brown", 
            "Crime against Women": "Pink", 
            "Crime committed by Juveniles": "LightBlue", 
            "Economic Offences": "DarkGreen", 
            "Other": "Gray"
        }

        final_output = []
        for _, row in df_processed_states.iterrows():
            cluster = int(row["cluster"])
            risk = cluster_to_risk[cluster]
            top_crime_for_state = row["top_crime"]
            crime_color = crime_colors.get(top_crime_for_state, "Gray")

            result_entry = {
                "state": row["state"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "risk": risk,
                "cluster": cluster,
                "top_crime": top_crime_for_state,
                "crime_color": crime_color,
                "rate_of_crime": float(row["rate_of_crime"]) if pd.notnull(row["rate_of_crime"]) else None,
                "crime_breakdown": dict(data['crime_type_counts'])
            }
            for y_col in year_cols:
                result_entry[y_col] = int(row[y_col]) if pd.notnull(row[y_col]) else None
            final_output.append(result_entry)

        return final_output

    except Exception as e:
        return {"error": str(e)}  

# -------------------------------------------------------------------
# 📈 CRIME TREND USING LINEAR REGRESSION (YEARLY TOTALS)
# -------------------------------------------------------------------
@app.post("/crime-trend")
async def crime_trend(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Please upload a valid CSV file"}

    with NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        df = pd.read_csv(tmp_path)
        df.columns = df.columns.astype(str).str.strip()

        # Identify year columns, handling non-numeric data robustly
        year_cols = sorted([col for col in df.columns if col.strip().isdigit()])
        if not year_cols:
            return {"error": "CSV must contain year columns (e.g., 2020, 2021, 2022)."}

        # Clean year columns: replace non-numeric with empty string, then convert to numeric
        # This ensures robustness against '-', '.', or other non-numeric entries
        for col in year_cols:
            df[col] = df[col].astype(str).replace(to_replace=r'[^0-9.]+', value='', regex=True)
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # Sum total crimes for each year across all states and all crime types
        yearly_totals = df[year_cols].sum().reset_index()
        yearly_totals.columns = ["year", "total_crimes"]
        yearly_totals["year"] = pd.to_numeric(yearly_totals["year"]).astype(int) # Ensure year is int
        yearly_totals = yearly_totals.sort_values(by="year")

        # Prepare data for Linear Regression
        X = yearly_totals[["year"]]
        y = yearly_totals["total_crimes"]

        model = LinearRegression()
        model.fit(X, y)

        # Predict for the next 3 years
        last_year = yearly_totals["year"].max()
        future_years = np.array([[last_year + i] for i in range(1, 4)]) # Predict for 3 future years
        future_preds = model.predict(future_years)

        # Combine historical and predicted data
        result = []
        for _, row in yearly_totals.iterrows():
            result.append({
                "year": int(row["year"]),
                "total_crimes": round(row["total_crimes"])
            })
        
        for i in range(3):
            result.append({
                "year": int(future_years[i][0]),
                "predicted_total_crimes": round(max(0, future_preds[i])) # Ensure predictions are non-negative
            })

        return result

    except Exception as e:
        return {"error": str(e)}