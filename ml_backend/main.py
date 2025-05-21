from fastapi import FastAPI, UploadFile, File
import pandas as pd
from tempfile import NamedTemporaryFile
import shutil
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from datetime import datetime
import numpy as np

app = FastAPI()

# -------------------------------------------------------------------
# 🔴 HOTSPOTS USING KMEANS + CRIME TYPE COLOR CODING
# -------------------------------------------------------------------
@app.post("/hotspots-ml")
async def extract_hotspots(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Please upload a valid CSV file"}

    with NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Load raw CSV and clean header
        df_raw = pd.read_csv(tmp_path, header=None)
        df_raw.columns = df_raw.iloc[0]
        df = df_raw[1:].reset_index(drop=True)

        # Clean header: convert NaN to strings
        df.columns = df.columns.astype(str).str.strip()

        # Identify state column
        state_col = df.columns[0]
        df = df.dropna(subset=[state_col])
        df = df[df[state_col].astype(str).str.lower() != "total all india"]

        # Convert features to numeric
        features = df.drop(columns=[state_col])
        features.columns = features.columns.astype(str).str.strip()

        # ❌ Remove columns named 'nan'
        features = features.loc[:, features.columns != 'nan']

        features = features.apply(pd.to_numeric, errors="coerce").fillna(0)

        # KMeans clustering
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        df["cluster"] = kmeans.fit_predict(features)

        # Map cluster to risk level
        cluster_totals = kmeans.cluster_centers_.sum(axis=1)
        sorted_clusters = np.argsort(cluster_totals)
        cluster_to_risk = {
            sorted_clusters[0]: "Low",
            sorted_clusters[1]: "Medium",
            sorted_clusters[2]: "High"
        }

        # Define crime color map
        crime_colors = {
            "Murder": "Red",
            "Theft": "Yellow",
            "Assault": "Blue",
            "Fraud": "Orange",
            "Harassment": "Purple",
            "Vandalism": "Green",
            "Other": "Gray"
        }

        crime_cols = features.columns.tolist()
        output = []

        for _, row in df.iterrows():
            cluster = int(row["cluster"])
            risk = cluster_to_risk[cluster]

            row_filled = pd.to_numeric(row[crime_cols], errors='coerce').fillna(0)
            top_crime = row_filled.idxmax()
            crime_color = crime_colors.get(top_crime, "Gray")

            output.append({
                "state": row[state_col],
                "risk": risk,
                "cluster": cluster,
                "top_crime": top_crime,
                "crime_color": crime_color
            })

        return output

    except Exception as e:
        return {"error": str(e)}  


# -------------------------------------------------------------------
# 📈 CRIME TREND USING LINEAR REGRESSION
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
        df.columns = df.columns.str.strip()

        if "Month" not in df.columns:
            return {"error": "CSV must have 'Month' column."}

        def parse_month(m):
            try:
                return datetime.strptime(m.strip(), "%b-%y")
            except:
                try:
                    return datetime.strptime(m.strip(), "%Y-%m")
                except:
                    return None

        df["Month_dt"] = df["Month"].apply(parse_month)
        df = df.dropna(subset=["Month_dt"])
        df = df.sort_values(by="Month_dt")

        df["Total"] = df.select_dtypes(include=[np.number]).sum(axis=1)

        monthly = df.groupby("Month_dt")["Total"].sum().reset_index()
        monthly["month_num"] = monthly["Month_dt"].map(datetime.toordinal)

        X = monthly[["month_num"]]
        y = monthly["Total"]
        model = LinearRegression()
        model.fit(X, y)

        last_month = monthly["Month_dt"].max()
        future_dates = [last_month + pd.DateOffset(months=i) for i in range(1, 4)]
        future_nums = [[d.toordinal()] for d in future_dates]
        future_preds = model.predict(future_nums)

        result = []
        for i in range(3):
            result.append({
                "month": future_dates[i].strftime("%b-%Y"),
                "predicted_total_crimes": round(future_preds[i])
            })

        return result

    except Exception as e:
        return {"error": str(e)}