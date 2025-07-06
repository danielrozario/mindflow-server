import nltk
import sys
import json
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download VADER lexicon if missing
nltk.download('vader_lexicon', quiet=True)

# Initialize VADER sentiment analyzer
sid = SentimentIntensityAnalyzer()

# Get the text input from the command-line argument
text = sys.argv[1]

# Analyze the sentiment
sentiment = sid.polarity_scores(text)

# Return the sentiment result as JSON
print(json.dumps(sentiment))
