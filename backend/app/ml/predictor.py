try:
    import torch 
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from .model_loader import get_model
from .preprocessing import preprocess_image
from typing import Dict

# Rwanda-focused classes (classes2): these classes are the ones that the model was trained on
# and are relevant to Rwandan crops.

DISEASE_CLASSES2 = [
    "Maize_Cercospora_leaf_spot",
    "Maize_Common_rust",
    "Maize_Northern_Leaf_Blight",
    "Maize_healthy",
    "Potato_Early_blight",
    "Potato_Late_blight",
    "Potato_healthy",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato_healthy",
]
#this are the old classes that i used to for transfer learning and fine tuning
DISEASE_CLASSES = [
    "Apple_Black_rot",
    "Apple_Cedar_apple_rust",
    "Apple_healthy",
    "Apple_scab",
    "Blueberry_healthy",
    "Cherry_Powdery_mildew",
    "Cherry_healthy",
    "Corn_Common_rust",
    "Corn_Gray_leaf_spot",
    "Corn_Northern_Leaf_Blight",
    "Corn_healthy",
    "Grape_Black_measles",
    "Grape_Black_rot",
    "Grape_Leaf_blight",
    "Grape_healthy",
    "Orange_Huanglongbing",
    "Peach_Bacterial_spot",
    "Peach_healthy",
    "Pepper_Bacterial_spot",
    "Pepper_healthy",
    "Potato_Early_blight",
    "Potato_Late_blight",
    "Potato_healthy",
    "Raspberry_healthy",
    "Soybean_Brown_spot",
    "Soybean_Downy_mildew",
    "Soybean_healthy",
    "Squash_Powdery_mildew",
    "Strawberry_Leaf_scorch",
    "Strawberry_healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites",
    "Tomato_Target_spot",
    "Tomato_Yellow_Leaf_Curl_Virus"
]


def predict(image_bytes: bytes, device: str='cpu') -> Dict:
    """Predict crop disease from image bytes"""
    
    if not TORCH_AVAILABLE:
        # Return a mock prediction when torch is not available
        return {
            'disease': 'Maize_healthy',
            'confidence': 95.0,
            'all_predictions': {cls: 0.0 for cls in DISEASE_CLASSES2}
        }

    try:
        image_tensor = preprocess_image(image_bytes)

        model = get_model(device=device)

        if model is None:
            # Return mock prediction if model couldn't load
            return {
                'disease': 'Maize_healthy',
                'confidence': 95.0,
                'all_predictions': {cls: 0.0 for cls in DISEASE_CLASSES2}
            }

        with torch.no_grad():
            image_tensor = image_tensor.to(device)
            logits = model(image_tensor)

            probabilities = torch.softmax(logits, dim=1)

            probs = probabilities.cpu().numpy()[0]
            top_prob = float(probs.max())
            top_class_idx = probs.argmax()
            top_disease = DISEASE_CLASSES2[top_class_idx]

            all_predictions = {
                DISEASE_CLASSES2[i]: float(probs[i]) for i in range(len(DISEASE_CLASSES2))
            }

            return {
                'disease': top_disease,
                'confidence': top_prob,
                'all_predictions': all_predictions
            }
        
    except Exception as e:
            raise ValueError(f'Prediction failed: {str(e)}')

