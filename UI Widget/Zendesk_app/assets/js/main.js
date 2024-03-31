let ticketId; // Global variable to be used in main.js
let userId; // global variable for authenticated zendesk users
const middleware = new Middleware();

async function main() {
  let summary = "";
  const client = ZAFClient.init();
  if (client.invoke) {
    client.invoke("resize", { width: "100%", height: "400px" });
    const { ticket } = await client.get("ticket");
    // Retrieve the current user's name (username)
  try {
    const response = await client.get("currentUser.name");
    userId = response["currentUser.name"]; // Set the global userId
    console.log("Current User ID: ", userId); // Log the userId (optional)
  } catch (error) {
    console.error("Error retrieving current user's name:", error);
  }
    ticketId = ticket.id;
  } else {
    ticketId = location.hash.substring(1);
  }
  if (ticketId === "") {
    return;
  }
  
  const ticketDetails = await middleware.getTicketDetail(ticketId);
  summary = ticketDetails.llm_summary;
  document.getElementById("summary").innerHTML = summary
    .split("\n")
    .join("<br/>");
  console.log("These is the summary result ", ticketDetails);
  // Logic to update the sentiment indicator and amber list
  // Update sentiment indicator visibility
  // Set Customer Sentiment color
  const sentimentIndicator = document.getElementById('sentiment-indicator');
  if (sentimentIndicator) {
    if (ticketDetails.sentimentScore === -1) {
      sentimentIndicator.style.backgroundColor = 'red';
    } else if (ticketDetails.sentimentScore === 1) {
      sentimentIndicator.style.backgroundColor = 'green';
    }
  }
  // Update solution feedback visibility
  const solutionFeedback = document.getElementById('solution-feedback');
  if (solutionFeedback) {
      solutionFeedback.style.display = 'flex'; // Show the feedback icons
  }

  
  // // Check if Amber List should be displayed
  // const amberListResponse = await middleware.getAmberList(api_key);
  // if (amberListResponse && amberListResponse.shouldDisplayAmberList) {
  //   const amberListElement = document.getElementById('amber-list');
  //   if (amberListElement) {
  //     amberListElement.style.display = 'block';
  //   }
  // }


  document.getElementById("summary").innerHTML = summary
    .split("\n")
    .join("<br/>");


  document.body.className = "";
//a method to get the sentiment chart to display.  saved for later as references
  const chartContainer = document.getElementById("chart");
  const chart = new ChartSentimentOverTime(chartContainer);
  chart.setData({
    messages: [
      {
        score: 0.019919290950675617,
      },
      {
        score: -0.16077391093955797,
      },
      {
        score: -0.07157953836350357,
      },
      {
        score: 0.38054752212940315,
      },
      {
        score: 0.623857673810860192,
      },
      {
        score: 0.4917376887972845,
      },
    ],
  });

  const title = document.getElementById("title");
  if (title) {
    title.innerHTML = `Ticket #${ticketId}`;
  }

  const fullscreen = document.getElementById("fullscreen");
  if (fullscreen) {
    fullscreen.onclick = () => {
      const modal = new Modal(`/assets/modal.html#${ticketId}`);
      modal.open();
    };
  }





  const issues = document.getElementById("issues");
  const query = document.getElementById("search-query");
  const submit = document.getElementById("search-submit");
  

  async function submitQuery(query) {
    const searchSpinner = document.getElementById("search-loading"); //get spinner
    searchSpinner.style.display = 'block'; //show spinner
    issues.className = "is-loading";
    try {
      //API call to VonaBot
      const result = await middleware.findSimilarIssue(query);
      console.log(result); // Add this line to log the server's response
  
      //set innerHTML of issues container to include the solution and related links with copy icons

      issues.innerHTML = `<p id="solution-text">${result['generated answer']}</p>
      
      
      <i id='copy-solution-text' class='fa fa-copy' style="cursor:pointer;"></i> <!-- Copy icon for solution text -->
      <br/>
      <p><b> Related Links</b></p>
      <ul>
      ${result.references
        .map(({ source }) => `<li><a href="${source}" target="_blank">${source.split("/").pop()}</a></li>`)
        .join("")}
      </ul>
      <i id='copy-related-links' class='fa fa-copy' style="cursor:pointer;"></i>`; // Copy icon for related links
  
      // Logic to show copy icons and add event listeners for copy functionality
      // This ensures icons are interactable as soon as they are added to the DOM
      addCopyFunctionality();
  
    } catch (error) {
      console.error('Error fetching issues', error);
      //handle error
    } finally {
      searchSpinner.style.display = 'none'; //hide spinner after the information is retrieved
      issues.className = ""; //reset the loader
    }
  }
    


  submit.onclick = async () => {
    const value = query.value;
    if (value.length === 0) return;
    submitQuery(value);
  };
  
}

