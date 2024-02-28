import gspread
from google.oauth2.service_account import Credentials

# Load credentials from the JSON file
credentials = Credentials.from_service_account_file('path/to/credentials.json')

# Authenticate using the obtained credentials
gc = gspread.authorize(credentials)
# Open the desired Google Sheet
sheet = gc.open_by_url('https://docs.google.com/spreadsheets/d/your-sheet-id')
# or
# sheet = gc.open('Your Sheet Title')

worksheet = sheet.worksheet('Sheet1')
column_values = worksheet.col_values(1) #column number for amber list
value_to_query = '' # reserved for retrieving from Zendesk frontend
if value_to_query in column_values:
    print("The value exists in the column.")
else:
    print("The value does not exist in the column.")

