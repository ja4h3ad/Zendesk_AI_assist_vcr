# required network and communications imports
from feedback_db import FeedbackDatabase
from flask import Flask, jsonify, request
from requests.auth import HTTPBasicAuth
from html import unescape
import logging
import re
import requests
from flask_cors import CORS
from llm_module import authenticate, summarize_text, entity_extraction
import string
import os
import sys
from os.path import join, dirname
from dotenv import load_dotenv
import html
from retry import retry
from vonage_cloud_runtime.vcr import VCR

# instantiate the VCR object - but where is this used?
vcr = VCR()

# Load environment variables and config files
dotenv_path = join(dirname(__file__), ".env")
load_dotenv(dotenv_path)
from config import SALUTATION_PATTERNS, SYSTEM_PATTERNS, SIGNATURE_PATTERNS, CONTACT_PHRASES, SECURITY_ARTIFACTS

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def preprocess_text(text):
    '''
    1. Remove emails
    2. Remove the effect of email signatures sent in emails
    3. Replace URLs
    4. Remove extra spaces, as well as leading and trailing spaces
    5. Remove separators that exist
    '''
    text = html.unescape(text)
    # Remove all defined patterns that are persistent in email comms
    for pattern in SALUTATION_PATTERNS + SYSTEM_PATTERNS + SIGNATURE_PATTERNS + CONTACT_PHRASES + SECURITY_ARTIFACTS:
        text = re.sub(pattern, ' ', text, flags=re.IGNORECASE)

    # Normalize all whitespace (spaces, tabs, newlines, carriage returns, etc.) to a single space
    text = re.sub(r'\s+', ' ', text)

    # Removing URLs
    url_pattern = r'https?://\S+|www\.\S+'
    text = re.sub(url_pattern, '', text)
    # Remove asterisks and empty brackets
    text = re.sub(r'\*+', '', text)
    text = re.sub(r'\!\[\]\(\s*\)', '', text)
    # Removing email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    text = re.sub(email_pattern, '', text)

    # remove random numeric sequence of numbers created by VTF form publisher (1654037608053)
    vtf_pattern = r'\b\d{13,15}\b'
    replacement_text = "Robert Gordon is requesting to have this application reviewed"
    text = re.sub(pattern, replacement_text, text)

    # Remove phone patterns
    phone_pattern = r'(\+\d{1,3}[\s.-])?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})'
    text = re.sub(phone_pattern, '', text)

    # Remove separator symbols
    separator_pattern = r'\|+'
    text = re.sub(separator_pattern, '', text)

    # Remove dot patterns
    dot_pattern = r'(•\s*)+'
    text = re.sub(dot_pattern, '', text)

    # Removing enumeration like '1. ', '2. '
    enumeration_pattern = r'\b\d+\.\s'
    text = re.sub(enumeration_pattern, '', text)

    # Remove markdown image/link syntax
    text = re.sub(r'\!\[.*?\]\(.*?\)', '', text)

    # Remove dates and times
    date_time_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{2,4}[/-]\d{1,2}[/-]\d{1,2}\b|\b\d{1,2}:\d{2}\b'
    text = re.sub(date_time_pattern, '', text)

    # Remove special characters except for +, _, periods, commas and question marks - needed for syntax

    exclusion = "+_.,?'"
    new_punctuation = ''.join(char for char in string.punctuation if char not in exclusion)
    # identify a translation table
    # argument_1 and argument_2 are for character replacement
    # argument_3 is for charcter deletion which are the new_punctuation characters
    translation_table = str.maketrans('', '', new_punctuation)
    text = text.translate(translation_table)

    #     punctuation = str.maketrans('', '', string.punctuation.replace('+', ''))
    #     text = text.translate(punctuation)

    # Removing auto-generated correspondence artifacts
    auto_gen_pattern = r'[\w\s,]+ Support <> [\w\s,]+\(\w+\) <> RE: [\w\s:]+'
    text = re.sub(auto_gen_pattern, '', text)

    # Removing extra spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text


@app.route('/vona_bot', methods=['POST'])
def vona_bot_route():
    data = request.json
    query = data.get('query')
    try:
        # Set the URL for the API call
        url = "https://rag-eu.ai.vonage.com/v1/query"

        # Define the headers with your account ID
        headers = {
            'x-account-id': 'f2321f87'  # Make sure this matches your actual account ID
        }

        # Define the parameters for the GET request
        params = {
            "kb": "zendesk",
            "query": query
        }

        # Make the GET request
        response = requests.get(url, headers=headers, params=params)

        # Check if the response status code is not 200 (OK)
        if response.status_code != 200:
            # Log the error with detailed information
            logging.error(
                f"RAG service returned status code: {response.status_code}, reason: {response.reason}, response body: {response.text}")
            return "", [], ""

        # If the response is successful, parse the JSON
        json_result = response.json()
        generated_answer = json_result.get("result") or ""
        references = json_result.get("references") or []
        rag_version = json_result.get("version") or ""
        resp = jsonify({
            'generated answer':  generated_answer,
            'references':  references,
            'rag_version':  rag_version
        }), 200

        return resp

    except requests.RequestException as e:
        # Log any request exceptions
        logging.error(f"Error occurred: {str(e)}")
        return "", [], ""



