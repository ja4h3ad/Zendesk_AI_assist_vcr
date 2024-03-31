import os
from pymongo import MongoClient
from datetime import datetime
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), ".env")
load_dotenv(dotenv_path)

mongo_url = os.environ.get('MONGO_URL')
mongo_name = os.environ.get('MONGO_DB_NAME')


class FeedbackDatabase:
    def __init__(self, uri='mongodb://localhost:27017/', db_name='user_feedback'):
        self.client=MongoClient(uri)
        self.db=self.client[db_name]
        self.actions_collection = self.db['actions']

    def insert_action(self, ticket_id, action_type, user_id='anonymous', content_type=None, summary=None):
        '''
        Inserts an action into the database.

        :param ticket_id: The ticket ID associated with the action.
        :param action_type: The type of action (e.g., "copy-action", "thumbs-up", "thumbs-down").
        :param user_id: The ID of the user performing the action. Defaults to 'anonymous'.
        :param content_type: The type of content copied, if applicable (e.g., "solutionText", "relatedLinks").
        :return: The ID of the inserted document.
        '''
        action_doc = {
            'ticketNumber': ticket_id,
            'actionType': action_type,
            'userId': user_id,
            'timestamp': datetime.now(),
        }
        # If content_type is provided, add it to the document
        if content_type:
            action_doc['contentType'] = content_type
        if summary:  # Add summary to the document if provided
            action_doc['summary'] = summary

        result = self.actions_collection.insert_one(action_doc)
        return result.inserted_id

    # add the thumbs up or thumbs down feedback of the summarized case to the database
    def record_feedback(self, ticket_id, is_positive_feedback, summary, user_id='anonymous'):
        '''

        :param ticket_id:  The ticket ID
        :param is_positive_feedback:  Boolean indicating if feedback is positive or negative
        :param user_id:  The ID of the user providing feedback, defaults to 'anonymous'
        :param summary:  The LLM summary
        :return: executes the method 'insert_action'
        '''
        feedback_type = 'thumbs-up' if is_positive_feedback else 'thumbs_down'
        return self.insert_action(ticket_id, feedback_type, user_id, None, summary)



    # add the copy action taken on the UI to the database
    def record_copy_action(self, ticket_id, user_id='anonymous', content_type='unknown'):
        '''
        Records a copy action to the database, with differentiation between solution text and related links.

        :param ticket_id: The ticket ID associated with the action.
        :param user_id: The ID of the user performing the copy action.
        :param content_type: Specifies the type of content being copied ("solutionText" or "relatedLinks").
        :return: The ID of the inserted document.
        '''
        return self.insert_action(ticket_id, 'copy-action', user_id, content_type)