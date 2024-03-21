# Zendesk AI Copilot

[This application provides an AI-driven agent experience that performs cognitive services on case data, powered by a Large Language Model and Natural Language Processing functions]

### Version 1.1 The features enabled in this version are:

* Case Summarization:  Provides a summary of all of the case correspondence within two paragraphs
* Information Retrieval:  Provides the ability for the Support Agent to type in a question about Vonage applications, products and services, and receive a short answer to the question as well as relevant links
* Copy and Paste:  The Agent can copy and paste the responses (links and answer)
* Feedback loop:  This version has a feedback loop that will allow us to track utilization of the app, including copying of the answers (tracker) and also whether or not the case summary hit the mark.  

Please submit bug reports to [tim.dentry@vonage.com ](). Pull requests are welcome.

### Changelog:
1. Changed RAG function section to reflect "Find an Answer in the Vonage Docs" from "Find a Solution in the KB or Dev Pages"
2. Fixed issue with copy and paste of the AI-generated "Find an Answer in the Vonage Docs" where the content was copied but the action was not recorded by the event listener
3. Modified some regex patterns to deal with the Zendesk raw data (email signature, certain case correspondence outlines, etc)
4. Added a "SALUTATION_PATTERN" array to the config.py used to clean the Zendesk raw data
5. Updated the route for the RAG API to include a basic authentication header
6. Added a metric route for server-side reporting of Vonage Cloud Runtime metrics


### Screenshot(s):
[put your screenshots down here.]

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