@app.route('/ticket/<ticket_number>', methods=['GET'])
def get_ticket_info(ticket_number: str):
    # Setup and Fetching Ticket Data
    email_address = os.environ.get('email_address')
    zendesk_api_token = os.environ.get('zendesk_api_token')
    basic = HTTPBasicAuth(f'{email_address}/token', f'{zendesk_api_token}')
    zendesk_url = 'https://nexmo.zendesk.com/api/v2'

    headers = {'Content-Type': 'application/json'}
    url = f"{zendesk_url}/tickets/{ticket_number}/comments?include=users&include_inline_images=false"

    ticket_response = requests.get(url, headers=headers, auth=basic)

    if ticket_response.status_code != 200:
        return jsonify({"error": "Failed to fetch ticket information", "status_code": ticket_response.status_code})

    ticket_response_json = ticket_response.json()

    # Processing Comments and Users

    comments = ticket_response_json.get("comments", [])
    users = ticket_response_json.get("users", [])
    user_dict = {user.get("id"): user.get("name") for user in users}
    all_comments_text = ""
    # assign comments to individual authors
    for comment in comments:

        author_id = comment.get("author_id")
        plain_body = comment.get("plain_body", "")
        name = user_dict.get(author_id, "Unknown")

        if name.lower() == "system":
            continue
        cleaned_body = preprocess_text(plain_body)
        all_comments_text += f"{name}: {cleaned_body}\n"


    # Authenticate once to the LLM endpoint
    auth_token = authenticate()

    # Check for authentication failure
    if auth_token is None:
        return jsonify({"error": "Authentication failed"})

    # Use the token for LLM methods
    llm_summary = summarize_text(all_comments_text, auth_token)
    # llm_topics = entity_extraction(all_comments_text, auth_token)

    # return ({
    #     "llm_summary": llm_summary,
    #     "llm_topics": llm_topics
    #
    # }),200

    return jsonify({
        "llm_summary": llm_summary
    }), 200


# Initialize the database class
db = FeedbackDatabase()


@app.route('/send_feedback', methods=['POST'])
def handle_summary_feedback():
    '''
    1.  Accepts the thumbs up or thumbs down indicator passed from middleware.js
    2.  The feedback will be stored in the mongodb
    :return: a positive affirmation that the Feedback was stored successfully in the form of a log
    '''
    data = request.json
    ticket_id = data['ticketId']
    is_positive_feedback = data['feedbackType'] == 1
    user_id = data.get('userId', 'anonymous')

    # Use the class method to record feedback
    db.record_feedback(ticket_id, is_positive_feedback, user_id)
    return jsonify({'message': 'Feedback recorded successfully'}), 200


@app.route('/record_copy_action', methods=['POST'])
def handle_copy_action():
    '''
    1.  Using the middleware.js route vonabotCopyAction,
    2.  This will store a data point if the Zendesk Agent has copied the info returned by GenAI
    :return:  a positive affirmation that the information was copied
    '''
    data = request.json
    ticket_id = data['ticketId']
    content_type = data.get('contentType', 'unknown') # get the content type that was copied
    user_id = data.get('userId', 'anonymous')

    # Example of handling based on content type
    if content_type == 'solutionText':
        # Handle recording the copy action for solution text specifically
        print(f"Recording action for copying solution text. Ticket ID: {ticket_id}, User ID: {user_id}")
    elif content_type == 'relatedLinks':
        # Handle recording the copy action for related links specifically
        print(f"Recording action for copying related links. Ticket ID: {ticket_id}, User ID: {user_id}")
    else:
        # Handle generic or unknown content type
        print(f"Recording generic copy action. Ticket ID: {ticket_id}, User ID: {user_id}")


    db.record_copy_action(ticket_id, user_id, content_type)

    # Use the class method to record copy action
    db.record_copy_action(ticket_id, user_id)
    return jsonify({'message': 'Copy action recorded successfully'}), 200


@app.get('/_/health')
async def health():
    return 'OK'


@app.get('/_/metrics')
async def metrics():
    return 'OK'


# if __name__ == '__main__':
#     app.run(debug=True, port=5003)

if __name__ == "__main__":
    port = int(os.getenv('VCR_PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
