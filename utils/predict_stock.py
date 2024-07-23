# predict_stock.py

import pandas as pd
import numpy as np
import matplotlib as ml
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

def train_model(data):
    # Prepare data
    df = pd.DataFrame(data)
    df = pd.get_dummies(df, columns=["product_name"], drop_first=True)

    X = df.drop("quantity_to_purchase", axis=1)
    y = df["quantity_to_purchase"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Linear Regression model
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    print(f"Mean Squared Error: {mse}")

    return model, scaler, X.columns
    from flask import Flask, request, jsonify
   import joblib
def predict():
    data = request.get_json(force=True)
    features = pd.DataFrame([data])
    prediction = model.predict(features)
    return jsonify({'predicted_quantity': prediction[0]})


def predict_stock(model, scaler, new_data, training_columns):
    # Ensure new data has the same columns as the training data
    new_data_df = pd.DataFrame(new_data)
    new_data_df = pd.get_dummies(new_data_df, columns=["product_name"], drop_first=True)

    # Reindex to ensure all columns are present
    new_data_df = new_data_df.reindex(columns=training_columns, fill_value=0)

    new_data_scaled = scaler.transform(new_data_df)
    predicted_quantities = model.predict(new_data_scaled)
    return predicted_quantities

# Example usage
if __name__ == "__main__":
    data = {
        "product_name": ["Widget A", "Widget B", "Gadget X", "Gadget Y", "Tool Q"],
        "buying_price": [100, 200, 150, 250, 80],
        "last_stock_sold": [30, 20, 15, 10, 25],
        "quantity_to_purchase": [50, 30, 20, 15, 40]
    }

    model, scaler, training_columns = train_model(data)

    new_data = {
        "buying_price": [120, 250],
        "last_stock_sold": [20, 10],
        "product_name": ["Widget B", "Gadget X"]
    }

    predicted_quantities = predict_stock(model, scaler, new_data, training_columns)
    print(f"Predicted Quantities: {predicted_quantities}")
    const result = await response.json();
    console.log('Prediction Result:', result);
    setPredictionResult(result.predicted_quantity);
  } catch (error) {
    console.error('Error predicting inventory:', error);
  } finally {
    setIsPredicting(false);
  }
}
