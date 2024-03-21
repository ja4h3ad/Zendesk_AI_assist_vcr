# Define separate patterns for salutations and signatures
SALUTATION_PATTERNS = [r'Thank you for contacting Vonage(?: API)? Support']

SYSTEM_PATTERNS = [r'To unsubscribe from this group and stop receiving emails from it, send an email to numbers\+unsubscribe@nexmo\.com\.',
                   r'A new file has been generated', r'Please find the generated file attached to this email.',
                   ]


SIGNATURE_PATTERNS = [
    r'Many thanks',
    r'Kind Regards',
    r'Best Regards',
    r'Communications APIs',
    r'Unified Communications',
    r'Contact Centers',
    r'Eric Ong \| Strategic Regional CX Consultant - SEA and India \+65 9111 0312 • eric.ong@vonage.com • LinkedIn Level 18 • 5 Temasek Boulevard, Suntec Tower 5 • Singapore • 038985',
    r'Follow Vonage on Social Media[ |•\w\s]+X',
    r'20[2-9]\d Planned Out-Of-Office Period:'

]


CONTACT_PHRASES = [
    r'Thank you for your reply',
    r'Thank you for reaching out to our team',
    r'Out-of-Office'
]

SECURITY_ARTIFACTS = [
    r'This email originates from outside of ',
    r'Keep this in mind before responding, opening attachments or clicking any links ',
    r'NOTE: The information contained in this email message is considered confidential and proprietary to the sender and is intended solely for review and use by the named recipient',
    r'Any unauthorized review, use or distribution is strictly prohibited',
    r'If you have received this message in error, please advise the sender by reply email and delete the message',
    r'This email originates from outside of [\w\s]',
    r'Keep this in mind before responding, opening attachments or clicking any links ',
    r'Unless you recognise the sender and know the content is safe ',
    r'If in any doubt, the grammar and spelling are poor, or the name doesn\'t match the email address then',
    r'please contact the sender via an alternate known method',
    r'This email is security checked and subject to .+? on web-page:',
    r'This email is security checked and subject to the disclaimer on web-page:',
    r'This email originates from outside of [\w\s]+\.',
    r'The information contained in this email message is considered confidential.*?delete the message'

]


