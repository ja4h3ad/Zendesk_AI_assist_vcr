let ticketId; // Global variable to be used in main.js
const middleware = new Middleware();

async function main() {
  let summary = "";
  const client = ZAFClient.init();
  if (client.invoke) {
    client.invoke("resize", { width: "100%", height: "400px" });
    const { ticket } = await client.get("ticket");
    ticketId = ticket.id;
  } else {
    ticketId = location.hash.substring(1);
  }
  if (ticketId === "") {
    return;
  }
  
  const ticketDetails = await middleware.getTicketDetail(ticketId);
  summary = ticketDetails.llm_summary;
  console.log(ticketDetails);
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
  //const submitAuto = document.getElementById("search-automatic");

  async function submitQuery(query) {
    const searchSpinner = document.getElementById("search-loading"); //get spinner
    searchSpinner.style.display = 'block'; //show spinner
    issues.className = "is-loading";
    try {
      //API call to VonaBot
      const result = await middleware.findSimilarIssue(query);
  
      //set innerHTML of issues container to include the solution and related links with copy icons
      issues.innerHTML = `<p id="solution-text">${result.generated_answer}</p>
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
  

  // Event listener for thumbs up
  const thumbsUp = document.getElementById('thumbs-up');
  if (thumbsUp) {
      thumbsUp.addEventListener('click', () => {
          middleware.summaryFeedback(ticketId, true)
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
      thumbsDown.addEventListener('click', () => {
          middleware.summaryFeedback(ticketId, false)
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
          middleware.vonabotCopyAction(ticketId, 'solutionText') // Adjusted to match your API call structure
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
          // Call middleware with 'relatedLinks' as contentType
          middleware.vonabotCopyAction(ticketId, 'relatedLinks')
            .then(response => console.log('Copy action for related links recorded:', response))
            .catch(error => console.error('Error recording copy action for related links:', error));
        })
        .catch(err => console.error('Failed to copy related links: ', err));
    });
  }
}

