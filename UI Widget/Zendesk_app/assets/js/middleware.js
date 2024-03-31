  //const BASE_URL = "https://neru-3ecb6a35-zendesk-ai-copilot-uat.use1.runtime.vonage.cloud";
  const BASE_URL = "https://vonagedev.ngrok.app";

  class Middleware {
    getTicketDetail(ticketId) {
      /*return {
        summary:
          "The user has quality problems with publisher video with the Opentok API. When initially played, the video buffers heavily and has poor quality, although subsequent plays improve somewhat. Despite good quality in the video element, there are issues when subscribing to the publisher.",
      };*/
      return this.getRequest(`${BASE_URL}/ticket/${ticketId}`);
    }
    getAmberList(api_key) {
      /*return {
        T if customer is on amber list, based on query to Google Sheet, False if Not}; */
      return this.getRequest(`${BASE_URL}/get_amber_list`); 
    }

    summaryFeedback(ticketId, isPositiveFeedback, userId, summary) {
      const feedbackValue = isPositiveFeedback ? 1: 0; //1 for thumbs up, 0 for thumbs down
      return this.postRequest(`${BASE_URL}/send_feedback`, {
        ticketId: ticketId,
        feedbackType: feedbackValue,
        userId:  userId, // include the username in the feedback
        summary: summary // include the summary in the feedback
      });
    }

    // Adjusted vonabotCopyAction method to include content type
  vonabotCopyAction(ticketId, contentType, userId) {
    console.log(`Attempting to record copy action: ${contentType}`);
    return this.postRequest(`${BASE_URL}/record_copy_action`, {
      ticketId: ticketId,
      contentType: contentType, // 'solutionText' or 'relatedLinks'
      userId: userId
    });
  }

    
    findSimilarIssue(query) {
      return this.postRequest(`${BASE_URL}/vona_bot`, {
        query: query,
      });
    }



    async getRequest(url) {
      const response = await fetch(url);
      return response.json();
    }

    async postRequest(url, data = {}) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    }



  }
