from PIL import Image
try:
    import torch 
    from torchvision import transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from io import BytesIO


IMG_SIZE = 224

if TORCH_AVAILABLE:
    preprocess_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
else:
    preprocess_transform = None

def preprocess_image(image_bytes:bytes)->torch.Tensor:

    try:
        image=Image.open(BytesIO(image_bytes))

        if image.mode!= 'RGB':
            image=image.convert('RGB')

        
        tensor=preprocess_transform(image)
        tensor=tensor.unsqueeze(0)

        return tensor

    except Exception as e:
        raise ValueError(f'Failed to generate image: {str(e)}')
    
    

