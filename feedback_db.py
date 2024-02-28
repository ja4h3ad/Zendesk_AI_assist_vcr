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
    def __init__(self, uri=mongo_url, db_name=mongo_name):
        self.client=MongoClient(uri)
        self.db=self.client[db_name]
        self.actions_collection = self.db['actions']

    def insert_action(self, ticket_id, action_type, user_id='anonymous'):
        '''

        :param ticket_id:
        :param action_type:
        :param user_id:
        :return: index insertion
        '''
        # assign the document properties
        action_doc = {
            'ticketNumber': ticket_id,
            'actionType': action_type,
            'userId': user_id,
            'timestamp': datetime.now(),
        }
        result = self.actions_collection.insert_one(action_doc)
        return result.inserted_id

    # add the thumbs up or thumbs down feedback of the summarized case to the database
    def record_feedback(self, ticket_id, is_positive_feedback, user_id='anonymous'):
        '''

        :param ticket_id:
        :param is_positive_feedback:
        :param user_id:
        :return: executes the method 'insert_action'
        '''
        feedback_type = 'thumbs-up' if is_positive_feedback else 'thumbs_down'
        return self.insert_action(ticket_id, feedback_type, user_id)



    # add the copy action taken on the UI to the database
    def record_copy_action(self, ticket_id, user_id='anonymous'):
        '''
        :param ticket_id:
        :param user_id:
        :return: that the RAG method was satisfactory because it was copied on the UI
        '''

        return self.insert_action(ticket_id, 'copy-action', user_id)