window.onload = () => {
  main();
  

  // Event listener for thumbs up and subsequent actions
  const thumbsUp = document.getElementById('thumbs-up');
  if (thumbsUp) {
      thumbsUp.addEventListener('click', function() {
        // Retrieve the text content of the summary at the time the button is clicked
        const summaryText = document.getElementById("summary").innerText;
        //check if already disabled
        if (this.classList.contains('icon-disabled')){
          return; //do nothing if disabled
        }
        this.classList.add('icon-active'); //mark as active when actuated
        thumbsDown.style.visibility = 'hidden'; // hide the TD icon if TU is pressed
        //thumbsDown.classList.add('icon-disabled'); //disable the other icon
        console.log("Sending summary", summary)
          middleware.summaryFeedback(ticketId, true, userId, summaryText)
              .then(response => {
                  console.log('Positive feedback sent:', response);
              })
              .catch(error => {
                  console.error('Error sending positive feedback:', error);
              });
      });
  }

  // Event listener for thumbs down
  const thumbsDown = document.getElementById('thumbs-down');
  if (thumbsDown) {
      thumbsDown.addEventListener('click', function() {
        // Retrieve the text content of the summary at the time the button is clicked
        const summaryText = document.getElementById("summary").innerText;
        //check is already disabled
        if (this.classList.contains('icon-disabled')){
          return; //do nothing if disabled
        }
        this.classList.add('icon-active-negative'); //mark as active with negative feedback
        thumbsUp.style.visibility = 'hidden'; // hide the U icon if TD is pressed
        //thumbsUp.classList.add('icon-disabled'); //disable other icon
        console.log("Sending summary", summaryText)
          middleware.summaryFeedback(ticketId, false, userId, summary)
              .then(response => {
                  console.log('Negative feedback sent:', response);
              })
              .catch(error => {
                  console.error('Error sending negative feedback:', error);
              });
      });
  } 

}

function addCopyFunctionality() {
  // Copy solution text
  const copySolutionTextIcon = document.getElementById('copy-solution-text');
  if (copySolutionTextIcon) {
    copySolutionTextIcon.addEventListener('click', () => {
      const solutionText = document.getElementById('solution-text').innerText;
      navigator.clipboard.writeText(solutionText)
        .then(() => {
          console.log('Solution text copied to clipboard');
          copySolutionTextIcon.classList.add('icon-copied'); //indicate success that solution text was copied
          setTimeout(() => copySolutionTextIcon.classList.remove('icon-copied'), 2000); //reset after 2 seconds
          middleware.vonabotCopyAction(ticketId, 'solutionText', userId) //
            .then(response => console.log('Copy action for solution text recorded:', response))
            .catch(error => console.error('Error recording copy action for solution text:', error));
        })
        .catch(err => console.error('Failed to copy solution text:', err));
    });
  }



  // Event listener for copying related links
  const copyRelatedLinksIcon = document.getElementById('copy-related-links');
  if (copyRelatedLinksIcon) {
    copyRelatedLinksIcon.addEventListener('click', () => {
      const linksElements = document.querySelectorAll('#issues ul li a');
      const linksText = Array.from(linksElements).map(a => a.href).join('\n');
      navigator.clipboard.writeText(linksText)
        .then(() => {
          console.log('Related links copied to clipboard');
          copyRelatedLinksIcon.classList.add('icon-copied'); //indicate success
          setTimeout(() => copyRelatedLinksIcon.classList.remove('icon-copied'), 2000); //Reset after 2 seconds
          // Call middleware with 'relatedLinks' as contentType
          middleware.vonabotCopyAction(ticketId, 'relatedLinks', userId)
            .then(response => console.log('Copy action for related links recorded:', response))
            .catch(error => console.error('Error recording copy action for related links:', error));
        })
        .catch(err => console.error('Failed to copy related links: ', err));
    });
  }
}

