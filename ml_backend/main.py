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
        # Make crime_type_col robust to case/whitespace
        crime_type_col = [col for col in df.columns if "type" in col.lower() and "crime" in col.lower()][0]

        # Normalize crime type values for consistency
        df[crime_type_col] = df[crime_type_col].astype(str).str.strip().str.lower().str.replace('  ', ' ').str.replace('crime commited', 'crime committed')

        # Get all unique crime types (normalized)
        all_crime_types = sorted(df[crime_type_col].unique())

        # Clean numeric columns before aggregation (remove non-numeric, keep dots, then convert)
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
            if state not in state_unique_info:
                state_unique_info[state] = {
                    'latitude': row[lat_col],
                    'longitude': row[lon_col],
                    'rate_of_crime': row[rate_col]
                }
            crime_type = row[crime_type_col]
            for year_col in year_cols:
                count = int(row[year_col])
                aggregated_data[state]['crime_type_counts'][crime_type] += count
                aggregated_data[state]['total_crime_years'][year_col] += count
        
        # Prepare aggregated data for DataFrame and KMeans
        processed_states_list = []
        for state_name, data in aggregated_data.items():
            # Fill in all crime types, even if zero
            crime_type_counts = {ct: data['crime_type_counts'].get(ct, 0) for ct in all_crime_types}
            top_crime_for_state = max(crime_type_counts, key=crime_type_counts.get) if crime_type_counts else "other"
            state_entry = {
                "state": state_name,
                "latitude": state_unique_info[state_name]['latitude'],
                "longitude": state_unique_info[state_name]['longitude'],
                "top_crime": top_crime_for_state,
                "rate_of_crime": state_unique_info[state_name]['rate_of_crime']
            }
            for year_col in year_cols:
                state_entry[year_col] = data['total_crime_years'][year_col]
            processed_states_list.append(state_entry)
        df_processed_states = pd.DataFrame(processed_states_list)
        features_for_kmeans = df_processed_states[year_cols].apply(pd.to_numeric, errors="coerce").fillna(0)
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features_for_kmeans)
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        df_processed_states["cluster"] = kmeans.fit_predict(features_scaled)
        cluster_totals = kmeans.cluster_centers_.sum(axis=1)
        sorted_clusters = np.argsort(cluster_totals)
        cluster_to_risk = {
            sorted_clusters[0]: "Low",
            sorted_clusters[1]: "Medium",
            sorted_clusters[2]: "High"
        }
        crime_colors = {
            "theft": "Red",
            "assault": "Blue",
            "burglary": "Yellow", 
            "vandalism": "Green", 
            "harassment": "Purple", 
            "fraud": "Orange",
            "murder": "DarkRed",
            "crime against children": "Purple", 
            "crime against scs": "Brown", 
            "crime against women": "Pink", 
            "crime committed by juveniles": "LightBlue", 
            "economic offences": "DarkGreen", 
            "other": "Gray"
        }
        final_output = []
        for _, row in df_processed_states.iterrows():
            cluster = int(row["cluster"])
            risk = cluster_to_risk[cluster]
            top_crime_for_state = row["top_crime"]
            crime_color = crime_colors.get(top_crime_for_state, "Gray")
            # Always include all crime types in breakdown
            state_crime_type_counts = {ct: aggregated_data[row["state"]]['crime_type_counts'].get(ct, 0) for ct in all_crime_types}
            result_entry = {
                "state": row["state"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "risk": risk,
                "cluster": cluster,
                "top_crime": top_crime_for_state,
                "crime_color": crime_color,
                "rate_of_crime": float(row["rate_of_crime"]) if pd.notnull(row["rate_of_crime"]) else None,
                "crime_breakdown": state_crime_type_counts
            }
            for y_col in year_cols:
                result_entry[y_col] = int(row[y_col]) if pd.notnull(row[y_col]) else None
            final_output.append(result_entry)
        print("[DEBUG] /hotspots-ml output:", final_output)
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
        # --- NEW LOGIC: Merge so each year has both keys (null if not available) ---
        all_years = list(yearly_totals["year"]) + [int(future_years[i][0]) for i in range(3)]
        all_years = sorted(set(all_years))
        year_to_actual = {int(row["year"]): round(row["total_crimes"]) for _, row in yearly_totals.iterrows()}
        year_to_pred = {int(future_years[i][0]): round(max(0, future_preds[i])) for i in range(3)}

        result = []
        for year in all_years:
            result.append({
                "year": year,
                "total_crimes": year_to_actual.get(year, None),
                "predicted_total_crimes": year_to_pred.get(year, None)
            })

        return result

    except Exception as e:
        return {"error": str(e)}