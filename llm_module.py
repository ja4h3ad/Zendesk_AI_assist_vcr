import os
import requests
import json
from dotenv import load_dotenv
import logging
import base64


# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)
# import credentials
VONAGE_API_KEY = os.environ.get('VONAGE_API_KEY')
VONAGE_API_SECRET = os.environ.get('VONAGE_API_SECRET')
auth_url_endpoint = os.environ.get('auth_url_endpoint')
llm_url = os.environ.get('llm_url')

# Set up my logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def authenticate():
    """
    1. Authenticates with the API and retrieves an access token.

    2. :return: The access token if successful, otherwise None.
    """
    data = 'grant_type=client_credentials'
    api_key_secret = f"{VONAGE_API_KEY}:{VONAGE_API_SECRET}"
    auth_header_value = base64.b64encode(api_key_secret.encode()).decode()
    auth_header = f"Basic {auth_header_value}"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': auth_header
    }
    try:
        response = requests.post(auth_url_endpoint, data=data, headers=headers)
        response.raise_for_status()
        auth_token = response.json().get("access_token")
        logger.info("Auth token acquired successfully.")
        return auth_token
    except requests.RequestException as e:
        logger.error("Error acquiring access token:", exc_info=True)
        return None


def make_llm_request(auth_token, query, prompt_template, repetition_penalty):
    """
    1. call the LLM API with the provided query and prompt template.

    2. :param auth_token: The authentication token.
    3. :param query: The user's query.
    4. :param prompt_template: The template for creating the prompt.
    5. :param repetition_penalty: The repetition penalty parameter for the API.
    6. :return: The response from the API or an error message.
    """
    llm_headers = {'Authorization': f'Bearer {auth_token}', 'Content-Type': 'text/plain'}
    prompt = {
        "inputs": prompt_template.format(query=query),
        "parameters": {
            "top_p": 0.7,
            "temperature": 0.01,
            "top_k": 5,
            "max_new_tokens": 512,
            "repetition_penalty": repetition_penalty
        }
    }
    try:
        response = requests.post(llm_url, headers=llm_headers, data=json.dumps(prompt))
        logger.info(f"API Response: {response.text}")

        response.raise_for_status()
        response_data = response.json()
        if isinstance(response_data, list) and len(response_data) > 0:
            return response_data[0].get("generated_text", "No response provided")
        else:
            return "No response provided"
    except requests.RequestException as e:
        logger.error(f"An error occurred: {e}")
        return f"An error occurred: {e}"


def summarize_text(query, auth_token):
    """
    API request to summarize the provided text.
    :param query: The text to be summarized.
    :param auth_token: The authentication token.
    :return: The summarized text.
    """
    if auth_token is None:
        return "Authentication failed."
    logger.info("Entering summarize_text")

    prompt_template = """
    Generate a concise summary of the the correspondence in {query}.
    """

    return make_llm_request(auth_token, query, prompt_template, 2.5)


def entity_extraction(query, auth_token):
    """
    Makes an API request to extract entities from the provided text.
    :param query: The text for entity extraction.
    :param auth_token: The authentication token.
    :return: The extracted entities.
    """
    if auth_token is None:
        return "Authentication failed."

    prompt_template = """
    Extract only the top two most important topics from the text in {query}.
    Based on the topics extracted above please create a two-word intuitive label for each topic. Make sure you to only return the labels and nothing more.
    Provide each topic in json format with the following keys:
    label_1:
    label_2:

    """
    return make_llm_request(auth_token, query, prompt_template, 1.5)
