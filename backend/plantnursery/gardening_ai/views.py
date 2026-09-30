import os

from google import genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class GardeningAIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        question = request.data.get('question', '').strip()

        if not question:
            return Response(
                {
                    'error': 'Please enter a gardening question.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        api_key = os.getenv('GEMINI_API_KEY')

        if not api_key:
            return Response(
                {
                    'error': 'Gemini API key is not configured.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:

            client = genai.Client(
                api_key=api_key
            )

            system_prompt = """
You are PlantNest Gardening Expert.

Help users with questions about plants and gardening.

Give simple, practical and easy-to-understand answers.

You can answer questions about:
- Plant care
- Watering
- Sunlight
- Soil
- Fertilizers
- Pruning
- Repotting
- Pests
- Plant diseases
- Indoor and outdoor plants
- General gardening problems

If the question is not related to plants or gardening,
politely say that you can only help with gardening and
plant-related questions.

Do not give dangerous chemical instructions.
If a serious plant disease or pest problem requires
professional treatment, recommend consulting a
qualified gardening or agricultural expert.
"""

            prompt = (
                f"{system_prompt}\n\n"
                f"User Question: {question}"
            )

            response = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt
            )

            answer = response.text.strip()

            return Response(
                {
                    'question': question,
                    'answer': answer
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            print('Gemini Error:', e)

            return Response(
                {
                    'error': 'Unable to get an answer right now. Please try again.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )