import pickle
import numpy as np

# Model load karo
with open('D:/Disaster/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('D:/Disaster/label_encoder.pkl', 'rb') as f:
    le = pickle.load(f)

def predict_severity(disaster_type, deaths, affected, damages, year):
    disaster_encoded = le.transform([disaster_type])[0]
    X = [[year, deaths, affected, damages, disaster_encoded]]
    pred = model.predict(X)[0]
    labels = {0: "Low 🟢", 1: "Medium 🟡", 2: "High 🔴"}
    return labels[pred]

def chat(user_message, severity=""):
    """Simple rule-based chatbot - Hindi + English"""
    msg = user_message.lower()
    
    if "flood" in msg or "बाढ़" in msg:
        return f"Flood ek dangerous disaster hai! Severity: {severity}\nSuraksha tips: Uche sthan par jayen, paani se door rahen!"
    elif "earthquake" in msg or "भूकंप" in msg:
        return f"Earthquake alert! Severity: {severity}\nSuraksha tips: Table ke neeche jayen, bahar niklen!"
    elif "drought" in msg or "सूखा" in msg:
        return f"Drought situation! Severity: {severity}\nSuraksha tips: Paani bachayein, crops ko protect karein!"
    else:
        return f"Disaster Analysis Complete!\nSeverity Level: {severity}\nSafe rahein aur authorities ki instructions follow karein!"

# Test karo
if __name__ == "__main__":
    severity = predict_severity("Flood", 1000, 50000, 5000000, 2020)
    print(f"Predicted Severity: {severity}")
    
    response = chat("flood disaster ke baare mein batao", severity)
    print(f"\nChatbot: {response}")