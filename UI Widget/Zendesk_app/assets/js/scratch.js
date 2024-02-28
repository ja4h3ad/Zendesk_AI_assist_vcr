const copyIcon = document.getElementById('copy-solution');
if (copyIcon) {
    copyIcon.addEventListener('click', () => {
        // Get the solution text
        const solutionText = document.getElementById('solution-text').innerText;

        // Get the related links as an HTMLCollection of <li> elements
        const relatedLinks = document.querySelectorAll('#issues ul li a');
        
        // Convert the NodeList of <a> elements to a string of URLs
        let linksText = Array.from(relatedLinks).map(a => a.href).join('\n');

        // Concatenate solution text and links for the clipboard
        const textToCopy = `${solutionText}\n\nRelated Links:\n${linksText}`;

        // Use the Clipboard API to copy the combined text
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('Solution text and related links copied to clipboard');
            // After successfully copying to clipboard, send feedback via middleware
            middleware.vonabotCopyAction(ticketId)
                .then(response => {
                    console.log('Copy action recorded:', response);
                })
                .catch(error => {
                    console.error('Error recording copy action:', error);
                });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
}
