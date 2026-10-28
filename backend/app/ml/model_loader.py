try:
    import torch 
    import torch.nn as nn
    import torchvision.models as models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. ML inference will be disabled.")

from pathlib import Path
import os


_model_instance=None


def load_model(model_path: str=None,device:str='cpu'):
    """Load the crop disease detection model"""
    
    if not TORCH_AVAILABLE:
        print("⚠️  PyTorch not available - returning None")
        return None
    
    global _model_instance

    if _model_instance is not None:
        print('Using cached model instance')
        return _model_instance
    
    print('Loading model instance....')

    if model_path is None:
        # Rwanda-focused model: 11 disease classes across maize, potato
        # and tomato (stage-2 fine-tuned ResNet18, val acc ~99.4%).
        model_path=Path(__file__).parent.parent.parent.parent / 'models' / 'plant_disease_11class_resnet18_stage2_best_v1.pth'

        model_path=str(model_path)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found:{model_path}")
        
        model = models.resnet18(weights=None)

        num_features = model.fc.in_features

        model.fc = nn.Linear(num_features, 11)

        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)

        model.eval()

        model = model.to(device)

        _model_instance = model

        print('Model loaded and cached successfully')

        return _model_instance
    

def get_model(device:str='cpu')->nn.Module:
    global _model_instance

    if _model_instance is None:
         load_model(device=device)
    return _model_instance