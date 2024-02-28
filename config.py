SIGNATURE_PATTERNS = [
    r'[\w\s,]+(?:Operational Business Partner|Vonage API Support)[^!]+',
    r'Eric Ong \| Strategic Regional CX Consultant - SEA and India \+65 9111 0312 • eric.ong@vonage.com • LinkedIn Level 18 • 5 Temasek Boulevard, Suntec Tower 5 • Singapore • 038985',
    r'Follow Vonage on Social Media[ |•\w\s]+X',
    r'2023 Planned Out-Of-Office Period: TBC',
]



NAMES = [r'Sotirios']

CONTACT_PHRASES = [
    r'(Thank you for contacting [\w\s]+)?(Vonage API Support|Many thanks|Kind Regards|Thanks|Best Regards|Communications APIs|Unified Communications|Contact Centers)',
    r'Thank you for your reply',
    r'Thank you for reaching out to our team',
    r'2023 Planned Out-Of-Office Period: TBC'
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


