from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.schemas.predictionresponse import PredictionInferenceResponse
from app.ml.predictor import predict

router=APIRouter(prefix='/inference',tags=['inference'])

@router.post('/predict',response_model=PredictionInferenceResponse)
async def predict_disease(file:UploadFile=File(...)):

    try:

        if not file.content_type.startswith('image'):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail='File must be an image(JPG,PNG,ETC)')
        
        image_bytes= await file.read()

        if len(image_bytes)==0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail='Image file is empty')
        
        prediction=predict(image_bytes)

        return PredictionInferenceResponse(
            disease=prediction['disease'],
            confidence=prediction['confidence'],
            all_predictions=prediction['all_predictions']
        )
    

    except HTTPException:

        raise
    except Exception as e:
        # Catch any other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
